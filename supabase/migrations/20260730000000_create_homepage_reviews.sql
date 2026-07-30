-- Create homepage_reviews table
CREATE TABLE IF NOT EXISTS public.homepage_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'বিনিয়োগকারী',
  location text,
  quote text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.homepage_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users on homepage_reviews"
  ON public.homepage_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Enable all access for authenticated users on homepage_reviews"
  ON public.homepage_reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
