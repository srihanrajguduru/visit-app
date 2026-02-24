// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine distance formula to find the nearest area since PostGIS is unverified
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { latitude, longitude } = await req.json();

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        // 1. Fetch all areas (fast, minimal data)
        const { data: areas, error: areaError } = await supabaseClient
            .from('areas')
            .select('*');

        if (areaError) throw areaError;

        if (!areas || areas.length === 0) {
            return new Response(JSON.stringify({ error: "No areas configured" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404
            });
        }

        // 2. Find nearest using Haversine
        let nearestArea = areas[0];
        let minDistance = Infinity;

        for (const area of areas) {
            if (area.latitude && area.longitude) {
                const dist = getDistance(latitude, longitude, area.latitude, area.longitude);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestArea = area;
                }
            }
        }

        // 3. Fetch metrics for nearest area
        const { data: metricsData } = await supabaseClient
            .from('area_metrics')
            .select('*')
            .eq('area_id', nearestArea.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Calculate synthetic pros and cons based on metrics
        let environmental_score = 0;
        let infrastructure_score = 0;
        let social_score = 0;
        const pros = [];
        const cons = [];

        if (metricsData) {
            environmental_score = metricsData.aqi ? Math.max(0, 100 - (metricsData.aqi / 3)) : 0;
            infrastructure_score = metricsData.amenity_score || 0;
            social_score = metricsData.women_safety_score || 0;

            if (metricsData.aqi < 50) pros.push("Excellent Air Quality");
            else if (metricsData.aqi > 150) cons.push("Poor Air Quality");

            if (metricsData.noise < 60) pros.push("Quiet Neighborhood");
            else if (metricsData.noise > 75) cons.push("High Noise Pollution");

            if (metricsData.metro_distance < 2) pros.push("Close to Metro Transit");
            else cons.push("Far from Metro Transit");

            if (metricsData.amenity_score > 80) pros.push("Great Amenities Nearby");
            else if (metricsData.amenity_score < 40) cons.push("Lacking Amenities");
        }

        const payload = {
            area_id: nearestArea.id,
            area_name: nearestArea.name,
            visit_score: nearestArea.current_visit_score,
            distance_km: minDistance.toFixed(2),
            environmental_score,
            infrastructure_score,
            social_score,
            pros,
            cons,
            latitude: nearestArea.latitude,
            longitude: nearestArea.longitude
        };

        return new Response(JSON.stringify(payload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
