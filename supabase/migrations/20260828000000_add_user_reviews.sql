-- Create user_reviews table
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewer_name text NOT NULL DEFAULT 'বিনিয়োগকারী',
  reviewer_email text,
  rating numeric(3,2) NOT NULL CHECK (rating >= 0.0 AND rating <= 1.0),
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  target_type text NOT NULL CHECK (target_type IN ('opportunity', 'homepage', 'general')),
  target_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  admin_note text,
  ip_address text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_user_reviews_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_reviews_updated_at ON public.user_reviews;
CREATE TRIGGER set_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE PROCEDURE public.handle_user_reviews_updated_at();

-- Enable Row Level Security
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public SELECT: only approved reviews
CREATE POLICY "Public can read approved user reviews"
  ON public.user_reviews
  FOR SELECT
  USING (status = 'approved');

-- 2. Public INSERT: anyone can submit pending reviews
CREATE POLICY "Public can insert pending user reviews"
  ON public.user_reviews
  FOR INSERT
  WITH CHECK (status = 'pending');

-- 3. Authenticated (Admin) full CRUD
CREATE POLICY "Authenticated users have full access on user_reviews"
  ON public.user_reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
