UPDATE testimonials
SET related_opportunity_id = (SELECT id FROM opportunities WHERE name ILIKE 'mawazin' LIMIT 1)
WHERE brand_name = 'Mawazin';

UPDATE testimonials
SET related_opportunity_id = (SELECT id FROM opportunities WHERE name ILIKE 'hr knitting' LIMIT 1)
WHERE brand_name = 'HR Knitting';

UPDATE testimonials
SET related_opportunity_id = (SELECT id FROM opportunities WHERE name ILIKE 'ফ্রান্স এক্সপোর্ট wak and sa' LIMIT 1)
WHERE brand_name = 'ফ্রান্স এক্সপোর্ট wak and sa';

-- Added for any other exact matches
UPDATE testimonials t
SET related_opportunity_id = o.id
FROM opportunities o
WHERE t.brand_name ILIKE o.name
  AND t.related_opportunity_id IS NULL;
