import { supabase } from "@/lib/supabase";
import { Area } from "@/types/database";
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
    const { data, error } = await supabase.from('areas').select('*');
    if (error || !data || data.length === 0) {
        throw new Error("No areas found");
    }
    const areas = data as Area[];

    // 2. Find nearest area using haversine distance exactly like desktop calculations
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
    const { data: metricsData } = await supabase
        .from('area_metrics')
        .select('aqi, noise, flood_risk, metro_distance, road_quality, internet_score, crime_rate, women_safety_score, amenity_score, water_supply_score')
        .eq('area_id', nearestArea.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() as any;

    // 4. Process scores and generate pros/cons summary
    let environmental_score = null;
    let infrastructure_score = null;
    let social_score = null;
    const pros: string[] = [];
    const cons: string[] = [];

    if (metricsData) {
        environmental_score = calculateEnvironmentalDisplay(metricsData);
        infrastructure_score = calculateInfrastructureDisplay(metricsData);
        social_score = calculateSocialDisplay(metricsData);

        if (metricsData.aqi && metricsData.aqi < 50) pros.push("Excellent Air Quality");
        else if (metricsData.aqi && metricsData.aqi > 150) cons.push("Poor Air Quality");

        if (metricsData.noise !== null && metricsData.noise < 60) pros.push("Quiet Neighborhood");
        else if (metricsData.noise !== null && metricsData.noise > 75) cons.push("High Noise Pollution");

        if (metricsData.metro_distance !== null && metricsData.metro_distance < 2) pros.push("Close to Metro Transit");
        else if (metricsData.metro_distance !== null) cons.push("Far from Metro Transit");

        if (metricsData.amenity_score !== null && metricsData.amenity_score > 80) pros.push("Great Amenities Nearby");
        else if (metricsData.amenity_score !== null && metricsData.amenity_score < 40) cons.push("Lacking Amenities");

        if (metricsData.flood_risk !== null && metricsData.flood_risk < 3) pros.push("Low Flood Risk");
        else if (metricsData.flood_risk !== null && metricsData.flood_risk >= 7) cons.push("High Flood Risk");
    }

    // Output strictly matching the requested spec: name, current_visit_score, metrics
    return {
        id: nearestArea.id,
        name: nearestArea.name,
        current_visit_score: nearestArea.current_visit_score,
        metrics: metricsData || null,
        environmental_score,
        infrastructure_score,
        social_score,
        pros,
        cons,
        latitude: nearestArea.latitude,
        longitude: nearestArea.longitude
    };
}
