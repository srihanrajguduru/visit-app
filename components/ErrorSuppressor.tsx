"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
    useEffect(() => {
        // 1. Suppress React/Next.js console.error captures
        const originalError = console.error;
        console.error = (...args: any[]) => {
            if (typeof args[0] === "string" && (
                args[0].includes("BillingNotEnabledMapError") ||
                args[0].includes("Google Maps JavaScript API error")
            )) {
                return; // Silently drop
            }
            if (args[0] && args[0].message && args[0].message.includes("BillingNotEnabledMapError")) {
                return;
            }
            originalError.apply(console, args as any);
        };

        // 2. Suppress window-level error events (stops the Next.js red Dev Overlay from popping up)
        const suppressMapErrors = (e: ErrorEvent) => {
            if (e.message && (e.message.includes("BillingNotEnabledMapError") || e.message.includes("Google Maps JavaScript API error"))) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        };

        const suppressMapRejections = (e: PromiseRejectionEvent) => {
            if (e.reason && e.reason.message && e.reason.message.includes("BillingNotEnabledMapError")) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        };

        window.addEventListener("error", suppressMapErrors, true);
        window.addEventListener("unhandledrejection", suppressMapRejections, true);

        return () => {
            console.error = originalError;
            window.removeEventListener("error", suppressMapErrors, true);
            window.removeEventListener("unhandledrejection", suppressMapRejections, true);
        };
    }, []);

    return null; // Renders nothing
}
