"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardHat, Search, RefreshCw, AlertCircle, Plus, Save, MapPin, CheckCircle2, Train, Wifi, Route } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
    width: "100%",
    height: "100%"
};

// Default to Hyderabad
const defaultCenter = { lat: 17.3850, lng: 78.4867 };



export default function InfrastructureManagementPage() {
    const [infrastructures, setInfrastructures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    });

    const [newInfra, setNewInfra] = useState({
        name: "",
        type: "Metro Station",
        latitude: "",
        longitude: "",
        status: "Operational"
    });

    const fetchInfrastructure = async () => {
        setLoading(true);
        // Assuming an 'infrastructure_nodes' table exists or will exist
        const { data, error } = await supabase
            .from("infrastructure_nodes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            if (error.code === '42P01' || error.message.includes("Could not find the table")) {
                // Mock if table doesn't exist
                setInfrastructures(mockInfrastructure);
            } else {
                setMessage({ type: "error", text: error.message });
            }
        } else {
            setInfrastructures(data || []);
            if (data?.length === 0) setInfrastructures(mockInfrastructure);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInfrastructure();
    }, []);

    const handleAddInfra = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        if (!newInfra.name || !newInfra.latitude || !newInfra.longitude) {
            setMessage({ type: "error", text: "Please fill in all required fields." });
            setSaving(false);
            return;
        }

        const { data, error } = await supabase.from("infrastructure_nodes").insert([{
            name: newInfra.name,
            type: newInfra.type,
            latitude: parseFloat(newInfra.latitude),
            longitude: parseFloat(newInfra.longitude),
            status: newInfra.status
        }]).select();

        if (error) {
            // if table missing, just add to local state
            if (error.code === '42P01' || error.message.includes("Could not find the table")) {
                const fakeNew = { ...newInfra, id: Math.random().toString(), latitude: parseFloat(newInfra.latitude), longitude: parseFloat(newInfra.longitude) };
                setInfrastructures([fakeNew, ...infrastructures]);
                setMessage({ type: "success", text: "Infrastructure added to local grid view (Database table pending)." });
                setNewInfra({ name: "", type: "Metro Station", latitude: "", longitude: "", status: "Operational" });
            } else {
                setMessage({ type: "error", text: error.message });
            }
        } else if (data) {
            setMessage({ type: "success", text: "Infrastructure node registered successfully!" });
            setNewInfra({ name: "", type: "Metro Station", latitude: "", longitude: "", status: "Operational" });
            setInfrastructures([data[0], ...infrastructures]);
        }

        setSaving(false);
    };

    const filteredInfra = infrastructures.filter(inf =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (type: string) => {
        if (type.includes('Metro')) return <Train className="w-5 h-5 text-purple-400" />;
        if (type.includes('Internet') || type.includes('Fiber')) return <Wifi className="w-5 h-5 text-blue-400" />;
        return <Route className="w-5 h-5 text-yellow-400" />;
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setNewInfra({
                ...newInfra,
                latitude: e.latLng.lat().toFixed(6),
                longitude: e.latLng.lng().toFixed(6)
            });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-4rem)]">

            {/* Sidebar: Add Infrastructure */}
            <div className="w-96 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full shrink-0 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-[#222] bg-[#141414]">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-400" />
                        Deploy Infrastructure
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Register new physical master nodes.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAddInfra} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Node Name / identifier *</label>
                            <input
                                type="text"
                                value={newInfra.name}
                                onChange={(e) => setNewInfra({ ...newInfra, name: e.target.value })}
                                placeholder="e.g., Jubilee Hills Checkpost Metro"
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Asset Type *</label>
                            <select
                                value={newInfra.type}
                                onChange={(e) => setNewInfra({ ...newInfra, type: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="Metro Station">Metro Station</option>
                                <option value="Road Network (Highway)">Road Network (Highway)</option>
                                <option value="Road Network (Arterial)">Road Network (Arterial)</option>
                                <option value="Fiber Internet Hub">Fiber Internet Hub</option>
                                <option value="Water Treatment Plant">Water Treatment Plant</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Latitude *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newInfra.latitude}
                                    onChange={(e) => setNewInfra({ ...newInfra, latitude: e.target.value })}
                                    placeholder="17.4325"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Longitude *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={newInfra.longitude}
                                    onChange={(e) => setNewInfra({ ...newInfra, longitude: e.target.value })}
                                    placeholder="78.4070"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Launch Status</label>
                            <select
                                value={newInfra.status}
                                onChange={(e) => setNewInfra({ ...newInfra, status: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="Operational">Operational</option>
                                <option value="Under Construction">Under Construction</option>
                                <option value="Proposed">Proposed</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Commit to Grid
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Content: Directory */}
            <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-[#222] bg-[#141414] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <HardHat className="w-6 h-6 text-emerald-400" />
                            Infrastructure Assets
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Nodes that automatically amplify the Visit Score engine calculations.</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
                            <p className="text-sm font-medium">{message.text}</p>
                        </motion.div>
                    )}
                </div>

                <div className="flex-1 min-h-0 relative p-6 pt-2">
                    {/* The Blank Black Box gets replaced by the Map and overlay list */}
                    <div className="absolute inset-x-6 inset-y-2 rounded-2xl overflow-hidden border border-[#333]">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                zoom={12}
                                center={
                                    newInfra.latitude && newInfra.longitude
                                        ? { lat: parseFloat(newInfra.latitude), lng: parseFloat(newInfra.longitude) }
                                        : defaultCenter
                                }
                                onClick={handleMapClick}
                                options={{
                                    styles: [
                                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                        {
                                            featureType: "administrative.locality",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#d59563" }],
                                        },
                                        {
                                            featureType: "poi",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#d59563" }],
                                        },
                                        {
                                            featureType: "poi.park",
                                            elementType: "geometry",
                                            stylers: [{ color: "#263c3f" }],
                                        },
                                        {
                                            featureType: "poi.park",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#6b9a76" }],
                                        },
                                        {
                                            featureType: "road",
                                            elementType: "geometry",
                                            stylers: [{ color: "#38414e" }],
                                        },
                                        {
                                            featureType: "road",
                                            elementType: "geometry.stroke",
                                            stylers: [{ color: "#212a37" }],
                                        },
                                        {
                                            featureType: "road",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#9ca5b3" }],
                                        },
                                        {
                                            featureType: "road.highway",
                                            elementType: "geometry",
                                            stylers: [{ color: "#746855" }],
                                        },
                                        {
                                            featureType: "road.highway",
                                            elementType: "geometry.stroke",
                                            stylers: [{ color: "#1f2835" }],
                                        },
                                        {
                                            featureType: "road.highway",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#f3d19c" }],
                                        },
                                        {
                                            featureType: "transit",
                                            elementType: "geometry",
                                            stylers: [{ color: "#2f3948" }],
                                        },
                                        {
                                            featureType: "transit.station",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#d59563" }],
                                        },
                                        {
                                            featureType: "water",
                                            elementType: "geometry",
                                            stylers: [{ color: "#17263c" }],
                                        },
                                        {
                                            featureType: "water",
                                            elementType: "labels.text.fill",
                                            stylers: [{ color: "#515c6d" }],
                                        },
                                        {
                                            featureType: "water",
                                            elementType: "labels.text.stroke",
                                            stylers: [{ color: "#17263c" }],
                                        },
                                    ],
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            >
                                {filteredInfra.map((node) => (
                                    <Marker
                                        key={node.id}
                                        position={{ lat: Number(node.latitude), lng: Number(node.longitude) }}
                                        icon={{
                                            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                        }}
                                        title={node.name}
                                    />
                                ))}
                                {newInfra.latitude && newInfra.longitude && (
                                    <Marker
                                        position={{ lat: parseFloat(newInfra.latitude), lng: parseFloat(newInfra.longitude) }}
                                        icon={{
                                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#0a0a0a]">
                                <RefreshCw className="w-8 h-8 mb-4 animate-spin text-emerald-400" />
                                <p>Loading map interface...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overlaid / Bottom list of assets slightly overlapping or below */}
                <div className="h-64 border-t border-[#333] bg-[#111] overflow-y-auto custom-scrollbar p-6">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <RefreshCw className="w-6 h-6 mb-2 animate-spin text-emerald-400" />
                            <p className="text-sm">Scanning infrastructure grid...</p>
                        </div>
                    ) : filteredInfra.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <HardHat className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No infrastructure assets found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredInfra.map((node) => (
                                <div key={node.id} className="bg-[#161616] border border-[#222] p-5 rounded-2xl hover:border-[#444] transition-colors relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-0 group-hover:bg-emerald-500/10 transition-colors" />

                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                                                {getIcon(node.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">{node.name}</h3>
                                                <p className="text-sm text-gray-400">{node.type}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${node.status === 'Operational' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            node.status === 'Proposed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {node.status}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm relative z-10">
                                        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Latitude</p>
                                            <p className="text-gray-200 font-mono text-xs">{Number(node.latitude).toFixed(4)}</p>
                                        </div>
                                        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Longitude</p>
                                            <p className="text-gray-200 font-mono text-xs">{Number(node.longitude).toFixed(4)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const mockInfrastructure = [
    { id: '1', name: 'Jubilee Hills Checkpost', type: 'Metro Station', latitude: 17.4325, longitude: 78.4070, status: 'Operational' },
    { id: '2', name: 'ORR Phase 2 Extension', type: 'Road Network (Highway)', latitude: 17.4410, longitude: 78.3450, status: 'Under Construction' },
    { id: '3', name: 'Gachibowli Tech Fiber Ring', type: 'Fiber Internet Hub', latitude: 17.4400, longitude: 78.3489, status: 'Operational' },
    { id: '4', name: 'Durgam Cheruvu Link Road', type: 'Road Network (Arterial)', latitude: 17.4300, longitude: 78.3900, status: 'Operational' },
];
