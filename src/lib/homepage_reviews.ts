import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

export type HomepageReview = Database["public"]["Tables"]["homepage_reviews"]["Row"];
export type HomepageReviewInsert = Database["public"]["Tables"]["homepage_reviews"]["Insert"];
export type HomepageReviewUpdate = Database["public"]["Tables"]["homepage_reviews"]["Update"];

export async function fetchHomepageReviews(): Promise<HomepageReview[]> {
  const { data, error } = await supabase
    .from("homepage_reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching homepage reviews:", error);
    return [];
  }
  return data || [];
}

export async function insertHomepageReview(review: HomepageReviewInsert) {
  const { data, error } = await supabase
    .from("homepage_reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHomepageReview(id: string, updates: HomepageReviewUpdate) {
  const { data, error } = await supabase
    .from("homepage_reviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHomepageReview(id: string) {
  const { error } = await supabase
    .from("homepage_reviews")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
