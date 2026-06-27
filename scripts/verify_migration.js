/**
 * --------------------------------------------------------
 * File: scripts/verify_migration.js
 * Purpose: Local database verification tool.
 * Responsibilities: Checks local SQLite tables structure and yields counts of existing rows via Prisma.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyTables() {
    const models = [
        { name: "User", table: "users" },
        { name: "UserProfile", table: "user_profiles" },
        { name: "Area", table: "areas" },
        { name: "AreaMetrics", table: "area_metrics" },
        { name: "VisitScore", table: "visit_scores" },
        { name: "VisitScoreHistory", table: "visit_score_history" },
        { name: "SavedArea", table: "saved_areas" },
        { name: "PropertyListing", table: "property_listings" },
        { name: "PropertyImage", table: "property_images" },
        { name: "PropertyMetadata", table: "property_metadata" },
        { name: "CommunityPost", table: "community_posts" },
        { name: "CommunityComment", table: "community_comments" },
        { name: "CommunityMember", table: "community_members" },
        { name: "Dataset", table: "datasets" },
        { name: "DatasetFile", table: "dataset_files" },
        { name: "InfrastructureNode", table: "infrastructure_nodes" }
    ];

    console.log("=== Verifying local SQLite tables (via Prisma) ===");
    for (const model of models) {
        try {
            // Dynamically query count for model
            const prismaModel = prisma[model.name.charAt(0).toLowerCase() + model.name.slice(1)];
            const count = await prismaModel.count();
            console.log(`  ✅ ${model.table} (${model.name}): ${count} rows`);
        } catch (error) {
            console.log(`  ❌ ${model.table} (${model.name}): ERROR — ${error.message}`);
        }
    }
}

verifyTables()
    .then(() => {
        console.log("\nDone verifying SQLite database tables.");
        prisma.$disconnect();
    })
    .catch((err) => {
        console.error("Verification failed:", err);
        prisma.$disconnect();
    });
