/**
 * --------------------------------------------------------
 * File: lib/utils.ts
 * Purpose: General utility helpers.
 * Responsibilities: Provides class merges (Tailwind CSS v4 + clsx), visit score clamping, score labels, and color mappings.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names dynamically.
 * Combines Tailwind CSS v4 directives and clsx values safely.
 * 
 * @param inputs Class name segments or conditional maps
 * @returns Formatted and deduplicated class list string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Clamps calculated score values to the standard 0-100 range.
 * 
 * @param score Raw computed score
 * @returns Score clamped between 0 and 100
 */
export function clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
}

/**
 * Yields color codes matching the score category (Green/Yellow/Red).
 * 
 * @param score Score value
 * @returns Hex color code
 */
export function getScoreColor(score: number): string {
    if (score >= 70) return "#22c55e"; // green
    if (score >= 40) return "#eab308"; // yellow
    return "#ef4444"; // red
}

/**
 * Translates score numbers to user-friendly qualitative labels.
 * 
 * @param score Score value
 * @returns Human-readable label
 */
export function getScoreLabel(score: number): string {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Below Average";
    return "Poor";
}

/**
 * Standardizes score number decimal precision formatting.
 * 
 * @param score Score value
 * @returns Standardized single decimal place score string
 */
export function formatScore(score: number): string {
    return score.toFixed(1);
}
