import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("email", email)
            .limit(1)
            .single();

        let role = "user";

        if (data && data.role) {
            role = data.role;
        }

        return NextResponse.json({ success: true, role });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
