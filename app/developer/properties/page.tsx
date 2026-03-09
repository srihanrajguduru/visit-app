"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search, RefreshCw, AlertCircle, Home, CheckCircle2, Bed, Bath, Maximize2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PropertyVerificationPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("property_listings")
            .select(`
                id,
                title,
                price,
                property_type,
                bedrooms,
                bathrooms,
                area_sqft,
                verified,
                owner_id,
                visit_score_snapshot,
                areas ( name, zone )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            if (error.code === '42P01' || error.message.includes('Could not find the table')) {
                // Table doesn't exist yet — show mock data for UI dev
                setProperties(mockProperties);
            } else {
                setMessage({ type: "error", text: error.message });
            }
        } else {
            setProperties(data || []);
            if (data?.length === 0) setProperties(mockProperties);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleToggleVerification = async (id: string, currentValue: boolean) => {
        // Optimistic UI
        setProperties(prev => prev.map(p => p.id === id ? { ...p, verified: !currentValue } : p));

        const { error } = await supabase
            .from("property_listings")
            .update({ verified: !currentValue })
            .eq("id", id);

        if (error) {
            // Revert on error
            setProperties(prev => prev.map(p => p.id === id ? { ...p, verified: currentValue } : p));
            setMessage({ type: "error", text: `Failed to update: ${error.message}` });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } else {
            setMessage({ type: "success", text: `Property verification updated.` });
            setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        }
    };

    const filteredProperties = properties.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.areas?.name && p.areas.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Property Verification
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400"
                    >
                        Verify and approve property listings. Changes sync in real-time to all users.
                    </motion.p>
                </div>

                <button
                    onClick={fetchProperties}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 p-4 rounded-xl flex items-center justify-between border ${message.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-200'
                        : 'bg-green-500/10 border-green-500/20 text-green-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                </motion.div>
            )}

            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-400" />
                        Property Listings Ledger
                    </h3>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by title or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-[#0c0c0c] border-b border-[#222]">
                            <tr>
                                <th className="px-6 py-4 font-mono">Title</th>
                                <th className="px-6 py-4 font-mono">Area</th>
                                <th className="px-6 py-4 font-mono">Type</th>
                                <th className="px-6 py-4 font-mono">Price (INR)</th>
                                <th className="px-6 py-4 font-mono text-center">Details</th>
                                <th className="px-6 py-4 font-mono text-center">Visit Score</th>
                                <th className="px-6 py-4 font-mono text-center">Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                                        Fetching property listings...
                                    </td>
                                </tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No property listings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProperties.map((prop) => (
                                    <tr key={prop.id} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {prop.title || "Untitled"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {prop.areas?.name || 'Unknown Area'}
                                            <span className="block text-xs text-gray-500 font-normal mt-0.5">{prop.areas?.zone || ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs capitalize">
                                                {prop.property_type || 'residential'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            ₹{prop.price ? prop.price.toLocaleString('en-IN') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Bed className="w-3 h-3" />{prop.bedrooms || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Bath className="w-3 h-3" />{prop.bathrooms || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Maximize2 className="w-3 h-3" />{prop.area_sqft || 0} sqft
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-mono font-bold ${(prop.visit_score_snapshot ?? 0) >= 70 ? 'text-green-400' : (prop.visit_score_snapshot ?? 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {prop.visit_score_snapshot?.toFixed(1) ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleVerification(prop.id, prop.verified)}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors border ${prop.verified
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                                    : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:bg-[#222] hover:text-white'
                                                    }`}
                                                title="Toggle Verification"
                                            >
                                                {prop.verified
                                                    ? <CheckCircle2 className="w-4 h-4" />
                                                    : <div className="w-3 h-3 rounded-sm border-2 border-current" />}
                                            </button>
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

// Mock Data for UI presentation when DB isn't seeded yet
const mockProperties = [
    { id: 'prop-1a2b3c', title: 'Skyline Residency 3BHK', price: 15400000, property_type: 'apartment', bedrooms: 3, bathrooms: 2, area_sqft: 1800, verified: true, visit_score_snapshot: 87.2, areas: { name: 'Jubilee Hills Phase 1', zone: 'Central' } },
    { id: 'prop-4d5e6f', title: 'Green Valley Villa', price: 8900000, property_type: 'villa', bedrooms: 4, bathrooms: 3, area_sqft: 3200, verified: false, visit_score_snapshot: 72.5, areas: { name: 'Banjara Hills Block C', zone: 'Central' } },
    { id: 'prop-7g8h9i', title: 'TechPark Office Suite', price: 21000000, property_type: 'commercial', bedrooms: 0, bathrooms: 2, area_sqft: 5000, verified: true, visit_score_snapshot: 91.0, areas: { name: 'HITEC City', zone: 'West' } },
    { id: 'prop-0j1k2l', title: 'Open Plot Kompally', price: 6500000, property_type: 'plot', bedrooms: 0, bathrooms: 0, area_sqft: 2400, verified: false, visit_score_snapshot: 55.8, areas: { name: 'Kompally Extension', zone: 'North' } },
    { id: 'prop-3m4n5o', title: 'Lake View Apartment', price: 11200000, property_type: 'apartment', bedrooms: 2, bathrooms: 2, area_sqft: 1400, verified: true, visit_score_snapshot: 82.1, areas: { name: 'Gachibowli Outer', zone: 'West' } },
];
