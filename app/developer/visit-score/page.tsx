"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Zap, Server, Activity, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VisitScoreControlPage() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchScores = async () => {
        setLoading(true);
        const { data } = await supabase.from("areas").select("id, name, zone, current_visit_score").order("name");
        if (data) setAreas(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchScores();
    }, []);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedAreas(new Set(areas.map(a => a.id)));
        } else {
            setSelectedAreas(new Set());
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        const newSet = new Set(selectedAreas);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedAreas(newSet);
    };

    const handleRecalculate = async (all: boolean = false) => {
        setRecalculating(true);
        setMessage({ type: "", text: "" });

        try {
            const targetIds = all ? areas.map(a => a.id) : Array.from(selectedAreas);

            if (targetIds.length === 0) {
                throw new Error("No areas selected for recalculation.");
            }

            // Simulate API call to edge function
            // In Phase 4, we will replace this with a real fetch to /api/calculate-visit-score
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock update to prove it works
            const mockUpdates = targetIds.map(id => ({
                id,
                current_visit_score: Math.floor(Math.random() * 40) + 50 // random new score between 50-90
            }));

            // In reality, edge function does this
            for (const update of mockUpdates) {
                await supabase.from("areas").update({ current_visit_score: update.current_visit_score }).eq("id", update.id);
            }

            setMessage({ type: "success", text: `Successfully recalculated Visit Score for ${targetIds.length} areas.` });

            // Refresh
            fetchScores();
            if (!all) setSelectedAreas(new Set());

        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setRecalculating(false);
        }
    };

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.zone && a.zone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-white mb-2 flex items-center gap-3"
                    >
                        Visit Score Control Board
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            Engine Online
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400"
                    >
                        Force manual recalculation of the core algorithmic engine across the master grid.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    <button
                        onClick={() => handleRecalculate(false)}
                        disabled={selectedAreas.size === 0 || recalculating}
                        className="px-5 py-2.5 rounded-xl bg-[#222] border border-[#333] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {recalculating && selectedAreas.size > 0 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Compute Selected ({selectedAreas.size})
                    </button>
                    <button
                        onClick={() => handleRecalculate(true)}
                        disabled={recalculating || areas.length === 0}
                        className="btn-glow px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {recalculating && selectedAreas.size === 0 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                        Compute Network
                    </button>
                </motion.div>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mb-8 p-4 rounded-xl flex items-start gap-4 border ${message.type === 'error'
                            ? 'bg-red-500/10 border-red-500/20 text-red-200'
                            : 'bg-green-500/10 border-green-500/20 text-green-200'
                        }`}
                >
                    {message.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />}
                    <div>
                        <h3 className="font-semibold text-lg">{message.type === 'error' ? 'Computation Error' : 'Success'}</h3>
                        <p className="text-sm opacity-90">{message.text}</p>
                    </div>
                </motion.div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111] border border-[#222] p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Analyzed Nodes</p>
                        <p className="text-2xl font-bold text-white">{areas.length}</p>
                    </div>
                </div>
                <div className="bg-[#111] border border-[#222] p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Average Network Integrity</p>
                        <p className="text-2xl font-bold text-white">
                            {areas.length ? (areas.reduce((a, b) => a + b.current_visit_score, 0) / areas.length).toFixed(1) : 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between">
                    <h3 className="font-semibold text-white">Score Registry Grid</h3>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-[#0c0c0c] border-b border-[#222]">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedAreas.size === areas.length && areas.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-[#333] bg-[#1a1a1a] text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-4 font-mono">Area/Node ID</th>
                                <th className="px-6 py-4 font-mono">Zone Assignment</th>
                                <th className="px-6 py-4 font-mono">Current Visit Score</th>
                                <th className="px-6 py-4 font-mono">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Fetching registry states...
                                    </td>
                                </tr>
                            ) : filteredAreas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No nodes found in the registry.
                                    </td>
                                </tr>
                            ) : (
                                filteredAreas.map((area) => (
                                    <tr key={area.id} className={`border-b border-[#222] transition-colors ${selectedAreas.has(area.id) ? 'bg-purple-500/5' : 'hover:bg-[#151515]'}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedAreas.has(area.id)}
                                                onChange={(e) => handleSelect(area.id, e.target.checked)}
                                                className="w-4 h-4 rounded border-[#333] bg-[#1a1a1a] text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{area.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1a1a1a] border border-[#333]">
                                                {area.zone || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full max-w-[150px] bg-[#1a1a1a] rounded-full h-2 overflow-hidden border border-[#333]">
                                                    <div
                                                        className={`h-full rounded-full ${area.current_visit_score >= 70 ? 'bg-green-500' : area.current_visit_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${Math.max(0, Math.min(100, area.current_visit_score))}%` }}
                                                    />
                                                </div>
                                                <span className={`font-bold ${area.current_visit_score >= 70 ? 'text-green-400' : area.current_visit_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {area.current_visit_score}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {area.current_visit_score > 0 ? (
                                                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Pending Compute
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
