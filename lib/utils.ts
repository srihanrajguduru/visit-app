import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
}

export function getScoreColor(score: number): string {
    if (score >= 70) return "#22c55e"; // green
    if (score >= 40) return "#eab308"; // yellow
    return "#ef4444"; // red
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Below Average";
    return "Poor";
}

export function formatScore(score: number): string {
    return score.toFixed(1);
}
