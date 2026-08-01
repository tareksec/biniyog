import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

export type HomepageReview = Database["public"]["Tables"]["homepage_reviews"]["Row"];
export type HomepageReviewInsert = Database["public"]["Tables"]["homepage_reviews"]["Insert"];
export type HomepageReviewUpdate = Database["public"]["Tables"]["homepage_reviews"]["Update"];

const FETCH_TIMEOUT_MS = 4_000;

export async function fetchHomepageReviewsSSR(): Promise<HomepageReview[]> {
  try {
    const result = await Promise.race([
      supabase
        .from("homepage_reviews")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase fetch timed out")), FETCH_TIMEOUT_MS),
      ),
    ]);

    const { data, error } = result;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Empty data returned");

    return data;
  } catch (err) {
    console.warn("[fetchHomepageReviewsSSR] Supabase error, using fallback:", err instanceof Error ? err.message : err);
    if (import.meta.env.SSR) {
      try {
        const module = await import("@/data/homepage-reviews-fallback.json");
        return module.default as HomepageReview[];
      } catch (importErr) {
        console.error("Failed to import fallback file on server:", importErr);
        return [];
      }
    }
    return [];
  }
}

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
