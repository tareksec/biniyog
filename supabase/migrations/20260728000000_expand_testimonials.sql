-- Add new columns to public.testimonials for expanded context
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS related_opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_title text,
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS investment_amount text;
