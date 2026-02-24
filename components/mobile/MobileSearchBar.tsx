"use client";

import { useState, useRef, useEffect } from "react";
import { Area } from "@/types/database";
import { Search, MapPin, X } from "lucide-react";

interface MobileSearchBarProps {
    areas: Area[];
    onSelectArea: (area: Area) => void;
}

export default function MobileSearchBar({ areas, onSelectArea }: MobileSearchBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Simple textual filter over our known areas for this prototype
    const filteredAreas = query.trim() === ""
        ? []
        : areas.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || (a.zone || "").toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (area: Area) => {
        onSelectArea(area);
        setQuery("");
        setIsFocused(false);
    };

    return (
        <div className="absolute top-4 left-4 right-4 z-20">
            <div className={`relative flex items-center transition-all bg-gray-900/90 backdrop-blur-md rounded-2xl border ${isFocused ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-800 shadow-md'}`}>
                <Search className="w-5 h-5 text-gray-400 ml-4 border-none" />
                <input
                    type="text"
                    className="w-full bg-transparent border-none text-white px-4 py-4 text-sm font-medium focus:outline-none focus:ring-0 placeholder:text-gray-500"
                    placeholder="Search Hyderabad areas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                // onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />

                {query.length > 0 && (
                    <button onClick={() => setQuery("")} className="mr-4 text-gray-400 hover:text-white p-1">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Sub-results dropdown */}
            {isFocused && query.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-30 max-h-64 overflow-y-auto">
                    {filteredAreas.length > 0 ? (
                        <div className="py-2">
                            {filteredAreas.map((area) => (
                                <button
                                    key={area.id}
                                    onClick={() => handleSelect(area)}
                                    className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-gray-800/50 last:border-0"
                                >
                                    <div className="bg-gray-800 p-2 rounded-full">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">{area.name}</div>
                                        <div className="text-gray-500 text-xs">{area.zone}</div>
                                    </div>
                                    <div className="ml-auto flex items-center justify-center bg-gray-950 px-2 py-1 rounded border border-gray-800 text-xs font-bold font-mono">
                                        {area.current_visit_score?.toFixed(1) || '--'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                            No areas found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
