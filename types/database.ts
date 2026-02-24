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
            properties: {
                Row: {
                    id: string;
                    area_id: string;
                    latitude: number;
                    longitude: number;
                    price: number;
                    property_type: string;
                    structural_score: number;
                    utilities_score: number;
                    title_verified: boolean;
                    owner_verified: boolean;
                    finish_score: number;
                    internal_health_score: number;
                    visit_score: number | null;
                    created_at: string;
                };
                Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at">;
                Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
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
        };
    };
};

export type Area = Database["public"]["Tables"]["areas"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type AreaMetrics = Database["public"]["Tables"]["area_metrics"]["Row"];
export type VisitScore = Database["public"]["Tables"]["visit_scores"]["Row"];
export type VisitScoreHistory = Database["public"]["Tables"]["visit_score_history"]["Row"];
export type Dataset = Database["public"]["Tables"]["datasets"]["Row"];
export type DatasetFile = Database["public"]["Tables"]["dataset_files"]["Row"];
export type SavedArea = Database["public"]["Tables"]["saved_areas"]["Row"];
