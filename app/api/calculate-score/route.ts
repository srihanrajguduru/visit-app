/**
 * --------------------------------------------------------
 * File: app/api/calculate-score/route.ts
 * Purpose: Server-side Visit Score calculation engine.
 * Responsibilities: Aggregates environmental, social, and infrastructure metrics, runs the proprietary scoring weight formulas, updates current score snapshots, logs histories, and returns scores.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AreaMetrics {
    aqi?: number | null;
    noise?: number | null;
    floodRisk?: number | null;
    metroDistance?: number | null;
    roadQuality?: number | null;
    waterSupplyScore?: number | null;
    internetScore?: number | null;
    womenSafetyScore?: number | null;
    crimeRate?: number | null;
    amenityScore?: number | null;
}

/**
 * Calculates environmental sub-score (0-100).
 */
function calcEnvironmental(data: AreaMetrics): number {
    const aqi = data.aqi ?? 150;
    let aqiScore = 20;
    if (aqi <= 50) aqiScore = 100;
    else if (aqi <= 100) aqiScore = 80;
    else if (aqi <= 200) aqiScore = 60;
    else if (aqi <= 300) aqiScore = 40;

    const noise = data.noise ?? 60;
    let noiseScore = 20;
    if (noise <= 45) noiseScore = 100;
    else if (noise <= 60) noiseScore = 80;
    else if (noise <= 75) noiseScore = 50;

    const flood = data.floodRisk ?? 2;
    let floodScore = 10;
    if (flood <= 3) floodScore = 100;
    else if (flood <= 6) floodScore = 50;

    const score = aqiScore * 0.4 + noiseScore * 0.3 + floodScore * 0.3;
    return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculates infrastructure sub-score (0-100).
 */
function calcInfrastructure(data: AreaMetrics): number {
    const dist = data.metroDistance ?? 2000;
    let metroScore = 10;
    if (dist <= 500) metroScore = 100;
    else if (dist <= 1000) metroScore = 90;
    else if (dist <= 2000) metroScore = 75;
    else if (dist <= 5000) metroScore = 40;

    const roadScore = (data.roadQuality ?? 0.5) * 100;
    const waterScore = (data.waterSupplyScore ?? 0.5) * 100;
    const internetScore = (data.internetScore ?? 0.5) * 100;

    const score = metroScore * 0.35 + roadScore * 0.25 + waterScore * 0.2 + internetScore * 0.2;
    return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculates social sub-score (0-100).
 */
function calcSocial(data: AreaMetrics): number {
    const safety = data.womenSafetyScore ?? 50;
    const crime = Math.max(0, 100 - (data.crimeRate ?? 50));
    const amenities = data.amenityScore ?? 50;

    const score = safety * 0.4 + crime * 0.3 + amenities * 0.3;
    return Math.min(Math.max(score, 0), 100);
}

export async function POST(req: Request) {
    try {
        const { area_id } = await req.json();

        if (!area_id) {
            return NextResponse.json({ error: "area_id is required" }, { status: 400 });
        }

        // Fetch latest metrics
        const metrics = await prisma.areaMetrics.findFirst({
            where: { areaId: area_id },
            orderBy: { createdAt: "desc" },
        });

        if (!metrics) {
            return NextResponse.json(
                { error: "Failed to fetch metrics: No metrics found for this area" },
                { status: 404 }
            );
        }

        // Calculate scores
        const envScore = calcEnvironmental(metrics);
        const infraScore = calcInfrastructure(metrics);
        const socialScore = calcSocial(metrics);

        const finalScore = (envScore + infraScore + socialScore) / 3.0;

        // Update Area current visit score
        await prisma.area.update({
            where: { id: area_id },
            data: {
                currentVisitScore: finalScore,
            },
        });

        // Insert history records in parallel
        try {
            await Promise.all([
                prisma.visitScore.create({
                    data: {
                        areaId: area_id,
                        visitScore: finalScore,
                    },
                }),
                prisma.visitScoreHistory.create({
                    data: {
                        areaId: area_id,
                        visitScore: finalScore,
                    },
                }),
            ]);
        } catch (histErr: any) {
            console.warn("History insert failed:", histErr.message);
        }

        return NextResponse.json({ success: true, score: finalScore });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
