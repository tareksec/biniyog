-- Update category for 'amar foods' and 'agro desh'
UPDATE public.opportunities
SET category = 'অর্গানিক ফুড'
WHERE slug = 'amar-foods' OR name ILIKE '%amar food%';

UPDATE public.opportunities
SET category = 'বাগান লিজিং ও এগ্রো'
WHERE slug = 'agro-desh' OR name ILIKE '%agro desh%';

