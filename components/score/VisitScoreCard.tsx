"use client";

import { motion } from "framer-motion";
import { getScoreColor, getScoreLabel, formatScore } from "@/lib/utils";

interface VisitScoreCardProps {
    score: number;
    areaName: string;
    zone?: string | null;
    compact?: boolean;
}

export function VisitScoreCard({ score, areaName, zone, compact }: VisitScoreCardProps) {
    const color = getScoreColor(score);
    const label = getScoreLabel(score);
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const glowClass =
        score >= 70 ? "score-glow-green" : score >= 40 ? "score-glow-yellow" : "score-glow-red";

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${color}20`, color }}
                >
                    {Math.round(score)}
                </div>
                <div>
                    <div className="text-sm font-medium text-white">{areaName}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-6 ${glowClass} score-pulse`}
        >
            <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">{areaName}</h3>
                {zone && <p className="text-xs text-gray-400 mb-4">{zone} Zone</p>}

                {/* Circular gauge */}
                <div className="relative w-36 h-36 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="rgba(75, 85, 99, 0.3)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke={color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{
                                filter: `drop-shadow(0 0 8px ${color}80)`,
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-3xl font-bold"
                            style={{ color }}
                        >
                            {formatScore(score)}
                        </motion.span>
                        <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                </div>

                <div
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    {label}
                </div>
            </div>
        </motion.div>
    );
}
