"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Search, RefreshCw, Trash2, AlertCircle, Clock, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CommunityModerationPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("community_posts")
            .select("*, areas(name)")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            if (error.code === "42P01" || error.message.includes('Could not find the table')) setPosts(mockPosts);
            else setMessage({ type: "error", text: error.message });
        } else {
            setPosts(data?.length ? data : mockPosts);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (id: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        const { error } = await supabase.from("community_posts").delete().eq("id", id);
        if (error) {
            setMessage({ type: "error", text: `Delete failed: ${error.message}` });
            fetchPosts();
        } else {
            setMessage({ type: "success", text: "Post removed." });
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 2000);
    };

    const formatTimeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const filtered = posts.filter((p) =>
        p.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.areas?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Community Moderation
                    </motion.h1>
                    <p style={{ color: "var(--text-muted)" }}>Monitor and moderate community discussions across all areas.</p>
                </div>
                <button onClick={fetchPosts} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === "error" ? "bg-red-500/10 text-red-300 border border-red-500/20" : "bg-green-500/10 text-green-300 border border-green-500/20"}`}>
                    {message.text}
                </div>
            )}

            <div className="mb-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                    type="text" placeholder="Search by content or area..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-16"><RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--brand-accent)" }} /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>No community posts found.</p>
                    </div>
                ) : (
                    filtered.map((post) => (
                        <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-5 rounded-xl flex items-start gap-4 group theme-transition"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ background: "var(--bg-elevated)", color: "var(--brand-accent)" }}>
                                {post.user_id?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{post.user_id?.substring(0, 12)}...</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--brand-accent)" }}>
                                        {post.areas?.name || "Unknown Area"}
                                    </span>
                                    <span className="text-[10px] flex items-center gap-1 ml-auto" style={{ color: "var(--text-muted)" }}>
                                        <Clock className="w-3 h-3" />{formatTimeAgo(post.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{post.content}</p>
                            </div>
                            <button onClick={() => handleDelete(post.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                                style={{ color: "var(--danger)", background: "rgba(214, 76, 76, 0.1)" }}
                                title="Delete post">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

const mockPosts = [
    { id: "mod-1", user_id: "user_abc123_example", content: "The water quality near the lake has improved significantly after the cleanup drive.", areas: { name: "Jubilee Hills" }, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "mod-2", user_id: "user_def456_example", content: "Noise levels from the highway are unbearable. Can we petition for sound barriers?", areas: { name: "HITEC City" }, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "mod-3", user_id: "user_ghi789_example", content: "Great new park opened in phase 2! Perfect for families.", areas: { name: "Gachibowli" }, created_at: new Date(Date.now() - 86400000).toISOString() },
];
