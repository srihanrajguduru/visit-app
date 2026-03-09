"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Map, Activity, ShieldCheck, HardHat, Building2, LogOut, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
    { name: "Overview", href: "/developer", icon: LayoutDashboard },
    { name: "Datasets", href: "/developer/datasets", icon: Database },
    { name: "Areas", href: "/developer/areas", icon: Map },
    { name: "Metrics", href: "/developer/metrics", icon: Activity },
    { name: "Visit Score Control", href: "/developer/visit-score", icon: Activity },
    { name: "Property Verification", href: "/developer/properties", icon: ShieldCheck },
    { name: "Community Moderation", href: "/developer/community", icon: MessageSquare },
    { name: "Infrastructure", href: "/developer/infrastructure", icon: HardHat },
    { name: "Government Projects", href: "/developer/gov-projects", icon: Building2 },
];

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();

    // Basic authorization wrapper: only allow specific users / emails into Developer Mode
    useEffect(() => {
        if (!user) return; // Wait for auth provider to load

        const isAuthorized =
            user.email?.endsWith("@visit.com") ||
            user.email?.endsWith("@visit.ai") ||
            user.email === "koppalasriharshini1806@gmail.com" ||
            user.email === "rishigurugubelli@gmail.com" ||
            user.email === "anilguduru2005@gmail.com" ||
            user.email === "mjithendarreddy2006@gmail.com" ||
            user.email === "harshitburgu5@gmail.com" ||
            user.email === "srihanraj.27@gmail.com";

        if (!isAuthorized) {
            router.push("/dashboard");
        }
    }, [user, router]);

    return (
        <div className="flex h-screen" style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}>
            {/* Sidebar */}
            <aside
                className="w-64 flex flex-col z-20 theme-transition"
                style={{
                    background: "var(--bg-surface)",
                    borderRight: "1px solid var(--border)",
                }}
            >
                <div className="p-6" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-1">
                        <h1 className="text-xl font-bold tracking-tight">
                            <span style={{ color: "var(--text-primary)" }}>Vi-SiT </span>
                            <span className="gradient-text">Admin</span>
                        </h1>
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: "var(--brand-accent)" }}
                        />
                        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                            Developer Mode
                        </p>
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
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative theme-transition"
                                style={{
                                    background: isActive ? "rgba(13, 92, 138, 0.12)" : "transparent",
                                    color: isActive ? "var(--brand-accent)" : "var(--text-muted)",
                                    border: isActive
                                        ? "1px solid rgba(43, 163, 212, 0.2)"
                                        : "1px solid transparent",
                                    boxShadow: isActive ? "0 0 15px rgba(43, 163, 212, 0.08)" : "none",
                                }}
                            >
                                <Icon
                                    className="w-4 h-4"
                                    style={{ color: isActive ? "var(--brand-accent)" : "var(--text-muted)" }}
                                />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute rounded-r-full"
                                        style={{
                                            left: "-13px",
                                            width: "4px",
                                            height: "32px",
                                            background: "var(--brand-accent)",
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 theme-transition" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-dark)" }}>
                    <div className="mb-4 px-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-muted)" }}>
                            Active Session
                        </p>
                        <p className="text-xs truncate font-mono" style={{ color: "var(--text-secondary)" }}>
                            {user?.email}
                        </p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors theme-transition"
                        style={{
                            color: "var(--danger)",
                            border: "1px solid transparent",
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        Exit Developer Mode
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className="flex-1 overflow-y-auto relative custom-scrollbar theme-transition"
                style={{ background: "var(--bg-dark)" }}
            >
                {children}
            </main>
        </div>
    );
}
