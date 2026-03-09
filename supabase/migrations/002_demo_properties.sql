-- Migration 002: Add listing_category and Seed Demo Properties

-- 1. Add listing_category to property_listings
ALTER TABLE public.property_listings 
ADD COLUMN IF NOT EXISTS listing_category TEXT NOT NULL DEFAULT 'sale' 
CHECK (listing_category IN ('sale', 'rent', 'buy'));

-- 2. Insert Demo Areas (if not exist, though they should be created by the app, we'll insert a few for the demo properties)
INSERT INTO public.areas (id, name, latitude, longitude, zone, current_visit_score)
VALUES 
    ('demo-area-1', 'Cyber City', 17.4435, 78.3772, 'West Zone', 85.5),
    ('demo-area-2', 'Jubilee Hills', 17.4326, 78.4071, 'Central Zone', 78.2),
    ('demo-area-3', 'Banjara Hills', 17.4156, 78.4398, 'Central Zone', 82.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Properties
INSERT INTO public.property_listings (
    id, title, description, price, property_type, listing_category, 
    bedrooms, bathrooms, area_sqft, latitude, longitude, 
    area_id, visit_score_snapshot, owner_id, verified
) VALUES
-- Cyber City (Area 1)
('prop-demo-1', 'Tech Park Office Space', 'Premium office space in the heart of Cyber City.', 150000, 'commercial', 'rent', 0, 4, 2500, 17.444, 78.378, 'demo-area-1', 88.5, 'demo-owner', true),
('prop-demo-2', 'Luxury 3BHK Apartment', 'Modern apartment with skyline views.', 25000000, 'apartment', 'sale', 3, 3, 2200, 17.442, 78.376, 'demo-area-1', 85.0, 'demo-owner', true),
('prop-demo-3', 'Co-working Desk Space (To-Let)', 'Fully furnished desk spaces available.', 15000, 'commercial', 'rent', 0, 1, 150, 17.445, 78.375, 'demo-area-1', null, 'demo-owner', false),

-- Jubilee Hills (Area 2)
('prop-demo-4', 'Independent Villa', 'Spacious villa with private garden and pool.', 85000000, 'villa', 'sale', 5, 6, 6000, 17.433, 78.408, 'demo-area-2', 79.5, 'demo-owner', true),
('prop-demo-5', 'Prime Residential Plot', 'Corner plot ideal for custom home construction.', 45000000, 'land', 'sale', 0, 0, 4500, 17.430, 78.410, 'demo-area-2', 75.0, 'demo-owner', true),
('prop-demo-6', '2BHK Annex For Rent', 'Quiet residential annex, perfect for small families.', 35000, 'apartment', 'rent', 2, 2, 1200, 17.435, 78.405, 'demo-area-2', 80.0, 'demo-owner', false),

-- Banjara Hills (Area 3)
('prop-demo-7', 'Commercial Showroom', 'Ground floor retail space on main road.', 300000, 'commercial', 'rent', 0, 2, 3000, 17.416, 78.440, 'demo-area-3', 84.5, 'demo-owner', true),
('prop-demo-8', '4BHK Penthouse', 'Luxurious penthouse with terrace garden.', 55000000, 'apartment', 'sale', 4, 4, 4200, 17.414, 78.438, 'demo-area-3', 83.0, 'demo-owner', true),
('prop-demo-9', 'Empty Land for Lease', 'Open land suitable for nursery or temporary setups.', 50000, 'land', 'rent', 0, 0, 10000, 17.418, 78.442, 'demo-area-3', null, 'demo-owner', false)
ON CONFLICT (id) DO NOTHING;
