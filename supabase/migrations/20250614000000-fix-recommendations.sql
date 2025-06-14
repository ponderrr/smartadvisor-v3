-- Fix recommendations table schema
ALTER TABLE public.recommendations
  -- Add missing columns
  ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS movie_recommendation JSONB,
  ADD COLUMN IF NOT EXISTS book_recommendation JSONB,
  ADD COLUMN IF NOT EXISTS answers JSONB,
  ADD COLUMN IF NOT EXISTS questions JSONB,
  -- Fix column constraints
  ALTER COLUMN type DROP NOT NULL,
  ALTER COLUMN title DROP NOT NULL,
  -- Add check constraints
  ADD CONSTRAINT valid_recommendation_type 
    CHECK (type IS NULL OR type IN ('movie', 'book', 'both')),
  ADD CONSTRAINT valid_content_type 
    CHECK (content_type IN ('movie', 'book', 'both')),
  ADD CONSTRAINT valid_year 
    CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE))),
  ADD CONSTRAINT valid_rating 
    CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recommendations_content_type 
  ON public.recommendations(content_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_year 
  ON public.recommendations(year);
CREATE INDEX IF NOT EXISTS idx_recommendations_genres 
  ON public.recommendations USING GIN (genres);

-- Add function to validate recommendation data
CREATE OR REPLACE FUNCTION validate_recommendation()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure at least one recommendation is present
  IF NEW.movie_recommendation IS NULL AND NEW.book_recommendation IS NULL THEN
    RAISE EXCEPTION 'At least one recommendation (movie or book) must be provided';
  END IF;

  -- Validate movie recommendation if present
  IF NEW.movie_recommendation IS NOT NULL THEN
    IF NOT (
      NEW.movie_recommendation ? 'title' AND
      NEW.movie_recommendation ? 'director' AND
      NEW.movie_recommendation ? 'year' AND
      NEW.movie_recommendation ? 'genres' AND
      NEW.movie_recommendation ? 'explanation'
    ) THEN
      RAISE EXCEPTION 'Invalid movie recommendation format';
    END IF;
  END IF;

  -- Validate book recommendation if present
  IF NEW.book_recommendation IS NOT NULL THEN
    IF NOT (
      NEW.book_recommendation ? 'title' AND
      NEW.book_recommendation ? 'author' AND
      NEW.book_recommendation ? 'year' AND
      NEW.book_recommendation ? 'genres' AND
      NEW.book_recommendation ? 'explanation'
    ) THEN
      RAISE EXCEPTION 'Invalid book recommendation format';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate recommendation data
DROP TRIGGER IF EXISTS validate_recommendation_trigger ON public.recommendations;
CREATE TRIGGER validate_recommendation_trigger
  BEFORE INSERT OR UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION validate_recommendation();

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can delete own recommendations" ON public.recommendations;

CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (content_type IN ('movie', 'book', 'both')) AND
    (movie_recommendation IS NOT NULL OR book_recommendation IS NOT NULL)
  );

CREATE POLICY "Users can update own recommendations"
  ON public.recommendations FOR UPDATE
  USING (
    auth.uid() = user_id AND
    (content_type IN ('movie', 'book', 'both')) AND
    (movie_recommendation IS NOT NULL OR book_recommendation IS NOT NULL)
  );

CREATE POLICY "Users can delete own recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id); 