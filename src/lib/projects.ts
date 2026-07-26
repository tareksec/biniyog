import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Opportunity, OpportunityRisk, OpportunityPayout, OpportunityLegalCheck } from "@/lib/database.types";
export type { Opportunity, OpportunityRisk, OpportunityPayout, OpportunityLegalCheck };

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching opportunities:", error);
    return [];
  }
  return data || [];
}

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
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

/** Deterministic pseudo funding % (30–95) from id, or 100 if funded. */
export function fundingProgress(p: Opportunity): number {
  if (isFullyFunded(p)) return 100;
  const config = getStatusConfig(p.status);
  
  if (config.width === "100%") return 100;
  
  const id = p.id || "default";
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  
  if (config.width === "dynamic-high") {
    return 85 + (h % 11); // 85..95
  }
  
  return 30 + (h % 51); // 30..80
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

/** Deterministic risk level based on business category */
export function getRiskLevel(p: Opportunity): { level: "low" | "med" | "high"; label: string; color: string; bg: string } {
  const type = (p.category || "").toLowerCase();
  
  if (type.includes("এগ্রো") || type.includes("কৃষি") || type.includes("খামার") || type.includes("টেক") || type.includes("স্টার্টআপ")) {
    return { level: "high", label: "উচ্চ ঝুঁকি", color: "text-destructive", bg: "bg-destructive/10" };
  }
  
  if (type.includes("গার্মেন্টস") || type.includes("ফ্যাশন") || type.includes("খাবার") || type.includes("রেস্টুরেন্ট") || type.includes("ই-কমার্স")) {
    return { level: "med", label: "মাঝারি ঝুঁকি", color: "text-yellow-600 dark:text-yellow-500", bg: "bg-yellow-500/10" };
  }
  
  return { level: "low", label: "নিম্ন ঝুঁকি", color: "text-primary", bg: "bg-primary/10" };
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
