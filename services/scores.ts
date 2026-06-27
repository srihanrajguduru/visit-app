/**
 * --------------------------------------------------------
 * File: services/scores.ts
 * Purpose: Visit Score and metrics service.
 * Responsibilities: Retrieves environmental/infrastructure/social metrics, fetches current scores and history, and handles display-level sub-score math.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { AreaMetrics, VisitScore, VisitScoreHistory } from "@/types/database";

/**
 * Retrieves the latest metrics record for a given area.
 * 
 * @param areaId ID of the target area
 * @returns AreaMetrics record or null
 */
export async function getAreaMetrics(areaId: string): Promise<AreaMetrics | null> {
    const metrics = await prisma.areaMetrics.findFirst({
        where: { areaId },
        orderBy: { createdAt: "desc" },
    });
    return metrics as unknown as AreaMetrics | null;
}

/**
 * Retrieves the latest calculated Visit Score for a given area.
 * 
 * @param areaId ID of the target area
 * @returns VisitScore record or null
 */
export async function getVisitScore(areaId: string): Promise<VisitScore | null> {
    const score = await prisma.visitScore.findFirst({
        where: { areaId },
        orderBy: { createdAt: "desc" },
    });
    return score as unknown as VisitScore | null;
}

/**
 * Retrieves up to 20 historical score records for a given area.
 * 
 * @param areaId ID of the target area
 * @returns Array of VisitScoreHistory records
 */
export async function getScoreHistory(
    areaId: string
): Promise<VisitScoreHistory[]> {
    const history = await prisma.visitScoreHistory.findMany({
        where: { areaId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    return history as unknown as VisitScoreHistory[];
}

/**
 * Calculate environmental sub-score (0-100) from raw metrics.
 * Used for display only — actual Visit Score is calculated server-side.
 */
export function calculateEnvironmentalDisplay(metrics: AreaMetrics): number {
    const aqiScore = metrics.aqi ? Math.max(0, 100 - (metrics.aqi / 5)) : 50;
    const noiseScore = metrics.noise ? Math.max(0, 100 - ((metrics.noise - 40) * 2)) : 50;
    const floodScore = metrics.flood_risk ? Math.max(0, 100 - (metrics.flood_risk * 25)) : 75;

    return (0.40 * aqiScore) + (0.35 * noiseScore) + (0.25 * floodScore);
}

/**
 * Calculate infrastructure sub-score (0-100) from raw metrics.
 */
export function calculateInfrastructureDisplay(metrics: AreaMetrics): number {
    const metroScore = metrics.metro_distance
        ? Math.max(0, 100 - (metrics.metro_distance / 50))
        : 50;
    const roadScore = (metrics.road_quality ?? 0.5) * 100;
    const waterScore = (metrics.water_supply_score ?? 0.5) * 100;
    const internetScore = (metrics.internet_score ?? 0.5) * 100;

    return (0.30 * metroScore) + (0.25 * roadScore) + (0.25 * waterScore) + (0.20 * internetScore);
}

/**
 * Calculate social sub-score (0-100) from raw metrics.
 */
export function calculateSocialDisplay(metrics: AreaMetrics): number {
    const crimeScore = metrics.crime_rate
        ? Math.max(0, 100 - metrics.crime_rate)
        : 50;
    const safetyScore = metrics.women_safety_score ?? 50;
    const amenityScore = metrics.amenity_score ?? 50;

    return (0.35 * crimeScore) + (0.35 * safetyScore) + (0.30 * amenityScore);
}

/**
 * Subscribe to realtime Visit Score changes.
 * Mocked for local SQLite database to prevent frontend channel subscription exceptions.
 */
export function subscribeToScoreUpdates(
    callback: (payload: VisitScore) => void
) {
    // Return mock subscription reference
    return {
        unsubscribe: () => {
            // Noop
        }
    };
}
