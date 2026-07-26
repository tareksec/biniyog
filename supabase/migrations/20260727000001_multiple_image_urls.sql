-- Add the new image_urls column
ALTER TABLE public.opportunities ADD COLUMN image_urls text[];

-- Migrate existing data: if image_url is not null and not empty, make it a 1-element array
UPDATE public.opportunities
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND trim(image_url) != '';

-- Drop the old column
ALTER TABLE public.opportunities DROP COLUMN image_url;
