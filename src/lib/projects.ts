import publicRaw from "@/data/public-projects.json";

export type PublicProject = {
  id: string;
  project_name: string;
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
};

export const projects: PublicProject[] = publicRaw as PublicProject[];

export function isFullyFunded(p: PublicProject): boolean {
  const s = (p.status || "").toLowerCase();
  return (
    s.includes("fully funded") ||
    s.includes("শেষ") ||
    !p.investment_required.trim() ||
    !p.expected_profit_annual.trim()
  );
}

export function isOpen(p: PublicProject): boolean {
  return (p.status || "").includes("সুযোগ আছে");
}

export function statusLabel(p: PublicProject): string {
  if (isOpen(p)) return "সুযোগ আছে";
  if ((p.status || "").includes("শেষের দিকে")) return "শেষের দিকে";
  if (isFullyFunded(p)) return "Fully Funded";
  return p.status || "—";
}

export function parseLinks(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l));
}

/** Extract the first number (in lakh/crore etc) from a Bengali/English amount string. */
export function parseAmount(raw: string): number {
  if (!raw) return 0;
  // Convert Bengali digits to English
  const en = raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const match = en.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  let n = parseFloat(match[1]);
  if (/কোটি|crore/i.test(raw)) n *= 10000000;
  else if (/লাখ|লক্ষ|lakh/i.test(raw)) n *= 100000;
  else if (/হাজার|thousand/i.test(raw)) n *= 1000;
  return n;
}

/** Extract expected annual ROI percentage from strings like "১৮%" or "18-25%". */
export function parseRoi(raw: string): number {
  if (!raw) return 0;
  const en = raw.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const nums = en.match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  const vals = nums.map(parseFloat);
  return Math.max(...vals);
}

/** Deterministic pseudo funding % (30–95) from id, or 100 if funded. */
export function fundingProgress(p: PublicProject): number {
  if (isFullyFunded(p)) return 100;
  let h = 0;
  for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
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
