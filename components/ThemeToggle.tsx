"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("visit-theme") as "dark" | "light" | null;
        const initial = stored || "dark";
        setTheme(initial);
        document.documentElement.setAttribute("data-theme", initial);
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("visit-theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

    // Prevent hydration mismatch
    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl theme-transition"
            style={{
                background: theme === "dark" ? "var(--bg-elevated)" : "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" style={{ color: "var(--brand-accent)" }} />
            ) : (
                <Moon className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
            )}
        </button>
    );
}
