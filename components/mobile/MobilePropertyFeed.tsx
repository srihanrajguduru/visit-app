import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Bath, Maximize2, Shield, Eye, Bookmark, MapPin, Building2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PropertyListing } from "@/types/database";



export default function MobilePropertyFeed({ areaId }: { areaId: string }) {
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!areaId) return;
        async function fetchListings() {
            setLoading(true);
            const { data, error } = await supabase
                .from("property_listings")
                .select("*")
                .eq("area_id", areaId)
                .order("created_at", { ascending: false });

            if (error) {
                setListings(mockListings); // Fallback to demo
            } else {
                setListings(data?.length ? (data as PropertyListing[]) : mockListings);
            }
            setLoading(false);
        }
        fetchListings();
    }, [areaId]);

    const filtered = listings.filter(l => filter === "all" || l.listing_category === filter || l.property_type === filter);

    if (loading) return (
        <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand-accent)", borderTopColor: "transparent" }} />
        </div>
    );

    return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>Properties</h3>
                <div className="flex gap-2 text-[10px] font-medium">
                    {["all", "sale", "rent"].map(type => (
                        <button
                            key={type} onClick={() => setFilter(type)}
                            className="px-2.5 py-1 rounded-md capitalize transition-colors"
                            style={{
                                background: filter === type ? "rgba(43, 163, 212, 0.15)" : "var(--bg-elevated)",
                                color: filter === type ? "var(--brand-accent)" : "var(--text-muted)",
                                border: filter === type ? "1px solid rgba(43, 163, 212, 0.3)" : "1px solid var(--border)",
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-6" style={{ color: "var(--text-muted)", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        <Building2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No properties found</p>
                    </div>
                ) : (
                    filtered.map((listing) => (
                        <div
                            key={listing.id}
                            className="p-3 rounded-xl flex flex-col gap-2"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-semibold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{listing.title}</h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                                            style={{
                                                background: listing.listing_category === 'rent' ? "rgba(43, 163, 212, 0.15)" : "rgba(65, 139, 70, 0.15)",
                                                color: listing.listing_category === 'rent' ? "var(--brand-accent)" : "var(--brand-secondary)"
                                            }}
                                        >
                                            For {listing.listing_category}
                                        </span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                                            {listing.property_type}
                                        </span>
                                        {listing.verified && <Shield className="w-3 h-3" style={{ color: "var(--brand-secondary)" }} />}
                                    </div>
                                </div>
                                <div className="text-sm font-bold" style={{ color: "var(--brand-accent)" }}>
                                    ₹{(listing.price / 100000).toFixed(1)}L {listing.listing_category === 'rent' ? '/mo' : ''}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {listing.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /> {listing.bedrooms}</span>}
                                {listing.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" /> {listing.bathrooms}</span>}
                                {listing.area_sqft > 0 && <span className="flex items-center gap-0.5"><Maximize2 className="w-3 h-3" /> {listing.area_sqft} ft²</span>}
                            </div>

                            <div className="flex gap-2 mt-1 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                                <button className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                                    <Eye className="w-3 h-3" /> Details
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg" style={{ background: "rgba(13, 92, 138, 0.15)", color: "var(--brand-accent)" }}>
                                    <MapPin className="w-3 h-3" /> Contact
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const mockListings: PropertyListing[] = [
    { id: "ml-1", title: "Skyline Residency 3BHK", description: null, price: 15400000, property_type: "apartment", listing_category: "sale", bedrooms: 3, bathrooms: 2, area_sqft: 1800, latitude: 17.43, longitude: 78.41, area_id: null, visit_score_snapshot: 87.2, owner_id: "mock", verified: true, created_at: new Date().toISOString() },
    { id: "ml-2", title: "Green Valley Villa", description: null, price: 8900000, property_type: "villa", listing_category: "sale", bedrooms: 4, bathrooms: 3, area_sqft: 3200, latitude: 17.42, longitude: 78.43, area_id: null, visit_score_snapshot: 72.5, owner_id: "mock", verified: false, created_at: new Date().toISOString() },
    { id: "ml-3", title: "TechPark Office Suite", description: null, price: 150000, property_type: "commercial", listing_category: "rent", bedrooms: 0, bathrooms: 2, area_sqft: 5000, latitude: 17.44, longitude: 78.38, area_id: null, visit_score_snapshot: 91.0, owner_id: "mock", verified: true, created_at: new Date().toISOString() },
];
