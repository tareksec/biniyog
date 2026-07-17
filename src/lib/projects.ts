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
