import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin client created dynamically per request

export async function POST(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { datasetId, records } = await req.json();

        if (!records || !Array.isArray(records)) {
            return NextResponse.json({ error: "Invalid records payload" }, { status: 400 });
        }

        // Process each record
        const updatedAreaIds = new Set<string>();

        for (const record of records) {
            // Find area by name (fuzzy match or exact match depending on data)
            // For the prototype, we assume the excel file has an 'Area' or 'Location' column
            const areaName = record.Area || record.Location || record.name || record.Station;
            if (!areaName) continue;

            const { data: area } = await supabaseAdmin
                .from("areas")
                .select("id")
                .ilike("name", `%${areaName}%`)
                .limit(1)
                .single();

            if (!area) continue;

            // Extract metrics dynamically based on standard column headers
            const updates: any = {};

            // AQI mappings
            if (record.AQI) updates.aqi = Number(record.AQI);
            if (record.PM25 || record["PM2.5 in        µg/m3"]) updates.aqi = Number(record.PM25 || record["PM2.5 in        µg/m3"]);

            // Noise mappings
            if (record.Noise || record["Noise Level"]) updates.noise = Number(record.Noise || record["Noise Level"]);

            // Social/Crime mappings
            if (record["Crime Rate"]) updates.crime_rate = Number(record["Crime Rate"]);
            if (record.Safety) updates.women_safety_score = Number(record.Safety);

            // Infrastructure
            if (record["Road Quality"]) updates.road_quality = Number(record["Road Quality"]) / 100;

            if (Object.keys(updates).length > 0) {
                // Fetch current metrics to merge
                const { data: current } = await supabaseAdmin
                    .from("area_metrics")
                    .select("*")
                    .eq("area_id", area.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                const newMetrics = current ? { ...current, ...updates } : { area_id: area.id, ...updates };
                delete newMetrics.id; // remove id so it inserts new row
                delete newMetrics.created_at;

                await supabaseAdmin.from("area_metrics").insert(newMetrics);
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
