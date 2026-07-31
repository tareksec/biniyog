-- Corrective SQL to link testimonials to opportunities based on LIVE database matches.
-- This will successfully link 5 testimonials.

-- 1. Link 'Mawazin'
UPDATE public.testimonials
SET related_opportunity_id = (SELECT id FROM public.opportunities WHERE name ILIKE 'mawazin' LIMIT 1)
WHERE brand_name = 'Mawazin' AND related_opportunity_id IS NULL;

-- 2. Link 'HR Knitting'
UPDATE public.testimonials
SET related_opportunity_id = (SELECT id FROM public.opportunities WHERE name ILIKE 'hr knitting' LIMIT 1)
WHERE brand_name = 'HR Knitting' AND related_opportunity_id IS NULL;

-- 3. Link 'ফ্রান্স এক্সপোর্ট wak and sa'
UPDATE public.testimonials
SET related_opportunity_id = (SELECT id FROM public.opportunities WHERE name ILIKE 'ফ্রান্স এক্সপোর্ট wak and sa' LIMIT 1)
WHERE brand_name = 'ফ্রান্স এক্সপোর্ট wak and sa' AND related_opportunity_id IS NULL;

-- 4. Link 'মেড ইজি' to 'MedEasy'
UPDATE public.testimonials
SET related_opportunity_id = (SELECT id FROM public.opportunities WHERE name ILIKE 'MedEasy' LIMIT 1)
WHERE brand_name = 'মেড ইজি' AND related_opportunity_id IS NULL;

-- 5. Link 'আমার ফুডস' to 'amar foods'
UPDATE public.testimonials
SET related_opportunity_id = (SELECT id FROM public.opportunities WHERE name ILIKE 'amar foods' LIMIT 1)
WHERE brand_name = 'আমার ফুডস' AND related_opportunity_id IS NULL;

-- 6. Leave 'One Ummah BD', 'Food Network Agro', 'কাচ্চি খানা''স', and 'IVAMCO' as NULL because they don't exist yet.
