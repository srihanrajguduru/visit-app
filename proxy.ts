/**
 * --------------------------------------------------------
 * File: proxy.ts
 * Purpose: Next.js 16 URL routing and viewport proxy.
 * Responsibilities: Performs mobile viewport routing detection, redirecting mobile users to the dedicated mobile route `/mobile`, while maintaining access to developer endpoints.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Mobile Detection & Routing ---
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);

    if (pathname === '/') {
        return NextResponse.redirect(new URL(isMobile ? '/mobile' : '/dashboard', request.url));
    }

    if (isMobile && !pathname.startsWith('/mobile') && !pathname.startsWith('/developer') && !pathname.startsWith('/upload')) {
        return NextResponse.redirect(new URL('/mobile', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
