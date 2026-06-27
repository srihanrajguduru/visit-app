/**
 * --------------------------------------------------------
 * File: app/mobile/profile/page.tsx
 * Purpose: User profile and activity statistics page for mobile.
 * Responsibilities: Renders user profile information, activity statistics, navigation shortcuts, and handles user log out.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { useEffect, useState } from "react";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import { UserCircle, Settings, LogOut, ChevronRight, Bell, Heart, Shield, HelpCircle, Smartphone, MessageSquare, Building2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getProfileStats } from "@/app/actions/dbActions";

export default function MobileProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [savedCount, setSavedCount] = useState<number>(0);
    const [communityCount, setCommunityCount] = useState<number>(0);
    const [listingCount, setListingCount] = useState<number>(0);

    useEffect(() => {
        async function fetchProfileData() {
            if (!user) return;

            const { data } = await getProfileStats(user.uid);
            if (data) {
                setSavedCount(data.savedCount);
                setCommunityCount(data.communityCount);
                setListingCount(data.listingCount);
            }
        }

        fetchProfileData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{ background: "var(--bg-dark)" }}>
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand-accent)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const stats = [
        { icon: Heart, label: "Saved Areas", value: savedCount, color: "var(--danger)", onClick: () => router.push("/mobile/saved") },
        { icon: MessageSquare, label: "Communities", value: communityCount, color: "var(--brand-secondary)", onClick: () => router.push("/mobile/community") },
        { icon: Building2, label: "Listings", value: listingCount, color: "var(--brand-primary)", onClick: undefined },
    ];

    const menuItems = [
        { icon: Bell, title: "Notifications", desc: "Manage alerts and emails" },
        { icon: Shield, title: "Privacy & Security", desc: "Manage data and sessions" },
        { icon: HelpCircle, title: "Help & Support", desc: "Contact admin" },
    ];

    return (
        <div className="min-h-screen pb-24 font-sans theme-transition" style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}>
            {/* Header */}
            <div
                className="pt-12 pb-6 px-6 sticky top-0 z-20 backdrop-blur-xl theme-transition"
                style={{ background: "color-mix(in srgb, var(--bg-dark) 80%, transparent)", borderBottom: "1px solid var(--border)" }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight gradient-text">Profile</h1>
                    <button className="p-2 rounded-full transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-accent))",
                            boxShadow: "var(--glow-primary)",
                        }}
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white">{user.email?.charAt(0).toUpperCase() || "?"}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{user.displayName || "Explorer"}</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--brand-secondary)" }} />
                            <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--brand-secondary)" }}>User Account</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <button
                                key={stat.label}
                                onClick={stat.onClick}
                                className="rounded-2xl p-4 flex flex-col gap-1 active:scale-95 transition-transform theme-transition"
                                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                            >
                                <Icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
                                <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{stat.value}</span>
                                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Joined Date */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <UserCircle className="w-5 h-5" style={{ color: "var(--brand-accent)" }} />
                    <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Member since</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                </div>

                {/* Settings Menu */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="px-5 py-4 flex items-center gap-4 theme-transition"
                                style={{ borderBottom: index < menuItems.length - 1 ? "1px solid var(--border)" : "none" }}
                            >
                                <Icon className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                                <div className="flex-1">
                                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                                </div>
                                <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                            </div>
                        );
                    })}
                </div>

                {/* App Version */}
                <div className="flex items-center justify-between px-2 text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                    <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        Vi-SiT Platform
                    </div>
                    <span>v2.0.0</span>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 mt-2 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                    style={{
                        background: "rgba(214, 76, 76, 0.1)",
                        color: "var(--danger)",
                        border: "1px solid rgba(214, 76, 76, 0.2)",
                    }}
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MobileNavigation />
            </div>
        </div>
    );
}
