/**
 * --------------------------------------------------------
 * File: app/api/auth/sync-role/route.ts
 * Purpose: Custom user role syncing endpoint.
 * Responsibilities: Checks local user database for roles and returns them.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { role: true },
        });

        const role = user?.role || "user";

        return NextResponse.json({ success: true, role });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
