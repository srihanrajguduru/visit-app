/**
 * --------------------------------------------------------
 * File: services/areaService.ts
 * Purpose: Area-based metrics retrieval service.
 * Responsibilities: Maps coordinates to nearest monitoring areas, queries local SQLite database via Prisma for metrics, calculates display sub-scores, and generates pros/cons summaries.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { Area } from "@/types/database";
import {
    calculateEnvironmentalDisplay,
    calculateInfrastructureDisplay,
    calculateSocialDisplay,
} from "@/services/scores";

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function getAreaByCoordinates(latitude: number, longitude: number) {
    // 1. Fetch available areas
    const areas = await prisma.area.findMany();
    if (areas.length === 0) {
        throw new Error("No areas found");
    }

    // 2. Find nearest area using haversine distance
    let nearestArea = areas[0];
    let minDistance = Infinity;

    for (const a of areas) {
        if (a.latitude && a.longitude) {
            const distance = getHaversineDistance(latitude, longitude, a.latitude, a.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestArea = a;
            }
        }
    }

    // 3. Get metrics for this nearest area, strictly querying the area_metrics table
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

    // Map Prisma camelCase back to snake_case structure expected by display functions
    const formattedMetrics: any = metricsData ? {
        id: metricsData.id,
        area_id: metricsData.areaId,
        dataset_version: metricsData.datasetVersion,
        aqi: metricsData.aqi,
        noise: metricsData.noise,
        flood_risk: metricsData.floodRisk,
        metro_distance: metricsData.metroDistance,
        road_quality: metricsData.roadQuality,
        water_supply_score: metricsData.waterSupplyScore,
        internet_score: metricsData.internetScore,
        crime_rate: metricsData.crimeRate,
        women_safety_score: metricsData.womenSafetyScore,
        amenity_score: metricsData.amenityScore,
        created_at: metricsData.createdAt.toISOString(),
    } : null;

    if (formattedMetrics) {
        environmental_score = calculateEnvironmentalDisplay(formattedMetrics);
        infrastructure_score = calculateInfrastructureDisplay(formattedMetrics);
        social_score = calculateSocialDisplay(formattedMetrics);

        if (formattedMetrics.aqi && formattedMetrics.aqi < 50) pros.push("Excellent Air Quality");
        else if (formattedMetrics.aqi && formattedMetrics.aqi > 150) cons.push("Poor Air Quality");

        if (formattedMetrics.noise !== null && formattedMetrics.noise < 60) pros.push("Quiet Neighborhood");
        else if (formattedMetrics.noise !== null && formattedMetrics.noise > 75) cons.push("High Noise Pollution");

        if (formattedMetrics.metro_distance !== null && formattedMetrics.metro_distance < 2) pros.push("Close to Metro Transit");
        else if (formattedMetrics.metro_distance !== null) cons.push("Far from Metro Transit");

        if (formattedMetrics.amenity_score !== null && formattedMetrics.amenity_score > 80) pros.push("Great Amenities Nearby");
        else if (formattedMetrics.amenity_score !== null && formattedMetrics.amenity_score < 40) cons.push("Lacking Amenities");

        if (formattedMetrics.flood_risk !== null && formattedMetrics.flood_risk < 3) pros.push("Low Flood Risk");
        else if (formattedMetrics.flood_risk !== null && formattedMetrics.flood_risk >= 7) cons.push("High Flood Risk");
    }

    // Output matching the expected spec: name, current_visit_score, metrics
    return {
        id: nearestArea.id,
        name: nearestArea.name,
        current_visit_score: nearestArea.currentVisitScore,
        metrics: formattedMetrics || null,
        environmental_score,
        infrastructure_score,
        social_score,
        pros,
        cons,
        latitude: nearestArea.latitude,
        longitude: nearestArea.longitude
    };
}
