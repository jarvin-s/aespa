-- Photocard Collection System Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create ENUM types for better data integrity
CREATE TYPE photocard_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE photocard_member AS ENUM ('karina', 'winter', 'giselle', 'ningning', 'group');

-- 2. Create eras table for different aespa comeback periods
CREATE TABLE IF NOT EXISTS photocard_eras (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    primary_color TEXT DEFAULT '#A855F7', -- Purple theme
    secondary_color TEXT DEFAULT '#7C3AED',
    background_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create photocards table
CREATE TABLE IF NOT EXISTS photocards (
    id SERIAL PRIMARY KEY,
    member photocard_member NOT NULL,
    era_id INTEGER REFERENCES photocard_eras(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    rarity photocard_rarity NOT NULL DEFAULT 'common',
    level_required INTEGER DEFAULT 1,
    -- Pack weights for random drops (higher = more likely)
    drop_weight INTEGER DEFAULT 100,
    -- Special conditions for obtaining
    is_event_exclusive BOOLEAN DEFAULT false,
    is_achievement_reward BOOLEAN DEFAULT false,
    -- Visual styling
    border_color TEXT,
    background_gradient TEXT,
    special_effects TEXT[], -- Array of effect names like ['holographic', 'animated']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user photocard collections
CREATE TABLE IF NOT EXISTS user_photocards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    photocard_id INTEGER REFERENCES photocards(id) ON DELETE CASCADE,
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Track how they got it
    obtained_method TEXT DEFAULT 'pack_opening', -- 'pack_opening', 'level_reward', 'achievement', 'special_event'
    -- Allow multiple copies (for trading system later)
    quantity INTEGER DEFAULT 1,
    -- Track if it's favorited for display
    is_favorited BOOLEAN DEFAULT false,
    UNIQUE(user_id, photocard_id) -- Prevent duplicates for now
);

-- 5. Create photocard packs system
CREATE TABLE IF NOT EXISTS photocard_packs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    cost_type TEXT DEFAULT 'level', -- 'level', 'xp', 'score', 'free'
    cost_amount INTEGER DEFAULT 0,
    cards_per_pack INTEGER DEFAULT 3,
    guaranteed_rarity photocard_rarity,
    available_from_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create pack opening history
CREATE TABLE IF NOT EXISTS pack_openings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    pack_id INTEGER REFERENCES photocard_packs(id) ON DELETE CASCADE,
    cards_obtained INTEGER[],
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track pack opening history and cooldowns
CREATE TABLE IF NOT EXISTS pack_opening_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    pack_id INTEGER NOT NULL REFERENCES photocard_packs(id),
    last_opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pack_id)
);

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_photocards_user_id ON user_photocards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photocards_photocard_id ON user_photocards(photocard_id);
CREATE INDEX IF NOT EXISTS idx_photocards_member ON photocards(member);
CREATE INDEX IF NOT EXISTS idx_photocards_rarity ON photocards(rarity);
CREATE INDEX IF NOT EXISTS idx_photocards_era ON photocards(era_id);
CREATE INDEX IF NOT EXISTS idx_pack_openings_user_id ON pack_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_pack_opening_cooldowns_user_pack ON pack_opening_cooldowns(user_id, pack_id);

-- 8. Add updated_at trigger for photocards
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_photocards_updated_at
    BEFORE UPDATE ON photocards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable Row Level Security
ALTER TABLE photocard_eras ENABLE ROW LEVEL SECURITY;
ALTER TABLE photocards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photocards ENABLE ROW LEVEL SECURITY;
ALTER TABLE photocard_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_opening_cooldowns ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies
-- Public read access for eras and photocards (for browsing)
CREATE POLICY "Public read access for photocard eras" ON photocard_eras
    FOR SELECT USING (true);

CREATE POLICY "Public read access for photocards" ON photocards
    FOR SELECT USING (true);

CREATE POLICY "Public read access for photocard packs" ON photocard_packs
    FOR SELECT USING (true);

-- User-specific access for collections
CREATE POLICY "Users can view their own photocard collection" ON user_photocards
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert into their own collection" ON user_photocards
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own collection" ON user_photocards
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own pack openings" ON pack_openings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own pack openings" ON pack_openings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 11. Insert sample data
-- Insert eras
INSERT INTO photocard_eras (name, display_name, description, primary_color, secondary_color) VALUES
('black-mamba', 'Black Mamba', 'The debut era that introduced aespa to the world', '#000000', '#8B5CF6'),
('next-level', 'Next Level', 'Taking it to the next level with powerful vocals and visuals', '#FF1493', '#FF69B4'),
('savage', 'Savage', 'Savage era showcasing fierce concept and strong choreography', '#DC2626', '#EF4444'),
('girls', 'Girls', 'Girls era with confident and mature concept', '#059669', '#10B981'),
('my-world', 'MY WORLD', 'Latest era showing growth and artistic maturity', '#7C3AED', '#A855F7'),
('drama', 'Drama', 'Drama era with intense performances and storytelling', '#EA580C', '#FB923C');

-- Insert sample photocards (you'll want to add real image URLs)
INSERT INTO photocards (member, era_id, name, description, image_url, rarity, level_required, drop_weight) VALUES
-- Black Mamba Era - Common cards
('karina', 1, 'Karina Black Mamba Concept', 'Karina in her iconic Black Mamba styling', '/images/photocards/black-mamba/karina-1.jpg', 'common', 1, 200),
('winter', 1, 'Winter Black Mamba Concept', 'Winter showcasing the Black Mamba aesthetic', '/images/photocards/black-mamba/winter-1.jpg', 'common', 1, 200),
('giselle', 1, 'Giselle Black Mamba Concept', 'Giselle in Black Mamba era styling', '/images/photocards/black-mamba/giselle-1.jpg', 'common', 1, 200),
('ningning', 1, 'Ningning Black Mamba Concept', 'Ningning during Black Mamba promotions', '/images/photocards/black-mamba/ningning-1.jpg', 'common', 1, 200),

-- Next Level Era - Uncommon cards
('karina', 2, 'Karina Next Level Performance', 'Karina performing Next Level', '/images/photocards/next-level/karina-1.jpg', 'uncommon', 5, 150),
('winter', 2, 'Winter Next Level Visual', 'Winter stunning Next Level visuals', '/images/photocards/next-level/winter-1.jpg', 'uncommon', 5, 150),

-- Savage Era - Rare cards
('karina', 3, 'Karina Savage Leader', 'Karina leading in Savage era', '/images/photocards/savage/karina-1.jpg', 'rare', 10, 75),
('winter', 3, 'Winter Savage Vocals', 'Winter showcasing powerful vocals', '/images/photocards/savage/winter-1.jpg', 'rare', 10, 75),

-- Girls Era - Epic cards
('group', 4, 'Girls Group Photo', 'All four members in Girls era concept', '/images/photocards/girls/group-1.jpg', 'epic', 15, 25),

-- MY WORLD Era - Legendary cards
('karina', 5, 'Karina MY WORLD Leader Card', 'Ultra rare Karina leadership card', '/images/photocards/my-world/karina-legendary.jpg', 'legendary', 25, 5);

-- Insert starter packs
INSERT INTO photocard_packs (name, description, cost_type, cost_amount, cards_per_pack, available_from_level) VALUES
('Starter Pack', 'Your first photocard pack! Guaranteed common cards to start your collection.', 'free', 0, 3, 1),
('Level Up Pack', 'Celebrate your progress! Available every 5 levels.', 'level', 5, 4, 5),
('Premium Pack', 'Higher chance of rare cards. Available every 10 levels.', 'level', 10, 5, 10),
('Elite Pack', 'Guaranteed rare or better! Available every 15 levels.', 'level', 15, 3, 15),
('Legendary Pack', 'Chance at legendary cards! Available every 25 levels.', 'level', 25, 2, 25);

-- Add some comments for documentation
COMMENT ON TABLE photocards IS 'Stores all available photocard designs and their properties';
COMMENT ON TABLE user_photocards IS 'Tracks which photocards each user has collected';
COMMENT ON TABLE photocard_packs IS 'Defines different types of card packs available for opening';
COMMENT ON COLUMN photocards.drop_weight IS 'Higher values make the card more likely to drop from packs';
COMMENT ON COLUMN photocards.special_effects IS 'Array of visual effect names for special cards';

-- Add ænergy column to user_accounts
ALTER TABLE IF EXISTS user_accounts 
ADD COLUMN IF NOT EXISTS aenergy INTEGER DEFAULT 100;

-- Update photocard_packs cost_type to include ænergy
ALTER TABLE IF EXISTS photocard_packs
ALTER COLUMN cost_type TYPE TEXT,
ALTER COLUMN cost_type SET DEFAULT 'aenergy';

-- Update existing enum values
COMMENT ON COLUMN photocard_packs.cost_type IS 'Cost type can be: ''aenergy'', ''level'', ''xp'', ''score'', ''free'''; 