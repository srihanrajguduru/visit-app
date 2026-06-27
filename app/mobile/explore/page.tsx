/**
 * --------------------------------------------------------
 * File: app/mobile/explore/page.tsx
 * Purpose: Trending neighborhoods explorer page for mobile.
 * Responsibilities: Lists top neighborhoods sorted by their current Visit Score, supporting saving/unsaving.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useState, useEffect } from "react";
import { getTrendingAreas, getSavedAreaIds, saveArea, unsaveArea } from "@/app/actions/dbActions";
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
                const { data, error } = await getTrendingAreas();

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
                const { data, error } = await getSavedAreaIds(user.uid);

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
                const { error } = await unsaveArea(user.uid, areaId);

                if (error) throw error;
                setSavedAreaIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(areaId);
                    return newSet;
                });
                toast.success("Area unsaved.");
            } else {
                const { error } = await saveArea(user.uid, areaId);

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
        if (score >= 90) return { text: "var(--score-excellent)", bg: "rgba(65, 139, 70, 0.1)", border: "rgba(65, 139, 70, 0.2)" };
        if (score >= 70) return { text: "var(--score-good)", bg: "rgba(89, 168, 95, 0.1)", border: "rgba(89, 168, 95, 0.2)" };
        if (score >= 50) return { text: "var(--score-moderate)", bg: "rgba(212, 167, 43, 0.1)", border: "rgba(212, 167, 43, 0.2)" };
        return { text: "var(--score-low)", bg: "rgba(214, 76, 76, 0.1)", border: "rgba(214, 76, 76, 0.2)" };
    };

    const handleViewOnMap = (area: Area) => {
        router.push(`/mobile/map?lat=${area.latitude}&lng=${area.longitude}&zoom=15&openScore=true`);
    };

    return (
        <div
            className="min-h-screen pb-24 font-sans theme-transition"
            style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}
        >
            {/* Header */}
            <div
                className="pt-12 pb-6 px-6 sticky top-0 backdrop-blur-xl z-20 theme-transition"
                style={{
                    background: "color-mix(in srgb, var(--bg-dark) 80%, transparent)",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6" style={{ color: "var(--brand-accent)" }} />
                    <h1
                        className="text-2xl font-bold tracking-tight gradient-text"
                    >
                        Explore
                    </h1>
                </div>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Top trending areas based on Visit Score.
                </p>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div
                            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: "var(--brand-accent)", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : areas.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center" style={{ color: "var(--text-muted)" }}>
                        <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                        <p>Unable to load trending areas.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-white rounded-full px-6 py-2"
                            style={{ background: "var(--brand-primary)" }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    areas.map((area, index) => {
                        const score = area.current_visit_score || 0;
                        const colors = getScoreColor(score);
                        return (
                            <div
                                key={area.id}
                                className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 theme-transition"
                                style={{
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                {/* Rank Badge */}
                                <div
                                    className="absolute top-0 right-0 font-black text-[80px] leading-none -mt-4 -mr-2 select-none pointer-events-none"
                                    style={{ color: "var(--border)" }}
                                >
                                    #{index + 1}
                                </div>

                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2
                                                className="text-lg font-bold flex items-center gap-2"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                {area.name}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                                <MapPin className="w-3 h-3" />
                                                <span>Hyderabad</span>
                                            </div>
                                        </div>

                                        <div
                                            className="flex flex-col items-end px-3 py-1.5 rounded-lg"
                                            style={{
                                                color: colors.text,
                                                background: colors.bg,
                                                border: `1px solid ${colors.border}`,
                                            }}
                                        >
                                            <span className="text-xl font-black">{score.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center justify-between mt-2 pt-2"
                                        style={{ borderTop: "1px solid var(--border)" }}
                                    >
                                        <button
                                            onClick={() => handleToggleSave(area.id)}
                                            disabled={savingAreaId === area.id}
                                            className="w-10 h-10 flex items-center justify-center rounded-full disabled:opacity-50 transition-colors"
                                            style={{ color: "var(--brand-accent)" }}
                                        >
                                            <Bookmark className={`w-5 h-5 ${isSaved(area.id) ? "fill-current" : ""}`} />
                                        </button>
                                        <button
                                            onClick={() => handleViewOnMap(area)}
                                            className="h-9 px-4 rounded-full text-white text-sm font-semibold flex items-center gap-2"
                                            style={{
                                                background: "var(--brand-primary)",
                                                boxShadow: "var(--glow-primary)",
                                            }}
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
