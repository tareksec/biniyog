import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  X,
  ChevronDown,
  Users,
} from "lucide-react";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityListItem } from "@/components/OpportunityListItem";
import { OpportunityCompareModal } from "@/components/OpportunityCompareModal";
import {
  useOpportunities,
  useTotalUsersCount,
  isOpen,
  parseAmount,
  parseRoi,
  uniqueCategories,
  getRiskLevel,
  statusLabel,
  resolveImageUrl,
} from "@/lib/projects";
import type { Opportunity } from "@/lib/projects";
import { OpportunityQuickView } from "@/components/OpportunityQuickView";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { listItem } from "@/lib/animations";
import { CountUp, toBengali } from "@/components/CountUp";

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
  const { data: totalUsersCount = 0 } = useTotalUsersCount();
  const showLoading = isLoading || (isFetching && projects.length === 0);

  // Parse arrays from comma-separated strings
  const riskFilters = searchParams.risk ? searchParams.risk.split(",") : [];
  const statusFilters = searchParams.status ? searchParams.status.split(",") : [];

  const { bookmarks } = useBookmarks();
  const [quickViewProject, setQuickViewProject] = useState<Opportunity | null>(null);

  // Local state for debounced search
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Compare feature state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleCompareToggle = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) {
        alert("আপনি সর্বোচ্চ ৩টি সুযোগ তুলনা করতে পারবেন");
        return prev;
      }
      return [...prev, id];
    });
  };

  const compareProjects = useMemo(() => {
    return projects.filter((p) => compareIds.includes(p.id));
  }, [projects, compareIds]);

  useEffect(() => {
    setSearchQuery(searchParams.q || "");
  }, [searchParams.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchQuery || undefined }), replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, navigate]);

  // Derived Stats
  const stats = useMemo(() => {
    let totalInvestable = 0;
    let totalRoi = 0;
    let roiCount = 0;
    let activeCount = 0;

    projects.forEach((p) => {
      if (isOpen(p)) {
        activeCount++;
        totalInvestable += parseAmount(p.investment_amount);
      }
      const r = parseRoi(p.expected_profit);
      if (r > 0) {
        totalRoi += r;
        roiCount++;
      }
    });

    const avgRoi = roiCount > 0 ? (totalRoi / roiCount).toFixed(1) : "0";

    // Format money helper
    const formatMoney = (amt: number) => {
      if (amt >= 10000000) return (amt / 10000000).toFixed(2) + " কোটি";
      if (amt >= 100000) return (amt / 100000).toFixed(1) + " লক্ষ";
      return amt.toLocaleString("bn-BD");
    };

    return {
      total: projects.length,
      active: activeCount,
      avgRoi: avgRoi,
      totalInvestableFormatted: formatMoney(totalInvestable),
      totalUsers: totalUsersCount,
    };
  }, [projects, totalUsersCount]);

  const categories = ["all", ...uniqueCategories(projects)];

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (searchParams.q) {
        const q = searchParams.q.toLowerCase();
        const matchesName = (p.name || "").toLowerCase().includes(q);
        const matchesLoc = ((p as any).location || p.address || "").toLowerCase().includes(q);
        if (!matchesName && !matchesLoc) return false;
      }
      // Category
      if (searchParams.category && searchParams.category !== "all") {
        if (p.category !== searchParams.category) return false;
      }
      // Amount
      const amt = parseAmount(p.investment_amount);
      if (searchParams.minAmount !== undefined && amt < searchParams.minAmount) return false;
      if (searchParams.maxAmount !== undefined && amt > searchParams.maxAmount) return false;
      // ROI
      const roi = parseRoi(p.expected_profit);
      if (searchParams.minRoi !== undefined && roi < searchParams.minRoi) return false;
      if (searchParams.maxRoi !== undefined && roi > searchParams.maxRoi) return false;
      // Risk
      if (riskFilters.length > 0) {
        const r = getRiskLevel(p);
        if (!r || !riskFilters.includes(r.level)) return false;
      }
      // Status
      if (statusFilters.length > 0) {
        if (!p.status || !statusFilters.includes(p.status)) return false;
      }
      // Saved
      if (searchParams.saved) {
        if (!bookmarks.includes(p.id)) return false;
      }
      return true;
    });
  }, [projects, searchParams, riskFilters, statusFilters, bookmarks]);

  // Sorting Logic
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    switch (searchParams.sort) {
      case "investment_asc":
        return list.sort((a, b) => parseAmount(a.investment_amount) - parseAmount(b.investment_amount));
      case "investment_desc":
        return list.sort((a, b) => parseAmount(b.investment_amount) - parseAmount(a.investment_amount));
      case "roi_desc":
        return list.sort((a, b) => parseRoi(b.expected_profit) - parseRoi(a.expected_profit));
      case "newest":
        return list.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
      case "ending_soon":
        // simple heuristic: if status is "শেষের দিকে", float to top
        return list.sort((a, b) => {
          if (a.status === "বিনিয়োগ নেওয়া শেষের দিকে") return -1;
          if (b.status === "বিনিয়োগ নেওয়া শেষের দিকে") return 1;
          return 0;
        });
      default:
        return list; // default fetched order (created_at desc usually)
    }
  }, [filteredProjects, searchParams.sort]);

  const viewMode = searchParams.view || "grid";

  const handleUpdateFilter = (key: keyof OpportunitiesSearch, value: any) => {
    navigate({ search: (prev) => ({ ...prev, [key]: value }), replace: true });
  };

  const handleToggleArrayFilter = (key: "risk" | "status", value: string, current: string[]) => {
    const newArr = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    handleUpdateFilter(key, newArr.length > 0 ? newArr.join(",") : undefined);
  };

  const clearFilters = () => {
    navigate({
      search: {
        category: searchParams.category,
        view: searchParams.view,
        // clear everything else
      },
      replace: true,
    });
    setSearchQuery("");
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">ফিল্টার</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">
          রিসেট করুন
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">বিনিয়োগের পরিমাণ (৳)</h4>
        <Slider
          defaultValue={[searchParams.minAmount || 0, searchParams.maxAmount || 5000000]}
          max={5000000}
          step={50000}
          onValueCommit={(val) => {
            handleUpdateFilter("minAmount", val[0]);
            handleUpdateFilter("maxAmount", val[1]);
          }}
        />
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{searchParams.minAmount ? (searchParams.minAmount / 100000).toFixed(1) + " লক্ষ" : "০"}</span>
          <span>{searchParams.maxAmount ? (searchParams.maxAmount / 100000).toFixed(1) + " লক্ষ" : "৫০ লক্ষ"}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">সম্ভাব্য লাভ (%)</h4>
        <Slider
          defaultValue={[searchParams.minRoi || 0, searchParams.maxRoi || 40]}
          max={40}
          step={1}
          onValueCommit={(val) => {
            handleUpdateFilter("minRoi", val[0]);
            handleUpdateFilter("maxRoi", val[1]);
          }}
        />
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{searchParams.minRoi || 0}%</span>
          <span>{searchParams.maxRoi || 40}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">ঝুঁকির মাত্রা</h4>
        {[
          { id: "low", label: "নিম্ন ঝুঁকি" },
          { id: "med", label: "মধ্যম ঝুঁকি" },
          { id: "high", label: "উচ্চ ঝুঁকি" },
        ].map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Checkbox
              id={`risk-${r.id}`}
              checked={riskFilters.includes(r.id)}
              onCheckedChange={() => handleToggleArrayFilter("risk", r.id, riskFilters)}
            />
            <label htmlFor={`risk-${r.id}`} className="text-sm font-medium leading-none cursor-pointer">
              {r.label}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">স্ট্যাটাস</h4>
        {[
          "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে",
          "বিনিয়োগ নেওয়া শেষের দিকে",
          "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ",
        ].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <Checkbox
              id={`status-${s}`}
              checked={statusFilters.includes(s)}
              onCheckedChange={() => handleToggleArrayFilter("status", s, statusFilters)}
            />
            <label htmlFor={`status-${s}`} className="text-sm font-medium leading-none cursor-pointer">
              {s.replace("বিনিয়োগ নেওয়া ", "")}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
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
                item: "https://biniyogbriddhi.com"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Opportunities",
                item: "https://biniyogbriddhi.com/opportunities"
              }
            ]
          }),
        }}
      />
      {/* Top Header / Stats */}
      <div className="bg-primary/5 pt-28 pb-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-display font-extrabold text-foreground mb-6">সকল সুযোগসমূহ</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-1">মোট সুযোগ</div>
              <div className="text-2xl font-bold text-foreground">{toBengali(stats.total)}</div>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-1">সক্রিয় ব্যবসা</div>
              <div className="text-2xl font-bold text-foreground">{toBengali(stats.active)}</div>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-1">গড় সম্ভাব্য লাভ</div>
              <div className="text-2xl font-bold text-primary">{toBengali(stats.avgRoi)}%</div>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" /> মোট ব্যবহারকারী
              </div>
              <div className="text-2xl font-bold text-foreground">
                <CountUp to={stats.totalUsers} bengali={true} duration={0.8} suffix={stats.totalUsers > 0 ? " জন" : " জন"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <AnimatePresence initial={false}>
            {isFiltersVisible && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden lg:block shrink-0"
              >
                <div className="w-72 sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <FilterPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: Search, Sort, View, Mobile Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="নাম বা ঠিকানা দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-base font-medium outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={searchParams.sort || "default"}
                    onChange={(e) => handleUpdateFilter("sort", e.target.value !== "default" ? e.target.value : undefined)}
                    className="appearance-none rounded-full border border-border bg-card pl-4 pr-10 py-2.5 text-sm font-medium outline-none transition focus:border-primary"
                  >
                    <option value="default">সাজান: ডিফল্ট</option>
                    <option value="roi_desc">সর্বোচ্চ লাভ আগে</option>
                    <option value="investment_asc">সর্বনিম্ন বিনিয়োগ আগে</option>
                    <option value="investment_desc">সর্বোচ্চ বিনিয়োগ আগে</option>
                    <option value="newest">নতুন যোগ হওয়া আগে</option>
                    <option value="ending_soon">শেষের দিকে থাকা সুযোগ আগে</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="flex items-center rounded-full border border-border bg-card p-1">
                  <button
                    onClick={() => handleUpdateFilter("view", "grid")}
                    className={`p-1.5 rounded-full transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateFilter("view", "list")}
                    className={`p-1.5 rounded-full transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <ListIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Desktop Filter Toggle */}
                <Button
                  variant={isFiltersVisible ? "default" : "outline"}
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="hidden lg:flex items-center gap-2 rounded-full h-10 px-4 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium">ফিল্টার</span>
                </Button>

                {/* Mobile Filter Sheet */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl overflow-y-auto">
                      <SheetHeader className="mb-4">
                        <SheetTitle>ফিল্টার এবং সাজান</SheetTitle>
                      </SheetHeader>
                      <FilterPanel />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-2">
              <div className="-mx-4 sm:mx-0 flex gap-2 overflow-x-auto px-4 sm:px-0 pb-4 scrollbar-hide flex-1 w-full sm:w-auto snap-x snap-mandatory">
                {categories.map((c) => {
                  const active = (searchParams.category || "all") === c;
                  return (
                    <button
                      key={c}
                      onClick={() => handleUpdateFilter("category", c === "all" ? undefined : c)}
                      className={`shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm font-medium btn-hover-sm ${
                        active
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {c === "all" ? "সব ক্যাটাগরি" : c}
                    </button>
                  );
                })}
              </div>

              {/* Saved Toggle */}
              <div className="px-4 sm:px-0 pb-4 sm:pb-0 shrink-0">
                <button
                  onClick={() => handleUpdateFilter("saved", searchParams.saved ? undefined : true)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold btn-hover-sm ${
                    searchParams.saved
                      ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={searchParams.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  সংরক্ষিত সুযোগ ({bookmarks.length})
                </button>
              </div>
            </div>

            {/* Results */}
            {showLoading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`skeleton-shimmer bg-card rounded-[1.75rem] border border-border/50 ${viewMode === "grid" ? "h-[360px]" : "h-[120px]"}`} />
                ))}
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 bg-card/50 rounded-[1.75rem] border border-dashed border-border px-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Filter className="h-10 w-10 text-primary opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-display mb-2">কোনো সুযোগ পাওয়া যায়নি</h3>
                <p className="text-[15px] text-muted-foreground max-w-md mx-auto mb-6">
                  আপনার নির্বাচিত ফিল্টার বা কিওয়ার্ড অনুযায়ী কোনো প্রজেক্ট খুঁজে পাওয়া যায়নি। দয়া করে অন্য ফিল্টার চেষ্টা করুন।
                </p>
                <Button onClick={clearFilters} variant="default" className="rounded-full px-8 py-6 shadow-md font-bold hover:scale-105 transition-transform">
                  সব ফিল্টার রিসেট করুন
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                <AnimatePresence mode="popLayout">
                {sortedProjects.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    variants={listItem}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                  {viewMode === "grid" ? (
                    <OpportunityCard 
                      project={p} 
                      index={idx} 
                      onQuickView={() => setQuickViewProject(p)}
                      isComparing={compareIds.includes(p.id)}
                      onCompareToggle={() => handleCompareToggle(p.id)}
                    />
                  ) : (
                    <OpportunityListItem 
                      project={p} 
                      index={idx} 
                      onQuickView={() => setQuickViewProject(p)}
                      isComparing={compareIds.includes(p.id)}
                      onCompareToggle={() => handleCompareToggle(p.id)}
                    />
                  )}
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <OpportunityQuickView 
        project={quickViewProject} 
        isOpen={!!quickViewProject} 
        onClose={() => setQuickViewProject(null)} 
      />

      <OpportunityCompareModal
        projects={compareProjects}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemove={handleCompareToggle}
      />

      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 sm:bottom-28 left-0 right-0 z-[55] mx-auto w-[90%] max-w-sm rounded-full bg-foreground p-3 pl-6 text-background shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-background/20 text-xs font-bold">
                {compareIds.length}
              </span>
              <span className="text-sm font-semibold">টি সুযোগ নির্বাচিত</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full h-8"
                onClick={() => setIsCompareModalOpen(true)}
              >
                তুলনা করুন
              </Button>
              <button
                onClick={() => setCompareIds([])}
                className="grid h-8 w-8 place-items-center rounded-full bg-background/10 hover:bg-background/20 transition-colors"
                title="মুছে ফেলুন"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
