/**
 * --------------------------------------------------------
 * File: app/api/auth/logout/route.ts
 * Purpose: Custom logout endpoint.
 * Responsibilities: Clears authenticated session cookies.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Expire cookies immediately
    response.cookies.set("__session", "", { path: "/", maxAge: 0 });
    response.cookies.set("__role", "", { path: "/", maxAge: 0 });

    return response;
}
