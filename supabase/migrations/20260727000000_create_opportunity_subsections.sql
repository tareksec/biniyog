-- ============================================================
-- Migration: Create opportunity sub-sections tables
-- Adds dynamic tables for Risks, Payouts, and Legal Checks
-- ============================================================

-- 1. OPPORTUNITY RISKS TABLE
create table if not exists public.opportunity_risks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  risk_name text not null,
  risk_level text not null default 'মধ্যম', -- 'নিম্ন', 'মধ্যম', 'উচ্চ'
  description text,
  sort_order integer default 0
);

alter table public.opportunity_risks enable row level security;

create policy "opportunity_risks_anon_select"
  on public.opportunity_risks
  for select
  to anon
  using (true);

create policy "opportunity_risks_auth_select"
  on public.opportunity_risks
  for select
  to authenticated
  using (true);

create policy "opportunity_risks_auth_insert"
  on public.opportunity_risks
  for insert
  to authenticated
  with check (true);

create policy "opportunity_risks_auth_update"
  on public.opportunity_risks
  for update
  to authenticated
  using (true)
  with check (true);

create policy "opportunity_risks_auth_delete"
  on public.opportunity_risks
  for delete
  to authenticated
  using (true);

create index if not exists idx_opportunity_risks_opportunity_id on public.opportunity_risks (opportunity_id, sort_order);


-- 2. OPPORTUNITY PAYOUTS TABLE
create table if not exists public.opportunity_payouts (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  cycle_name text not null,
  target_profit text,
  actual_profit text,
  status text not null default 'পেইড', -- 'পেইড', 'চলমান', 'বাকি'
  sort_order integer default 0
);

alter table public.opportunity_payouts enable row level security;

create policy "opportunity_payouts_anon_select"
  on public.opportunity_payouts
  for select
  to anon
  using (true);

create policy "opportunity_payouts_auth_select"
  on public.opportunity_payouts
  for select
  to authenticated
  using (true);

create policy "opportunity_payouts_auth_insert"
  on public.opportunity_payouts
  for insert
  to authenticated
  with check (true);

create policy "opportunity_payouts_auth_update"
  on public.opportunity_payouts
  for update
  to authenticated
  using (true)
  with check (true);

create policy "opportunity_payouts_auth_delete"
  on public.opportunity_payouts
  for delete
  to authenticated
  using (true);

create index if not exists idx_opportunity_payouts_opportunity_id on public.opportunity_payouts (opportunity_id, sort_order);


-- 3. OPPORTUNITY LEGAL CHECKS TABLE
create table if not exists public.opportunity_legal_checks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  check_text text not null,
  sort_order integer default 0
);

alter table public.opportunity_legal_checks enable row level security;

create policy "opportunity_legal_checks_anon_select"
  on public.opportunity_legal_checks
  for select
  to anon
  using (true);

create policy "opportunity_legal_checks_auth_select"
  on public.opportunity_legal_checks
  for select
  to authenticated
  using (true);

create policy "opportunity_legal_checks_auth_insert"
  on public.opportunity_legal_checks
  for insert
  to authenticated
  with check (true);

create policy "opportunity_legal_checks_auth_update"
  on public.opportunity_legal_checks
  for update
  to authenticated
  using (true)
  with check (true);

create policy "opportunity_legal_checks_auth_delete"
  on public.opportunity_legal_checks
  for delete
  to authenticated
  using (true);

create index if not exists idx_opportunity_legal_checks_opportunity_id on public.opportunity_legal_checks (opportunity_id, sort_order);
