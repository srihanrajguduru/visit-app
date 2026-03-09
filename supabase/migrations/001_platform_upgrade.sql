-- Vi-SiT Platform Upgrade Migration
-- Phase 1: Drop old properties table, create 7 new tables with RLS

-- ============================================
-- 1. DROP OLD PROPERTIES TABLE
-- ============================================
DROP TABLE IF EXISTS properties CASCADE;

-- ============================================
-- 2. PROPERTY LISTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS property_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    property_type TEXT NOT NULL DEFAULT 'apartment',
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    area_sqft INTEGER NOT NULL DEFAULT 500,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    visit_score_snapshot FLOAT,
    owner_id TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. PROPERTY IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- ============================================
-- 4. PROPERTY METADATA
-- ============================================
CREATE TABLE IF NOT EXISTS property_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    cleanliness_score FLOAT DEFAULT 0,
    maintenance_score FLOAT DEFAULT 0,
    demand_score FLOAT DEFAULT 0,
    noise_score FLOAT DEFAULT 0
);

-- ============================================
-- 5. COMMUNITY POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. COMMUNITY COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. COMMUNITY MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    membership_type TEXT NOT NULL DEFAULT 'resident',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(area_id, user_id)
);

-- ============================================
-- 8. USER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    areas_associated TEXT[] DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 9. RLS POLICIES
-- ============================================

-- Property Listings
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read property_listings" ON property_listings FOR SELECT USING (true);
CREATE POLICY "Authenticated insert property_listings" ON property_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner update property_listings" ON property_listings FOR UPDATE USING (true);
CREATE POLICY "Owner delete property_listings" ON property_listings FOR DELETE USING (true);

-- Property Images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read property_images" ON property_images FOR SELECT USING (true);
CREATE POLICY "Authenticated insert property_images" ON property_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner delete property_images" ON property_images FOR DELETE USING (true);

-- Property Metadata
ALTER TABLE property_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read property_metadata" ON property_metadata FOR SELECT USING (true);
CREATE POLICY "Authenticated insert property_metadata" ON property_metadata FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update property_metadata" ON property_metadata FOR UPDATE USING (true);

-- Community Posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community_posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated insert community_posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Author update community_posts" ON community_posts FOR UPDATE USING (true);
CREATE POLICY "Author delete community_posts" ON community_posts FOR DELETE USING (true);

-- Community Comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community_comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert community_comments" ON community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Author delete community_comments" ON community_comments FOR DELETE USING (true);

-- Community Members
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community_members" ON community_members FOR SELECT USING (true);
CREATE POLICY "Authenticated insert community_members" ON community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Self delete community_members" ON community_members FOR DELETE USING (true);

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated insert user_profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Self update user_profiles" ON user_profiles FOR UPDATE USING (true);

-- ============================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_property_listings_area ON property_listings(area_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_owner ON property_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_price ON property_listings(price);
CREATE INDEX IF NOT EXISTS idx_community_posts_area ON community_posts(area_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_members_area ON community_members(area_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
