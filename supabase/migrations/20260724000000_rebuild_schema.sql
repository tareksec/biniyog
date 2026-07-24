-- ============================================================
-- Migration: Rebuild schema for direct Supabase backend
-- Replaces Google Sheet sync with native Supabase tables
-- ============================================================

-- ============================================================
-- 1. OPPORTUNITIES TABLE
-- ============================================================

-- Drop old table & policies (from previous migration)
drop policy if exists "Opportunities are viewable by everyone." on public.opportunities;
drop policy if exists "Service role can insert/update opportunities." on public.opportunities;
drop table if exists public.opportunities;

create table public.opportunities (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  owner_name    text,
  owner_phone   text,
  cfa_comment   text,
  guarantee     text,
  category      text,
  investment_type text,
  bank_details  text,         -- account number, swift code, routing no, branch, address
  investment_amount text,
  expected_profit   text,
  profit_period     text,
  status        text default 'চলমান',  -- one of: "চলমান", "Fully Funded", "শেষের দিকে"
  description   text,
  address       text,
  organization_type text,
  estimated_capital text,
  website_url   text,
  image_url     text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Enable RLS
alter table public.opportunities enable row level security;

-- Anon: read-only
create policy "opportunities_anon_select"
  on public.opportunities
  for select
  to anon
  using (true);

-- Authenticated: full CRUD
create policy "opportunities_auth_select"
  on public.opportunities
  for select
  to authenticated
  using (true);

create policy "opportunities_auth_insert"
  on public.opportunities
  for insert
  to authenticated
  with check (true);

create policy "opportunities_auth_update"
  on public.opportunities
  for update
  to authenticated
  using (true)
  with check (true);

create policy "opportunities_auth_delete"
  on public.opportunities
  for delete
  to authenticated
  using (true);

-- Auto-update `updated_at` on row modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_opportunities_updated_at
  before update on public.opportunities
  for each row
  execute function public.handle_updated_at();

-- Index on slug for fast lookups
create index idx_opportunities_slug on public.opportunities (slug);
-- Index on status for filtering
create index idx_opportunities_status on public.opportunities (status);
-- Index on category for filtering
create index idx_opportunities_category on public.opportunities (category);

-- ============================================================
-- 2. TESTIMONIALS TABLE
-- ============================================================

create table public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  quote       text not null,
  created_at  timestamptz default now() not null
);

-- Enable RLS
alter table public.testimonials enable row level security;

-- Anon: read-only
create policy "testimonials_anon_select"
  on public.testimonials
  for select
  to anon
  using (true);

-- Authenticated: full CRUD
create policy "testimonials_auth_select"
  on public.testimonials
  for select
  to authenticated
  using (true);

create policy "testimonials_auth_insert"
  on public.testimonials
  for insert
  to authenticated
  with check (true);

create policy "testimonials_auth_update"
  on public.testimonials
  for update
  to authenticated
  using (true)
  with check (true);

create policy "testimonials_auth_delete"
  on public.testimonials
  for delete
  to authenticated
  using (true);

-- ============================================================
-- 3. STORAGE BUCKET: opportunity-images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('opportunity-images', 'opportunity-images', true)
on conflict (id) do nothing;

-- Public read access (anon can view/download images)
create policy "opportunity_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'opportunity-images');

-- Authenticated-only write access (upload, update, delete)
create policy "opportunity_images_auth_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'opportunity-images');

create policy "opportunity_images_auth_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'opportunity-images')
  with check (bucket_id = 'opportunity-images');

create policy "opportunity_images_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'opportunity-images');
