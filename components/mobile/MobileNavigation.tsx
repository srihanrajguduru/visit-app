"use client";

import { Map, Compass, Bookmark, User, MessageSquare } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function MobileNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    const navItems = [
        { icon: Map, label: "Map", path: "/mobile/map" },
        { icon: Compass, label: "Explore", path: "/mobile/explore" },
        { icon: MessageSquare, label: "Community", path: "/mobile/community" },
        { icon: Bookmark, label: "Saved", path: "/mobile/saved" },
        { icon: User, label: "Profile", path: "/mobile/profile" },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl pb-safe pt-2 theme-transition"
            style={{
                background: "color-mix(in srgb, var(--bg-dark) 90%, transparent)",
                borderTop: "1px solid var(--border)",
            }}
        >
            <div className="flex justify-around items-center px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="flex flex-col items-center justify-center w-16 gap-1 transition-colors"
                            style={{
                                color: active ? "var(--brand-accent)" : "var(--text-muted)",
                            }}
                        >
                            <Icon
                                className="w-6 h-6"
                                style={{
                                    fill: active ? "rgba(43, 163, 212, 0.15)" : "none",
                                }}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
                <div className="flex flex-col items-center justify-center w-10">
                    <ThemeToggle />
                </div>
            </div>
            {/* Safe area spacer for iOS devices */}
            <div className="h-5"></div>
        </div>
    );
}
