/**
 * --------------------------------------------------------
 * File: services/properties.ts
 * Purpose: Property listings data access service.
 * Responsibilities: Handles listing retrieval by area/owner, listing creation with automatic score snapshotting, dynamic search filtering, nearby listings proximity math, and verification toggles.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { PropertyListing } from "@/types/database";

/**
 * Format Prisma object to match original Supabase snake_case interface.
 */
function formatListing(listing: any): PropertyListing | null {
    if (!listing) return null;
    return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: Number(listing.price),
        property_type: listing.propertyType,
        listing_category: listing.listingCategory,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area_sqft: listing.areaSqft,
        latitude: listing.latitude,
        longitude: listing.longitude,
        area_id: listing.areaId,
        visit_score_snapshot: listing.visitScoreSnapshot,
        owner_id: listing.ownerId,
        verified: listing.verified,
        created_at: listing.createdAt instanceof Date ? listing.createdAt.toISOString() : listing.createdAt,
    } as unknown as PropertyListing;
}

/**
 * Get all property listings for a specific area.
 */
export async function getListingsByArea(areaId: string): Promise<PropertyListing[]> {
    const listings = await prisma.propertyListing.findMany({
        where: { areaId },
        orderBy: { price: "asc" },
    });
    return listings.map((l) => formatListing(l)!) ?? [];
}

/**
 * Get a single property listing by ID.
 */
export async function getListingById(id: string): Promise<PropertyListing | null> {
    const listing = await prisma.propertyListing.findUnique({
        where: { id },
    });
    return formatListing(listing);
}

/**
 * Get all property listings owned by a user.
 */
export async function getListingsByOwner(ownerId: string): Promise<PropertyListing[]> {
    const listings = await prisma.propertyListing.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
    });
    return listings.map((l) => formatListing(l)!) ?? [];
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
    const areas = await prisma.area.findMany();
    let nearestAreaId: string | null = null;
    let visitScoreSnapshot: number | null = null;

    if (areas.length > 0) {
        let minDist = Infinity;
        for (const area of areas) {
            const dist = Math.sqrt(
                Math.pow(area.latitude - listing.latitude, 2) +
                Math.pow(area.longitude - listing.longitude, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearestAreaId = area.id;
                visitScoreSnapshot = area.currentVisitScore;
            }
        }
    }

    const created = await prisma.propertyListing.create({
        data: {
            title: listing.title,
            description: listing.description || null,
            price: listing.price,
            propertyType: listing.property_type,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            areaSqft: listing.area_sqft,
            latitude: listing.latitude,
            longitude: listing.longitude,
            ownerId: listing.owner_id,
            areaId: nearestAreaId,
            visitScoreSnapshot: visitScoreSnapshot,
            verified: false,
        },
    });

    return formatListing(created)!;
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
    const where: any = {};

    if (filters.areaId) where.areaId = filters.areaId;
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.minBedrooms !== undefined) where.bedrooms = { gte: filters.minBedrooms };
    if (filters.verified !== undefined) where.verified = filters.verified;

    const listings = await prisma.propertyListing.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return listings.map((l) => formatListing(l)!) ?? [];
}

/**
 * Get nearby property listings within a radius (in km).
 */
export async function getNearbyListings(
    lat: number,
    lng: number,
    radiusKm: number = 2
): Promise<PropertyListing[]> {
    const listings = await prisma.propertyListing.findMany();
    
    const degRadius = radiusKm / 111;
    const nearby = listings.filter((p) => {
        const dist = Math.sqrt(
            Math.pow(p.latitude - lat, 2) + Math.pow(p.longitude - lng, 2)
        );
        return dist <= degRadius;
    });

    return nearby.map((l) => formatListing(l)!) ?? [];
}

/**
 * Toggle verification status of a property listing (developer action).
 */
export async function toggleVerification(
    listingId: string,
    field: "verified",
    currentValue: boolean
): Promise<void> {
    await prisma.propertyListing.update({
        where: { id: listingId },
        data: { verified: !currentValue },
    });
}
