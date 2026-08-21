import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BlogPost, BlogCategory } from "@/lib/database.types";

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.warn("[fetchBlogCategories] Supabase error:", error.message);
    return [];
  }

  return data || [];
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog_categories"],
    queryFn: fetchBlogCategories,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export async function fetchBlogPosts(): Promise<(BlogPost & { category: BlogCategory | null })[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      category:blog_categories(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[fetchBlogPosts] Supabase error:", error.message);
    return [];
  }

  // Type assertion since join returns an array or single object depending on relationship, 
  // but we know category is a single object or null.
  return (data || []) as any;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: fetchBlogPosts,
    staleTime: 1000 * 60 * 1, // 1 min
  });
}

export async function fetchPublishedBlogPosts(): Promise<(BlogPost & { category: BlogCategory | null })[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("[fetchPublishedBlogPosts] Supabase error:", error.message);
    return [];
  }

  return (data || []) as any;
}

export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: ["published_blog_posts"],
    queryFn: fetchPublishedBlogPosts,
    staleTime: 1000 * 60 * 1, // 1 min
  });
}

export async function fetchBlogPostBySlug(slug: string): Promise<(BlogPost & { category: BlogCategory | null }) | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.warn("[fetchBlogPostBySlug] Supabase error:", error.message);
    return null;
  }

  return data as any;
}

export function useBlogPostBySlug(slug?: string) {
  return useQuery({
    queryKey: ["blog_post_by_slug", slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 1,
  });
}

export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn("[fetchBlogPost] Supabase error:", error.message);
    return null;
  }

  return data;
}

export function useBlogPost(id?: string) {
  return useQuery({
    queryKey: ["blog_post", id],
    queryFn: () => fetchBlogPost(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
  });
}

