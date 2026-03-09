-- Migration 003: Add infrastructure_nodes

CREATE TABLE IF NOT EXISTS public.infrastructure_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'Operational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Demo Infrastructure Nodes
INSERT INTO public.infrastructure_nodes (name, type, latitude, longitude, status)
VALUES 
    ('Jubilee Hills Checkpost Checkpoint', 'Metro Station', 17.4325, 78.4070, 'Operational'),
    ('ORR Phase 2 Extension Corridor', 'Road Network (Highway)', 17.4410, 78.3450, 'Under Construction'),
    ('Gachibowli Tech Fiber Ring', 'Fiber Internet Hub', 17.4400, 78.3489, 'Operational'),
    ('Durgam Cheruvu Link Road', 'Road Network (Arterial)', 17.4300, 78.3900, 'Operational');
