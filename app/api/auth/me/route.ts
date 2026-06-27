/**
 * --------------------------------------------------------
 * File: app/api/auth/me/route.ts
 * Purpose: Custom session retrieval endpoint.
 * Responsibilities: Reads session cookies, decodes/verifies JWTs, and returns user session data.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "visit-app-default-jwt-secret-key-987654321";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("__session")?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // Invalid or expired token
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({ success: true, user });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
