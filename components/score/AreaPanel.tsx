"use client";

import { motion } from "framer-motion";
import type { AreaMetrics } from "@/types/database";
import {
    calculateEnvironmentalDisplay,
    calculateInfrastructureDisplay,
    calculateSocialDisplay,
} from "@/services/scores";

interface AreaPanelProps {
    areaName: string;
    zone: string | null;
    metrics: AreaMetrics | null;
    score: number;
    onClose: () => void;
}

function MetricBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                    {value.toFixed(1)} {unit}
                </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}

export function AreaPanel({ areaName, zone, metrics, score, onClose }: AreaPanelProps) {
    if (!metrics) return null;

    const envScore = calculateEnvironmentalDisplay(metrics);
    const infraScore = calculateInfrastructureDisplay(metrics);
    const socialScore = calculateSocialDisplay(metrics);

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="glass-card p-6 w-96 max-h-[85vh] overflow-y-auto map-panel"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{areaName}</h2>
                    {zone && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{zone} Zone</p>}
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        background: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Score */}
            <div className="text-center mb-6 py-4 rounded-xl" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-4xl font-bold gradient-text">{score.toFixed(1)}</div>
                <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Visit Score</div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Environment", value: envScore, color: "var(--brand-secondary)" },
                    { label: "Infrastructure", value: infraScore, color: "var(--brand-primary)" },
                    { label: "Social", value: socialScore, color: "var(--score-moderate)" },
                ].map((s) => (
                    <div key={s.label} className="text-center py-3 rounded-xl" style={{ background: "var(--bg-elevated)" }}>
                        <div className="text-lg font-bold" style={{ color: s.color }}>
                            {s.value.toFixed(0)}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Detailed Metrics */}
            <div className="space-y-1">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Environmental</h3>
                <MetricBar label="AQI (PM2.5)" value={metrics.aqi ?? 0} max={500} unit="µg/m³" color="var(--danger)" />
                <MetricBar label="Noise Level" value={metrics.noise ?? 0} max={100} unit="dB" color="var(--warning)" />
                <MetricBar label="Flood Risk" value={(metrics.flood_risk ?? 0) * 100} max={100} unit="%" color="var(--score-moderate)" />

                <h3 className="text-sm font-semibold mt-4 mb-3" style={{ color: "var(--text-secondary)" }}>Infrastructure</h3>
                <MetricBar label="Metro Distance" value={(metrics.metro_distance ?? 5000) / 1000} max={10} unit="km" color="var(--brand-primary)" />
                <MetricBar label="Road Quality" value={(metrics.road_quality ?? 0.5) * 100} max={100} unit="%" color="var(--brand-accent)" />
                <MetricBar label="Water Supply" value={(metrics.water_supply_score ?? 0.5) * 100} max={100} unit="%" color="var(--brand-primary-light)" />
                <MetricBar label="Internet" value={(metrics.internet_score ?? 0.5) * 100} max={100} unit="%" color="var(--brand-accent-light)" />

                <h3 className="text-sm font-semibold mt-4 mb-3" style={{ color: "var(--text-secondary)" }}>Social</h3>
                <MetricBar label="Safety Score" value={metrics.women_safety_score ?? 50} max={100} unit="" color="var(--brand-secondary)" />
                <MetricBar label="Crime Rate" value={metrics.crime_rate ?? 30} max={100} unit="" color="var(--danger)" />
                <MetricBar label="Amenity Score" value={metrics.amenity_score ?? 50} max={100} unit="" color="var(--brand-accent)" />
            </div>

            <p className="text-[10px] mt-4 text-center" style={{ color: "var(--text-muted)" }}>
                Data version: {metrics.dataset_version ?? "v1.0"}
            </p>
        </motion.div>
    );
}
