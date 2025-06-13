
-- Add missing content_type column to recommendations table
ALTER TABLE public.recommendations 
ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'both' 
CHECK (content_type IN ('movie', 'book', 'both'));

-- Add missing columns that the app expects
ALTER TABLE public.recommendations 
ADD COLUMN IF NOT EXISTS director TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Update column types to match what the app expects
ALTER TABLE public.recommendations 
ALTER COLUMN rating TYPE DECIMAL(3,1) USING rating::DECIMAL(3,1);

-- Rename is_favorite to is_favorited to match the app
ALTER TABLE public.recommendations 
RENAME COLUMN is_favorite TO is_favorited;

-- Drop existing RLS policies and recreate them properly
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can insert their own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can update their own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can delete their own recommendations" ON public.recommendations;

-- Recreate RLS policies with proper permissions
CREATE POLICY "Users can view own recommendations" ON public.recommendations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.recommendations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON public.recommendations 
FOR DELETE USING (auth.uid() = user_id);

-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON public.recommendations(type);
CREATE INDEX IF NOT EXISTS idx_recommendations_is_favorited ON public.recommendations(is_favorited);
