-- Enable pg_cron and pg_net extensions if not already enabled
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema public;

-- Create the scheduled job
-- Replace [YOUR_PROJECT_REF] with your actual Supabase project reference
-- Replace [YOUR_ANON_KEY] with your actual Supabase anon key
select cron.schedule(
  'sync-opportunities-every-30m', -- Job name
  '*/30 * * * *',                 -- Schedule: Every 30 minutes
  $$
    select net.http_post(
      url:='https://dfblfoyjhxhxmnckyspa.supabase.co/functions/v1/sync-opportunities',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_3y9kJ9oUgbFvz1HNBrR-uA_b2Nz2KDp"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Note: To check if pg_cron is enabled, you can run:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';
--
-- To view scheduled jobs:
-- SELECT * FROM cron.job;
