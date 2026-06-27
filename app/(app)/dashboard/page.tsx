/**
 * --------------------------------------------------------
 * File: app/(app)/dashboard/page.tsx
 * Purpose: Desktop livability dashboard homepage.
 * Responsibilities: Renders the full screen Google Map with overlays, search controls, and details sidebar panel.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, LogOut, Menu, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { VisitScoreCard } from "@/components/score/VisitScoreCard";
import { AreaPanel } from "@/components/score/AreaPanel";
import PropertyListingsPanel from "@/components/dashboard/PropertyListingsPanel";
import CommunityPanel from "@/components/dashboard/CommunityPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { getAllMapAreas, getAreaMetrics } from "@/app/actions/dbActions";
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
    const [communityOpen, setCommunityOpen] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    });

    // Fetch areas
    useEffect(() => {
        async function load() {
            const { data } = await getAllMapAreas();
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
            const { data } = await getAreaMetrics(selectedArea!.id);
            if (data) setMetrics(data as AreaMetrics);
        }
        loadMetrics();
    }, [selectedArea]);

    const onMarkerClick = useCallback((area: Area) => {
        setSelectedArea(area);
        setSidebarOpen(false);
        setCommunityOpen(false);
    }, []);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-dark)" }}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "var(--brand-accent)", borderTopColor: "transparent" }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen overflow-hidden" style={{ background: "var(--bg-dark)" }}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="glass-card p-2 cursor-pointer transition-colors theme-transition"
                    >
                        {sidebarOpen
                            ? <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                            : <Menu className="w-5 h-5" style={{ color: "var(--text-muted)" }} />}
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))" }}
                        >
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:block">Vi-SiT</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {user && (
                        <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>
                            {user.displayName || user.email}
                        </span>
                    )}
                    {user ? (
                        <button
                            onClick={logout}
                            className="glass-card p-2 cursor-pointer transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="glass-card px-4 py-2 text-sm transition-colors"
                            style={{ color: "var(--brand-accent)" }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Sidebar - Area list + Property Listings */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -350 }}
                        animate={{ x: 0 }}
                        exit={{ x: -350 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="absolute top-20 left-4 z-10 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar space-y-4"
                    >
                        {/* Areas Section */}
                        <div className="glass-card p-4">
                            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
                                Hyderabad Areas ({areas.length})
                            </h2>
                            <div className="space-y-2">
                                {areas.map((area) => (
                                    <button
                                        key={area.id}
                                        onClick={() => onMarkerClick(area)}
                                        className="w-full text-left p-3 rounded-xl transition-all theme-transition"
                                        style={{
                                            background: selectedArea?.id === area.id ? "rgba(13, 92, 138, 0.1)" : "transparent",
                                            border: selectedArea?.id === area.id ? "1px solid rgba(43, 163, 212, 0.25)" : "1px solid transparent",
                                        }}
                                    >
                                        <VisitScoreCard
                                            score={area.current_visit_score ?? 0}
                                            areaName={area.name}
                                            compact
                                        />
                                    </button>
                                ))}
                            </div>
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

            {/* Area details panel + Community button */}
            <AnimatePresence>
                {selectedArea && (
                    <div className="absolute top-20 right-4 z-10 flex gap-3">
                        {/* Community Panel (slides from right) */}
                        <CommunityPanel
                            areaId={selectedArea.id}
                            areaName={selectedArea.name}
                            isOpen={communityOpen}
                            onClose={() => setCommunityOpen(false)}
                        />

                        {/* Area Panel with community button */}
                        <div className="relative">
                            <AreaPanel
                                areaName={selectedArea.name}
                                zone={selectedArea.zone}
                                metrics={metrics}
                                score={selectedArea.current_visit_score ?? 0}
                                onClose={() => { setSelectedArea(null); setCommunityOpen(false); }}
                            />

                            {/* Community Reviews Button */}
                            <button
                                onClick={() => setCommunityOpen(!communityOpen)}
                                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all btn-glow"
                                style={{
                                    background: communityOpen
                                        ? "rgba(65, 139, 70, 0.15)"
                                        : "var(--bg-surface)",
                                    color: communityOpen ? "var(--brand-secondary)" : "var(--text-secondary)",
                                    border: communityOpen
                                        ? "1px solid rgba(65, 139, 70, 0.3)"
                                        : "1px solid var(--border)",
                                }}
                            >
                                <MessageSquare className="w-4 h-4" />
                                {communityOpen ? "Hide Community" : "Community Reviews"}
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Properties Panel (Bottom Center) */}
            <AnimatePresence>
                {selectedArea && !communityOpen && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-750px)] min-w-[320px] max-w-[550px] shadow-2xl"
                    >
                        <PropertyListingsPanel
                            areaId={selectedArea.id}
                            areaName={selectedArea.name}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom stats bar */}
            <AnimatePresence>
                {!communityOpen && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 glass-card px-6 py-3 flex items-center gap-6"
                    >
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: "var(--brand-accent)" }}>{areas.length}</div>
                            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Areas</div>
                        </div>
                        <div className="w-px h-8" style={{ background: "var(--border)" }} />
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: "var(--brand-secondary)" }}>
                                {areas.length > 0
                                    ? (areas.reduce((sum, a) => sum + (a.current_visit_score ?? 0), 0) / areas.length).toFixed(1)
                                    : "–"}
                            </div>
                            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Avg Score</div>
                        </div>
                        <div className="w-px h-8" style={{ background: "var(--border)" }} />
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
                                {areas.filter((a) => (a.current_visit_score ?? 0) >= 80).length}
                            </div>
                            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Above 80</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
