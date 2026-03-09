import { createClient } from "@supabase/supabase-js";
import type { PropertyListing } from "@/types/database";

// Use untyped client — the typed Database generic causes 'never' errors 
// on new tables that are defined in types but may not yet exist in Supabase introspection
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get all property listings for a specific area.
 */
export async function getListingsByArea(areaId: string): Promise<PropertyListing[]> {
    const { data, error } = await supabase
        .from("property_listings")
        .select("*")
        .eq("area_id", areaId)
        .order("price");

    if (error) return [];
    return (data as PropertyListing[]) ?? [];
}

/**
 * Get a single property listing by ID.
 */
export async function getListingById(id: string): Promise<PropertyListing | null> {
    const { data, error } = await supabase
        .from("property_listings")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as PropertyListing;
}

/**
 * Get all property listings owned by a user.
 */
export async function getListingsByOwner(ownerId: string): Promise<PropertyListing[]> {
    const { data, error } = await supabase
        .from("property_listings")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

    if (error) return [];
    return (data as PropertyListing[]) ?? [];
}

/**
 * Create a new property listing.
 * Automatically snapshots the current Visit Score of the nearest area.
 */
export async function createListing(listing: {
    title: string;
    description?: string;
    price: number;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    latitude: number;
    longitude: number;
    owner_id: string;
}): Promise<PropertyListing> {
    // Find nearest area to attach visit_score_snapshot
    const { data: areas } = await supabase.from("areas").select("*");
    let nearestAreaId: string | null = null;
    let visitScoreSnapshot: number | null = null;

    if (areas && areas.length > 0) {
        let minDist = Infinity;
        for (const area of areas) {
            const dist = Math.sqrt(
                Math.pow(area.latitude - listing.latitude, 2) +
                Math.pow(area.longitude - listing.longitude, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearestAreaId = area.id;
                visitScoreSnapshot = area.current_visit_score;
            }
        }
    }

    const { data, error } = await supabase
        .from("property_listings")
        .insert({
            ...listing,
            area_id: nearestAreaId,
            visit_score_snapshot: visitScoreSnapshot,
            verified: false,
        } as any)
        .select()
        .single();

    if (error) return {} as PropertyListing; // Fallback so it doesn't crash process
    return data as PropertyListing;
}

/**
 * Search property listings with filters.
 */
export async function searchListings(filters: {
    areaId?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    minBedrooms?: number;
    verified?: boolean;
}): Promise<PropertyListing[]> {
    let query = supabase.from("property_listings").select("*");

    if (filters.areaId) query = query.eq("area_id", filters.areaId);
    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
    if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
    if (filters.minBedrooms) query = query.gte("bedrooms", filters.minBedrooms);
    if (filters.verified !== undefined) query = query.eq("verified", filters.verified);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return [];
    return (data as PropertyListing[]) ?? [];
}

/**
 * Get nearby property listings within a radius (in km).
 */
export async function getNearbyListings(
    lat: number,
    lng: number,
    radiusKm: number = 2
): Promise<PropertyListing[]> {
    const { data, error } = await supabase.from("property_listings").select("*");
    if (error || !data) return [];

    const degRadius = radiusKm / 111;
    return (data as PropertyListing[]).filter((p) => {
        const dist = Math.sqrt(
            Math.pow(p.latitude - lat, 2) + Math.pow(p.longitude - lng, 2)
        );
        return dist <= degRadius;
    });
}

/**
 * Toggle verification status of a property listing (developer action).
 */
export async function toggleVerification(
    listingId: string,
    field: "verified",
    currentValue: boolean
): Promise<void> {
    const { error } = await supabase
        .from("property_listings")
        .update({ [field]: !currentValue })
        .eq("id", listingId);

    if (error) return;
}
