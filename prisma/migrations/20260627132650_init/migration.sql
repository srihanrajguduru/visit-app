-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "areas_associated" TEXT NOT NULL DEFAULT '[]',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "zone" TEXT,
    "current_visit_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "area_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_id" TEXT NOT NULL,
    "dataset_version" TEXT,
    "aqi" REAL,
    "noise" REAL,
    "flood_risk" REAL,
    "metro_distance" REAL,
    "road_quality" REAL,
    "water_supply_score" REAL,
    "internet_score" REAL,
    "crime_rate" REAL,
    "women_safety_score" REAL,
    "amenity_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "visit_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_id" TEXT NOT NULL,
    "visit_score" REAL NOT NULL,
    "dataset_version" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "visit_score_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_id" TEXT NOT NULL,
    "visit_score" REAL NOT NULL,
    "dataset_version" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "saved_areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "property_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "property_type" TEXT NOT NULL,
    "listing_category" TEXT NOT NULL DEFAULT 'sale',
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "area_sqft" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "area_id" TEXT,
    "visit_score_snapshot" REAL,
    "owner_id" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "property_metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "cleanliness_score" REAL NOT NULL DEFAULT 0,
    "maintenance_score" REAL NOT NULL DEFAULT 0,
    "demand_score" REAL NOT NULL DEFAULT 0,
    "noise_score" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "membership_type" TEXT NOT NULL DEFAULT 'resident',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "file_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "dataset_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataset_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "infrastructure_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_area_id_user_id_key" ON "community_members"("area_id", "user_id");
