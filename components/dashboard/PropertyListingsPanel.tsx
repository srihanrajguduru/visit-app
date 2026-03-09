"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Bed, Bath, Maximize2, MapPin, Shield, Eye, Bookmark, ChevronDown, ChevronUp, Building2, Search } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { PropertyListing } from "@/types/database";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PropertyListingsPanelProps {
    areaId: string | null;
    areaName: string;
}

export default function PropertyListingsPanel({ areaId, areaName }: PropertyListingsPanelProps) {
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!areaId) {
            setListings([]);
            return;
        }

        async function fetchListings() {
            setLoading(true);
            const { data, error } = await supabase
                .from("property_listings")
                .select("*")
                .eq("area_id", areaId)
                .order("created_at", { ascending: false });

            if (error) {
                // Use mock data for UI dev when table isn't created yet
                setListings(mockListings);
            } else {
                setListings(data?.length ? (data as PropertyListing[]) : mockListings);
            }
            setLoading(false);
        }

        fetchListings();
    }, [areaId]);

    const filteredListings = listings.filter((l) => {
        const matchesTypeFilter = filter === "all" || l.property_type === filter || l.listing_category === filter;
        const matchesSearch = !searchTerm || l.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTypeFilter && matchesSearch;
    });

    const getScoreColors = (score: number | null) => {
        if (!score) return { color: "var(--text-muted)", bg: "var(--bg-elevated)" };
        if (score >= 80) return { color: "var(--score-excellent)", bg: "rgba(65, 139, 70, 0.12)" };
        if (score >= 60) return { color: "var(--score-good)", bg: "rgba(89, 168, 95, 0.12)" };
        if (score >= 40) return { color: "var(--score-moderate)", bg: "rgba(212, 167, 43, 0.12)" };
        return { color: "var(--score-low)", bg: "rgba(214, 76, 76, 0.12)" };
    };

    const propertyTypes = ["all", "sale", "rent", "apartment", "villa", "commercial", "land"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
                style={{ borderBottom: expanded ? "1px solid var(--border)" : "none" }}
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(13, 92, 138, 0.15)", color: "var(--brand-primary)" }}
                    >
                        <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            Property Listings
                        </h3>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {areaName ? `${filteredListings.length} in ${areaName}` : "Select an area"}
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                )}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Search & Filter */}
                        <div className="px-5 py-3 space-y-3" style={{ borderBottom: "1px solid var(--border)" }}>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                                <input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg transition-colors theme-transition"
                                    style={{
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-primary)",
                                        border: "1px solid var(--border)",
                                    }}
                                />
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto">
                                {propertyTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className="px-3 py-1 rounded-full text-[10px] font-medium capitalize whitespace-nowrap transition-colors"
                                        style={{
                                            background: filter === type ? "rgba(13, 92, 138, 0.15)" : "var(--bg-elevated)",
                                            color: filter === type ? "var(--brand-accent)" : "var(--text-muted)",
                                            border: filter === type ? "1px solid rgba(43, 163, 212, 0.3)" : "1px solid var(--border)",
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Listings */}
                        <div className="max-h-72 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div
                                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                        style={{ borderColor: "var(--brand-accent)", borderTopColor: "transparent" }}
                                    />
                                </div>
                            ) : filteredListings.length === 0 ? (
                                <div className="text-center py-8">
                                    <Home className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No listings found</p>
                                </div>
                            ) : (
                                filteredListings.map((listing) => {
                                    const scoreColors = getScoreColors(listing.visit_score_snapshot);
                                    return (
                                        <motion.div
                                            key={listing.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3.5 rounded-xl transition-all cursor-pointer group theme-transition"
                                            style={{
                                                background: "var(--bg-surface)",
                                                border: "1px solid var(--border)",
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                                                        {listing.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span
                                                            className="text-[10px] px-2 py-0.5 rounded capitalize"
                                                            style={{ background: listing.listing_category === 'rent' ? "rgba(43, 163, 212, 0.15)" : "rgba(65, 139, 70, 0.15)", color: listing.listing_category === 'rent' ? "var(--brand-accent)" : "var(--brand-secondary)" }}
                                                        >
                                                            For {listing.listing_category}
                                                        </span>
                                                        <span
                                                            className="text-[10px] px-2 py-0.5 rounded capitalize"
                                                            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                                                        >
                                                            {listing.property_type}
                                                        </span>
                                                        {listing.verified && (
                                                            <Shield className="w-3 h-3" style={{ color: "var(--brand-secondary)" }} />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className="text-xs font-bold px-2 py-1 rounded-lg"
                                                    style={{ color: scoreColors.color, background: scoreColors.bg }}
                                                >
                                                    {listing.visit_score_snapshot?.toFixed(0) ?? "—"}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                                    {listing.bedrooms > 0 && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Bed className="w-3 h-3" /> {listing.bedrooms}
                                                        </span>
                                                    )}
                                                    {listing.bathrooms > 0 && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Bath className="w-3 h-3" /> {listing.bathrooms}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-0.5">
                                                        <Maximize2 className="w-3 h-3" /> {listing.area_sqft} ft²
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold" style={{ color: "var(--brand-accent)" }}>
                                                    ₹{(listing.price / 100000).toFixed(1)}L {listing.listing_category === 'rent' ? '/mo' : ''}
                                                </div>
                                            </div>

                                            {/* Actions (visible on hover via group) */}
                                            <div
                                                className="flex items-center gap-2 mt-2.5 pt-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ borderTop: "1px solid var(--border)" }}
                                            >
                                                <button className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                                                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                                                >
                                                    <Eye className="w-3 h-3" /> Details
                                                </button>
                                                <button className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                                                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                                                >
                                                    <Bookmark className="w-3 h-3" /> Save
                                                </button>
                                                <button className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg transition-colors ml-auto"
                                                    style={{ background: "rgba(13, 92, 138, 0.15)", color: "var(--brand-accent)" }}
                                                >
                                                    <MapPin className="w-3 h-3" /> Contact
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Mock data for UI
const mockListings: PropertyListing[] = [
    { id: "ml-1", title: "Skyline Residency 3BHK", description: null, price: 15400000, property_type: "apartment", listing_category: "sale", bedrooms: 3, bathrooms: 2, area_sqft: 1800, latitude: 17.43, longitude: 78.41, area_id: null, visit_score_snapshot: 87.2, owner_id: "mock", verified: true, created_at: new Date().toISOString() },
    { id: "ml-2", title: "Green Valley Villa", description: null, price: 8900000, property_type: "villa", listing_category: "sale", bedrooms: 4, bathrooms: 3, area_sqft: 3200, latitude: 17.42, longitude: 78.43, area_id: null, visit_score_snapshot: 72.5, owner_id: "mock", verified: false, created_at: new Date().toISOString() },
    { id: "ml-3", title: "TechPark Office Suite", description: null, price: 150000, property_type: "commercial", listing_category: "rent", bedrooms: 0, bathrooms: 2, area_sqft: 5000, latitude: 17.44, longitude: 78.38, area_id: null, visit_score_snapshot: 91.0, owner_id: "mock", verified: true, created_at: new Date().toISOString() },
    { id: "ml-4", title: "Lake View 2BHK", description: null, price: 35000, property_type: "apartment", listing_category: "rent", bedrooms: 2, bathrooms: 1, area_sqft: 1100, latitude: 17.41, longitude: 78.40, area_id: null, visit_score_snapshot: 55.8, owner_id: "mock", verified: false, created_at: new Date().toISOString() },
    { id: "ml-5", title: "Open Plot (Sector 4)", description: null, price: 45000000, property_type: "land", listing_category: "sale", bedrooms: 0, bathrooms: 0, area_sqft: 4500, latitude: 17.45, longitude: 78.39, area_id: null, visit_score_snapshot: null, owner_id: "mock", verified: true, created_at: new Date().toISOString() },
];
