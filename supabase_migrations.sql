-- ================================================================
-- CineScope Database Migrations
-- Run this SQL in your Supabase SQL Editor to add all features
-- ================================================================

-- ================================================================
-- WATCHLIST FEATURES
-- ================================================================

-- 1. Add media_type column to watchlists table
ALTER TABLE watchlists 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'movie';

-- ================================================================
-- USER RATINGS FEATURE
-- ================================================================

-- 2. Create user_ratings table for quick star ratings
CREATE TABLE IF NOT EXISTS user_ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10) NOT NULL,
  media_type TEXT DEFAULT 'movie' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, media_type)
);

-- 3. Enable Row Level Security on user_ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for user_ratings (drop first if exists)
DROP POLICY IF EXISTS "Users can view own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON user_ratings;

-- Policy: Users can view their own ratings
CREATE POLICY "Users can view own ratings" ON user_ratings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own ratings
CREATE POLICY "Users can insert own ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON user_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_id, media_type);
CREATE INDEX IF NOT EXISTS idx_watchlists_media_type ON watchlists(media_type);

-- ================================================================
-- SOCIAL FEATURES: Followers Table
-- ================================================================

-- 6. Create followers table for follow/following relationships
CREATE TABLE IF NOT EXISTS followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Prevent self-following
);

-- 7. Enable Row Level Security on followers
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for followers (drop first if exists)
DROP POLICY IF EXISTS "Follower relationships are publicly viewable" ON followers;
DROP POLICY IF EXISTS "Users can follow others" ON followers;
DROP POLICY IF EXISTS "Users can unfollow" ON followers;

-- Policy: Anyone can view follower relationships (for public profiles)
CREATE POLICY "Follower relationships are publicly viewable" ON followers
  FOR SELECT USING (true);

-- Policy: Users can follow others (insert)
CREATE POLICY "Users can follow others" ON followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- 9. Create indexes for followers table
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);

-- ================================================================
-- SOCIAL FEATURES: Update existing tables for public visibility
-- ================================================================

-- 10. Add policy for public watchlist viewing (drop first if exists)
DROP POLICY IF EXISTS "Watchlists are publicly viewable" ON watchlists;
CREATE POLICY "Watchlists are publicly viewable" ON watchlists
  FOR SELECT USING (true);

-- 11. Add policy for public reviews viewing (drop first if exists)
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON reviews;
CREATE POLICY "Reviews are publicly viewable" ON reviews
  FOR SELECT USING (true);

-- ================================================================
-- USER PROFILES TABLE
-- ================================================================

-- 12. Create user_profiles table for additional profile information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 14. Create policies for user_profiles (drop first if exists)
DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Policy: Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable" ON user_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 15. Create index for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- ================================================================
-- AUTOMATIC USER PROFILE CREATION
-- ================================================================

-- 16. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- HELPFUL QUERIES (for debugging/testing)
-- ================================================================

-- View all followers for a user:
-- SELECT * FROM followers WHERE following_id = 'user-uuid';

-- View all users a person follows:
-- SELECT * FROM followers WHERE follower_id = 'user-uuid';

-- Get follower count:
-- SELECT COUNT(*) FROM followers WHERE following_id = 'user-uuid';

-- Get following count:
-- SELECT COUNT(*) FROM followers WHERE follower_id = 'user-uuid';
