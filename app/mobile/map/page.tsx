"use client";

import { useEffect, useState } from "react";
import { Area } from "@/types/database";
import { supabase } from "@/lib/supabase";
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

    // Initial fetch
    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("areas")
                .select("*")
                .order("current_visit_score", { ascending: false });
            if (data) {
                setAreas(data as Area[]);

                // Process URL Parameters and link matching area
                const mapLat = searchParams.get("lat");
                const mapLng = searchParams.get("lng");
                const openScore = searchParams.get("openScore");

                if (mapLat && mapLng && openScore === "true") {
                    const latNum = parseFloat(mapLat);
                    const lngNum = parseFloat(mapLng);

                    // FInd exactly matching area
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
        }
        load();
    }, [searchParams]);

    // Real-time updates subscription
    useEffect(() => {
        const channel = supabase
            .channel("score-updates-mobile")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "visit_scores" },
                async () => {
                    const { data } = await supabase
                        .from("areas")
                        .select("*")
                        .order("current_visit_score", { ascending: false });
                    if (data) setAreas(data as Area[]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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
