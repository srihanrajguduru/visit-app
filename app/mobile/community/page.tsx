"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Send, UserPlus, UserMinus, Clock, ChevronDown, MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import type { CommunityPost, Area } from "@/types/database";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MobileCommunityPage() {
    const { user } = useAuth();
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [memberCount, setMemberCount] = useState(0);
    const [isMember, setIsMember] = useState(false);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [showAreaPicker, setShowAreaPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedArea = areas.find((a) => a.id === selectedAreaId);

    // Fetch areas
    useEffect(() => {
        async function loadAreas() {
            const { data } = await supabase
                .from("areas")
                .select("*")
                .order("name");
            if (data) {
                setAreas(data as Area[]);
                if (data.length > 0 && !selectedAreaId) {
                    setSelectedAreaId(data[0].id);
                }
            }
        }
        loadAreas();
    }, []);

    // Fetch community data when area changes
    useEffect(() => {
        if (!selectedAreaId) return;

        async function loadCommunity() {
            setLoading(true);

            const { data: postsData } = await supabase
                .from("community_posts")
                .select("*")
                .eq("area_id", selectedAreaId!)
                .order("created_at", { ascending: false })
                .limit(50);

            setPosts(postsData && postsData.length > 0 ? (postsData as CommunityPost[]) : mockPosts);

            const { count } = await supabase
                .from("community_members")
                .select("*", { count: "exact", head: true })
                .eq("area_id", selectedAreaId!);
            setMemberCount(count ?? 8);

            if (user) {
                const { data: membership } = await supabase
                    .from("community_members")
                    .select("*")
                    .eq("area_id", selectedAreaId!)
                    .eq("user_id", user.uid)
                    .maybeSingle();
                setIsMember(!!membership);
            }

            setLoading(false);
        }

        loadCommunity();
    }, [selectedAreaId, user]);

    // Realtime
    useEffect(() => {
        if (!selectedAreaId) return;
        const channel = supabase
            .channel(`mobile-community-${selectedAreaId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "community_posts",
                filter: `area_id=eq.${selectedAreaId}`,
            }, (payload) => {
                setPosts((prev) => [payload.new as CommunityPost, ...prev]);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedAreaId]);

    const handlePost = async () => {
        if (!newPost.trim() || !user || !selectedAreaId || posting) return;
        setPosting(true);
        const { data, error } = await supabase
            .from("community_posts")
            .insert({ area_id: selectedAreaId, user_id: user.uid, content: newPost.trim() })
            .select()
            .single();
        if (!error && data) {
            setPosts((prev) => [data as CommunityPost, ...prev]);
            setNewPost("");
        }
        setPosting(false);
    };

    const handleToggleMembership = async () => {
        if (!user || !selectedAreaId) return;
        if (isMember) {
            await supabase.from("community_members").delete().eq("area_id", selectedAreaId).eq("user_id", user.uid);
            setIsMember(false);
            setMemberCount((c) => Math.max(0, c - 1));
        } else {
            await supabase.from("community_members").insert({ area_id: selectedAreaId, user_id: user.uid, membership_type: "resident" });
            setIsMember(true);
            setMemberCount((c) => c + 1);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="min-h-screen pb-24 flex flex-col theme-transition" style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}>
            {/* Header */}
            <div
                className="pt-12 pb-4 px-6 sticky top-0 z-20 backdrop-blur-xl theme-transition"
                style={{ background: "color-mix(in srgb, var(--bg-dark) 80%, transparent)", borderBottom: "1px solid var(--border)" }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" style={{ color: "var(--brand-secondary)" }} />
                        <h1 className="text-xl font-bold gradient-text">Community</h1>
                    </div>
                    <button
                        onClick={handleToggleMembership}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                        style={{
                            background: isMember ? "rgba(214, 76, 76, 0.1)" : "rgba(65, 139, 70, 0.12)",
                            color: isMember ? "var(--danger)" : "var(--brand-secondary)",
                            border: `1px solid ${isMember ? "rgba(214, 76, 76, 0.2)" : "rgba(65, 139, 70, 0.2)"}`,
                        }}
                    >
                        {isMember ? <><UserMinus className="w-3 h-3" /> Leave</> : <><UserPlus className="w-3 h-3" /> Join</>}
                    </button>
                </div>

                {/* Area Picker */}
                <button
                    onClick={() => setShowAreaPicker(!showAreaPicker)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: "var(--brand-accent)" }} />
                        <span className="font-medium">{selectedArea?.name ?? "Select area"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            <Users className="w-3 h-3 inline mr-0.5" />{memberCount}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAreaPicker ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                </button>

                {showAreaPicker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 max-h-48 overflow-y-auto custom-scrollbar rounded-xl"
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                    >
                        {areas.map((area) => (
                            <button
                                key={area.id}
                                onClick={() => { setSelectedAreaId(area.id); setShowAreaPicker(false); }}
                                className="w-full text-left px-4 py-3 text-sm transition-colors"
                                style={{
                                    background: selectedAreaId === area.id ? "rgba(43, 163, 212, 0.08)" : "transparent",
                                    color: selectedAreaId === area.id ? "var(--brand-accent)" : "var(--text-secondary)",
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                {area.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Posts Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand-secondary)", borderTopColor: "transparent" }} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No discussions yet</p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Start the conversation!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl theme-transition"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{ background: "var(--bg-elevated)", color: "var(--brand-accent)" }}
                                >
                                    {post.user_id.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                    {post.user_id.substring(0, 8)}...
                                </span>
                                <span className="ml-auto text-[10px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                    <Clock className="w-2.5 h-2.5" />
                                    {formatTimeAgo(post.created_at)}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                {post.content}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Post Input */}
            <div className="sticky bottom-20 left-0 right-0 px-4 py-3 backdrop-blur-xl z-10" style={{ background: "color-mix(in srgb, var(--bg-dark) 90%, transparent)", borderTop: "1px solid var(--border)" }}>
                {user ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handlePost()}
                            placeholder="Share your thoughts..."
                            className="flex-1 px-4 py-3 text-sm rounded-xl transition-colors"
                            style={{ background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                        />
                        <button
                            onClick={handlePost}
                            disabled={!newPost.trim() || posting}
                            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-colors"
                            style={{ background: "var(--brand-secondary)", color: "white" }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-sm py-2" style={{ color: "var(--text-muted)" }}>Login to join the discussion</p>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MobileNavigation />
            </div>
        </div>
    );
}

const mockPosts: CommunityPost[] = [
    { id: "mp-1", area_id: "mock", user_id: "user_abc123", content: "Just moved here — the infrastructure is really improving! New metro line construction visible from my balcony.", created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: "mp-2", area_id: "mock", user_id: "user_def456", content: "Water supply has been consistent this week. Big improvement from last month.", created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "mp-3", area_id: "mock", user_id: "user_ghi789", content: "Anyone notice the noise levels from the new construction? It's quite loud during the day.", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "mp-4", area_id: "mock", user_id: "user_jkl012", content: "The park near Sector 7 has been renovated beautifully. Great place for evening walks.", created_at: new Date(Date.now() - 172800000).toISOString() },
];
