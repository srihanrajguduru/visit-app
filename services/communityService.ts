/**
 * --------------------------------------------------------
 * File: services/communityService.ts
 * Purpose: Community posts and moderation service.
 * Responsibilities: Handles fetching posts, adding comments, joining/leaving neighborhood communities, membership verification, and post deletion.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { CommunityPost, CommunityComment, CommunityMember } from "@/types/database";

/**
 * Format helpers to map camelCase Prisma outputs back to the snake_case interfaces expected by client pages.
 */
function formatPost(post: any): CommunityPost {
    return {
        id: post.id,
        area_id: post.areaId,
        user_id: post.userId,
        content: post.content,
        created_at: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    } as unknown as CommunityPost;
}

function formatComment(comment: any): CommunityComment {
    return {
        id: comment.id,
        post_id: comment.postId,
        user_id: comment.userId,
        content: comment.content,
        created_at: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
    } as unknown as CommunityComment;
}

function formatMember(member: any): CommunityMember {
    return {
        id: member.id,
        area_id: member.areaId,
        user_id: member.userId,
        membership_type: member.membershipType,
        joined_at: member.joinedAt instanceof Date ? member.joinedAt.toISOString() : member.joinedAt,
    } as unknown as CommunityMember;
}

/**
 * Get all community posts for an area, ordered newest first.
 */
export async function getCommunityPosts(areaId: string): Promise<CommunityPost[]> {
    const posts = await prisma.communityPost.findMany({
        where: { areaId },
        orderBy: { createdAt: "desc" },
    });
    return posts.map((p) => formatPost(p)) ?? [];
}

/**
 * Create a new community discussion post.
 */
export async function createPost(
    areaId: string,
    userId: string,
    content: string
): Promise<CommunityPost> {
    const created = await prisma.communityPost.create({
        data: {
            areaId,
            userId,
            content,
        },
    });
    return formatPost(created);
}

/**
 * Get all comments for a specific post.
 */
export async function getComments(postId: string): Promise<CommunityComment[]> {
    const comments = await prisma.communityComment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
    });
    return comments.map((c) => formatComment(c)) ?? [];
}

/**
 * Add a comment to a post.
 */
export async function addComment(
    postId: string,
    userId: string,
    content: string
): Promise<CommunityComment> {
    const created = await prisma.communityComment.create({
        data: {
            postId,
            userId,
            content,
        },
    });
    return formatComment(created);
}

/**
 * Join a community for an area.
 */
export async function joinCommunity(
    areaId: string,
    userId: string,
    membershipType: string = "resident"
): Promise<CommunityMember> {
    // Upsert to handle joining/re-joining gracefully
    const created = await prisma.communityMember.upsert({
        where: {
            areaId_userId: {
                areaId,
                userId,
            },
        },
        update: {
            membershipType,
        },
        create: {
            areaId,
            userId,
            membershipType,
        },
    });
    return formatMember(created);
}

/**
 * Leave a community.
 */
export async function leaveCommunity(areaId: string, userId: string): Promise<void> {
    try {
        await prisma.communityMember.delete({
            where: {
                areaId_userId: {
                    areaId,
                    userId,
                },
            },
        });
    } catch {
        // Safe catch if membership didn't exist
    }
}

/**
 * Check if a user is a member of a community.
 */
export async function checkMembership(
    areaId: string,
    userId: string
): Promise<CommunityMember | null> {
    const member = await prisma.communityMember.findUnique({
        where: {
            areaId_userId: {
                areaId,
                userId,
            },
        },
    });
    return member ? formatMember(member) : null;
}

/**
 * Get all members of a community.
 */
export async function getCommunityMembers(areaId: string): Promise<CommunityMember[]> {
    const members = await prisma.communityMember.findMany({
        where: { areaId },
        orderBy: { joinedAt: "desc" },
    });
    return members.map((m) => formatMember(m)) ?? [];
}

/**
 * Get the count of members in a community.
 */
export async function getCommunityMemberCount(areaId: string): Promise<number> {
    return prisma.communityMember.count({
        where: { areaId },
    });
}

/**
 * Delete a community post (developer moderation).
 */
export async function deletePost(postId: string): Promise<void> {
    await prisma.communityPost.delete({
        where: { id: postId },
    });
}

/**
 * Delete a community comment (developer moderation).
 */
export async function deleteComment(commentId: string): Promise<void> {
    await prisma.communityComment.delete({
        where: { id: commentId },
    });
}

/**
 * Subscribe to realtime community posts for an area.
 * Mocked locally to support out-of-the-box offline runs.
 */
export function subscribeToCommunityPosts(
    areaId: string,
    callback: (post: CommunityPost) => void
) {
    return {
        unsubscribe: () => {
            // Noop
        },
    };
}
