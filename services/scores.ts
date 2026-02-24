import { supabase } from "@/lib/supabase";
import type { AreaMetrics, VisitScore, VisitScoreHistory } from "@/types/database";

export async function getAreaMetrics(areaId: string): Promise<AreaMetrics | null> {
    const { data, error } = await supabase
        .from("area_metrics")
        .select("*")
        .eq("area_id", areaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data;
}

export async function getVisitScore(areaId: string): Promise<VisitScore | null> {
    const { data, error } = await supabase
        .from("visit_scores")
        .select("*")
        .eq("area_id", areaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data;
}

export async function getScoreHistory(
    areaId: string
): Promise<VisitScoreHistory[]> {
    const { data, error } = await supabase
        .from("visit_score_history")
        .select("*")
        .eq("area_id", areaId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) return [];
    return data ?? [];
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
 */
export function subscribeToScoreUpdates(
    callback: (payload: VisitScore) => void
) {
    return supabase
        .channel("visit-scores-changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "visit_scores" },
            (payload) => callback(payload.new as VisitScore)
        )
        .subscribe();
}
