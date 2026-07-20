create table if not exists public.opportunities (
  id text primary key,
  name text,
  category text,
  status text,
  investment_amount text,
  expected_profit text,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.opportunities enable row level security;

-- Create policies
create policy "Opportunities are viewable by everyone."
  on public.opportunities for select
  using ( true );

create policy "Service role can insert/update opportunities."
  on public.opportunities for all
  using ( true )
  with check ( true );
