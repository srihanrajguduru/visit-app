"use client";

import { useState, useEffect } from "react";
import { Area, AreaMetrics } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { motion, useAnimation, PanInfo } from "framer-motion";
import MobileVisitScoreCard from "./MobileVisitScoreCard";
import { X, Activity, Droplets, MapPin, ShieldAlert, Wifi, Building2, Search, Train, Bookmark } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

interface MobileBottomSheetProps {
    areas: Area[];
    selectedArea: Area | null;
    visitScoreData?: any;
    onClose: () => void;
}

// SNAP POINTS for the sheet (percentages of screen height)
const SNAP_POINTS = {
    HIDDEN: "100%",
    COLLAPSED: "75%", // 100 - 25 = 75%
    HALF: "50%",      // 100 - 50 = 50%
    FULL: "15%",      // 100 - 85 = 15%
};

export default function MobileBottomSheet({ areas, selectedArea, visitScoreData, onClose }: MobileBottomSheetProps) {
    const [metrics, setMetrics] = useState<AreaMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const controls = useAnimation();
    const { user } = useAuth();
    const hasAdvancedData = !!visitScoreData;
    const activeMetrics = visitScoreData?.metrics || metrics;

    const [showDetailedMode, setShowDetailedMode] = useState(false);

    // Track current snap point manually to handle logic
    const [currentSnap, setCurrentSnap] = useState(SNAP_POINTS.COLLAPSED);

    useEffect(() => {
        if (!selectedArea) {
            controls.start({ y: SNAP_POINTS.HIDDEN });
            setCurrentSnap(SNAP_POINTS.HIDDEN);
            setMetrics(null);
            return;
        }

        // When a new area is selected, snap to HALF open
        controls.start({ y: SNAP_POINTS.HALF, transition: { type: "spring", damping: 25, stiffness: 200 } });
        setCurrentSnap(SNAP_POINTS.HALF);
        setShowDetailedMode(false);

        async function fetchMetrics() {
            setIsLoading(true);
            const { data } = await supabase
                .from("area_metrics")
                .select("*")
                .eq("area_id", selectedArea!.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) setMetrics(data as AreaMetrics);
            setIsLoading(false);
        }

        async function checkSavedStatus() {
            if (!user) return;
            const { data } = await supabase
                .from("saved_areas")
                .select("id")
                .eq("area_id", selectedArea!.id)
                .eq("user_id", user.uid)
                .single();
            setIsSaved(!!data);
        }

        if (!hasAdvancedData) fetchMetrics();
        checkSavedStatus();
    }, [selectedArea, hasAdvancedData, controls, user]);

    // Handle drag end to snap to nearest point
    const handleDragEnd = (event: any, info: PanInfo) => {
        const yDirection = info.offset.y;
        const velocity = info.velocity.y;

        let targetSnap = currentSnap;

        // Swiping Down
        if (yDirection > 50 || velocity > 500) {
            if (currentSnap === SNAP_POINTS.FULL) targetSnap = SNAP_POINTS.HALF;
            else if (currentSnap === SNAP_POINTS.HALF) targetSnap = SNAP_POINTS.COLLAPSED;
            else if (currentSnap === SNAP_POINTS.COLLAPSED) {
                targetSnap = SNAP_POINTS.HIDDEN;
                onClose(); // De-select area
            }
        }
        // Swiping Up
        else if (yDirection < -50 || velocity < -500) {
            if (currentSnap === SNAP_POINTS.COLLAPSED) targetSnap = SNAP_POINTS.HALF;
            else if (currentSnap === SNAP_POINTS.HALF) targetSnap = SNAP_POINTS.FULL;
        }

        setCurrentSnap(targetSnap);
        controls.start({ y: targetSnap, transition: { type: "spring", damping: 25, stiffness: 200 } });
    };

    if (!selectedArea) return null;

    return (
        <motion.div
            className="fixed left-0 right-0 bottom-0 z-[999] bg-gray-950 border-t border-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] touch-pan-y"
            initial={{ y: "100%" }}
            animate={controls}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ height: "85vh", maxHeight: "90vh", overflowY: "auto" }}
        >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-4">
                <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
            </div>

            {/* Header / Collapsed View */}
            <div className="px-6 pb-6 border-b border-gray-800/50">
                <div className="flex justify-between items-start">
                    <MobileVisitScoreCard score={selectedArea.current_visit_score ?? 0} areaName={selectedArea.name} />

                    <button onClick={onClose} className="p-2 bg-gray-900 rounded-full text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content for Half/Full Expansion */}
            <div className="px-6 py-6 pb-32 overflow-y-auto" style={{ maxHeight: "calc(100vh - 150px)" }}>
                {isLoading && !hasAdvancedData ? (
                    <div className="flex items-center justify-center py-10 opacity-50">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : showDetailedMode && activeMetrics ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                        <button
                            onClick={() => setShowDetailedMode(false)}
                            className="flex items-center gap-2 text-indigo-400 focus:outline-none font-medium mb-4 active:opacity-70 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Overview
                        </button>

                        <section>
                            <h3 className="text-[16px] font-bold text-white mb-4 tracking-wide">Environmental</h3>
                            <ProgressBarMetric label="AQI (PM2.5)" value={activeMetrics.aqi ?? 0} max={500} unit="μg/m³" colorClass="bg-red-500" />
                            <ProgressBarMetric label="Noise Level" value={activeMetrics.noise ?? 0} max={100} unit="dB" colorClass="bg-orange-500" />
                            <ProgressBarMetric label="Flood Risk" value={(activeMetrics.flood_risk ?? 0) * 100} max={100} unit="%" colorClass="bg-yellow-500" />
                        </section>

                        <section>
                            <h3 className="text-[16px] font-bold text-white mb-4 tracking-wide">Infrastructure</h3>
                            <ProgressBarMetric label="Metro Distance" value={(activeMetrics.metro_distance ?? 5000) / 1000} max={10} unit="km" colorClass="bg-indigo-500" />
                            <ProgressBarMetric label="Road Quality" value={(activeMetrics.road_quality ?? 0.5) * 100} max={100} unit="%" colorClass="bg-purple-500" />
                            <ProgressBarMetric label="Water Supply" value={(activeMetrics.water_supply_score ?? 0.5) * 100} max={100} unit="%" colorClass="bg-blue-500" />
                            <ProgressBarMetric label="Internet" value={(activeMetrics.internet_score ?? 0.5) * 100} max={100} unit="%" colorClass="bg-cyan-500" />
                        </section>

                        <section>
                            <h3 className="text-[16px] font-bold text-white mb-4 tracking-wide">Social</h3>
                            <ProgressBarMetric label="Safety Score" value={activeMetrics.women_safety_score ?? 50} max={100} unit="" colorClass="bg-green-500" />
                            <ProgressBarMetric label="Crime Rate" value={activeMetrics.crime_rate ?? 30} max={100} unit="" colorClass="bg-red-500" />
                            <ProgressBarMetric label="Amenity Score" value={activeMetrics.amenity_score ?? 50} max={100} unit="" colorClass="bg-purple-500" />
                        </section>

                        <div className="pt-2">
                            <button
                                onClick={handleToggleSave}
                                disabled={isSaving}
                                className={`w-full py-4 font-bold rounded-2xl transition-colors border shadow-lg flex justify-center items-center gap-2 ${isSaved
                                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30"
                                    : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                                    }`}
                            >
                                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                                {isSaving ? "Updating..." : isSaved ? "Saved Area" : "Save Area"}
                            </button>
                        </div>
                    </div>
                ) : hasAdvancedData ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Section: Visit Intelligence Overview */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Location Intelligence</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <ScoreBox label="Environment" value={visitScoreData.environmental_score} color="text-green-400" />
                                <ScoreBox label="Infrastructure" value={visitScoreData.infrastructure_score} color="text-indigo-400" />
                                <ScoreBox label="Social Factor" value={visitScoreData.social_score} color="text-pink-400" />
                            </div>
                        </section>

                        {/* Pros & Cons Section */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" /> Pros
                                </h4>
                                <ul className="space-y-2 text-[13px] text-gray-300">
                                    {visitScoreData.pros?.map((p: string, i: number) => (
                                        <li key={i}>• {p}</li>
                                    ))}
                                    {(!visitScoreData.pros || visitScoreData.pros.length === 0) && <li>No major advantages</li>}
                                </ul>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" /> Cons
                                </h4>
                                <ul className="space-y-2 text-[13px] text-gray-300">
                                    {visitScoreData.cons?.map((c: string, i: number) => (
                                        <li key={i}>• {c}</li>
                                    ))}
                                    {(!visitScoreData.cons || visitScoreData.cons.length === 0) && <li>No major disadvantages</li>}
                                </ul>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                onClick={() => {
                                    setShowDetailedMode(true);
                                    controls.start({ y: SNAP_POINTS.FULL, transition: { type: "spring", damping: 25, stiffness: 200 } });
                                    setCurrentSnap(SNAP_POINTS.FULL);
                                }}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Explore Properties Here
                            </button>
                        </div>
                    </div>
                ) : metrics ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Section: Environment */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Environment</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox icon={<Activity />} label="AQI (PM2.5)" value={metrics.aqi?.toString() || '--'} unit="μg/m³" />
                                <MetricBox icon={<Wifi />} label="Noise Level" value={metrics.noise?.toString() || '--'} unit="dB" />
                                <MetricBox icon={<ShieldAlert />} label="Flood Risk" value={metrics.flood_risk ? ((metrics.flood_risk * 100).toFixed(0)) : '--'} unit="%" />
                                <MetricBox icon={<Droplets />} label="Water Quality" value={metrics.water_supply_score ? ((metrics.water_supply_score * 100).toFixed(0)) : '--'} unit="%" />
                            </div>
                        </section>

                        {/* Section: Infrastructure */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Infrastructure</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox icon={<Train />} label="Metro Dist." value={metrics.metro_distance ? (metrics.metro_distance / 1000).toFixed(1) : '--'} unit="km" />
                                <MetricBox icon={<MapPin />} label="Road Quality" value={metrics.road_quality ? ((metrics.road_quality * 100).toFixed(0)) : '--'} unit="%" />
                                <MetricBox icon={<Building2 />} label="Amenities" value={metrics.amenity_score?.toString() || '--'} unit="/100" />
                            </div>
                        </section>

                        {/* Section: Action */}
                        <div className="pt-4 flex flex-col gap-3">
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-500/20">
                                Explore Properties Here
                            </button>
                            <button
                                onClick={handleToggleSave}
                                disabled={isSaving}
                                className={`w-full py-4 font-bold rounded-2xl transition-colors border shadow-lg flex justify-center items-center gap-2 ${isSaved
                                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30"
                                    : "bg-gray-900 hover:bg-gray-800 text-white border-gray-800"
                                    }`}
                            >
                                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                                {isSaving ? "Updating..." : isSaved ? "Saved Area" : "Save Area"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">No detailed metrics available.</div>
                )}
            </div>
        </motion.div>
    );

    async function handleToggleSave() {
        if (!user) {
            toast.error("Please login to save areas");
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                // Remove
                const { error } = await supabase
                    .from("saved_areas")
                    .delete()
                    .eq("area_id", selectedArea!.id)
                    .eq("user_id", user.uid);

                if (error) throw error;
                setIsSaved(false);
                toast.success("Removed from saved areas");
            } else {
                // Save
                const { error } = await supabase
                    .from("saved_areas")
                    .insert({
                        area_id: selectedArea!.id,
                        user_id: user.uid
                    } as any);

                if (error) throw error;
                setIsSaved(true);
                toast.success("Added to saved areas");
            }
        } catch (e) {
            console.error("Save error:", e);
            toast.error("Could not update saved status");
        } finally {
            setIsSaving(false);
        }
    }
}

// Simple internal component for the grid
function MetricBox({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-indigo-400 w-5 h-5">{icon}</div>
            <div className="text-xs text-gray-400 font-medium">{label}</div>
            <div className="text-lg font-bold text-white flex items-baseline gap-1">
                {value} <span className="text-xs text-gray-500 font-normal">{unit}</span>
            </div>
        </div>
    );
}

function ScoreBox({ label, value, color }: { label: string, value: number | null | undefined, color: string }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value.toFixed(0)}</div>
            <div className="text-[10px] text-gray-400 font-medium leading-tight">{label}</div>
        </div>
    );
}

function ProgressBarMetric({ label, value, max, unit, colorClass, displayValueOverride }: any) {
    if (value === null || value === undefined) return null;
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const displayValue = displayValueOverride !== undefined ? displayValueOverride : value;

    return (
        <div className="flex flex-col gap-1.5 mb-5">
            <div className="flex justify-between items-center text-[13px] px-1">
                <span className="text-gray-300 font-medium">{label}</span>
                <span className="text-white font-bold">{Number(displayValue).toFixed(1)}{unit ? ` ${unit}` : ''}</span>
            </div>
            <div className="h-[6px] w-full bg-gray-800/80 rounded-full overflow-hidden">
                <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
