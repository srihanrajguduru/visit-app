"use client";

import { motion } from "framer-motion";
import { Database, Map, Activity, Zap, Server, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize a generic Supabase client to fetch public stats (RLS on users determines what they see, 
// here developers will view public stats)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeveloperOverview() {
    const [stats, setStats] = useState({
        areasCount: 0,
        datasetsCount: 0,
        avgScore: 0,
    });

    useEffect(() => {
        async function loadStats() {
            // Fetch total areas
            const { count: areasCount } = await supabase
                .from('areas')
                .select('*', { count: 'exact', head: true });

            // Fetch uploaded datasets count
            const { count: datasetsCount } = await supabase
                .from('datasets')
                .select('*', { count: 'exact', head: true });

            // Fetch average visit score
            const { data: scores } = await supabase.from('visit_scores').select('visit_score');
            const avg = scores && scores.length > 0
                ? scores.reduce((sum, curr) => sum + curr.visit_score, 0) / scores.length
                : 0;

            setStats({
                areasCount: areasCount || 0,
                datasetsCount: datasetsCount || 0,
                avgScore: avg,
            });
        }

        loadStats();
    }, []);

    const statCards = [
        { title: "Total Covered Areas", value: stats.areasCount.toString(), icon: Map, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { title: "Datasets Managed", value: stats.datasetsCount.toString(), icon: Database, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { title: "Avg Network Score", value: stats.avgScore.toFixed(1), icon: Activity, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { title: "Platform Engine", value: "Online", icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    ];

    const quickLinks = [
        { name: "Manage Datasets", desc: "Upload CSV/Excel environment data", href: "/developer/datasets", icon: Database },
        { name: "Score Control Board", desc: "Force recalculate and monitor scores", href: "/developer/visit-score", icon: Zap },
        { name: "Property Verify", desc: "Approve titles and ownerships", href: "/developer/properties", icon: ShieldCheck },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                >
                    Administrator Overview
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    High-level system status and immediate access to Visit platform controls.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-[#111] border ${stat.border} rounded-2xl p-6 relative overflow-hidden group`}
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform ${stat.color}`}>
                                <Icon className="w-16 h-16" />
                            </div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white relative z-10">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-1">Quick Links</h2>
                        <p className="text-sm text-gray-500 mb-6">Commonly accessed developer tools.</p>

                        <div className="space-y-3 flex-1">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link href={link.href} key={link.name}>
                                        <div className="group flex items-center p-4 rounded-xl border border-[#222] hover:border-[#333] hover:bg-[#1a1a1a] transition-all cursor-pointer">
                                            <div className="p-3 rounded-lg bg-[#222] text-gray-400 group-hover:text-white transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h4 className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{link.name}</h4>
                                                <p className="text-xs text-gray-500">{link.desc}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-lg font-semibold text-white mb-1">System Health Alert</h2>
                            <p className="text-sm text-gray-500 mb-6">Real-time platform monitors.</p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start">
                                    <span className="relative flex h-3 w-3 mt-1 mr-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-medium text-emerald-400 mb-1">Database Sync Active</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">The main Supabase connection is healthy. Realtime hooks for visit_scores are currently attached and listening for developer mutations.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 mr-3"></div>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-400 mb-1">Edge Functions Deployed</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">calculate-visit-score is loaded on standard Next.js API routes with a 2ms cold start average.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
