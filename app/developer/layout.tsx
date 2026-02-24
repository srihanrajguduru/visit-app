"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Map, Activity, ShieldCheck, HardHat, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

const navItems = [
    { name: "Overview", href: "/developer", icon: LayoutDashboard },
    { name: "Datasets", href: "/developer/datasets", icon: Database },
    { name: "Areas", href: "/developer/areas", icon: Map },
    { name: "Metrics", href: "/developer/metrics", icon: Activity },
    { name: "Visit Score Control", href: "/developer/visit-score", icon: Activity },
    { name: "Property Verification", href: "/developer/properties", icon: ShieldCheck },
    { name: "Infrastructure", href: "/developer/infrastructure", icon: HardHat },
    { name: "Government Projects", href: "/developer/gov-projects", icon: Building2 },
];

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-[#111111] border-r border-[#222] flex flex-col z-20">
                <div className="p-6 border-b border-[#222]">
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">
                        Visit <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Admin</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <p className="text-xs text-gray-500 font-medium">Developer Mode</p>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                        : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-transparent"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                                        style={{ position: "absolute", left: "-13px" }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#222] bg-[#0c0c0c]">
                    <div className="mb-4 px-2">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Active Session</p>
                        <p className="text-xs text-gray-300 truncate font-mono">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        Exit Developer Mode
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-[#0a0a0a] custom-scrollbar">
                {children}
            </main>
        </div>
    );
}
