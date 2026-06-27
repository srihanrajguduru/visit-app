/**
 * --------------------------------------------------------
 * File: app/api/auth/signup/route.ts
 * Purpose: Custom registration endpoint.
 * Responsibilities: Registers users locally, hashes passwords, initializes profiles, and signs session cookies.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "visit-app-default-jwt-secret-key-987654321";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    name: name || null,
                    role: "user", // default role
                },
            });

            const profile = await tx.userProfile.create({
                data: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    areasAssociated: JSON.stringify([]),
                },
            });

            return { user, profile };
        });

        // Sign JWT
        const token = jwt.sign(
            { userId: result.user.id, email: result.user.email, role: result.user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Build response
        const response = NextResponse.json({
            success: true,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
            },
        });

        // Set session cookies
        response.cookies.set("__session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        response.cookies.set("__role", result.user.role, {
            httpOnly: false, // Accessible by client if needed, matching original cookies
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
