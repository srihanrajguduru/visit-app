/**
 * --------------------------------------------------------
 * File: app/mobile/map/page.tsx
 * Purpose: Interactive map dashboard page for mobile.
 * Responsibilities: Render map markers for neighborhoods, support click mapping, geolocation lookup, and detail overlay sheets.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useEffect, useState } from "react";
import { Area } from "@/types/database";
import { getAllMapAreas } from "@/app/actions/dbActions";
import nextDynamic from "next/dynamic";

const MobileMap = nextDynamic(() => import("@/components/mobile/MobileMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Loading Map...</div>
});
import MobileBottomSheet from "@/components/mobile/MobileBottomSheet";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import MobileSearchBar from "@/components/mobile/MobileSearchBar";
import { getAreaByCoordinates } from "@/services/areaService";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// export const dynamic = "force-dynamic";
export const dynamic = "auto";

function MapDashboardContent() {
    const searchParams = useSearchParams();

    // Compute initial state synchronously to prevent map teleporting
    const [initialCenter] = useState(() => {
        const mapLat = searchParams.get("lat");
        const mapLng = searchParams.get("lng");
        const openScore = searchParams.get("openScore");
        if (mapLat && mapLng && openScore === "true") {
            return { lat: parseFloat(mapLat), lng: parseFloat(mapLng) };
        }
        return undefined;
    });

    const [initialZoom] = useState(() => {
        const mapLat = searchParams.get("lat");
        const mapLng = searchParams.get("lng");
        const openScore = searchParams.get("openScore");
        if (mapLat && mapLng && openScore === "true") return 15;
        return undefined;
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [clickedCoord, setClickedCoord] = useState<{ lat: number, lng: number } | null>(null);
    const [visitScoreData, setVisitScoreData] = useState<any>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        async function load() {
            setIsDataLoading(true);
            setLoadError(null);

            // Fetch columns needed for map markers
            const { data, error } = await getAllMapAreas();

            if (error) {
                console.error("Supabase areas fetch error:", error);
                setLoadError(`DB Error: ${error.message}`);
                setIsDataLoading(false);
                return;
            }

            if (!data || data.length === 0) {
                setLoadError("No areas data returned.");
                setIsDataLoading(false);
                return;
            }

            setAreas(data as Area[]);
            setIsDataLoading(false);

            // Process URL Parameters and link matching area
            const mapLat = searchParams.get("lat");
            const mapLng = searchParams.get("lng");
            const openScore = searchParams.get("openScore");

            if (mapLat && mapLng && openScore === "true") {
                const latNum = parseFloat(mapLat);
                const lngNum = parseFloat(mapLng);

                // Find exactly matching area
                const matched = data.find((a: any) =>
                    Math.abs(a.latitude - latNum) < 0.0001 &&
                    Math.abs(a.longitude - lngNum) < 0.0001
                );

                if (matched) {
                    setSelectedArea(matched as Area);
                    setVisitScoreData(matched);
                } else {
                    // Fallback click handle trigger
                    handleMapClick(latNum, lngNum);
                }
            }
        }
        load();
    }, [searchParams]);

    // Map Click Intelligence Addon
    async function handleMapClick(lat: number, lng: number) {
        console.log("clicked coordinates:", lat, lng);
        setClickedCoord({ lat, lng });

        try {
            const area = await getAreaByCoordinates(lat, lng);

            console.log("nearest area:", area.name);
            console.log("visit score returned:", area.current_visit_score);

            setSelectedArea(area as any);
            setVisitScoreData(area);
        } catch (error) {
            console.error("No Visit Score data available for this location yet", error);
        }
    }

    return (
        <main className="w-full h-screen relative flex flex-col bg-gray-950">
            {/* Error Banner — only shows on real errors, not slow loads */}
            {loadError && (
                <div className="absolute top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-xs p-3 text-center font-mono leading-snug">
                    ⚠️ {loadError}
                </div>
            )}
            {/* Subtle loading pill — hides itself once data arrives */}
            {isDataLoading && areas.length === 0 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/90 backdrop-blur-sm text-indigo-300 text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            )}
            {/* Top Search Bar */}
            <MobileSearchBar areas={areas} onSelectArea={setSelectedArea} />

            {/* Google Maps Base Layer */}
            <div className="flex-1 w-full h-full relative">
                <MobileMap
                    areas={areas}
                    selectedArea={selectedArea}
                    onMarkerClick={setSelectedArea}
                    onMapClick={handleMapClick}
                    clickedCoord={clickedCoord}
                    initialCenter={initialCenter}
                    initialZoom={initialZoom}
                />
            </div>

            {/* Draggable Bottom Sheet for selected area or generic overview */}
            <MobileBottomSheet
                areas={areas}
                selectedArea={selectedArea}
                visitScoreData={visitScoreData}
                onClose={() => setSelectedArea(null)}
            />

            {/* Fixed Bottom Navigation */}
            <MobileNavigation />
        </main>
    );
}

export default function MobileDashboardPage() {
    return (
        <Suspense fallback={<div className="w-full h-screen bg-gray-950 flex items-center justify-center text-white">Loading Map...</div>}>
            <MapDashboardContent />
        </Suspense>
    );
}
