import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Opportunity, OpportunityRisk, OpportunityPayout, OpportunityLegalCheck, Testimonial } from "@/lib/database.types";
export type { Opportunity, OpportunityRisk, OpportunityPayout, OpportunityLegalCheck, Testimonial };

/** Timeout (ms) for the live Supabase fetch before falling back. */
const FETCH_TIMEOUT_MS = 4_000;

/** Ensure a promise rejection doesn't go unhandled (e.g. the loser of a Promise.race). */
function suppressUnhandled(p: any): void {
  if (p && typeof p.catch === "function") {
    p.catch(() => {});
  } else if (p && typeof p.then === "function") {
    p.then(() => {}, () => {});
  }
}


export async function fetchOpportunitiesSSR(): Promise<Opportunity[]> {
  let supabasePromise: Promise<unknown> | undefined;
  try {
    // Race the Supabase query against a timeout.
    // IMPORTANT: we save a reference to the losing promise so it doesn't
    // become an unhandled rejection if it settles after the race resolves.
    supabasePromise = supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    const result = await Promise.race([
      supabasePromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase fetch timed out")), FETCH_TIMEOUT_MS),
      ),
    ]);

    const { data, error } = result as { data: Opportunity[] | null; error: { message: string } | null };

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Empty data returned");

    return data as Opportunity[];
  } catch (err) {
    suppressUnhandled(supabasePromise);
    console.warn("[fetchOpportunitiesSSR] Supabase error, using fallback:", err instanceof Error ? err.message : err);
    if (import.meta.env.SSR) {
      try {
        const module = await import("@/data/opportunities-fallback.json");
        return module.default as Opportunity[];
      } catch (importErr) {
        console.error("Failed to import fallback file on server:", importErr);
        return [];
      }
    }
    return [];
  }
}

export async function fetchTestimonialsSSR(opportunityId?: string): Promise<Testimonial[]> {
  let supabasePromise: Promise<unknown> | undefined;
  try {
    let query = supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
    
    if (opportunityId) {
      query = query.eq("related_opportunity_id", opportunityId);
    }

    supabasePromise = query;

    const result = await Promise.race([
      supabasePromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase fetch timed out")), FETCH_TIMEOUT_MS),
      ),
    ]);

    const { data, error } = result as { data: Testimonial[] | null; error: { message: string } | null };

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Empty data returned");

    return data as Testimonial[];
  } catch (err) {
    suppressUnhandled(supabasePromise);
    console.warn("[fetchTestimonialsSSR] Supabase error, using fallback:", err instanceof Error ? err.message : err);
    if (import.meta.env.SSR) {
      try {
        const module = await import("@/data/testimonials-fallback.json");
        const allTestimonials = module.default as Testimonial[];
        return opportunityId ? allTestimonials.filter(t => t.related_opportunity_id === opportunityId) : allTestimonials;
      } catch (importErr) {
        console.error("Failed to import fallback file on server:", importErr);
        return [];
      }
    }
    return [];
  }
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[fetchOpportunities] Supabase error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (err) {
    console.warn(
      "[fetchOpportunities] Fetch failed:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

/**
 * Fetches total count of registered users/investors safely for public display.
 */
export async function fetchTotalUsersCount(): Promise<number> {
  try {
    // 1. Try public RPC function
    const { data: rpcCount, error: rpcErr } = await supabase.rpc("get_total_users_count" as any);
    if (!rpcErr && typeof rpcCount === "number") {
      return rpcCount;
    }

    // 2. Try profiles table exact count
    const { count, error: countErr } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (!countErr && typeof count === "number") {
      return count;
    }

    // 3. Try get_all_users RPC (if authenticated)
    const { data: allUsers, error: allUsersErr } = await supabase.rpc("get_all_users" as any);
    if (!allUsersErr && Array.isArray(allUsers)) {
      return allUsers.length;
    }

    return 0;
  } catch (err) {
    console.warn("[fetchTotalUsersCount] Error fetching user count:", err);
    return 0;
  }
}

export function useTotalUsersCount() {
  return useQuery({
    queryKey: ["public_total_users"],
    queryFn: fetchTotalUsersCount,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export async function fetchOpportunitySubsections(opportunityId: string) {
  if (!opportunityId) return { risks: [], payouts: [], legalChecks: [] };
  
  const [risksRes, payoutsRes, legalRes] = await Promise.all([
    supabase.from("opportunity_risks").select("*").eq("opportunity_id", opportunityId).order("sort_order", { ascending: true }),
    supabase.from("opportunity_payouts").select("*").eq("opportunity_id", opportunityId).order("sort_order", { ascending: true }),
    supabase.from("opportunity_legal_checks").select("*").eq("opportunity_id", opportunityId).order("sort_order", { ascending: true }),
  ]);

  return {
    risks: (risksRes.data || []) as OpportunityRisk[],
    payouts: (payoutsRes.data || []) as OpportunityPayout[],
    legalChecks: (legalRes.data || []) as OpportunityLegalCheck[],
  };
}

export function useOpportunitySubsections(opportunityId?: string) {
  return useQuery({
    queryKey: ["opportunity_subsections", opportunityId],
    queryFn: () => fetchOpportunitySubsections(opportunityId!),
    enabled: !!opportunityId,
    staleTime: 1000 * 60 * 2,
  });
}

// Check if fully funded or closed
export function isFullyFunded(p: Opportunity): boolean {
  const s = p.status || "";
  return (
    s === "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ" ||
    s === "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।" ||
    s === "আমরা তাদের নিয়ে এখন আর কাজ করছি না"
  );
}

// Check if open for investment
export function isOpen(p: Opportunity): boolean {
  const s = p.status || "";
  return s === "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে" || s === "বিনিয়োগ নেওয়া শেষের দিকে";
}

// Return raw status for label (already well-formatted)
export function statusLabel(p: Opportunity): string {
  return p.status || "—";
}

// Get the visual configuration for the status progress bar
export function getStatusConfig(status: string | null): { color: string; width: string } {
  switch (status) {
    case "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে":
      return { color: "bg-green-500", width: "dynamic" };
    case "বিনিয়োগ নেওয়া শেষের দিকে":
      return { color: "bg-amber-500", width: "dynamic-high" };
    case "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ":
      return { color: "bg-slate-500", width: "100%" };
    case "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।":
      return { color: "bg-neutral-500", width: "100%" };
    case "আমরা তাদের নিয়ে এখন আর কাজ করছি না":
      return { color: "bg-zinc-800", width: "100%" };
    default:
      return { color: "bg-primary", width: "dynamic" };
  }
}

export function parseLinks(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l));
}

/** Extract the first number (in lakh/crore etc) from a Bengali/English amount string. */
export function parseAmount(raw: string | number | undefined | null): number {
  if (!raw) return 0;
  // Convert Bengali digits to English
  const en = String(raw).replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const match = en.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  let n = parseFloat(match[1]);
  if (/কোটি|crore/i.test(String(raw))) n *= 10000000;
  else if (/লাখ|লক্ষ|lakh/i.test(String(raw))) n *= 100000;
  else if (/হাজার|thousand/i.test(String(raw))) n *= 1000;
  return n;
}

/** Extract expected annual ROI percentage from strings like "১৮%" or "18-25%". */
export function parseRoi(raw: string | number | undefined | null): number {
  if (!raw) return 0;
  const en = String(raw).replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const nums = en.match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  const vals = nums.map(parseFloat);
  return Math.max(...vals);
}



/** Unique categories present. */
export function uniqueCategories(list: Opportunity[]): string[] {
  const s = new Set<string>();
  for (const p of list) {
    const t = (p.category || "").trim();
    if (t) s.add(t);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, "bn"));
}

/** Risk level directly controlled via opportunity.risk_level */
export function getRiskLevel(p: Opportunity): { level: "low" | "med" | "high"; label: string; color: string; bg: string } {
  const raw = (p.risk_level || "").trim();

  if (raw === "নিম্ন") {
    return {
      level: "low",
      label: "নিম্ন ঝুঁকি",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  }

  if (raw === "উচ্চ") {
    return {
      level: "high",
      label: "উচ্চ ঝুঁকি",
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-500/10",
    };
  }

  // Default: মধ্যম ঝুঁকি
  return {
    level: "med",
    label: "মধ্যম ঝুঁকি",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-500/10",
  };
}

/** 
 * Resolves the final image URL. If uploaded via our admin, it will be a Supabase public URL.
 * If missing, falls back to internet images based on category.
 */
export function resolveImageUrl(project: Opportunity): string {
  if (project.image_urls && project.image_urls.length > 0 && project.image_urls[0].trim() !== "") {
    return project.image_urls[0].trim();
  }

  const c = (project.category || "").toLowerCase();
  
  if (c.includes("এগ্রো") || c.includes("কৃষি") || c.includes("খামার") || c.includes("মাছ") || c.includes("মুরগি") || c.includes("ডেইরি")) {
    return "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("গার্মেন্টস") || c.includes("ফ্যাশন") || c.includes("কাপড়") || c.includes("টেক্সটাইল") || c.includes("বস্ত্র") || c.includes("টেইলার্স")) {
    return "https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("আইটি") || c.includes("টেক") || c.includes("সফটওয়্যার") || c.includes("ডিজিটাল") || c.includes("কম্পিউটার")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ফার্মেসী") || c.includes("হেলথ") || c.includes("মেডিসিন") || c.includes("মেডিকেল") || c.includes("স্বাস্থ্য") || c.includes("ক্লিনিক")) {
    return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("খাবার") || c.includes("রেস্টুরেন্ট") || c.includes("ফুড") || c.includes("বেকারি") || c.includes("ক্যাফে") || c.includes("মিষ্টি")) {
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ই-কমার্স") || c.includes("রিটেইল") || c.includes("সুপারশপ") || c.includes("দোকান") || c.includes("শপ")) {
    return "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ম্যানুফ্যাকচারিং") || c.includes("কারখানা") || c.includes("শিল্প") || c.includes("প্লাস্টিক") || c.includes("লোহা")) {
    return "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ট্রান্সপোর্ট") || c.includes("লজিস্টিকস") || c.includes("পরিবহন") || c.includes("অটোমোবাইল") || c.includes("গাড়ি")) {
    return "https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("এডুকেশন") || c.includes("শিক্ষা") || c.includes("ট্রেনিং") || c.includes("স্কুল") || c.includes("কোচিং")) {
    return "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("রিয়েল এস্টেট") || c.includes("আবাসন") || c.includes("প্রপার্টি") || c.includes("কনস্ট্রাকশন") || c.includes("নির্মাণ")) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ট্রেডিং") || c.includes("বাণিজ্য") || c.includes("ডিলারশিপ") || c.includes("সাপ্লায়ার")) {
    return "https://images.unsplash.com/photo-1586528116311-ad8ed745d44c?q=80&w=800&auto=format&fit=crop";
  }
  
  // Default fallback
  return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
}

/** 
 * Resolves all image URLs for a project (up to 3).
 * Falls back to an array containing a single default category image if none exist.
 */
export function resolveImageUrls(project: Opportunity): string[] {
  if (project.image_urls && project.image_urls.length > 0) {
    const validUrls = project.image_urls.filter(url => url && url.trim() !== "");
    if (validUrls.length > 0) {
      return validUrls.map(url => url.trim());
    }
  }
  
  return [resolveImageUrl(project)];
}
