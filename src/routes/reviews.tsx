import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, Search, Building2, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { HomepageReview, Testimonial, Opportunity } from "@/lib/database.types";

interface ReviewsSearch {
  q?: string;
  rating?: number;
  tab?: "platform" | "company";
}

export const Route = createFileRoute("/reviews")({
  validateSearch: (search: Record<string, unknown> | undefined): ReviewsSearch => {
    const q = typeof search?.q === "string" && search.q.trim().length > 0 ? search.q.trim() : undefined;
    let rating: number | undefined = undefined;
    if (typeof search?.rating === "number" && !isNaN(search.rating)) {
      rating = search.rating;
    } else if (typeof search?.rating === "string") {
      const parsed = parseInt(search.rating, 10);
      if (!isNaN(parsed)) rating = parsed;
    }
    const tab = search?.tab === "company" ? "company" : "platform";

    return { q, rating, tab };
  },
  head: () => ({
    meta: [
      { title: "গ্রাহকদের মতামত ও অভিজ্ঞতা · বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "বিনিয়োগ বৃদ্ধির হালাল বিনিয়োগ সেবা ও ব্যবসা নিয়ে আমাদের সম্মানিত বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা ও মতামত।",
      },
      { property: "og:title", content: "গ্রাহকদের মতামত ও অভিজ্ঞতা · বিনিয়োগ বৃদ্ধি" },
      {
        property: "og:description",
        content:
          "বিনিয়োগ বৃদ্ধির হালাল বিনিয়োগ সেবা ও ব্যবসা নিয়ে আমাদের সম্মানিত বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা ও মতামত।",
      },
      { name: "twitter:title", content: "গ্রাহকদের মতামত ও অভিজ্ঞতা · বিনিয়োগ বৃদ্ধি" },
      {
        name: "twitter:description",
        content:
          "বিনিয়োগ বৃদ্ধির হালাল বিনিয়োগ সেবা ও ব্যবসা নিয়ে আমাদের সম্মানিত বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা ও মতামত।",
      },
    ],
  }),
  loader: async ({ context }) => {
    try {
      const { fetchTestimonialsSSR, fetchOpportunitiesSSR } = await import("@/lib/projects");
      const { fetchHomepageReviewsSSR } = await import("@/lib/homepage_reviews");
      await Promise.allSettled([
        context.queryClient.ensureQueryData({
          queryKey: ["testimonials-all"],
          queryFn: () => fetchTestimonialsSSR(),
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["homepage-reviews-all"],
          queryFn: () => fetchHomepageReviewsSSR(),
        }),
        context.queryClient.ensureQueryData({
          queryKey: ["opportunities-all"],
          queryFn: () => fetchOpportunitiesSSR(),
        }),
      ]);
    } catch (err) {
      console.warn("[Reviews Route Loader] Non-fatal loader error:", err);
    }
  },
  component: ReviewsPage,
});

// ─── Tab 1 Card: আমাদের রিভিউ (Platform / Homepage Reviews) ────────────
function PlatformReviewCard({ item }: { item: HomepageReview }) {
  const rating = item?.rating ? Math.min(5, Math.max(1, Number(item.rating))) : 5;
  const initial = item?.name ? item.name.charAt(0) : "ব";
  const name = item?.name || "সম্মানিত বিনিয়োগকারী";
  const location = item?.location || "বাংলাদেশ";
  const quote = item?.quote || "";

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div>
        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs font-bold text-muted-foreground">
            {rating}.০
          </span>
        </div>

        {/* Quote Icon & Text */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-primary/30 mb-2"
        >
          <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z" />
        </svg>
        <p className="text-base leading-relaxed text-foreground sm:text-[17px] font-normal">
          "{quote}"
        </p>
      </div>

      {/* Footer: Avatar + Name + Location */}
      <footer className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
        {item?.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={name}
            className="h-11 w-11 shrink-0 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a] flex items-center justify-center font-bold text-base border border-[#1a6b4a]/20">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground font-medium">
            {location}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Tab 2 Card: কোম্পানি রিভিউ (Company Testimonials) ─────────────────
function CompanyReviewCard({
  item,
  opportunity,
}: {
  item: Testimonial;
  opportunity?: Opportunity | null;
}) {
  const rating = item?.rating ? Math.min(5, Math.max(1, Number(item.rating))) : 5;
  const initial = item?.name ? item.name.charAt(0) : "ব";
  const name = item?.name || "বিনিয়োগকারী";
  const oppName = opportunity?.name || item?.brand_name || null;
  const oppIdentifier = opportunity?.slug || opportunity?.id || item?.related_opportunity_id || null;
  const quote = item?.quote || "";
  const subtitle = [item?.role_title, item?.location].filter(Boolean).join(" • ") || "বিনিয়োগকারী";

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div>
        {/* Linked Opportunity Badge */}
        {oppName && (
          <div className="mb-3">
            {oppIdentifier ? (
              <Link
                to="/opportunities/$id"
                params={{ id: String(oppIdentifier) }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <Building2 className="h-3 w-3 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[200px]">{oppName}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold">
                <Building2 className="h-3 w-3 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[200px]">{oppName}</span>
              </span>
            )}
          </div>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs font-bold text-muted-foreground">
            {rating}.০
          </span>
        </div>

        {/* Quote Icon & Text */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-primary/30 mb-2"
        >
          <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z" />
        </svg>
        <p className="text-base leading-relaxed text-foreground sm:text-[17px] font-normal">
          "{quote}"
        </p>

        {/* Investment Amount Badge if exists */}
        {item?.investment_amount && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{item.investment_amount}</span>
          </div>
        )}
      </div>

      {/* Footer: Avatar + Investor Name + Role + Location */}
      <footer className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
        {item?.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={name}
            className="h-11 w-11 shrink-0 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a] flex items-center justify-center font-bold text-base border border-[#1a6b4a]/20">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground font-medium">
            {subtitle}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Main Reviews Page Component ─────────────────────────────────────
function ReviewsPage() {
  const searchParams = useSearch({ from: "/reviews" });
  const navigate = Route.useNavigate();

  const currentTab = searchParams?.tab === "company" ? "company" : "platform";

  // Fetch Homepage Reviews (Tab 1: আমাদের রিভিউ)
  const { data: rawHomepageReviews = [], isLoading: isLoadingHomepage } = useQuery({
    queryKey: ["homepage-reviews-all"],
    queryFn: async () => {
      try {
        const { fetchHomepageReviewsSSR } = await import("@/lib/homepage_reviews");
        return (await fetchHomepageReviewsSSR()) ?? [];
      } catch (err) {
        console.error("Error fetching homepage reviews:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Sort Homepage reviews by sort_order
  const homepageReviews = useMemo(() => {
    if (!Array.isArray(rawHomepageReviews)) return [];
    return [...rawHomepageReviews].sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));
  }, [rawHomepageReviews]);

  // Fetch Testimonials (Tab 2: কোম্পানি রিভিউ)
  const { data: rawTestimonials = [], isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ["testimonials-all"],
    queryFn: async () => {
      try {
        const { fetchTestimonialsSSR } = await import("@/lib/projects");
        return (await fetchTestimonialsSSR()) ?? [];
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const testimonials = useMemo(() => {
    return Array.isArray(rawTestimonials) ? rawTestimonials : [];
  }, [rawTestimonials]);

  // Fetch Opportunities for resolving linked company names
  const { data: rawOpportunities = [] } = useQuery({
    queryKey: ["opportunities-all"],
    queryFn: async () => {
      try {
        const { fetchOpportunitiesSSR } = await import("@/lib/projects");
        return (await fetchOpportunitiesSSR()) ?? [];
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const opportunities = useMemo(() => {
    return Array.isArray(rawOpportunities) ? rawOpportunities : [];
  }, [rawOpportunities]);

  // Opportunities lookup map (keyed by ID and slug)
  const oppMap = useMemo(() => {
    const map = new Map<string, Opportunity>();
    opportunities.forEach((o) => {
      if (o && o.id) map.set(o.id, o);
    });
    return map;
  }, [opportunities]);

  const activeReviews = useMemo(() => {
    const list = currentTab === "company" ? testimonials : homepageReviews;
    return Array.isArray(list) ? list : [];
  }, [currentTab, homepageReviews, testimonials]);

  const isLoading = currentTab === "company" ? isLoadingTestimonials : isLoadingHomepage;

  const [searchQuery, setSearchQuery] = useState(searchParams?.q || "");
  const [selectedRating, setSelectedRating] = useState<number | null>(
    typeof searchParams?.rating === "number" ? searchParams.rating : null
  );

  useEffect(() => {
    setSearchQuery(searchParams?.q || "");
    setSelectedRating(typeof searchParams?.rating === "number" ? searchParams.rating : null);
  }, [searchParams?.q, searchParams?.rating]);

  useEffect(() => {
    const handler = setTimeout(() => {
      navigate({
        search: (prev) => ({
          ...prev,
          q: searchQuery.trim() ? searchQuery.trim() : undefined,
        }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, navigate]);

  const handleTabChange = (tab: "platform" | "company") => {
    navigate({
      search: (prev) => ({
        ...prev,
        tab: tab === "company" ? "company" : undefined,
      }),
      replace: true,
    });
  };

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
    navigate({
      search: (prev) => ({
        ...prev,
        rating: rating !== null ? rating : undefined,
      }),
      replace: true,
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const total = activeReviews?.length ?? 0;
    const ratedList = (activeReviews ?? []).filter(
      (t) => t && typeof t.rating === "number" && t.rating > 0
    );
    const avg =
      ratedList.length > 0
        ? (
            ratedList.reduce((sum, t) => sum + Number(t.rating || 5), 0) /
            ratedList.length
          ).toFixed(1)
        : "৫.০";
    return { total, avg };
  }, [activeReviews]);

  // Filtered List
  const filteredReviews = useMemo(() => {
    if (!Array.isArray(activeReviews)) return [];
    return activeReviews.filter((t: any) => {
      if (!t) return false;
      const q = (searchQuery || "").trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (t.name && String(t.name).toLowerCase().includes(q)) ||
        (t.quote && String(t.quote).toLowerCase().includes(q)) ||
        (t.brand_name && String(t.brand_name).toLowerCase().includes(q)) ||
        (t.location && String(t.location).toLowerCase().includes(q));

      const matchesRating = selectedRating === null || Number(t.rating || 5) === selectedRating;

      return Boolean(matchesSearch && matchesRating);
    });
  }, [activeReviews, searchQuery, selectedRating]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            হোমে ফিরে যান
          </Link>
          <span className="text-sm font-bold tracking-wide text-[#111827]">মতামত ও রিভিউ</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-muted/30 border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1a6b4a] mb-3 bg-[#1a6b4a]/10 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a6b4a] animate-pulse" />
            গ্রাহকদের সন্তুষ্টি ও আস্থা
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111827]">
            বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা
          </h1>
          <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            {currentTab === "platform"
              ? "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম ও সেবা সম্পর্কে সম্মানিত বিনিয়োগকারী ও শুভাকাঙ্ক্ষীদের সামগ্রিক মতামত।"
              : "বিনিয়োগ বৃদ্ধির সাথে যুক্ত বিভিন্ন ব্যবসায়িক উদ্যোগ ও কোম্পানিতে বিনিয়োগকারীদের অভিজ্ঞতা।"}
          </p>

          {/* ─── Pill-style Tabs ─── */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/80 border border-border shadow-xs">
              <button
                type="button"
                onClick={() => handleTabChange("platform")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  currentTab === "platform"
                    ? "bg-white text-[#1a6b4a] shadow-sm border border-border/40 font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>আমাদের রিভিউ</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    currentTab === "platform"
                      ? "bg-[#1a6b4a]/10 text-[#1a6b4a]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {homepageReviews.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("company")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  currentTab === "company"
                    ? "bg-white text-[#1a6b4a] shadow-sm border border-border/40 font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>কোম্পানি রিভিউ</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    currentTab === "company"
                      ? "bg-[#1a6b4a]/10 text-[#1a6b4a]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {testimonials.length}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-[#1a6b4a]">{stats.total}</div>
              <div className="mt-0.5 text-xs font-semibold text-muted-foreground">মোট মতামত</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold text-amber-500">
                <span>{stats.avg}</span>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-0.5 text-xs font-semibold text-muted-foreground">গড় রেটিং</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                currentTab === "platform" ? "নাম বা রিভিউ খুঁজুন..." : "নাম, কোম্পানি বা মতামত খুঁজুন..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full rounded-xl text-sm"
            />
          </div>

          {/* Rating Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleRatingChange(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRating === null
                  ? "bg-[#1a6b4a] text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              সকল ({activeReviews.length})
            </button>
            <button
              onClick={() => handleRatingChange(5)}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRating === 5
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>৫ স্টার</span>
              <Star className="h-3 w-3 fill-current" />
            </button>
            <button
              onClick={() => handleRatingChange(4)}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRating === 4
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>৪ স্টার</span>
              <Star className="h-3 w-3 fill-current" />
            </button>
          </div>
        </div>

        {/* Reviews Grid with Animated Tab Transition */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1a6b4a]" />
          </div>
        ) : (filteredReviews ?? []).length === 0 ? (
          <div className="rounded-3xl border border-border bg-card py-16 text-center shadow-xs my-6">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-base font-bold">কোনো মতামত পাওয়া যায়নি</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              অনুসন্ধানের সাথে মিল রয়েছে এমন কোনো রিভিউ নেই। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।
            </p>
            {(searchQuery || selectedRating !== null) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleRatingChange(null);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1a6b4a]/10 px-4 py-2 text-xs font-bold text-[#1a6b4a] hover:bg-[#1a6b4a]/20 cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentTab === "platform"
                ? (filteredReviews ?? []).map((item: HomepageReview) =>
                    item ? <PlatformReviewCard key={item.id || item.quote} item={item} /> : null
                  )
                : (filteredReviews ?? []).map((item: Testimonial) =>
                    item ? (
                      <CompanyReviewCard
                        key={item.id || item.quote}
                        item={item}
                        opportunity={
                          item?.related_opportunity_id
                            ? oppMap.get(item.related_opportunity_id)
                            : null
                        }
                      />
                    ) : null
                  )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
