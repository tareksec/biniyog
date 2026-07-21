import { useQuery } from "@tanstack/react-query";
import publicRaw from "@/data/public-projects.json";

export type PublicProject = {
  id: string;
  project_name: string;
  founder_name?: string;
  entrepreneur_description: string;
  verification_type: string;
  business_type: string;
  investment_model: string;
  investment_required: string;
  expected_profit_annual: string;
  profit_payout_schedule: string;
  status: string;
  investment_terms: string;
  location: string;
  company_maturity: string;
  turnover_capital: string;
  links: string;
  image_url?: string;
};

export const fallbackProjects: PublicProject[] = publicRaw as PublicProject[];

export async function fetchProjects(): Promise<PublicProject[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.warn("Supabase credentials not found, using fallback local JSON data.");
    return fallbackProjects;
  }
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/opportunities?select=*`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch from Supabase:", res.statusText);
      return fallbackProjects;
    }
    const rawData = await res.json();
    
    // Map Supabase columns to the frontend PublicProject type
    const mapped = rawData.map((row: any) => ({
      id: row.id || `unknown-${Math.random()}`,
      project_name: row.name || "",
      founder_name: row.founder_name || "",
      entrepreneur_description: row.description || "",
      verification_type: row.guarantee || "",
      business_type: row.category || "",
      investment_model: row.investment_type || "",
      investment_required: row.investment_amount || "",
      expected_profit_annual: row.expected_profit || "",
      profit_payout_schedule: row.profit_period || "",
      status: row.status || "",
      investment_terms: row.cfa_comment || "",
      location: row.address || "",
      company_maturity: row.organization_type || "",
      turnover_capital: row.estimated_capital || "",
      links: row.links || "",
      image_url: row.image_url || undefined,
    }));

    // Deduplicate: keep latest entry per project_name (or per id)
    const seen = new Map<string, PublicProject>();
    for (const p of mapped) {
      const key = (p.project_name || p.id).toLowerCase().trim();
      seen.set(key, p); // last-write wins
    }
    return Array.from(seen.values());
  } catch (error) {
    console.error("Error fetching projects:", error);
    return fallbackProjects;
  }
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    // Use placeholderData instead of initialData so that once Supabase
    // data arrives it fully replaces the fallback without duplication.
    placeholderData: fallbackProjects,
    staleTime: 1000 * 60 * 5, // 5 min — avoid redundant refetches
  });
}

export function isFullyFunded(p: PublicProject): boolean {
  const s = (p.status || "").toLowerCase();
  // Only mark as fully funded if the status explicitly says so —
  // avoid matching "শেষের দিকে" (almost full) or other strings containing "শেষ"
  return (
    s.includes("fully funded") ||
    s.includes("বিনিয়োগ নেওয়া শেষ") ||
    s.includes("বিনিয়োগ হয়েছে")
  );
}

export function isOpen(p: PublicProject): boolean {
  return (p.status || "").trim().toLowerCase().includes("সুযোগ আছে");
}

export function statusLabel(p: PublicProject): string {
  if (isOpen(p)) return "সুযোগ আছে";
  if ((p.status || "").includes("শেষের দিকে")) return "শেষের দিকে";
  if (isFullyFunded(p)) return "সম্পূর্ণ বিনিয়োগ হয়েছে";
  return p.status || "—";
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
export function fundingProgress(p: PublicProject): number {
  if (isFullyFunded(p)) return 100;
  const id = p.id || "default";
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 30 + (h % 60); // 30..89
}

/** Unique business_type categories present. */
export function uniqueCategories(list: PublicProject[]): string[] {
  const s = new Set<string>();
  for (const p of list) {
    const t = (p.business_type || "").trim();
    if (t) s.add(t);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, "bn"));
}

/** Deterministic risk level based on business type */
export function getRiskLevel(p: PublicProject): { level: "low" | "med" | "high"; label: string; color: string; bg: string } {
  const type = (p.business_type || "").toLowerCase();
  
  if (type.includes("এগ্রো") || type.includes("কৃষি") || type.includes("খামার") || type.includes("টেক") || type.includes("স্টার্টআপ")) {
    return { level: "high", label: "উচ্চ ঝুঁকি", color: "text-destructive", bg: "bg-destructive/10" };
  }
  
  if (type.includes("গার্মেন্টস") || type.includes("ফ্যাশন") || type.includes("খাবার") || type.includes("রেস্টুরেন্ট") || type.includes("ই-কমার্স")) {
    return { level: "med", label: "মাঝারি ঝুঁকি", color: "text-yellow-600 dark:text-yellow-500", bg: "bg-yellow-500/10" };
  }
  
  return { level: "low", label: "নিম্ন ঝুঁকি", color: "text-primary", bg: "bg-primary/10" };
}

/** 
 * Resolves the final image URL automatically from the internet based on the business category.
 * Translates Bengali categories to English concepts to fetch highly accurate internet images.
 */
export function resolveImageUrl(project: PublicProject): string {
  // If an explicit image URL is provided in the sheet/database, use it first
  if (project.image_url && project.image_url.trim() !== "") {
    const rawUrl = project.image_url.trim();
    
    // Convert Google Drive sharing links to direct image view links
    if (rawUrl.includes("drive.google.com")) {
      const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    
    return rawUrl;
  }

  const c = (project.business_type || "").toLowerCase();
  
  // 1. Agriculture / Farming
  if (c.includes("এগ্রো") || c.includes("কৃষি") || c.includes("খামার") || c.includes("মাছ") || c.includes("মুরগি") || c.includes("ডেইরি")) {
    return "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop";
  }
  // 2. Garments / Fashion / Textile
  if (c.includes("গার্মেন্টস") || c.includes("ফ্যাশন") || c.includes("কাপড়") || c.includes("টেক্সটাইল") || c.includes("বস্ত্র") || c.includes("টেইলার্স")) {
    return "https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=800&auto=format&fit=crop";
  }
  // 3. IT / Tech / Software
  if (c.includes("আইটি") || c.includes("টেক") || c.includes("সফটওয়্যার") || c.includes("ডিজিটাল") || c.includes("কম্পিউটার")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
  }
  // 4. Pharmacy / Medical / Health
  if (c.includes("ফার্মেসী") || c.includes("হেলথ") || c.includes("মেডিসিন") || c.includes("মেডিকেল") || c.includes("স্বাস্থ্য") || c.includes("ক্লিনিক")) {
    return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop";
  }
  // 5. Food / Restaurant / Bakery / Grocery
  if (c.includes("খাবার") || c.includes("রেস্টুরেন্ট") || c.includes("ফুড") || c.includes("বেকারি") || c.includes("ক্যাফে") || c.includes("মিষ্টি")) {
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop";
  }
  // 6. E-commerce / Retail / Shop
  if (c.includes("ই-কমার্স") || c.includes("রিটেইল") || c.includes("সুপারশপ") || c.includes("দোকান") || c.includes("শপ")) {
    return "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop";
  }
  // 7. Manufacturing / Factory / Industry
  if (c.includes("ম্যানুফ্যাকচারিং") || c.includes("কারখানা") || c.includes("শিল্প") || c.includes("প্লাস্টিক") || c.includes("লোহা")) {
    return "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800&auto=format&fit=crop";
  }
  // 8. Transport / Logistics / Automobile
  if (c.includes("ট্রান্সপোর্ট") || c.includes("লজিস্টিকস") || c.includes("পরিবহন") || c.includes("অটোমোবাইল") || c.includes("গাড়ি")) {
    return "https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=800&auto=format&fit=crop";
  }
  // 9. Education / Training
  if (c.includes("এডুকেশন") || c.includes("শিক্ষা") || c.includes("ট্রেনিং") || c.includes("স্কুল") || c.includes("কোচিং")) {
    return "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop";
  }
  // 10. Real Estate / Property / Construction
  if (c.includes("রিয়েল এস্টেট") || c.includes("আবাসন") || c.includes("প্রপার্টি") || c.includes("কনস্ট্রাকশন") || c.includes("নির্মাণ")) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop";
  }
  // 11. Trading / Commerce / Dealership (Generic Business Fallback)
  if (c.includes("ট্রেডিং") || c.includes("বাণিজ্য") || c.includes("ডিলারশিপ") || c.includes("সাপ্লায়ার")) {
    return "https://images.unsplash.com/photo-1586528116311-ad8ed745d44c?q=80&w=800&auto=format&fit=crop";
  }
  
  // Default soft abstract business image for unknown categories
  return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
}
