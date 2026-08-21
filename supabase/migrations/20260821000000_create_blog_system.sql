-- 1. Create Blog Categories table
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Blog Posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null,
  cover_image_url text,
  category_id uuid references public.blog_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_name text,
  meta_title text,
  meta_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute procedure public.handle_updated_at();

-- 4. Enable RLS
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;

-- 5. Policies for Categories
create policy "Categories are viewable by everyone." 
  on public.blog_categories for select using (true);
  
create policy "Authenticated users can manage categories." 
  on public.blog_categories for all 
  using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- 6. Policies for Posts
create policy "Published posts are viewable by everyone." 
  on public.blog_posts for select 
  using (status = 'published');
  
create policy "Authenticated users can manage posts." 
  on public.blog_posts for all 
  using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- 7. Storage Bucket setup
insert into storage.buckets (id, name, public) 
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "Blog images are publicly accessible." 
  on storage.objects for select 
  using ( bucket_id = 'blog-images' );

create policy "Authenticated users can upload blog images." 
  on storage.objects for insert 
  with check ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can update blog images." 
  on storage.objects for update 
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete blog images." 
  on storage.objects for delete 
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );
