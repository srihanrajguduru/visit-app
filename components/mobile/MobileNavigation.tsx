"use client";

import { Map, Compass, Bookmark, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function MobileNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 pb-safe pt-2">
            <div className="flex justify-around items-center px-2 py-2">
                <button
                    onClick={() => router.push("/mobile/map")}
                    className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive("/mobile/map") ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <Map className={`w-6 h-6 ${isActive("/mobile/map") ? "fill-indigo-900/40" : ""}`} />
                    <span className="text-[10px] font-medium">Map</span>
                </button>

                <button
                    onClick={() => router.push("/mobile/explore")}
                    className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive("/mobile/explore") ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <Compass className={`w-6 h-6 ${isActive("/mobile/explore") ? "fill-indigo-900/40" : ""}`} />
                    <span className="text-[10px] font-medium">Explore</span>
                </button>

                <button
                    onClick={() => router.push("/mobile/saved")}
                    className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive("/mobile/saved") ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <Bookmark className={`w-6 h-6 ${isActive("/mobile/saved") ? "fill-indigo-900/40" : ""}`} />
                    <span className="text-[10px] font-medium">Saved</span>
                </button>

                <button
                    onClick={() => router.push("/mobile/profile")}
                    className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive("/mobile/profile") ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <User className={`w-6 h-6 ${isActive("/mobile/profile") ? "fill-indigo-900/40" : ""}`} />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </div>
            {/* Safe area spacer for iOS devices */}
            <div className="h-5"></div>
        </div>
    );
}
