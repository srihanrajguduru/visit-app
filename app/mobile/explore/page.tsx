"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Area } from "@/types/database";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import { MapPin, TrendingUp, AlertCircle, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function MobileExplorePage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useAuth();
    const [savedAreaIds, setSavedAreaIds] = useState<Set<string>>(new Set());
    const [savingAreaId, setSavingAreaId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTrendingAreas() {
            try {
                const { data, error } = await supabase
                    .from("areas")
                    .select("id, name, latitude, longitude, current_visit_score")
                    .order("current_visit_score", { ascending: false, nullsFirst: false })
                    .limit(20);

                if (error) {
                    console.error("Error fetching areas:", error);
                    toast.error("Failed to load trending areas.");
                    return;
                }

                setAreas(data as Area[]);
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchTrendingAreas();
    }, []);

    useEffect(() => {
        async function fetchSavedAreas() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from("saved_areas")
                    .select("area_id")
                    .eq("user_id", user.uid);

                if (error) {
                    console.error("Error fetching saved areas:", error);
                    return;
                }

                const ids = new Set((data as any[]).map((item) => item.area_id));
                setSavedAreaIds(ids);
            } catch (err) {
                console.error("Unexpected error fetching saved areas:", err);
            }
        }

        fetchSavedAreas();
    }, [user]);

    const isSaved = (areaId: string) => savedAreaIds.has(areaId);

    const handleToggleSave = async (areaId: string) => {
        if (!user) {
            toast.error("You need to be logged in to save areas.");
            return;
        }

        setSavingAreaId(areaId);
        try {
            if (isSaved(areaId)) {
                // Unsave
                const { error } = await supabase
                    .from("saved_areas")
                    .delete()
                    .eq("user_id", user.uid)
                    .eq("area_id", areaId);

                if (error) throw error;
                setSavedAreaIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(areaId);
                    return newSet;
                });
                toast.success("Area unsaved.");
            } else {
                // Save
                const { error } = await supabase
                    .from("saved_areas")
                    .insert({ user_id: user.uid, area_id: areaId } as any);

                if (error) throw error;
                setSavedAreaIds((prev) => new Set(prev).add(areaId));
                toast.success("Area saved!");
            }
        } catch (error: any) {
            console.error("Error toggling save status:", error);
            toast.error(`Failed to ${isSaved(areaId) ? "unsave" : "save"} area: ${error.message}`);
        } finally {
            setSavingAreaId(null);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (score >= 70) return "text-green-400 bg-green-400/10 border-green-400/20";
        if (score >= 50) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        return "text-red-400 bg-red-400/10 border-red-400/20";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent Livability";
        if (score >= 70) return "Good Livability";
        if (score >= 50) return "Moderate Livability";
        return "Needs Improvement";
    };

    const handleViewOnMap = (area: Area) => {
        // Route back to the map with search params to center map & open detail sheet
        router.push(`/mobile/map?lat=${area.latitude}&lng=${area.longitude}&zoom=15&openScore=true`);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Explore
                    </h1>
                </div>
                <p className="text-gray-400 text-sm">Top trending areas based on Visit Score.</p>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : areas.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                        <p>Unable to load trending areas.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 py-2"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    areas.map((area, index) => {
                        const score = area.current_visit_score || 0;
                        return (
                            <div
                                key={area.id}
                                className="group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-[#151518]"
                            >
                                {/* Rank Badge */}
                                <div className="absolute top-0 right-0 font-black text-[80px] leading-none text-white/[0.02] -mt-4 -mr-2 select-none pointer-events-none">
                                    #{index + 1}
                                </div>

                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                {area.name}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>Hyderabad</span>
                                            </div>
                                        </div>

                                        <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${getScoreColor(score)}`}>
                                            <span className="text-xl font-black">{score.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => handleToggleSave(area.id)}
                                            disabled={savingAreaId === area.id}
                                            className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-400 hover:text-white hover:bg-indigo-500/20 disabled:opacity-50"
                                        >
                                            <Bookmark className={`w-5 h-5 ${isSaved(area.id) ? "fill-current" : ""}`} />
                                        </button>
                                        <button
                                            onClick={() => handleViewOnMap(area)}
                                            className="h-9 px-4 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                        >
                                            View on Map
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MobileNavigation />
            </div>
        </div>
    );
}
