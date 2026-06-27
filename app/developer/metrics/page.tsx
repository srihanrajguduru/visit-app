"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Save, Search, RefreshCw, AlertCircle, CheckCircle2, Map } from "lucide-react";
import { supabase } from "@/lib/supabase";



export default function MetricsManagementPage() {
    const [areas, setAreas] = useState<any[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const [metrics, setMetrics] = useState({
        aqi: 0,
        noise: 0,
        flood_risk: "Low",
        metro_distance: 0,
        road_quality: 0,
        internet_score: 0,
        crime_rate: 0,
        women_safety_score: 0
    });

    const fetchAreas = async () => {
        setLoading(true);
        const { data } = await supabase.from("areas").select("id, name, zone").order("name");
        if (data) setAreas(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        if (!selectedAreaId) {
            setMetrics({
                aqi: 0, noise: 0, flood_risk: "Low", metro_distance: 0,
                road_quality: 0, internet_score: 0, crime_rate: 0, women_safety_score: 0
            });
            return;
        }

        const fetchAreaMetrics = async () => {
            setMetricsLoading(true);
            setMessage({ type: "", text: "" });

            const { data, error } = await supabase
                .from("area_metrics")
                .select("*")
                .eq("area_id", selectedAreaId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setMetrics({
                    aqi: data.aqi || 0,
                    noise: data.noise || 0,
                    flood_risk: data.flood_risk || "Low",
                    metro_distance: data.metro_distance || 0,
                    road_quality: data.road_quality || 0,
                    internet_score: data.internet_score || 0,
                    crime_rate: data.crime_rate || 0,
                    women_safety_score: data.women_safety_score || 0
                });
            } else {
                // Defaults if no metrics exist yet
                setMetrics({
                    aqi: 0, noise: 0, flood_risk: "Low", metro_distance: 0,
                    road_quality: 0, internet_score: 0, crime_rate: 0, women_safety_score: 0
                });
                if (error && error.code !== "PGRST116") {
                    console.error(error);
                }
            }
            setMetricsLoading(false);
        };

        fetchAreaMetrics();
    }, [selectedAreaId]);

    const handleSaveMetrics = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAreaId) return;

        setSaving(true);
        setMessage({ type: "", text: "" });

        // Upsert metrics logic: we insert a new row as the current active version, 
        // or we just update. The simplest is to insert a new row 
        const { error } = await supabase.from("area_metrics").insert([{
            area_id: selectedAreaId,
            dataset_version: "manual_override_" + new Date().getTime(),
            aqi: Number(metrics.aqi),
            noise: Number(metrics.noise),
            flood_risk: metrics.flood_risk,
            metro_distance: Number(metrics.metro_distance),
            road_quality: Number(metrics.road_quality),
            internet_score: Number(metrics.internet_score),
            crime_rate: Number(metrics.crime_rate),
            women_safety_score: Number(metrics.women_safety_score)
        }]);

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({ type: "success", text: "Metrics updated successfully! Remember to recalculate the Visit Score." });
        }

        setSaving(false);
    };

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-4rem)]">

            {/* Sidebar: Area List */}
            <div className="w-80 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full shrink-0">
                <div className="p-5 border-b border-[#222]">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-blue-400" />
                        Select Area
                    </h2>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search areas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading areas...</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredAreas.map(area => (
                                <button
                                    key={area.id}
                                    onClick={() => setSelectedAreaId(area.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${selectedAreaId === area.id
                                            ? "bg-blue-500 text-white shadow-lg"
                                            : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
                                        }`}
                                >
                                    <p className="font-medium truncate">{area.name}</p>
                                    <p className={`text-xs mt-0.5 ${selectedAreaId === area.id ? "text-blue-100" : "text-gray-600"}`}>
                                        {area.zone || "No Zone"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Metrics Editor */}
            <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-[#222] bg-[#141414]">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="w-6 h-6 text-purple-400" />
                        Manual Metric Override
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Directly inject environmental, infrastructure, and social scores.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {!selectedAreaId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Activity className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select an area from the sidebar to edit its metrics.</p>
                        </div>
                    ) : metricsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <RefreshCw className="w-8 h-8 mb-4 animate-spin text-purple-400" />
                            <p>Fetching active metrics...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveMetrics} className="max-w-3xl">

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-8 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'error'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-200'
                                            : 'bg-green-500/10 border-green-500/20 text-green-200'
                                        }`}
                                >
                                    {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                                </motion.div>
                            )}

                            <div className="space-y-8">
                                {/* Environmental */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[#333] pb-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Environmental Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">AQI Level (0-500)</label>
                                            <input type="number" required min="0" max="500" value={metrics.aqi} onChange={e => setMetrics({ ...metrics, aqi: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Noise Level (dB)</label>
                                            <input type="number" required min="0" max="200" value={metrics.noise} onChange={e => setMetrics({ ...metrics, noise: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Flood Risk</label>
                                            <select value={metrics.flood_risk} onChange={e => setMetrics({ ...metrics, flood_risk: e.target.value })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Infrastructure */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[#333] pb-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Infrastructure Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Metro Dist (meters)</label>
                                            <input type="number" required min="0" value={metrics.metro_distance} onChange={e => setMetrics({ ...metrics, metro_distance: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Road Quality (0-1)</label>
                                            <input type="number" required step="0.1" min="0" max="1" value={metrics.road_quality} onChange={e => setMetrics({ ...metrics, road_quality: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Internet Score (0-1)</label>
                                            <input type="number" required step="0.1" min="0" max="1" value={metrics.internet_score} onChange={e => setMetrics({ ...metrics, internet_score: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Social */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[#333] pb-2">
                                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                        Social Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Crime Rate (0-100)</label>
                                            <input type="number" required min="0" max="100" value={metrics.crime_rate} onChange={e => setMetrics({ ...metrics, crime_rate: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                            <p className="text-xs text-gray-500 mt-1">Lower is better.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Women Safety (0-100)</label>
                                            <input type="number" required min="0" max="100" value={metrics.women_safety_score} onChange={e => setMetrics({ ...metrics, women_safety_score: e.target.value as any })}
                                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                                            <p className="text-xs text-gray-500 mt-1">Higher is safer.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-[#333] flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Inject Metrics Override
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
