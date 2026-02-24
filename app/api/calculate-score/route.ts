import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin dynamically per request to avoid build errors.

interface AreaMetrics {
    aqi?: number;
    noise?: number;
    flood_risk?: string;
    metro_distance?: number;
    road_quality?: number;
    water_supply_score?: number;
    internet_score?: number;
    women_safety_score?: number;
    crime_rate?: number;
    amenity_score?: number;
}

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

    const flood = (data.flood_risk ?? "Low").toLowerCase();
    let floodScore = 10;
    if (flood === "low") floodScore = 100;
    else if (flood === "medium") floodScore = 50;

    const score = aqiScore * 0.4 + noiseScore * 0.3 + floodScore * 0.3;
    return Math.min(Math.max(score, 0), 100);
}

function calcInfrastructure(data: AreaMetrics): number {
    const dist = data.metro_distance ?? 2000;
    let metroScore = 10;
    if (dist <= 500) metroScore = 100;
    else if (dist <= 1000) metroScore = 90;
    else if (dist <= 2000) metroScore = 75;
    else if (dist <= 5000) metroScore = 40;

    const roadScore = (data.road_quality ?? 0.5) * 100;
    const waterScore = (data.water_supply_score ?? 0.5) * 100;
    const internetScore = (data.internet_score ?? 0.5) * 100;

    const score = metroScore * 0.35 + roadScore * 0.25 + waterScore * 0.2 + internetScore * 0.2;
    return Math.min(Math.max(score, 0), 100);
}

function calcSocial(data: AreaMetrics): number {
    const safety = data.women_safety_score ?? 50;
    const crime = Math.max(0, 100 - (data.crime_rate ?? 50));
    const amenities = data.amenity_score ?? 50;

    const score = safety * 0.4 + crime * 0.3 + amenities * 0.3;
    return Math.min(Math.max(score, 0), 100);
}

export async function POST(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { area_id } = await req.json();

        if (!area_id) {
            return NextResponse.json({ error: "area_id is required" }, { status: 400 });
        }

        const { data: metrics, error: metricsErr } = await supabaseAdmin
            .from("area_metrics")
            .select("*")
            .eq("area_id", area_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (metricsErr || !metrics) {
            return NextResponse.json(
                { error: `Failed to fetch metrics: ${metricsErr?.message || 'Not found'}` },
                { status: 404 }
            );
        }

        const envScore = calcEnvironmental(metrics);
        const infraScore = calcInfrastructure(metrics);
        const socialScore = calcSocial(metrics);

        const finalScore = (envScore + infraScore + socialScore) / 3.0;

        const { error: updateErr } = await supabaseAdmin
            .from("areas")
            .update({
                current_visit_score: finalScore,
                updated_at: new Date().toISOString(),
            })
            .eq("id", area_id);

        if (updateErr) throw new Error(updateErr.message);

        const { error: histErr } = await supabaseAdmin
            .from("visit_scores")
            .insert({ area_id, score: finalScore });

        if (histErr) console.warn("History insert failed:", histErr.message);

        return NextResponse.json({ success: true, score: finalScore });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
