import { supabase } from "@/lib/supabase";
import type { Database, UserReview, UserReviewInsert, UserReviewUpdate } from "@/lib/database.types";

export type { UserReview, UserReviewInsert, UserReviewUpdate };

export interface SubmitReviewInput {
  reviewer_name?: string;
  reviewer_email?: string;
  rating: number;
  note?: string;
  target_type: "opportunity" | "homepage" | "general";
  target_id?: string;
  has_invested: boolean;
  user_identity: string;
  investment_details?: string;
}

/**
 * Submits a user review via the server API endpoint with rate limiting.
 * Falls back to direct Supabase client insert if API endpoint is unreachable.
 */
export async function submitUserReview(data: SubmitReviewInput): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/public/submit-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json.success) {
      return { success: true, message: json.message };
    }

    if (res.status === 429) {
      throw new Error(json.error || "আপনি অতিরিক্ত রিভিউ পাঠিয়েছেন। কিছুক্ষণ পর চেষ্টা করুন।");
    }
    throw new Error(json.error || "রিভিউ জমা দিতে ত্রুটি হয়েছে");
  } catch (apiErr: any) {
    if (apiErr?.message && (apiErr.message.includes("অতিরিক্ত রিভিউ") || apiErr.message.includes("১ ঘন্টায় সর্বোচ্চ"))) {
      throw apiErr;
    }
    console.warn("[submitUserReview] API route fallback to direct insert:", apiErr);

    const { error } = await supabase.from("user_reviews").insert({
      reviewer_name: (data.reviewer_name || "").trim() || "বিনিয়োগকারী",
      reviewer_email: (data.reviewer_email || "").trim() || null,
      rating: Math.max(0, Math.min(1, data.rating)),
      note: (data.note || "").trim() || null,
      status: "pending",
      target_type: data.target_type,
      target_id: data.target_type === "opportunity" && data.target_id ? data.target_id : null,
      has_invested: Boolean(data.has_invested),
      user_identity: (data.user_identity || "").trim(),
      investment_details: (data.investment_details || "").trim() || null,
    });

    if (error) {
      console.error("[submitUserReview] Fallback direct insert error:", error);
      throw new Error(error.message || "রিভিউ জমা দেওয়া সম্ভব হয়নি");
    }

    return {
      success: true,
      message: "আপনার মতামত সফলভাবে জমা হয়েছে। পর্যালোচনার পর এটি প্রকাশিত হবে।",
    };
  }
}

/**
 * Fetches approved user reviews, optionally filtered by targetType and targetId.
 */
export async function getApprovedReviews(
  targetType?: "opportunity" | "homepage" | "general",
  targetId?: string
): Promise<UserReview[]> {
  try {
    let query = supabase
      .from("user_reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (targetType) {
      query = query.eq("target_type", targetType);
    }
    if (targetId) {
      query = query.eq("target_id", targetId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getApprovedReviews] Error fetching approved reviews:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[getApprovedReviews] Unexpected error:", err);
    return [];
  }
}

/**
 * Admin: Fetches all pending reviews waiting for approval.
 */
export async function getPendingReviewsAdmin(): Promise<UserReview[]> {
  const { data, error } = await supabase
    .from("user_reviews")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPendingReviewsAdmin] Error:", error);
    throw error;
  }
  return data || [];
}

/**
 * Admin: Fetches all reviews (pending, approved, rejected) with optional status filter.
 */
export async function getAllReviewsAdmin(statusFilter?: "all" | "pending" | "approved" | "rejected"): Promise<UserReview[]> {
  let query = supabase
    .from("user_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getAllReviewsAdmin] Error:", error);
    throw error;
  }
  return data || [];
}

/**
 * Admin: Updates status ('approved' | 'rejected' | 'pending') and optional admin note.
 */
export async function updateReviewStatus(
  id: string,
  status: "approved" | "rejected" | "pending",
  adminNote?: string
): Promise<UserReview> {
  const updates: UserReviewUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (adminNote !== undefined) {
    updates.admin_note = adminNote.trim() || null;
  }

  const { data, error } = await supabase
    .from("user_reviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateReviewStatus] Error:", error);
    throw error;
  }
  return data;
}

/**
 * Admin: Deletes a user review permanently.
 */
export async function deleteUserReviewAdmin(id: string): Promise<boolean> {
  const { error } = await supabase.from("user_reviews").delete().eq("id", id);
  if (error) {
    console.error("[deleteUserReviewAdmin] Error:", error);
    throw error;
  }
  return true;
}
