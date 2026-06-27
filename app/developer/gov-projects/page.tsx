/**
 * --------------------------------------------------------
 * File: app/developer/gov-projects/page.tsx
 * Purpose: Municipal development projects manager dashboard.
 * Responsibilities: Registers upcoming government projects (e.g. roads, rails) to influence long-term neighborhood scoring multipliers.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Search, RefreshCw, AlertCircle, Plus, Save, MapPin, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { getGovProjects, createGovProject } from "@/app/actions/dbActions";



export default function GovProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const [newProject, setNewProject] = useState({
        project_name: "",
        latitude: "",
        longitude: "",
        completion_date: "",
        impact_score: "1.10"
    });

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await getGovProjects();

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setProjects(data || mockProjects);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        if (!newProject.project_name || !newProject.latitude || !newProject.longitude || !newProject.completion_date) {
            setMessage({ type: "error", text: "Please fill in all required fields." });
            setSaving(false);
            return;
        }

        const { data, error } = await createGovProject({
            project_name: newProject.project_name,
            latitude: parseFloat(newProject.latitude),
            longitude: parseFloat(newProject.longitude),
            completion_date: newProject.completion_date,
            impact_score: parseFloat(newProject.impact_score)
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else if (data) {
            setMessage({ type: "success", text: "Municipal project registered successfully!" });
            setNewProject({ project_name: "", latitude: "", longitude: "", completion_date: "", impact_score: "1.10" });
            setProjects([...projects, data].sort((a, b) => new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime()));
        }

        setSaving(false);
    };

    const filteredProjects = projects.filter(p =>
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-4rem)]">

            {/* Sidebar: Add Project */}
            <div className="w-96 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full shrink-0 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-[#222] bg-[#141414]">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-orange-400" />
                        Register Municipal Project
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Add future Govt developments to alter long-term area valuation multipliers.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAddProject} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Project Title *</label>
                            <input
                                type="text"
                                value={newProject.project_name}
                                onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                                placeholder="e.g., SRDP Flyover Phase 3"
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Latitude *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newProject.latitude}
                                    onChange={(e) => setNewProject({ ...newProject, latitude: e.target.value })}
                                    placeholder="17.4325"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Longitude *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newProject.longitude}
                                    onChange={(e) => setNewProject({ ...newProject, longitude: e.target.value })}
                                    placeholder="78.4070"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Expected Completion Date *</label>
                            <input
                                type="date"
                                value={newProject.completion_date}
                                onChange={(e) => setNewProject({ ...newProject, completion_date: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex justify-between">
                                Visit Score Impact Multiplier
                                <span className="text-orange-400 font-mono text-xs mt-0.5">x{newProject.impact_score}</span>
                            </label>
                            <input
                                type="range"
                                min="1.00"
                                max="1.50"
                                step="0.05"
                                value={newProject.impact_score}
                                onChange={(e) => setNewProject({ ...newProject, impact_score: e.target.value })}
                                className="w-full accent-orange-500 mt-2"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                                <span>1.0x (Neutral)</span>
                                <span>1.5x (Massive Catalyst)</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Log Project into Masterplan
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Content: Timeline */}
            <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-[#222] bg-[#141414] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-orange-400" />
                            Municipal Development Timeline
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Track strategic zone upgrades and their algorithmic multipliers.</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search timeline..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="p-4 bg-[#0a0a0a]">
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-200'
                                    : 'bg-green-500/10 border-green-500/20 text-green-200'
                                }`}
                        >
                            {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium text-left truncate">{message.text}</p>
                        </motion.div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <RefreshCw className="w-8 h-8 mb-4 animate-spin text-orange-400" />
                            <p>Synchronizing with city planning records...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Building2 className="w-16 h-16 mb-4 opacity-20" />
                            <p>No development projects recorded.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-[#333] ml-4 md:ml-6 pb-4">
                            {filteredProjects.map((project, idx) => {
                                const dateObj = new Date(project.completion_date);
                                const isPast = dateObj < new Date();

                                return (
                                    <div key={project.id} className="mb-8 pl-8 relative group">
                                        {/* Timeline dot */}
                                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-[#111] ${isPast ? 'bg-green-500' : 'bg-orange-500 group-hover:scale-125 transition-transform'}`} />

                                        <div className="bg-[#161616] border border-[#222] p-5 rounded-2xl hover:border-[#444] transition-colors relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-0 group-hover:bg-orange-500/10 transition-colors" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-lg font-bold text-white">{project.project_name}</h3>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${isPast ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                    <div className="flex items-center gap-3 bg-[#111] border border-[#222] p-3 rounded-xl">
                                                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex flex-shrink-0 items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <div className="text-sm font-mono text-gray-300">
                                                            <p>{Number(project.latitude).toFixed(4)},</p>
                                                            <p>{Number(project.longitude).toFixed(4)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-[#111] border border-[#222] p-3 rounded-xl">
                                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex flex-shrink-0 items-center justify-center">
                                                            <TrendingUp className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Assigned Multiplier</p>
                                                            <p className="text-base font-mono text-orange-400 font-bold tracking-wide">
                                                                x{Number(project.impact_score).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const mockProjects = [
    { id: '1', project_name: 'Airport Express Metro Line', latitude: 17.4415, longitude: 78.3420, completion_date: '2026-12-01', impact_score: 1.25 },
    { id: '2', project_name: 'Regional Ring Road (Northern Half)', latitude: 17.5810, longitude: 78.4110, completion_date: '2027-06-15', impact_score: 1.15 },
    { id: '3', project_name: 'Hitech City Comprehensive Water Supply', latitude: 17.4435, longitude: 78.3772, completion_date: '2025-08-30', impact_score: 1.05 },
    { id: '4', project_name: 'Musi Riverfront Development', latitude: 17.3780, longitude: 78.4710, completion_date: '2028-01-01', impact_score: 1.40 },
];
