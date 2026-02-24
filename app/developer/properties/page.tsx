"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search, RefreshCw, AlertCircle, Home, CheckCircle2 } from "lucide-react";
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
        // Joining with areas to get the area name
        const { data, error } = await supabase
            .from("properties")
            .select(`
        id, 
        price, 
        type, 
        title_verified, 
        owner_verified,
        areas ( name, zone )
      `)
            .order("id", { ascending: false });

        if (error) {
            if (error.code === '42P01') {
                // table doesn't exist yet, mock for UI dev
                setProperties(mockProperties);
            } else {
                setMessage({ type: "error", text: error.message });
            }
        } else {
            setProperties(data || []);
            if (data?.length === 0) setProperties(mockProperties); // fallback for empty db during dev
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleToggleVerification = async (id: string, field: 'title_verified' | 'owner_verified', currentValue: boolean) => {
        // Optimistic UI update
        setProperties(prev => prev.map(p => p.id === id ? { ...p, [field]: !currentValue } : p));

        // Real DB update
        const { error } = await supabase
            .from("properties")
            .update({ [field]: !currentValue })
            .eq("id", id);

        if (error) {
            // Revert on error
            setProperties(prev => prev.map(p => p.id === id ? { ...p, [field]: currentValue } : p));
            setMessage({ type: "error", text: `Failed to update: ${error.message}` });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } else {
            setMessage({ type: "success", text: `Property record updated successfully.` });
            setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        }
    };

    const filteredProperties = properties.filter(p =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.areas?.name && p.areas.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        Approve legal titles and ownership credentials to dynamically update property health scores.
                    </motion.p>
                </div>
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
                        Property Real Estate Ledger
                    </h3>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by ID or Area..."
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
                                <th className="px-6 py-4 font-mono">Property ID</th>
                                <th className="px-6 py-4 font-mono">Registry Area</th>
                                <th className="px-6 py-4 font-mono">Asset Type</th>
                                <th className="px-6 py-4 font-mono">Valuation (INR)</th>
                                <th className="px-6 py-4 font-mono text-center">Title Verified</th>
                                <th className="px-6 py-4 font-mono text-center">Owner Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                                        Fetching property ledger...
                                    </td>
                                </tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No properties pending verification found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProperties.map((prop) => (
                                    <tr key={prop.id} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-blue-400">
                                            {prop.id.split('-')[0] || prop.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            {prop.areas?.name || 'Unknown Area'}
                                            <span className="block text-xs text-gray-500 font-normal mt-0.5">{prop.areas?.zone || ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs">
                                                {prop.type || 'Residential'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            ₹{prop.price ? prop.price.toLocaleString('en-IN') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleVerification(prop.id, 'title_verified', prop.title_verified)}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors border ${prop.title_verified
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                                        : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:bg-[#222] hover:text-white'
                                                    }`}
                                                title="Toggle Title Verification"
                                            >
                                                {prop.title_verified ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-3 h-3 rounded-sm border-2 border-current" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleVerification(prop.id, 'owner_verified', prop.owner_verified)}
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors border ${prop.owner_verified
                                                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                                                        : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:bg-[#222] hover:text-white'
                                                    }`}
                                                title="Toggle Owner Verification"
                                            >
                                                {prop.owner_verified ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-3 h-3 rounded-sm border-2 border-current" />}
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

// Mock Data for UI presentation if the DB isn't fully seeded yet
const mockProperties = [
    { id: 'prop-1a2b3c', price: 15400000, type: 'Apartment', title_verified: true, owner_verified: false, areas: { name: 'Jubilee Hills Phase 1', zone: 'Central' } },
    { id: 'prop-4d5e6f', price: 8900000, type: 'Villa', title_verified: false, owner_verified: false, areas: { name: 'Banjara Hills Block C', zone: 'Central' } },
    { id: 'prop-7g8h9i', price: 21000000, type: 'Commercial', title_verified: true, owner_verified: true, areas: { name: 'HITEC City Tech Park', zone: 'West' } },
    { id: 'prop-0j1k2l', price: 6500000, type: 'Plot', title_verified: false, owner_verified: true, areas: { name: 'Kompally Extension', zone: 'North' } },
    { id: 'prop-3m4n5o', price: 11200000, type: 'Apartment', title_verified: true, owner_verified: true, areas: { name: 'Gachibowli Outer', zone: 'West' } },
];
