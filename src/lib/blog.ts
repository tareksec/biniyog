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
