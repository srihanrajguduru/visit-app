import { supabase } from "@/lib/supabase";
import type { Area } from "@/types/database";

export async function getAllAreas(): Promise<Area[]> {
    const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("name");

    if (error) throw error;
    return data ?? [];
}

export async function getAreaById(id: string): Promise<Area | null> {
    const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getNearestArea(
    lat: number,
    lng: number
): Promise<Area | null> {
    const { data, error } = await supabase.from("areas").select("*");

    if (error || !data || data.length === 0) return null;

    let nearest: Area | null = null;
    let minDist = Infinity;

    for (const area of (data as Area[])) {
        const dist = Math.sqrt(
            Math.pow(area.latitude - lat, 2) + Math.pow(area.longitude - lng, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = area;
        }
    }

    return nearest;
}
