import { createClient } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/database";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get or create a user profile. Auto-creates on first login.
 */
export async function getOrCreateProfile(user: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
}): Promise<UserProfile> {
    // Try to find existing
    const { data: existing } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.uid)
        .maybeSingle();

    if (existing) return existing as UserProfile;

    // Create new profile
    const { data, error } = await supabase
        .from("user_profiles")
        .insert({
            user_id: user.uid,
            name: user.displayName || null,
            email: user.email || null,
            avatar_url: user.photoURL || null,
            areas_associated: [],
        } as any)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
}

/**
 * Get a user profile by Firebase UID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) return null;
    return data as UserProfile | null;
}

/**
 * Update a user profile.
 */
export async function updateProfile(
    userId: string,
    updates: { name?: string; email?: string; avatar_url?: string; areas_associated?: string[] }
): Promise<UserProfile> {
    const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
}

/**
 * Get all communities a user has joined.
 */
export async function getUserCommunities(userId: string) {
    const { data, error } = await supabase
        .from("community_members")
        .select("*, areas(*)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false });

    if (error) return [];
    return data ?? [];
}

/**
 * Get all property listings owned by a user.
 */
export async function getUserProperties(userId: string) {
    const { data, error } = await supabase
        .from("property_listings")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
}

/**
 * Get all profiles (developer/admin use).
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("joined_at", { ascending: false });

    if (error) return [];
    return (data as UserProfile[]) ?? [];
}
