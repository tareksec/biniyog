import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, X, MapPin, ChevronDown, Bookmark, SlidersHorizontal, ArrowUpDown, Shield, Filter } from "lucide-react";
import { OpportunityCard, formatProfit } from "@/components/OpportunityCard";
import { useOpportunities, useTotalUsersCount, getRiskLevel, isOpen, isFullyFunded, resolveImageUrl } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OpportunitiesSearch {
  q?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  minRoi?: number;
  maxRoi?: number;
  risk?: string;
  status?: string;
  sort?: string;
  view?: "grid" | "list";
  saved?: boolean;
}

const CATEGORY_PILLS = ["সব", "এগ্রো", "আইটি", "গার্মেন্টস", "ই-কমার্স", "এক্সপোর্ট"] as const;

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "বিনিয়োগের সুযোগ | যাচাইকৃত SME বিনিয়োগ বাংলাদেশ | বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "বাংলাদেশের যাচাইকৃত SME ব্যবসায় লাভজনক বিনিয়োগের সুযোগ দেখুন। co-investment platform Bangladesh।",
      },
      {
        property: "og:title",
        content: "বিনিয়োগের সুযোগ | যাচাইকৃত SME বিনিয়োগ বাংলাদেশ | বিনিয়োগ বৃদ্ধি",
      },
      {
        property: "og:description",
        content:
          "বাংলাদেশের যাচাইকৃত SME ব্যবসায় লাভজনক বিনিয়োগের সুযোগ দেখুন। co-investment platform Bangladesh।",
      },
      { property: "og:url", content: "https://biniyogbriddhi.com/opportunities" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:secure_url", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { property: "og:image:alt", content: "বিনিয়োগের সুযোগ | যাচাইকৃত SME বিনিয়োগ বাংলাদেশ | বিনিয়োগ বৃদ্ধি" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "বিনিয়োগের সুযোগ | যাচাইকৃত SME বিনিয়োগ বাংলাদেশ | বিনিয়োগ বৃদ্ধি",
      },
      {
        name: "twitter:description",
        content:
          "বাংলাদেশের যাচাইকৃত SME ব্যবসায় লাভজনক বিনিয়োগের সুযোগ দেখুন। co-investment platform Bangladesh।",
      },
      { name: "twitter:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
    ],
  }),
  component: OpportunitiesPage,
  loader: async ({ context }) => {
    const { fetchOpportunitiesSSR, fetchTotalUsersCount } = await import("@/lib/projects");
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["opportunities"],
        queryFn: fetchOpportunitiesSSR,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["public_total_users"],
        queryFn: fetchTotalUsersCount,
      }),
    ]);
  },
  validateSearch: (search: Record<string, unknown>): OpportunitiesSearch => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      category: typeof search.category === "string" ? search.category : undefined,
      minAmount: typeof search.minAmount === "number" ? search.minAmount : undefined,
      maxAmount: typeof search.maxAmount === "number" ? search.maxAmount : undefined,
      minRoi: typeof search.minRoi === "number" ? search.minRoi : undefined,
      maxRoi: typeof search.maxRoi === "number" ? search.maxRoi : undefined,
      risk: typeof search.risk === "string" ? search.risk : undefined,
      status: typeof search.status === "string" ? search.status : undefined,
      sort: typeof search.sort === "string" ? search.sort : undefined,
      view: search.view === "list" || search.view === "grid" ? search.view : undefined,
      saved: search.saved === true ? true : undefined,
    };
  },
});

function OpportunitiesPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: projects = [], isLoading, isFetching } = useOpportunities();
  const showLoading = isLoading || (isFetching && projects.length === 0);

  // Local state for debounced search
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");

  // Local saved bookmarks
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("biniyog_saved_opportunities");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("বুকমার্ক থেকে সরানো হয়েছে");
      } else {
        next.add(id);
        toast.success("বুকমার্কে সংরক্ষণ করা হয়েছে");
      }
      try {
        localStorage.setItem("biniyog_saved_opportunities", JSON.stringify(Array.from(next)));
        window.dispatchEvent(new Event("bookmarks_changed"));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    setSearchQuery(searchParams.q || "");
  }, [searchParams.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchQuery || undefined }), replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, navigate]);

  const handleUpdateFilter = (key: keyof OpportunitiesSearch, value: any) => {
    navigate({ search: (prev) => ({ ...prev, [key]: value }), replace: true });
  };

  const clearFilters = () => {
    navigate({
      search: {},
      replace: true,
    });
    setSearchQuery("");
  };

  // Filter projects based on search query & category pills & saved & risk
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Saved filter
      if (searchParams.saved && !savedIds.has(p.id)) return false;

      // Search by name or location
      if (searchParams.q) {
        const q = searchParams.q.toLowerCase();
        const matchesName = (p.name || "").toLowerCase().includes(q);
        const matchesLoc = ((p as any).location || p.address || "").toLowerCase().includes(q);
        if (!matchesName && !matchesLoc) return false;
      }

      // Category filter pill
      if (searchParams.category && searchParams.category !== "all" && searchParams.category !== "সব") {
        const cat = (p.category || "").toLowerCase();
        const pill = searchParams.category.toLowerCase();
        const matchesCat =
          cat.includes(pill) ||
          (pill === "এগ্রো" &&
            (cat.includes("কৃষি") || cat.includes("খামার") || cat.includes("মাছ") || cat.includes("ডেইরি") || cat.includes("বাগান"))) ||
          (pill === "আইটি" &&
            (cat.includes("টেক") || cat.includes("সফটওয়্যার") || cat.includes("ডিজিটাল") || cat.includes("কম্পিউটার"))) ||
          (pill === "গার্মেন্টস" &&
            (cat.includes("ফ্যাশন") || cat.includes("টেক্সটাইল") || cat.includes("বস্ত্র") || cat.includes("টেইলার্স"))) ||
          (pill === "ই-কমার্স" &&
            (cat.includes("রিটেইল") || cat.includes("দোকান") || cat.includes("শপ") || cat.includes("সুপারশপ"))) ||
          (pill === "এক্সপোর্ট" &&
            (cat.includes("বাণিজ্য") || cat.includes("ইম্পোর্ট") || cat.includes("ট্রেডিং")));

        if (!matchesCat) return false;
      }

      // Risk level filter
      if (searchParams.risk) {
        const risk = getRiskLevel(p);
        if (risk.level !== searchParams.risk) return false;
      }

      // Status filter
      if (searchParams.status) {
        if (searchParams.status === "open" && !isOpen(p)) return false;
        if (searchParams.status === "funded" && !isFullyFunded(p)) return false;
      }

      return true;
    });
  }, [projects, searchParams.q, searchParams.category, searchParams.saved, savedIds, searchParams.risk, searchParams.status]);

  // Sort logic
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    switch (searchParams.sort) {
      case "profit_high": {
        sorted.sort((a, b) => {
          const aP = parseFloat((a.expected_profit || "0").replace(/[^\d.]/g, "")) || 0;
          const bP = parseFloat((b.expected_profit || "0").replace(/[^\d.]/g, "")) || 0;
          return bP - aP;
        });
        break;
      }
      case "profit_low": {
        sorted.sort((a, b) => {
          const aP = parseFloat((a.expected_profit || "0").replace(/[^\d.]/g, "")) || 0;
          const bP = parseFloat((b.expected_profit || "0").replace(/[^\d.]/g, "")) || 0;
          return aP - bP;
        });
        break;
      }
      case "risk_low": {
        const riskOrder = { low: 0, med: 1, high: 2 };
        sorted.sort((a, b) => riskOrder[getRiskLevel(a).level] - riskOrder[getRiskLevel(b).level]);
        break;
      }
      case "risk_high": {
        const riskOrder = { low: 0, med: 1, high: 2 };
        sorted.sort((a, b) => riskOrder[getRiskLevel(b).level] - riskOrder[getRiskLevel(a).level]);
        break;
      }
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return sorted;
  }, [filteredProjects, searchParams.sort]);

  // Count active filters
  const activeFilterCount = [searchParams.saved, searchParams.risk, searchParams.status, searchParams.sort && searchParams.sort !== "newest"].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Schema.org Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://biniyogbriddhi.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Opportunities",
                item: "https://biniyogbriddhi.com/opportunities",
              },
            ],
          }),
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (≤ 768px): PrimeHouse App Style (Screens 1 & 2)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden pt-4 pb-24 px-4">
        {/* ── Screen 1: Header bar (top of page) ── */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: small label "বর্তমান বিভাগ" + bold location text with dropdown arrow */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm shrink-0">
              <MapPin className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                বর্তমান বিভাগ
              </div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1 leading-tight mt-0.5">
                <span>ঢাকা, বাংলাদেশ</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Right: bookmark icon button */}
          <button
            type="button"
            onClick={() => handleUpdateFilter("saved", searchParams.saved ? undefined : true)}
            className={`h-10 w-10 rounded-full border border-border/80 bg-card/90 backdrop-blur-md shadow-sm flex items-center justify-center transition-colors cursor-pointer ${
              searchParams.saved ? "text-amber-500 border-amber-500/40" : "text-foreground"
            }`}
            aria-label="বুকমার্ক"
            title="বুকমার্ক ফিল্টার"
          >
            <Bookmark className={`h-4.5 w-4.5 ${searchParams.saved ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Below header: pill-shaped search bar full width with search icon. Placeholder: "সুযোগ খুঁজুন..." */}
        <div className="relative w-full mb-3.5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="সুযোগ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 pl-11 pr-11 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-primary/50 shadow-inner/sm"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground pointer-events-none">
              <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
            </div>
          )}
        </div>

        {/* Below search: horizontal scrollable filter pills — "সব" "এগ্রো" "আইটি" "গার্মেন্টস" "ই-কমার্স" — active pill dark filled */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x mb-4">
          {CATEGORY_PILLS.map((pill) => {
            const isActive =
              pill === "সব"
                ? !searchParams.category || searchParams.category === "all" || searchParams.category === "সব"
                : searchParams.category === pill;

            return (
              <button
                key={pill}
                type="button"
                onClick={() => handleUpdateFilter("category", pill === "সব" ? undefined : pill)}
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* ── Mobile Filter Row: Risk, Status, Sort ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x mb-3">
          {/* Risk pills */}
          {[
            { value: undefined, label: "সব ঝুঁকি" },
            { value: "low", label: "নিম্ন" },
            { value: "med", label: "মধ্যম" },
            { value: "high", label: "উচ্চ" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleUpdateFilter("risk", opt.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer border ${
                searchParams.risk === opt.value || (!searchParams.risk && !opt.value)
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white/90 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700"
              }`}
            >
              {opt.value ? `⚡ ${opt.label}` : opt.label}
            </button>
          ))}

          {/* Divider */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />

          {/* Sort pills */}
          {[
            { value: undefined, label: "সাজান" },
            { value: "profit_high", label: "মুনাফা ↓" },
            { value: "risk_low", label: "ঝুঁকি ↑" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleUpdateFilter("sort", opt.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer border ${
                searchParams.sort === opt.value || (!searchParams.sort && !opt.value)
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-sm"
                  : "bg-white/90 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Saved bookmark info (mobile) */}
        {searchParams.saved && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 px-4 py-2.5 mb-4">
            <Bookmark className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex-1">
              সংরক্ষিত {savedIds.size}টি সুযোগ
            </p>
            <button
              type="button"
              onClick={() => handleUpdateFilter("saved", undefined)}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              সব দেখুন
            </button>
          </div>
        )}

        {/* ── Screen 2: Card list (mobile) ── */}
        {showLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer bg-card/70 rounded-[24px] border border-border/50 h-[300px]"
              />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="py-16 text-center bg-card/40 rounded-[24px] border border-dashed border-border px-4">
            <p className="text-muted-foreground text-sm">কোনো সুযোগ পাওয়া যায়নি</p>
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-bold text-primary underline cursor-pointer"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedProjects.map((p) => {
              const profit = formatProfit(p.expected_profit || "", p.profit_period);
              const risk = getRiskLevel(p);
              const img = (p.image_urls && p.image_urls[0]?.trim()) || resolveImageUrl(p);
              const isNew = p.created_at
                ? Date.now() - new Date(p.created_at).getTime() < 60 * 24 * 60 * 60 * 1000
                : true;
              const isBookmarked = savedIds.has(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => navigate({ to: "/opportunities/$id", params: { id: p.id } })}
                  className="group relative rounded-[24px] overflow-hidden bg-zinc-900 text-white dark:bg-[#181d24] border border-white/10 dark:border-white/5 shadow-md active:scale-[0.99] transition-all cursor-pointer p-3"
                >
                  {/* Image takes full top half, border-radius: 16px on all corners */}
                  <div className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-zinc-800">
                    <img
                      src={img}
                      alt={p.name}
                      width={640}
                      height={400}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    {/* "নতুন" badge pill top-left of image (if recently added) */}
                    {isNew && (
                      <span className="absolute top-3 left-3 z-10 bg-white/95 text-zinc-950 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                        নতুন
                      </span>
                    )}

                    {/* Bookmark icon top-right of image */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(p.id);
                      }}
                      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors shadow-sm cursor-pointer"
                      aria-label="বুকমার্ক"
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>

                  {/* Below image (white/dark bg): two-column row */}
                  <div className="pt-3 px-1">
                    <div className="flex items-baseline justify-between gap-2">
                      {/* Left: opportunity name bold large */}
                      <h3 className="font-bold text-base text-white truncate group-hover:text-amber-300 transition-colors">
                        {p.name}
                      </h3>
                      {/* Right: minimum investment amount bold (e.g., ১ লক্ষ টাকা) */}
                      <span className="font-bold text-sm sm:text-base text-white shrink-0">
                        {p.investment_amount || "১ লক্ষ টাকা"}
                      </span>
                    </div>

                    {/* Second row: মুনাফা X% · মুশারাকা · নিম্ন ঝুঁকি — small muted text separated by dots */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <span>মুনাফা {profit.percentage}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{p.investment_type || "মুশারাকা"}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{risk.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (> 768px): Unchanged Glassmorphism Design
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Header: Matching Reference Headline ── */}
        <div className="text-center pt-20 pb-4 sm:pt-24 sm:pb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
            Ready to Find Your <span className="font-serif italic font-normal text-amber-500">Dream</span> Property & Profitable Investment Opportunity?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
            আপনার স্বপ্নের লাভজনক <span className="text-primary font-bold">বিনিয়োগ</span> সুযোগ খুঁজে নিন
          </p>
        </div>

        {/* ── Search Bar: Centered, Pill-shaped ── */}
        <div className="relative max-w-xl mx-auto w-full mb-5">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="সুযোগ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border/70 bg-card/85 dark:bg-zinc-900/85 backdrop-blur-md pl-12 pr-11 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground outline-none transition-all shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full hover:bg-muted transition-colors"
              title="খালি করুন"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Category Filter Pills: Horizontal Row ── */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 pt-1 px-2 scrollbar-hide snap-x snap-mandatory max-w-full">
          {CATEGORY_PILLS.map((pill) => {
            const isActive =
              pill === "সব"
                ? !searchParams.category || searchParams.category === "all" || searchParams.category === "সব"
                : searchParams.category === pill;

            return (
              <button
                key={pill}
                type="button"
                onClick={() => handleUpdateFilter("category", pill === "সব" ? undefined : pill)}
                className={`shrink-0 snap-start rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#181a20] text-white shadow-md dark:bg-white dark:text-zinc-900"
                    : "bg-white/80 dark:bg-zinc-800/80 text-muted-foreground border border-border/80 shadow-sm hover:bg-white dark:hover:bg-zinc-800 hover:text-foreground"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* ── Filter Bar: Bookmark, Risk, Sort, Active Count ── */}
        <div className="flex items-center justify-between gap-3 mb-8 mt-4 max-w-4xl mx-auto">
          {/* Left: Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bookmark filter */}
            <button
              type="button"
              onClick={() => handleUpdateFilter("saved", searchParams.saved ? undefined : true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                searchParams.saved
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300/60 dark:border-amber-700/50 shadow-sm"
                  : "bg-white/80 dark:bg-zinc-800/80 text-muted-foreground border-border/80 shadow-sm hover:bg-white dark:hover:bg-zinc-800 hover:text-foreground"
              }`}
              title="সংরক্ষিত সুযোগ দেখুন"
            >
              <Bookmark className={`h-3.5 w-3.5 ${searchParams.saved ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>সংরক্ষিত</span>
              {searchParams.saved && savedIds.size > 0 && (
                <span className="ml-0.5 h-5 min-w-5 px-1 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {savedIds.size}
                </span>
              )}
            </button>

            {/* Risk level filter */}
            <div className="relative group">
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  searchParams.risk
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-700/50 shadow-sm"
                    : "bg-white/80 dark:bg-zinc-800/80 text-muted-foreground border-border/80 shadow-sm hover:bg-white dark:hover:bg-zinc-800 hover:text-foreground"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{searchParams.risk === "low" ? "নিম্ন ঝুঁকি" : searchParams.risk === "med" ? "মধ্যম ঝুঁকি" : searchParams.risk === "high" ? "উচ্চ ঝুঁকি" : "ঝুঁকি স্তর"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:block">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/80 shadow-xl p-1.5 min-w-[160px]">
                  {[
                    { value: undefined, label: "সব ঝুঁকি" },
                    { value: "low", label: "নিম্ন ঝুঁকি" },
                    { value: "med", label: "মধ্যম ঝুঁকি" },
                    { value: "high", label: "উচ্চ ঝুঁকি" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleUpdateFilter("risk", opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        searchParams.risk === opt.value || (!searchParams.risk && !opt.value)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status filter */}
            <div className="relative group">
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  searchParams.status
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300/60 dark:border-blue-700/50 shadow-sm"
                    : "bg-white/80 dark:bg-zinc-800/80 text-muted-foreground border-border/80 shadow-sm hover:bg-white dark:hover:bg-zinc-800 hover:text-foreground"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{searchParams.status === "open" ? "চলমান" : searchParams.status === "funded" ? "সম্পন্ন" : "অবস্থা"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:block">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/80 shadow-xl p-1.5 min-w-[160px]">
                  {[
                    { value: undefined, label: "সব অবস্থা" },
                    { value: "open", label: "চলমান সুযোগ" },
                    { value: "funded", label: "সম্পন্ন/বন্ধ" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleUpdateFilter("status", opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        searchParams.status === opt.value || (!searchParams.status && !opt.value)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sort dropdown + filter count */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold bg-white/80 dark:bg-zinc-800/80 text-muted-foreground border border-border/80 shadow-sm hover:bg-white dark:hover:bg-zinc-800 hover:text-foreground transition-all duration-200 cursor-pointer"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>
                  {searchParams.sort === "profit_high" ? "মুনাফা: বেশি"
                    : searchParams.sort === "profit_low" ? "মুনাফা: কম"
                    : searchParams.sort === "risk_low" ? "ঝুঁকি: কম"
                    : searchParams.sort === "risk_high" ? "ঝুঁকি: বেশি"
                    : "সাজান"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full right-0 mt-1 z-50 hidden group-hover:block">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/80 shadow-xl p-1.5 min-w-[180px]">
                  {[
                    { value: undefined, label: "সর্বশেষ যোগ হয়েছে" },
                    { value: "profit_high", label: "মুনাফা: বেশি → কম" },
                    { value: "profit_low", label: "মুনাফা: কম → বেশি" },
                    { value: "risk_low", label: "ঝুঁকি: কম → বেশি" },
                    { value: "risk_high", label: "ঝুঁকি: বেশি → কম" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleUpdateFilter("sort", opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        searchParams.sort === opt.value || (!searchParams.sort && !opt.value)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter count + clear */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>{activeFilterCount} ফিল্টার মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved bookmark info bar */}
        {searchParams.saved && (
          <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3 rounded-2xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 px-5 py-3">
            <Bookmark className="h-5 w-5 fill-amber-500 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">সংরক্ষিত সুযোগ</p>
              <p className="text-xs text-amber-600 dark:text-amber-400/80">আপনার বুকমার্ক করা {savedIds.size}টি বিনিয়োগ সুযোগ দেখাচ্ছে</p>
            </div>
            <button
              type="button"
              onClick={() => handleUpdateFilter("saved", undefined)}
              className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              সব দেখুন
            </button>
          </div>
        )}

        {/* ── Cards Display: Desktop Grid (1-4 cols) ── */}
        {showLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer bg-card/60 rounded-[2rem] border border-border/50 min-h-[480px]"
              />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 bg-card/40 backdrop-blur-md rounded-[2rem] border border-dashed border-border px-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary opacity-60" />
            </div>
            <h3 className="text-xl font-bold text-foreground font-display mb-2">কোনো সুযোগ পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              আপনার নির্বাচিত ফিল্টার বা সার্চ অনুযায়ী কোনো প্রজেক্ট খুঁজে পাওয়া যায়নি।
            </p>
            <Button
              onClick={clearFilters}
              variant="default"
              className="rounded-full px-6 py-2.5 font-bold cursor-pointer"
            >
              সব ফিল্টার রিসেট করুন
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {sortedProjects.map((p, idx) => (
                <div key={p.id}>
                  <OpportunityCard project={p} index={idx} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
