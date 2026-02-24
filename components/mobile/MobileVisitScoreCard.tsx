"use client";

import { motion } from "framer-motion";

interface MobileVisitScoreCardProps {
    score: number;
    areaName: string;
}

export default function MobileVisitScoreCard({ score, areaName }: MobileVisitScoreCardProps) {
    const getScoreDetails = (s: number) => {
        if (s >= 90) return { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Excellent" };
        if (s >= 70) return { color: "text-[#84cc16]", bg: "bg-[#84cc16]/10", border: "border-[#84cc16]/20", label: "Great" };
        if (s >= 50) return { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Average" };
        return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
    };

    const details = getScoreDetails(score);

    return (
        <div className="flex items-center gap-4">
            <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${details.bg} ${details.border} border shadow-inner`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent" />
                <span className={`text-4xl font-extrabold tracking-tighter tabular-nums ${details.color}`}>
                    {score.toFixed(1)}
                </span>
            </div>
            <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold text-white leading-tight line-clamp-1">{areaName}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${details.bg} ${details.color}`}>
                        {details.label}
                    </span>
                    <span className="text-sm text-gray-500">Visit Score</span>
                </div>
            </div>
        </div>
    );
}
