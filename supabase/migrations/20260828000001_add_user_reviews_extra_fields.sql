-- Add extra columns to user_reviews table
ALTER TABLE public.user_reviews
  ADD COLUMN IF NOT EXISTS has_invested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_identity text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS investment_details text;
