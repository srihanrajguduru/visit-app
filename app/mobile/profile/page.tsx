"use client";

import { useEffect, useState } from "react";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import { UserCircle, Settings, LogOut, ChevronRight, Bell, Heart, Shield, HelpCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function MobileProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [savedCount, setSavedCount] = useState<number>(0);

    // Fetch the total count of saved areas directly via Head for lightweight profile metrics
    useEffect(() => {
        async function fetchSavedCount() {
            if (!user) return;
            const { count } = await supabase
                .from("saved_areas")
                .select("*", { count: 'exact', head: true })
                .eq("user_id", user.uid);

            if (count !== null) setSavedCount(count);
        }

        fetchSavedCount();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        // Redundant catch, layout should theoretically protect this but added for safe measure
        router.push("/login");
        return null;
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login"); // Immediately force redirection
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                        <Settings className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold overflow-hidden shadow-lg shadow-indigo-500/20">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user.email?.charAt(0).toUpperCase() || "?"
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.displayName || "Explorer"}</h2>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-emerald-400 tracking-wider uppercase">User Account</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="p-6 space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => router.push('/mobile/saved')}
                        className="bg-[#0f0f11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 active:scale-95 transition-transform"
                    >
                        <Heart className="w-5 h-5 text-pink-500 mb-1" />
                        <span className="text-2xl font-black">{savedCount}</span>
                        <span className="text-xs text-gray-400 font-medium">Saved Areas</span>
                    </div>
                    <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                        <UserCircle className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-2xl font-black">
                            {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">Joined Date</span>
                    </div>
                </div>

                {/* Account Settings Menu */}
                <div className="bg-[#0f0f11] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5 bg-white/[0.02]">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-white">Notifications</div>
                            <div className="text-xs text-gray-500">Manage alerts and emails</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="px-5 py-4 flex items-center gap-4 border-b border-white/5 bg-white/[0.02]">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-white">Privacy & Security</div>
                            <div className="text-xs text-gray-500">Manage data and sessions</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="px-5 py-4 flex items-center gap-4 bg-white/[0.02]">
                        <HelpCircle className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-white">Help & Support</div>
                            <div className="text-xs text-gray-500">Contact admin</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                </div>

                {/* App Metadata */}
                <div className="flex items-center justify-between px-2 opacity-50 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        Visit Score Engine
                    </div>
                    <span>v1.0.0</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-4 mt-4 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-500 font-bold rounded-2xl transition-colors border border-red-500/20 shadow-lg shadow-red-500/5 flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>

            {/* Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MobileNavigation />
            </div>
        </div>
    );
}
