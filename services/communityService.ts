import { createClient } from "@supabase/supabase-js";
import type { CommunityPost, CommunityComment, CommunityMember } from "@/types/database";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get all community posts for an area, ordered newest first.
 */
export async function getCommunityPosts(areaId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("area_id", areaId)
        .order("created_at", { ascending: false });

    if (error) return [];
    return (data as CommunityPost[]) ?? [];
}

/**
 * Create a new community discussion post.
 */
export async function createPost(
    areaId: string,
    userId: string,
    content: string
): Promise<CommunityPost> {
    const { data, error } = await supabase
        .from("community_posts")
        .insert({ area_id: areaId, user_id: userId, content } as any)
        .select()
        .single();

    if (error) return {} as CommunityPost;
    return data as CommunityPost;
}

/**
 * Get all comments for a specific post.
 */
export async function getComments(postId: string): Promise<CommunityComment[]> {
    const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) return [];
    return (data as CommunityComment[]) ?? [];
}

/**
 * Add a comment to a post.
 */
export async function addComment(
    postId: string,
    userId: string,
    content: string
): Promise<CommunityComment> {
    const { data, error } = await supabase
        .from("community_comments")
        .insert({ post_id: postId, user_id: userId, content } as any)
        .select()
        .single();

    if (error) return {} as CommunityComment;
    return data as CommunityComment;
}

/**
 * Join a community for an area.
 */
export async function joinCommunity(
    areaId: string,
    userId: string,
    membershipType: string = "resident"
): Promise<CommunityMember> {
    const { data, error } = await supabase
        .from("community_members")
        .insert({
            area_id: areaId,
            user_id: userId,
            membership_type: membershipType,
        } as any)
        .select()
        .single();

    if (error) return {} as CommunityMember;
    return data as CommunityMember;
}

/**
 * Leave a community.
 */
export async function leaveCommunity(areaId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("area_id", areaId)
        .eq("user_id", userId);

    if (error) return;
}

/**
 * Check if a user is a member of a community.
 */
export async function checkMembership(
    areaId: string,
    userId: string
): Promise<CommunityMember | null> {
    const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("area_id", areaId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) return null;
    return data as CommunityMember | null;
}

/**
 * Get all members of a community.
 */
export async function getCommunityMembers(areaId: string): Promise<CommunityMember[]> {
    const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("area_id", areaId)
        .order("joined_at", { ascending: false });

    if (error) return [];
    return (data as CommunityMember[]) ?? [];
}

/**
 * Get the count of members in a community.
 */
export async function getCommunityMemberCount(areaId: string): Promise<number> {
    const { count, error } = await supabase
        .from("community_members")
        .select("*", { count: "exact", head: true })
        .eq("area_id", areaId);

    if (error) return 0;
    return count ?? 0;
}

/**
 * Delete a community post (developer moderation).
 */
export async function deletePost(postId: string): Promise<void> {
    const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

    if (error) return;
}

/**
 * Delete a community comment (developer moderation).
 */
export async function deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);

    if (error) return;
}

/**
 * Subscribe to realtime community posts for an area.
 */
export function subscribeToCommunityPosts(
    areaId: string,
    callback: (post: CommunityPost) => void
) {
    return supabase
        .channel(`community-posts-${areaId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "community_posts",
                filter: `area_id=eq.${areaId}`,
            },
            (payload) => callback(payload.new as CommunityPost)
        )
        .subscribe((status, err) => {
            // Silence errors when testing without schema in Dev mode
            if (err) return;
        });
}
