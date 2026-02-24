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
