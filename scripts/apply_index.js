const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://postgres.npxfnyigvtzntcpmqngw:GuduruSrihanRaj@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
    });

    try {
        await client.connect();

        // Creating an exact compound index for Fix 8 
        await client.query(`CREATE INDEX IF NOT EXISTS idx_areas_location ON areas(latitude, longitude);`);

        console.log("Geospatial index successfully created.");
    } catch (err) {
        console.error("Index creation failed:", err);
    } finally {
        await client.end();
    }
}

main();
