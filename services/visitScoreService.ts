/**
 * --------------------------------------------------------
 * File: services/visitScoreService.ts
 * Purpose: Visit Score coordinate lookup service.
 * Responsibilities: Performs Haversine distance search over coordinates to locate nearest area, aggregates local SQLite environmental, social, and infrastructure metrics, and yields pros/cons summaries.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export async function getAreaVisitScore(latitude: number, longitude: number, areasCache?: any[]) {
    // 1. Fetch available areas if not provided
    let areas = areasCache;
    if (!areas || areas.length === 0) {
        const dbAreas = await prisma.area.findMany();
        if (dbAreas.length === 0) throw new Error("No properties or areas found.");
        areas = dbAreas;
    }

    // 2. Find closest area via Haversine distance
    let nearestArea = areas[0];
    let minDist = Infinity;
    for (const a of areas) {
        if (a.latitude && a.longitude) {
            const dist = getHaversineDistance(latitude, longitude, a.latitude, a.longitude);
            if (dist < minDist) {
                minDist = dist;
                nearestArea = a;
            }
        }
    }

    // If click is too far (> 30km strictly), we might want to reject
    if (minDist > 30) throw new Error("Location too far from known Hyderabad zones");

    // 3. Get metrics for this nearest area
    const metricsData = await prisma.areaMetrics.findFirst({
        where: { areaId: nearestArea.id },
        orderBy: { createdAt: "desc" },
    });

    // 4. Process scores and generate pros/cons summary
    let environmental_score = null;
    let infrastructure_score = null;
    let social_score = null;
    const pros: string[] = [];
    const cons: string[] = [];

    if (metricsData) {
        environmental_score = metricsData.aqi ? Math.max(0, 100 - (metricsData.aqi / 3)) : null;
        infrastructure_score = metricsData.amenityScore || null;
        social_score = metricsData.womenSafetyScore || null;

        if (metricsData.aqi && metricsData.aqi < 50) pros.push("Excellent Air Quality");
        else if (metricsData.aqi && metricsData.aqi > 150) cons.push("Poor Air Quality");

        if (metricsData.noise !== null && metricsData.noise < 60) pros.push("Quiet Neighborhood");
        else if (metricsData.noise !== null && metricsData.noise > 75) cons.push("High Noise Pollution");

        if (metricsData.metroDistance !== null && metricsData.metroDistance < 2) pros.push("Close to Metro Transit");
        else if (metricsData.metroDistance !== null) cons.push("Far from Metro Transit");

        if (metricsData.amenityScore !== null && metricsData.amenityScore > 80) pros.push("Great Amenities Nearby");
        else if (metricsData.amenityScore !== null && metricsData.amenityScore < 40) cons.push("Lacking Amenities");

        if (metricsData.floodRisk !== null && metricsData.floodRisk < 3) pros.push("Low Flood Risk");
        else if (metricsData.floodRisk !== null && metricsData.floodRisk >= 7) cons.push("High Flood Risk");
    }

    return {
        area_id: nearestArea.id,
        area_name: nearestArea.name,
        visit_score: nearestArea.currentVisitScore,
        environmental_score,
        infrastructure_score,
        social_score,
        pros,
        cons,
        latitude: nearestArea.latitude,
        longitude: nearestArea.longitude,
        distance_km: minDist
    };
}
