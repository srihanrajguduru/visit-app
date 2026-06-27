"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Send, X, ChevronRight, UserPlus, UserMinus, Clock } from "lucide-react";
import { getAreaCommunityPosts, getCommunityMemberCount, getCommunityMembership, joinAreaCommunity, leaveAreaCommunity, createAreaPost } from "@/app/actions/dbActions";
import { useAuth } from "@/components/AuthProvider";
import type { CommunityPost, CommunityMember } from "@/types/database";



interface CommunityPanelProps {
    areaId: string | null;
    areaName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function CommunityPanel({ areaId, areaName, isOpen, onClose }: CommunityPanelProps) {
    const { user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [memberCount, setMemberCount] = useState(0);
    const [isMember, setIsMember] = useState(false);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!areaId || !isOpen) return;

        async function loadCommunity() {
            setLoading(true);

            // Load posts
            const { data: postsData } = await getAreaCommunityPosts(areaId!);

            if (postsData && postsData.length > 0) {
                setPosts(postsData as any[]);
            } else {
                // Mock data for UI dev
                setPosts(mockPosts);
            }

            // Member count
            const { data: count } = await getCommunityMemberCount(areaId!);
            setMemberCount(count ?? 12);

            // Check membership
            if (user) {
                const { data: membership } = await getCommunityMembership(areaId!, user.uid);
                setIsMember(!!membership);
            }

            setLoading(false);
        }

        loadCommunity();
    }, [areaId, isOpen, user]);

    const handlePost = async () => {
        if (!newPost.trim() || !user || !areaId || posting) return;

        setPosting(true);
        const { data, error } = await createAreaPost(areaId, user.uid, newPost.trim());

        if (!error && data) {
            setPosts((prev) => [data as any, ...prev]);
            setNewPost("");
        }
        setPosting(false);
    };

    const handleToggleMembership = async () => {
        if (!user || !areaId) return;

        if (isMember) {
            await leaveAreaCommunity(areaId, user.uid);
            setIsMember(false);
            setMemberCount((c) => Math.max(0, c - 1));
        } else {
            await joinAreaCommunity(areaId, user.uid);
            setIsMember(true);
            setMemberCount((c) => c + 1);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 420, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 420, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="glass-card w-96 h-[calc(100vh-6rem)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(65, 139, 70, 0.15)", color: "var(--brand-secondary)" }}
                            >
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Community</h3>
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                    {areaName} • {memberCount} members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleMembership}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
                                style={{
                                    background: isMember ? "rgba(214, 76, 76, 0.1)" : "rgba(65, 139, 70, 0.12)",
                                    color: isMember ? "var(--danger)" : "var(--brand-secondary)",
                                    border: `1px solid ${isMember ? "rgba(214, 76, 76, 0.2)" : "rgba(65, 139, 70, 0.2)"}`,
                                }}
                            >
                                {isMember ? <><UserMinus className="w-3 h-3" /> Leave</> : <><UserPlus className="w-3 h-3" /> Join</>}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div
                                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: "var(--brand-secondary)", borderTopColor: "transparent" }}
                                />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
                                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No discussions yet</p>
                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Be the first to start a conversation!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 rounded-xl"
                                    style={{
                                        background: "var(--bg-surface)",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                            style={{ background: "var(--bg-elevated)", color: "var(--brand-accent)" }}
                                        >
                                            {post.user_id.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                            {post.user_id.substring(0, 8)}...
                                        </span>
                                        <span className="ml-auto text-[10px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                            <Clock className="w-2.5 h-2.5" />
                                            {formatTimeAgo(post.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                        {post.content}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Post Input */}
                    <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                        {user ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handlePost()}
                                    placeholder="Share your thoughts..."
                                    className="flex-1 px-3 py-2 text-xs rounded-lg transition-colors"
                                    style={{
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-primary)",
                                        border: "1px solid var(--border)",
                                    }}
                                />
                                <button
                                    onClick={handlePost}
                                    disabled={!newPost.trim() || posting}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                                    style={{ background: "var(--brand-secondary)", color: "white" }}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-xs py-1" style={{ color: "var(--text-muted)" }}>
                                Login to join the discussion
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Mock posts for UI dev
const mockPosts: CommunityPost[] = [
    { id: "mp-1", area_id: "mock", user_id: "user_abc123_long", content: "Just moved to this area. The infrastructure is really improving! New metro line construction is visible from my balcony.", created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: "mp-2", area_id: "mock", user_id: "user_def456_long", content: "Water supply has been consistent this week. Big improvement from last month.", created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "mp-3", area_id: "mock", user_id: "user_ghi789_long", content: "Anyone notice the noise levels from the new construction site on Road No. 12? It's quite loud during the day.", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "mp-4", area_id: "mock", user_id: "user_jkl012_long", content: "The park near Sector 7 has been renovated beautifully. Great place for evening walks now.", created_at: new Date(Date.now() - 172800000).toISOString() },
];
