/**
 * Vi-SiT Migration Runner
 * Creates all new tables for the platform upgrade.
 * 
 * IMPORTANT: Run this SQL directly in the Supabase SQL Editor:
 *   1. Go to https://supabase.com/dashboard
 *   2. Select your project
 *   3. Go to SQL Editor
 *   4. Copy/paste the contents of supabase/migrations/001_platform_upgrade.sql
 *   5. Click "Run"
 * 
 * This script tests connectivity and verifies tables exist after migration.
 */

const { createClient } = require("@supabase/supabase-js");

// Read env from .env.local manually
const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE env vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    const tables = [
        "areas",
        "area_metrics",
        "visit_scores",
        "datasets",
        "saved_areas",
    ];

    const newTables = [
        "property_listings",
        "property_images",
        "property_metadata",
        "community_posts",
        "community_comments",
        "community_members",
        "user_profiles",
    ];

    console.log("=== Verifying existing tables ===");
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
        if (error) {
            console.log(`  ❌ ${table}: ${error.message}`);
        } else {
            console.log(`  ✅ ${table}: ${count} rows`);
        }
    }

    console.log("\n=== Verifying new tables ===");
    for (const table of newTables) {
        const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
        if (error) {
            console.log(`  ❌ ${table}: NOT CREATED YET — ${error.message}`);
            console.log(`     → Run the SQL in supabase/migrations/001_platform_upgrade.sql via Supabase SQL Editor`);
        } else {
            console.log(`  ✅ ${table}: ${count} rows`);
        }
    }

    console.log("\n=== Checking old properties table ===");
    const { error: oldPropsError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });
    if (oldPropsError) {
        console.log("  ✅ Old 'properties' table removed (expected)");
    } else {
        console.log("  ⚠️  Old 'properties' table still exists — run migration to drop it");
    }
}

verifyTables().then(() => {
    console.log("\nDone. If any tables are missing, paste the SQL migration into your Supabase SQL Editor.");
});
