-- Add risk_level column to public.opportunities with check constraint
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS risk_level text 
NOT NULL DEFAULT 'মধ্যম'
CHECK (risk_level IN ('নিম্ন', 'মধ্যম', 'উচ্চ'));
