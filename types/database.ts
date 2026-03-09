// Vi-SiT Database Type Definitions
// Auto-generated from Supabase schema

export type Database = {
    public: {
        Tables: {
            areas: {
                Row: {
                    id: string;
                    name: string;
                    latitude: number;
                    longitude: number;
                    zone: string | null;
                    current_visit_score: number | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["areas"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["areas"]["Insert"]>;
            };
            property_listings: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    price: number;
                    property_type: string;
                    listing_category: string;
                    bedrooms: number;
                    bathrooms: number;
                    area_sqft: number;
                    latitude: number;
                    longitude: number;
                    area_id: string | null;
                    visit_score_snapshot: number | null;
                    owner_id: string;
                    verified: boolean;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["property_listings"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["property_listings"]["Insert"]>;
            };
            property_images: {
                Row: {
                    id: string;
                    property_id: string;
                    image_url: string;
                };
                Insert: Omit<Database["public"]["Tables"]["property_images"]["Row"], "id">;
                Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
            };
            property_metadata: {
                Row: {
                    id: string;
                    property_id: string;
                    cleanliness_score: number;
                    maintenance_score: number;
                    demand_score: number;
                    noise_score: number;
                };
                Insert: Omit<Database["public"]["Tables"]["property_metadata"]["Row"], "id">;
                Update: Partial<Database["public"]["Tables"]["property_metadata"]["Insert"]>;
            };
            datasets: {
                Row: {
                    id: string;
                    name: string;
                    version: string;
                    uploaded_by: string;
                    file_count: number;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["datasets"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["datasets"]["Insert"]>;
            };
            dataset_files: {
                Row: {
                    id: string;
                    dataset_id: string;
                    file_path: string;
                    file_type: string;
                    uploaded_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["dataset_files"]["Row"], "id" | "uploaded_at">;
                Update: Partial<Database["public"]["Tables"]["dataset_files"]["Insert"]>;
            };
            area_metrics: {
                Row: {
                    id: string;
                    area_id: string;
                    dataset_version: string | null;
                    aqi: number | null;
                    noise: number | null;
                    flood_risk: number | null;
                    metro_distance: number | null;
                    road_quality: number | null;
                    water_supply_score: number | null;
                    internet_score: number | null;
                    crime_rate: number | null;
                    women_safety_score: number | null;
                    amenity_score: number | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["area_metrics"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["area_metrics"]["Insert"]>;
            };
            visit_scores: {
                Row: {
                    id: string;
                    area_id: string;
                    visit_score: number;
                    dataset_version: string | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["visit_scores"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["visit_scores"]["Insert"]>;
            };
            visit_score_history: {
                Row: {
                    id: string;
                    area_id: string;
                    visit_score: number;
                    dataset_version: string | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["visit_score_history"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["visit_score_history"]["Insert"]>;
            };
            saved_areas: {
                Row: {
                    id: string;
                    user_id: string;
                    area_id: string;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["saved_areas"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["saved_areas"]["Insert"]>;
            };
            community_posts: {
                Row: {
                    id: string;
                    area_id: string;
                    user_id: string;
                    content: string;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["community_posts"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["community_posts"]["Insert"]>;
            };
            community_comments: {
                Row: {
                    id: string;
                    post_id: string;
                    user_id: string;
                    content: string;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["community_comments"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["community_comments"]["Insert"]>;
            };
            community_members: {
                Row: {
                    id: string;
                    area_id: string;
                    user_id: string;
                    membership_type: string;
                    joined_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["community_members"]["Row"], "id" | "joined_at">;
                Update: Partial<Database["public"]["Tables"]["community_members"]["Insert"]>;
            };
            user_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string | null;
                    email: string | null;
                    avatar_url: string | null;
                    areas_associated: string[];
                    joined_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "id" | "joined_at">;
                Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
            };
        };
    };
};

// Convenience type exports
export type Area = Database["public"]["Tables"]["areas"]["Row"];
export type PropertyListing = Database["public"]["Tables"]["property_listings"]["Row"];
export type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"];
export type PropertyMetadata = Database["public"]["Tables"]["property_metadata"]["Row"];
export type AreaMetrics = Database["public"]["Tables"]["area_metrics"]["Row"];
export type VisitScore = Database["public"]["Tables"]["visit_scores"]["Row"];
export type VisitScoreHistory = Database["public"]["Tables"]["visit_score_history"]["Row"];
export type Dataset = Database["public"]["Tables"]["datasets"]["Row"];
export type DatasetFile = Database["public"]["Tables"]["dataset_files"]["Row"];
export type SavedArea = Database["public"]["Tables"]["saved_areas"]["Row"];
export type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];
export type CommunityComment = Database["public"]["Tables"]["community_comments"]["Row"];
export type CommunityMember = Database["public"]["Tables"]["community_members"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
