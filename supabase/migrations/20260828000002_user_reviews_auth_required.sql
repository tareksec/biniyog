-- Add user_id to user_reviews table and restrict INSERT to authenticated users only
ALTER TABLE public.user_reviews
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop previous public insert policy
DROP POLICY IF EXISTS "Public can insert pending user reviews" ON public.user_reviews;
DROP POLICY IF EXISTS "Authenticated can insert user reviews" ON public.user_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert pending user reviews" ON public.user_reviews;

-- Create policy allowing ONLY authenticated users to submit reviews
CREATE POLICY "Authenticated users can insert pending user reviews"
  ON public.user_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (user_id IS NULL OR user_id = auth.uid()) AND
    status = 'pending'
  );
