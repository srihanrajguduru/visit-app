"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { VisitScoreCard } from "@/components/score/VisitScoreCard";
import { AreaPanel } from "@/components/score/AreaPanel";
import { supabase } from "@/lib/supabase";
import { getScoreColor } from "@/lib/utils";
import type { Area, AreaMetrics } from "@/types/database";

const mapContainerStyle = {
    width: "100%",
    height: "100vh",
};

const center = { lat: 17.385, lng: 78.4867 };

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

export const dynamic = "force-dynamic";

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [metrics, setMetrics] = useState<AreaMetrics | null>(null);
    const [hoveredArea, setHoveredArea] = useState<Area | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    });

    // Fetch areas
    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("areas")
                .select("*")
                .order("current_visit_score", { ascending: false });
            if (data) setAreas(data as Area[]);
        }
        load();
    }, []);

    // Fetch metrics when area selected
    useEffect(() => {
        if (!selectedArea) {
            setMetrics(null);
            return;
        }
        async function loadMetrics() {
            const { data } = await supabase
                .from("area_metrics")
                .select("*")
                .eq("area_id", selectedArea!.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            if (data) setMetrics(data as AreaMetrics);
        }
        loadMetrics();
    }, [selectedArea]);

    // Subscribe to realtime score updates
    useEffect(() => {
        const channel = supabase
            .channel("score-updates")
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

        return () => { supabase.removeChannel(channel); };
    }, []);

    const onMarkerClick = useCallback((area: Area) => {
        setSelectedArea(area);
        setSidebarOpen(false);
    }, []);

    if (!isLoaded) {
        return (
            <div className="bg-gray-950 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen overflow-hidden bg-gray-950">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="glass-card p-2 cursor-pointer hover:border-indigo-500/50 transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:block">Visit</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {user && (
                        <span className="text-xs text-gray-500 hidden sm:block">
                            {user.displayName || user.email}
                        </span>
                    )}
                    {user ? (
                        <button
                            onClick={logout}
                            className="glass-card p-2 cursor-pointer hover:border-red-500/50 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4 text-gray-400" />
                        </button>
                    ) : (
                        <Link href="/login" className="glass-card px-4 py-2 text-sm text-indigo-400 hover:text-white transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Sidebar - Area list */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -350 }}
                        animate={{ x: 0 }}
                        exit={{ x: -350 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="absolute top-20 left-4 z-10 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto glass-card p-4"
                    >
                        <h2 className="text-sm font-semibold text-gray-300 mb-4">
                            Hyderabad Areas ({areas.length})
                        </h2>
                        <div className="space-y-2">
                            {areas.map((area) => (
                                <button
                                    key={area.id}
                                    onClick={() => onMarkerClick(area)}
                                    className={`w-full text-left p-3 rounded-xl transition-all hover:bg-gray-800/60 ${selectedArea?.id === area.id ? "bg-indigo-500/10 border border-indigo-500/30" : "border border-transparent"
                                        }`}
                                >
                                    <VisitScoreCard
                                        score={area.current_visit_score ?? 0}
                                        areaName={area.name}
                                        compact
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map */}
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedArea ? { lat: selectedArea.latitude, lng: selectedArea.longitude } : center}
                zoom={selectedArea ? 14 : 12}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {areas.map((area) => {
                    const score = area.current_visit_score ?? 0;
                    const color = getScoreColor(score);
                    return (
                        <MarkerF
                            key={area.id}
                            position={{ lat: area.latitude, lng: area.longitude }}
                            onClick={() => onMarkerClick(area)}
                            onMouseOver={() => setHoveredArea(area)}
                            onMouseOut={() => setHoveredArea(null)}
                            icon={{
                                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                                fillColor: color,
                                fillOpacity: 0.9,
                                strokeColor: "#fff",
                                strokeWeight: 1.5,
                                scale: 1.5,
                                anchor: new google.maps.Point(12, 22),
                            }}
                        >
                            {hoveredArea?.id === area.id && (
                                <InfoWindowF onCloseClick={() => setHoveredArea(null)}>
                                    <div className="p-2 text-gray-900">
                                        <div className="font-semibold">{area.name}</div>
                                        <div className="text-sm" style={{ color }}>
                                            Score: {score.toFixed(1)}
                                        </div>
                                    </div>
                                </InfoWindowF>
                            )}
                        </MarkerF>
                    );
                })}
            </GoogleMap>

            {/* Area details panel */}
            <AnimatePresence>
                {selectedArea && (
                    <div className="absolute top-20 right-4 z-10">
                        <AreaPanel
                            areaName={selectedArea.name}
                            zone={selectedArea.zone}
                            metrics={metrics}
                            score={selectedArea.current_visit_score ?? 0}
                            onClose={() => setSelectedArea(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom stats bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card px-6 py-3 flex items-center gap-6"
                >
                    <div className="text-center">
                        <div className="text-lg font-bold text-indigo-400">{areas.length}</div>
                        <div className="text-[10px] text-gray-500">Areas</div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                            {areas.length > 0
                                ? (areas.reduce((sum, a) => sum + (a.current_visit_score ?? 0), 0) / areas.length).toFixed(1)
                                : "–"}
                        </div>
                        <div className="text-[10px] text-gray-500">Avg Score</div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                            {areas.filter((a) => (a.current_visit_score ?? 0) >= 80).length}
                        </div>
                        <div className="text-[10px] text-gray-500">Above 80</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
