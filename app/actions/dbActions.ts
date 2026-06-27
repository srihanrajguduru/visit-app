/**
 * --------------------------------------------------------
 * File: app/actions/dbActions.ts
 * Purpose: Next.js Server Actions for secure database operations.
 * Responsibilities: Acts as the server-side database controller, executing SQLite queries via Prisma and returning standardized responses { data, error } to client-side components.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { createListing, toggleVerification } from "@/services/properties";
import { joinCommunity, leaveCommunity, createPost } from "@/services/communityService";

// Helper to wrap server action responses in standard { data, error } structure
async function runAction<T>(action: () => Promise<T>): Promise<{ data: T | null; error: { message: string } | null }> {
    try {
        const result = await action();
        return { data: result, error: null };
    } catch (e: any) {
        console.error("Server Action Error:", e);
        return { data: null, error: { message: e.message || "An unexpected error occurred" } };
    }
}

/**
 * Fetch top 20 trending areas by Visit Score
 */
export async function getTrendingAreas() {
    return runAction(async () => {
        const areas = await prisma.area.findMany({
            orderBy: {
                currentVisitScore: "desc",
            },
            take: 20,
        });
        return areas.map((a) => ({
            id: a.id,
            name: a.name,
            latitude: a.latitude,
            longitude: a.longitude,
            current_visit_score: a.currentVisitScore,
            created_at: a.createdAt.toISOString(),
        }));
    });
}

/**
 * Fetch saved area IDs for a user
 */
export async function getSavedAreaIds(userId: string) {
    return runAction(async () => {
        const saved = await prisma.savedArea.findMany({
            where: { userId },
            select: { areaId: true },
        });
        return saved.map((s) => ({ area_id: s.areaId }));
    });
}

/**
 * Save an area for a user
 */
export async function saveArea(userId: string, areaId: string) {
    return runAction(async () => {
        return prisma.savedArea.create({
            data: {
                userId,
                areaId,
            },
        });
    });
}

/**
 * Unsave an area for a user
 */
export async function unsaveArea(userId: string, areaId: string) {
    return runAction(async () => {
        return prisma.savedArea.deleteMany({
            where: {
                userId,
                areaId,
            },
        });
    });
}

/**
 * Unsave/Delete a saved area by its specific row ID
 */
export async function deleteSavedAreaById(id: string) {
    return runAction(async () => {
        return prisma.savedArea.delete({
            where: { id },
        });
    });
}

/**
 * Fetch all areas for mapping
 */
export async function getAllMapAreas() {
    return runAction(async () => {
        const areas = await prisma.area.findMany({
            orderBy: {
                currentVisitScore: "desc",
            },
        });
        return areas.map((a) => ({
            id: a.id,
            name: a.name,
            latitude: a.latitude,
            longitude: a.longitude,
            current_visit_score: a.currentVisitScore,
        }));
    });
}

/**
 * Fetch all areas alphabetically
 */
export async function getAllAreasAlphabetical() {
    return runAction(async () => {
        const areas = await prisma.area.findMany({
            orderBy: {
                name: "asc",
            },
        });
        return areas.map((a) => ({
            id: a.id,
            name: a.name,
            zone: a.zone,
            current_visit_score: a.currentVisitScore,
        }));
    });
}

/**
 * Update an area's Visit Score
 */
export async function updateAreaScore(id: string, score: number) {
    return runAction(async () => {
        return prisma.area.update({
            where: { id },
            data: { currentVisitScore: score },
        });
    });
}

/**
 * Fetch metrics for a specific area
 */
export async function getAreaMetrics(areaId: string) {
    return runAction(async () => {
        const metrics = await prisma.areaMetrics.findFirst({
            where: { areaId },
            orderBy: { createdAt: "desc" },
        });
        if (!metrics) return null;
        return {
            id: metrics.id,
            area_id: metrics.areaId,
            dataset_version: metrics.datasetVersion,
            aqi: metrics.aqi,
            noise: metrics.noise,
            flood_risk: metrics.floodRisk,
            metro_distance: metrics.metroDistance,
            road_quality: metrics.roadQuality,
            water_supply_score: metrics.waterSupplyScore,
            internet_score: metrics.internetScore,
            crime_rate: metrics.crimeRate,
            women_safety_score: metrics.womenSafetyScore,
            amenity_score: metrics.amenityScore,
            created_at: metrics.createdAt.toISOString(),
        };
    });
}

/**
 * Check if an area is saved by a user
 */
export async function checkSavedStatus(userId: string, areaId: string) {
    return runAction(async () => {
        const saved = await prisma.savedArea.findFirst({
            where: { userId, areaId },
        });
        return saved ? { id: saved.id } : null;
    });
}

/**
 * Fetch all infrastructure nodes
 */
export async function getInfrastructureNodes() {
    return runAction(async () => {
        const nodes = await prisma.infrastructureNode.findMany();
        return nodes.map((n) => ({
            id: n.id,
            name: n.name,
            type: n.type,
            latitude: n.latitude,
            longitude: n.longitude,
            status: n.status,
        }));
    });
}

/**
 * Fetch property listings with their area name and zone (merged in memory)
 */
export async function getPropertyListings(areaId: string | null = null) {
    return runAction(async () => {
        const where = areaId ? { areaId } : {};
        const listings = await prisma.propertyListing.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        const areas = await prisma.area.findMany();
        return listings.map((l) => {
            const area = areas.find((a) => a.id === l.areaId);
            return {
                id: l.id,
                title: l.title,
                price: Number(l.price),
                property_type: l.propertyType,
                bedrooms: l.bedrooms,
                bathrooms: l.bathrooms,
                area_sqft: l.areaSqft,
                verified: l.verified,
                owner_id: l.ownerId,
                visit_score_snapshot: l.visitScoreSnapshot,
                created_at: l.createdAt.toISOString(),
                areas: area ? { name: area.name, zone: area.zone } : null,
            };
        });
    });
}

/**
 * Fetch verified property listings with images and metadata (merged in memory)
 */
export async function getVerifiedPropertyListings() {
    return runAction(async () => {
        const listings = await prisma.propertyListing.findMany({
            where: { verified: true },
            orderBy: { createdAt: "desc" },
        });
        const images = await prisma.propertyImage.findMany();
        const metadata = await prisma.propertyMetadata.findMany();
        return listings.map((l) => {
            const listImages = images.filter((img) => img.propertyId === l.id).map((img) => ({ image_url: img.imageUrl }));
            const listMeta = metadata.find((m) => m.propertyId === l.id);
            return {
                id: l.id,
                title: l.title,
                description: l.description,
                price: Number(l.price),
                property_type: l.propertyType,
                bedrooms: l.bedrooms,
                bathrooms: l.bathrooms,
                area_sqft: l.areaSqft,
                latitude: l.latitude,
                longitude: l.longitude,
                area_id: l.areaId,
                visit_score_snapshot: l.visitScoreSnapshot,
                owner_id: l.ownerId,
                verified: l.verified,
                created_at: l.createdAt.toISOString(),
                property_images: listImages,
                property_metadata: listMeta ? {
                    id: listMeta.id,
                    property_id: listMeta.propertyId,
                    cleanliness_score: listMeta.cleanlinessScore,
                    maintenance_score: listMeta.maintenanceScore,
                    cleanlinessScore: listMeta.cleanlinessScore, // support both casings
                    maintenanceScore: listMeta.maintenanceScore,
                    demand_score: listMeta.demandScore,
                    demandScore: listMeta.demandScore,
                    noise_score: listMeta.noiseScore,
                    noiseScore: listMeta.noiseScore,
                } : null,
            };
        });
    });
}

/**
 * Create a new property listing
 */
export async function createPropertyListing(payload: {
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
}) {
    return runAction(async () => {
        return createListing(payload);
    });
}

/**
 * Toggle property verification status
 */
export async function togglePropertyVerification(id: string, currentValue: boolean) {
    return runAction(async () => {
        return toggleVerification(id, "verified", currentValue);
    });
}

/**
 * Fetch community posts for an area (merged with profiles in memory)
 */
export async function getAreaCommunityPosts(areaId: string) {
    return runAction(async () => {
        const posts = await prisma.communityPost.findMany({
            where: { areaId },
            orderBy: { createdAt: "desc" },
        });
        const profiles = await prisma.userProfile.findMany();
        return posts.map((p) => {
            const profile = profiles.find((prof) => prof.userId === p.userId);
            return {
                id: p.id,
                area_id: p.areaId,
                user_id: p.userId,
                content: p.content,
                created_at: p.createdAt.toISOString(),
                user_profiles: profile ? {
                    name: profile.name,
                    avatar_url: profile.avatarUrl,
                } : null,
            };
        });
    });
}

/**
 * Get count of comments on a post
 */
export async function getPostCommentsCount(postId: string) {
    return runAction(async () => {
        return prisma.communityComment.count({
            where: { postId },
        });
    });
}

/**
 * Get community membership status for a user
 */
export async function getCommunityMembership(areaId: string, userId: string) {
    return runAction(async () => {
        const member = await prisma.communityMember.findUnique({
            where: {
                areaId_userId: { areaId, userId },
            },
        });
        if (!member) return null;
        return {
            id: member.id,
            area_id: member.areaId,
            user_id: member.userId,
            membership_type: member.membershipType,
            joined_at: member.joinedAt.toISOString(),
        };
    });
}

/**
 * Join community of an area
 */
export async function joinAreaCommunity(areaId: string, userId: string) {
    return runAction(async () => {
        const member = await joinCommunity(areaId, userId);
        return {
            id: member.id,
            area_id: member.area_id,
            user_id: member.user_id,
            membership_type: member.membership_type,
            joined_at: member.joined_at,
        };
    });
}

/**
 * Leave community of an area
 */
export async function leaveAreaCommunity(areaId: string, userId: string) {
    return runAction(async () => {
        return leaveCommunity(areaId, userId);
    });
}

/**
 * Create a new post in community
 */
export async function createAreaPost(areaId: string, userId: string, content: string) {
    return runAction(async () => {
        const post = await createPost(areaId, userId, content);
        return {
            id: post.id,
            area_id: post.area_id,
            user_id: post.user_id,
            content: post.content,
            created_at: post.created_at,
        };
    });
}

/**
 * Fetch saved areas with metadata for a user (merged in memory)
 */
export async function getSavedAreasWithMetadata(userId: string) {
    return runAction(async () => {
        const saved = await prisma.savedArea.findMany({
            where: { userId },
        });
        const areas = await prisma.area.findMany();
        return saved.map((s) => {
            const area = areas.find((a) => a.id === s.areaId);
            return {
                id: s.id,
                user_id: s.userId,
                area_id: s.areaId,
                created_at: s.createdAt.toISOString(),
                area: area ? {
                    id: area.id,
                    name: area.name,
                    zone: area.zone,
                    current_visit_score: area.currentVisitScore,
                } : null,
            };
        });
    });
}

/**
 * Get profile stats: count of saved areas, joined communities, and owned listings
 */
export async function getProfileStats(userId: string) {
    return runAction(async () => {
        const savedCount = await prisma.savedArea.count({
            where: { userId },
        });
        const communityCount = await prisma.communityMember.count({
            where: { userId },
        });
        const listingCount = await prisma.propertyListing.count({
            where: { ownerId: userId },
        });
        return {
            savedCount,
            communityCount,
            listingCount,
        };
    });
}

/**
 * Get count of members in a community
 */
export async function getCommunityMemberCount(areaId: string) {
    return runAction(async () => {
        return prisma.communityMember.count({
            where: { areaId },
        });
    });
}

/**
 * Get administrator statistics for dashboard overview
 */
export async function getAdminStats() {
    return runAction(async () => {
        const areasCount = await prisma.area.count();
        const datasetsCount = await prisma.dataset.count();
        const scores = await prisma.visitScore.findMany({
            select: { visitScore: true }
        });
        const avg = scores.length > 0
            ? scores.reduce((sum, curr) => sum + Number(curr.visitScore || 0), 0) / scores.length
            : 0;
        return {
            areasCount,
            datasetsCount,
            avgScore: avg
        };
    });
}

/**
 * Create a new geographical area
 */
export async function createArea(payload: {
    name: string;
    latitude: number;
    longitude: number;
    zone?: string;
    current_visit_score?: number;
}) {
    return runAction(async () => {
        const area = await prisma.area.create({
            data: {
                name: payload.name,
                latitude: payload.latitude,
                longitude: payload.longitude,
                zone: payload.zone || "Unknown",
                currentVisitScore: payload.current_visit_score || 0,
            }
        });
        return {
            id: area.id,
            name: area.name,
            latitude: area.latitude,
            longitude: area.longitude,
            zone: area.zone,
            current_visit_score: area.currentVisitScore,
            created_at: area.createdAt.toISOString()
        };
    });
}

/**
 * Fetch all community posts across areas
 */
export async function getAllCommunityPosts() {
    return runAction(async () => {
        const posts = await prisma.communityPost.findMany({
            orderBy: { createdAt: "desc" },
            take: 100
        });
        const areas = await prisma.area.findMany();
        return posts.map(p => {
            const area = areas.find(a => a.id === p.areaId);
            return {
                id: p.id,
                area_id: p.areaId,
                user_id: p.userId,
                content: p.content,
                created_at: p.createdAt.toISOString(),
                areas: area ? { name: area.name } : null
            };
        });
    });
}

/**
 * Delete a community post by ID
 */
export async function deleteCommunityPost(id: string) {
    return runAction(async () => {
        return prisma.communityPost.delete({
            where: { id }
        });
    });
}

const GOV_PROJECTS_FILE = path.join(process.cwd(), "prisma", "gov_projects.json");

// Helper to get gov projects
function readGovProjectsSync(): any[] {
    try {
        if (fs.existsSync(GOV_PROJECTS_FILE)) {
            return JSON.parse(fs.readFileSync(GOV_PROJECTS_FILE, "utf-8"));
        }
    } catch (e) {
        console.error("Error reading gov projects:", e);
    }
    return [];
}

function writeGovProjectsSync(projects: any[]) {
    try {
        fs.writeFileSync(GOV_PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
    } catch (e) {
        console.error("Error writing gov projects:", e);
    }
}

/**
 * Fetch all municipal projects
 */
export async function getGovProjects() {
    return runAction(async () => {
        const localData = readGovProjectsSync();
        return localData.length > 0 ? localData : null;
    });
}

/**
 * Register a new municipal project
 */
export async function createGovProject(project: {
    project_name: string;
    latitude: number;
    longitude: number;
    completion_date: string;
    impact_score: number;
}) {
    return runAction(async () => {
        const localData = readGovProjectsSync();
        const newProj = {
            id: Math.random().toString(),
            project_name: project.project_name,
            latitude: Number(project.latitude),
            longitude: Number(project.longitude),
            completion_date: project.completion_date,
            impact_score: Number(project.impact_score),
            created_at: new Date().toISOString()
        };
        localData.push(newProj);
        writeGovProjectsSync(localData);
        return newProj;
    });
}

/**
 * Create a new infrastructure node
 */
export async function createInfrastructureNode(payload: {
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    status?: string;
}) {
    return runAction(async () => {
        const node = await prisma.infrastructureNode.create({
            data: {
                name: payload.name,
                type: payload.type,
                latitude: payload.latitude,
                longitude: payload.longitude,
                status: payload.status || "Operational",
            }
        });
        return {
            id: node.id,
            name: node.name,
            type: node.type,
            latitude: node.latitude,
            longitude: node.longitude,
            status: node.status,
            created_at: node.createdAt.toISOString()
        };
    });
}

/**
 * Create or update area metrics
 */
export async function createAreaMetrics(payload: {
    area_id: string;
    dataset_version: string;
    aqi: number;
    noise: number;
    flood_risk: number | string;
    metro_distance: number;
    road_quality: number;
    internet_score: number;
    crime_rate: number;
    women_safety_score: number;
}) {
    return runAction(async () => {
        const floodRisk = typeof payload.flood_risk === "string" 
            ? (payload.flood_risk === "High" ? 8 : (payload.flood_risk === "Moderate" ? 5 : 2))
            : payload.flood_risk;
        return prisma.areaMetrics.create({
            data: {
                areaId: payload.area_id,
                datasetVersion: payload.dataset_version,
                aqi: payload.aqi,
                noise: payload.noise,
                floodRisk: floodRisk,
                metroDistance: payload.metro_distance,
                roadQuality: payload.road_quality,
                internetScore: payload.internet_score,
                crimeRate: payload.crime_rate,
                womenSafetyScore: payload.women_safety_score,
            }
        });
    });
}

