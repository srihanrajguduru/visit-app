/**
 * --------------------------------------------------------
 * File: services/areas.ts
 * Purpose: Area data access service.
 * Responsibilities: Handles fetching areas list, fetching single area by ID, and computing the nearest area based on coordinates using Prisma.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { prisma } from "@/lib/prisma";
import type { Area } from "@/types/database";

/**
 * Fetches all monitored areas ordered alphabetically by name.
 * 
 * @returns Array of Area records
 */
export async function getAllAreas(): Promise<Area[]> {
    const areas = await prisma.area.findMany({
        orderBy: {
            name: "asc",
        },
    });
    return areas as unknown as Area[];
}

/**
 * Fetches a single area by its unique identifier.
 * 
 * @param id Unique ID of the area
 * @returns Area record or null if not found
 */
export async function getAreaById(id: string): Promise<Area | null> {
    const area = await prisma.area.findUnique({
        where: { id },
    });
    return area as unknown as Area | null;
}

/**
 * Computes the nearest monitored area to a given latitude and longitude.
 * Uses Euclidean distance for immediate local searches.
 * 
 * @param lat Latitude of origin coordinate
 * @param lng Longitude of origin coordinate
 * @returns Nearest Area record or null
 */
export async function getNearestArea(
    lat: number,
    lng: number
): Promise<Area | null> {
    const areas = await prisma.area.findMany();

    if (areas.length === 0) return null;

    let nearest: any = null;
    let minDist = Infinity;

    for (const area of areas) {
        const dist = Math.sqrt(
            Math.pow(area.latitude - lat, 2) + Math.pow(area.longitude - lng, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = area;
        }
    }

    return nearest as unknown as Area | null;
}
