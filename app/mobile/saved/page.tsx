/**
 * --------------------------------------------------------
 * File: app/mobile/saved/page.tsx
 * Purpose: Saved areas management page for mobile.
 * Responsibilities: Renders neighborhoods saved by the user, handles removal (unsaving), and links back to the map.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useEffect, useState } from "react";
import { getSavedAreasWithMetadata, unsaveArea } from "@/app/actions/dbActions";
import { Area } from "@/types/database";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import { ArrowRight, MapPin, Bookmark, AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function MobileSavedPage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        fetchSavedAreas();
    }, [user, authLoading]);

    async function fetchSavedAreas() {
        if (!user) return;
        try {
            const { data, error } = await getSavedAreasWithMetadata(user.uid);

            if (error) {
                console.error("Error fetching saved areas:", error);
                toast.error("Failed to load saved areas.");
                return;
            }

            // Extract the nested structured area objects
            const parsedAreas = (data as any[]).map(row => row.area).filter(Boolean) as Area[];
            setAreas(parsedAreas);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function removeSavedArea(areaId: string) {
        if (!user) return;

        // Optimistic UI update
        const previousAreas = [...areas];
        setAreas(areas.filter(a => a.id !== areaId));

        try {
            const { error } = await unsaveArea(user.uid, areaId);

            if (error) throw error;
            toast.success("Area removed");
        } catch (err) {
            // Revert on failure
            setAreas(previousAreas);
            console.error("Failed to remove Area:", err);
            toast.error("Failed to remove from saved areas");
        }
    }

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
        router.push(`/mobile/map?lat=${area.latitude}&lng=${area.longitude}&zoom=15&openScore=true`);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Saved Areas
                    </h1>
                </div>
                <p className="text-gray-400 text-sm">Your personally bookmarked regions.</p>
            </div>

            {/* List */}
            <div className="p-6 space-y-4">
                {loading || authLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : !user ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                        <p className="mb-4">Please log in to view your saved areas.</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 py-2"
                        >
                            Sign In
                        </button>
                    </div>
                ) : areas.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <Bookmark className="w-8 h-8 mb-3 opacity-30" />
                        <p>No saved areas yet.</p>
                        <p className="text-sm mt-2 opacity-60">Tap the bookmark icon on any area to save it here.</p>
                    </div>
                ) : (
                    areas.map((area) => {
                        const score = area.current_visit_score || 0;
                        return (
                            <div
                                key={area.id}
                                className="group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-[#151518]"
                            >
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => removeSavedArea(area.id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleViewOnMap(area)}
                                            className="h-9 pr-3 pl-4 rounded-full text-indigo-400 hover:text-white hover:bg-indigo-500/20 text-sm font-semibold flex items-center transition-colors"
                                        >
                                            View on Map
                                            <ArrowRight className="w-4 h-4 ml-1.5" />
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
