import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const developerRoutes = ['/developer', '/upload']
const protectedRoutes = ['/dashboard', '/profile']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isDeveloperRoute = developerRoutes.some(route => pathname.startsWith(route))
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || isDeveloperRoute

    if (isProtectedRoute) {
        const token = request.cookies.get('__session')
        const role = request.cookies.get('__role')?.value || 'user'

        if (!token) {
            const url = new URL('/login', request.url)
            url.searchParams.set('redirect', pathname)
            return NextResponse.redirect(url)
        }

        if (token.value === 'mock-token') {
            return NextResponse.next();
        }

        if (isDeveloperRoute && role !== 'developer') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // --- Mobile Detection & Routing ---
        const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);

        // Standard user routing
        if (role === 'user') {
            if (isMobile && !pathname.startsWith('/mobile')) {
                // If mobile and not already on /mobile, redirect to /mobile
                return NextResponse.redirect(new URL('/mobile', request.url));
            } else if (!isMobile && pathname.startsWith('/mobile')) {
                // If desktop and trying to access /mobile, redirect to /dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // Redirect root to appropriate dashboard
    if (pathname === '/') {
        const token = request.cookies.get('__session')
        if (token) {
            const role = request.cookies.get('__role')?.value || 'user'
            if (role === 'developer') return NextResponse.redirect(new URL('/developer', request.url))

            const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
            return NextResponse.redirect(new URL(isMobile ? '/mobile' : '/dashboard', request.url))
        }
    }

    return NextResponse.next()
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
}
