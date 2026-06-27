/**
 * --------------------------------------------------------
 * File: app/api/process-dataset/route.ts
 * Purpose: Dataset ingestion and processing route.
 * Responsibilities: Parses uploaded CSV/Excel environmental records, fuzzy matches areas by name in SQLite, pushes updated metrics, and triggers score updates.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { records } = await req.json();

        if (!records || !Array.isArray(records)) {
            return NextResponse.json({ error: "Invalid records payload" }, { status: 400 });
        }

        const updatedAreaIds = new Set<string>();

        for (const record of records) {
            // Find area by name (fuzzy match)
            const areaName = record.Area || record.Location || record.name || record.Station;
            if (!areaName) continue;

            const area = await prisma.area.findFirst({
                where: {
                    name: {
                        contains: areaName,
                    },
                },
                select: { id: true },
            });

            if (!area) continue;

            // Extract metrics dynamically based on standard column headers
            const updates: any = {};

            // AQI mappings
            if (record.AQI) updates.aqi = Number(record.AQI);
            if (record.PM25 || record["PM2.5 in        µg/m3"]) {
                updates.aqi = Number(record.PM25 || record["PM2.5 in        µg/m3"]);
            }

            // Noise mappings
            if (record.Noise || record["Noise Level"]) {
                updates.noise = Number(record.Noise || record["Noise Level"]);
            }

            // Social/Crime mappings
            if (record["Crime Rate"]) updates.crimeRate = Number(record["Crime Rate"]);
            if (record.Safety) updates.womenSafetyScore = Number(record.Safety);

            // Infrastructure
            if (record["Road Quality"]) updates.roadQuality = Number(record["Road Quality"]) / 100;

            if (Object.keys(updates).length > 0) {
                // Fetch current metrics to merge
                const current = await prisma.areaMetrics.findFirst({
                    where: { areaId: area.id },
                    orderBy: { createdAt: "desc" },
                });

                // Merge and clean up fields for new insertion
                const newMetrics = current 
                    ? { ...current, ...updates } 
                    : { areaId: area.id, ...updates };

                // Strip primary key and timestamps so it creates a new record
                delete newMetrics.id;
                delete newMetrics.createdAt;

                await prisma.areaMetrics.create({
                    data: newMetrics,
                });
                updatedAreaIds.add(area.id);
            }
        }

        // Trigger score recalculation for updated areas
        const recalculations = Array.from(updatedAreaIds).map(async (area_id) => {
            try {
                await fetch(new URL("/api/calculate-score", req.url).toString(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area_id }),
                });
            } catch (e) {
                console.error(`Failed to trigger calc for ${area_id}`, e);
            }
        });

        await Promise.allSettled(recalculations);

        return NextResponse.json({
            success: true,
            processed: records.length,
            updatedAreas: updatedAreaIds.size,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
