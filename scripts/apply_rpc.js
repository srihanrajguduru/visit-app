const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://postgres.npxfnyigvtzntcpmqngw:GuduruSrihanRaj@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
    });

    await client.connect();

    try {
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;

            CREATE OR REPLACE FUNCTION get_nearest_area(clicked_latitude double precision, clicked_longitude double precision)
            RETURNS SETOF areas
            LANGUAGE sql
            AS $$
              SELECT *
              FROM areas
              ORDER BY
                ST_Distance(
                  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                  ST_SetSRID(ST_MakePoint(clicked_longitude, clicked_latitude), 4326)
                )
              LIMIT 1;
            $$;
        `);
        console.log("SUCCESS: Created get_nearest_area RPC function via PostGIS");
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        await client.end();
    }
}

main();
