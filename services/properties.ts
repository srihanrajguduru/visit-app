import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/database";

export async function getPropertiesByArea(areaId: string): Promise<Property[]> {
    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("area_id", areaId)
        .order("price");

    if (error) throw error;
    return (data as Property[]) ?? [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as Property;
}

export async function getNearbyProperties(
    lat: number,
    lng: number,
    radiusKm: number = 2
): Promise<Property[]> {
    const { data, error } = await supabase.from("properties").select("*");

    if (error || !data) return [];

    const props = data as Property[];
    const degRadius = radiusKm / 111;
    return props.filter((p) => {
        const dist = Math.sqrt(
            Math.pow(p.latitude - lat, 2) + Math.pow(p.longitude - lng, 2)
        );
        return dist <= degRadius;
    });
}
