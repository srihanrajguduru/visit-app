"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Save, Search, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";



export default function AreaManagementPage() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [newArea, setNewArea] = useState({
        name: "",
        latitude: "",
        longitude: "",
        zone: ""
    });

    const fetchAreas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("areas")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setAreas(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        if (!newArea.name || !newArea.latitude || !newArea.longitude) {
            setError("Please fill in all required fields.");
            setSaving(false);
            return;
        }

        const { data, error } = await supabase.from("areas").insert([
            {
                name: newArea.name,
                latitude: parseFloat(newArea.latitude),
                longitude: parseFloat(newArea.longitude),
                zone: newArea.zone || "Unknown",
                current_visit_score: 0
            }
        ]).select();

        if (error) {
            setError(error.message);
        } else if (data) {
            setSuccess(`Area "${newArea.name}" added successfully!`);
            setNewArea({ name: "", latitude: "", longitude: "", zone: "" });
            setAreas([...areas, data[0]].sort((a: any, b: any) => a.name.localeCompare(b.name)));
        }

        setSaving(false);
    };

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.zone && a.zone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                >
                    Area Management
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    Add new geographical zones and master grid locations to the Visit engine.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Add New Area Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="xl:col-span-1"
                >
                    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sticky top-8">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Register New Area
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                <p className="text-sm text-green-200">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleAddArea} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Area Name *</label>
                                <input
                                    type="text"
                                    value={newArea.name}
                                    onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                                    placeholder="e.g., Jubilee Hills Phase 3"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Latitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newArea.latitude}
                                        onChange={(e) => setNewArea({ ...newArea, latitude: e.target.value })}
                                        placeholder="17.4325"
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Longitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newArea.longitude}
                                        onChange={(e) => setNewArea({ ...newArea, longitude: e.target.value })}
                                        placeholder="78.4070"
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Zone Assignment</label>
                                <input
                                    type="text"
                                    value={newArea.zone}
                                    onChange={(e) => setNewArea({ ...newArea, zone: e.target.value })}
                                    placeholder="e.g., Central Zone"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Area
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Existing Areas List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="xl:col-span-2"
                >
                    <div className="bg-[#111] border border-[#222] rounded-2xl flex flex-col h-[700px]">
                        <div className="p-6 border-b border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-purple-400" />
                                Registered Master Grid Areas
                            </h2>

                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search areas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                                    <p>Loading registry...</p>
                                </div>
                            ) : filteredAreas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <MapPin className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No areas found matching '{searchTerm}'.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredAreas.map(area => (
                                        <div key={area.id} className="p-4 rounded-xl border border-[#222] bg-[#161616] hover:border-[#444] hover:bg-[#1a1a1a] transition-colors group flex justify-between items-center">
                                            <div className="min-w-0 pr-4">
                                                <h3 className="text-white font-medium truncate">{area.name}</h3>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-mono">
                                                    <span className="truncate">{area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}</span>
                                                    {area.zone && (
                                                        <span className="shrink-0 px-2 py-0.5 rounded text-purple-300 bg-purple-500/10 border border-purple-500/20">
                                                            {area.zone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${area.current_visit_score >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : area.current_visit_score >= 40 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {area.current_visit_score}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
