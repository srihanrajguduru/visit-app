/**
 * --------------------------------------------------------
 * File: services/userProfileService.ts
 * Purpose: User profile and member association service.
 * Responsibilities: Manages profile creation, fetching profile by ID, updating profile data, and retrieving associated listings or joined communities.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/types/database";

/**
 * Helper to map SQLite profile row structure to UserProfile.
 * Parses areasAssociated string stored in SQLite back to string[].
 */
function formatProfile(profile: any): UserProfile | null {
    if (!profile) return null;
    let areasAssociated: string[] = [];
    try {
        areasAssociated = JSON.parse(profile.areasAssociated || "[]");
    } catch {
        areasAssociated = [];
    }
    return {
        ...profile,
        avatar_url: profile.avatarUrl,
        areas_associated: areasAssociated,
        joined_at: profile.joinedAt,
    } as unknown as UserProfile;
}

/**
 * Get or create a user profile. Auto-creates on first login.
 */
export async function getOrCreateProfile(user: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
}): Promise<UserProfile> {
    const existing = await prisma.userProfile.findUnique({
        where: { userId: user.uid },
    });

    if (existing) {
        return formatProfile(existing)!;
    }

    const created = await prisma.userProfile.create({
        data: {
            userId: user.uid,
            name: user.displayName || null,
            email: user.email || null,
            avatarUrl: user.photoURL || null,
            areasAssociated: JSON.stringify([]),
        },
    });

    return formatProfile(created)!;
}

/**
 * Get a user profile by Firebase UID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
    });
    return formatProfile(profile);
}

/**
 * Update a user profile.
 */
export async function updateProfile(
    userId: string,
    updates: { name?: string; email?: string; avatar_url?: string; areas_associated?: string[] }
): Promise<UserProfile> {
    const prismaUpdates: any = {};
    if (updates.name !== undefined) prismaUpdates.name = updates.name;
    if (updates.email !== undefined) prismaUpdates.email = updates.email;
    if (updates.avatar_url !== undefined) prismaUpdates.avatarUrl = updates.avatar_url;
    if (updates.areas_associated !== undefined) {
        prismaUpdates.areasAssociated = JSON.stringify(updates.areas_associated);
    }

    const updated = await prisma.userProfile.update({
        where: { userId },
        data: prismaUpdates,
    });

    return formatProfile(updated)!;
}

/**
 * Get all communities a user has joined.
 */
export async function getUserCommunities(userId: string) {
    const members = await prisma.communityMember.findMany({
        where: { userId },
        orderBy: { joinedAt: "desc" },
    });

    if (members.length === 0) return [];

    const areaIds = members.map((m) => m.areaId);
    const areas = await prisma.area.findMany({
        where: { id: { in: areaIds } },
    });

    return members.map((m) => ({
        ...m,
        user_id: m.userId,
        area_id: m.areaId,
        membership_type: m.membershipType,
        joined_at: m.joinedAt,
        areas: areas.find((a) => a.id === m.areaId) || null,
    }));
}

/**
 * Get all property listings owned by a user.
 */
export async function getUserProperties(userId: string) {
    const listings = await prisma.propertyListing.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
    });

    return listings.map((l) => ({
        ...l,
        property_type: l.propertyType,
        listing_category: l.listingCategory,
        area_sqft: l.areaSqft,
        area_id: l.areaId,
        visit_score_snapshot: l.visitScoreSnapshot,
        owner_id: l.ownerId,
        created_at: l.createdAt,
    }));
}

/**
 * Get all profiles (developer/admin use).
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
    const profiles = await prisma.userProfile.findMany({
        orderBy: { joinedAt: "desc" },
    });
    return profiles.map((p) => formatProfile(p)!) ?? [];
}
