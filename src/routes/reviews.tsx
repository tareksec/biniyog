import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ReviewsSearch {
  q?: string;
  rating?: number;
  tab?: "platform" | "company";
}

export const Route = createFileRoute("/reviews")({
  validateSearch: (search: Record<string, unknown>): ReviewsSearch => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      rating:
        typeof search.rating === "number"
          ? search.rating
          : typeof search.rating === "string"
          ? parseInt(search.rating, 10)
          : undefined,
      tab: search.tab === "company" ? "company" : "platform",
    };
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
    const { fetchTestimonialsSSR } = await import("@/lib/projects");
    const { fetchHomepageReviewsSSR } = await import("@/lib/homepage_reviews");
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["testimonials-all"],
        queryFn: () => fetchTestimonialsSSR(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["homepage-reviews-all"],
        queryFn: () => fetchHomepageReviewsSSR(),
      }),
    ]);
  },
  component: ReviewsPage,
});

interface ReviewCardItem {
  id: string;
  name: string;
  location?: string | null;
  quote: string;
  rating?: number | null;
  avatar_url?: string | null;
  brand_name?: string | null;
  related_opportunity_id?: string | null;
  role_title?: string | null;
  investment_amount?: string | null;
}

function ReviewGridCard({ item }: { item: ReviewCardItem }) {
  const brandContent = item.brand_name ? (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit mb-3 transition-colors hover:bg-primary/15">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span>{item.brand_name}</span>
    </div>
  ) : null;

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[var(--shadow-elevated)]">
      <div>
        {/* Brand Badge */}
        {item.related_opportunity_id ? (
          <Link to="/opportunities/$id" params={{ id: item.related_opportunity_id }}>
            {brandContent}
          </Link>
        ) : (
          brandContent
        )}

        {/* Star Rating */}
        {item.rating && item.rating > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        ) : null}

        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary/40">
          <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z" />
        </svg>
        <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
          "{item.quote}"
        </p>

        {/* Investment Amount Badge */}
        {item.investment_amount && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item.investment_amount}</span>
          </div>
        )}
      </div>

      <footer className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
        {item.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={item.name}
            className="h-11 w-11 shrink-0 rounded-full object-cover border border-border"
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {item.name ? item.name.substring(0, 2) : "বি"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{item.name || "বিনিয়োগকারী"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[item.role_title, item.location].filter(Boolean).join(" • ") || "বিনিয়োগকারী"}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ReviewsPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const currentTab = searchParams.tab === "company" ? "company" : "platform";

  // Fetch Homepage Reviews (Tab 1: আমাদের রিভিউ)
  const { data: homepageReviews = [], isLoading: isLoadingHomepage } = useQuery({
    queryKey: ["homepage-reviews-all"],
    queryFn: async () => {
      const { fetchHomepageReviewsSSR } = await import("@/lib/homepage_reviews");
      return fetchHomepageReviewsSSR();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Testimonials (Tab 2: কোম্পানি রিভিউ)
  const { data: testimonials = [], isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ["testimonials-all"],
    queryFn: async () => {
      const { fetchTestimonialsSSR } = await import("@/lib/projects");
      return fetchTestimonialsSSR();
    },
    staleTime: 1000 * 60 * 5,
  });

  const activeReviews = useMemo(() => {
    return currentTab === "platform" ? homepageReviews : testimonials;
  }, [currentTab, homepageReviews, testimonials]);

  const isLoading = currentTab === "platform" ? isLoadingHomepage : isLoadingTestimonials;

  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [selectedRating, setSelectedRating] = useState<number | null>(searchParams.rating || null);

  useEffect(() => {
    setSearchQuery(searchParams.q || "");
    setSelectedRating(searchParams.rating || null);
  }, [searchParams.q, searchParams.rating]);

  useEffect(() => {
    const handler = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchQuery || undefined }), replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, navigate]);

  const handleTabChange = (tab: "platform" | "company") => {
    navigate({
      search: (prev) => ({
        ...prev,
        tab: tab === "platform" ? undefined : tab,
      }),
      replace: true,
    });
  };

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
    navigate({ search: (prev) => ({ ...prev, rating: rating || undefined }), replace: true });
  };

  // Statistics
  const stats = useMemo(() => {
    const total = activeReviews.length;
    const ratedList = activeReviews.filter((t) => t.rating && t.rating > 0);
    const avg =
      ratedList.length > 0
        ? (
            ratedList.reduce((sum, t) => sum + (t.rating || 5), 0) /
            ratedList.length
          ).toFixed(1)
        : "৫.০";
    const verifiedCount = activeReviews.filter((t: any) => t.investment_amount).length;
    return { total, avg, verifiedCount };
  }, [activeReviews]);

  // Filtered List
  const filteredReviews = useMemo(() => {
    return activeReviews.filter((t: any) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.quote && t.quote.toLowerCase().includes(q)) ||
        (t.brand_name && t.brand_name.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q));

      const matchesRating = selectedRating === null || (t.rating || 5) === selectedRating;

      return matchesSearch && matchesRating;
    });
  }, [activeReviews, searchQuery, selectedRating]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
          <span className="text-sm font-bold tracking-wide">সকল মতামত</span>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-surface border-b border-border py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            গ্রাহকদের সন্তুষ্টি ও আস্থা
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            {currentTab === "platform"
              ? "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম ও সেবা সম্পর্কে সম্মানিত বিনিয়োগকারী ও শুভাকাঙ্ক্ষীদের সামগ্রিক মতামত।"
              : "বিনিয়োগ বৃদ্ধির সাথে যুক্ত বিভিন্ন ব্যবসায়িক উদ্যোগ ও কোম্পানিতে বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা।"}
          </p>

          {/* ─── 2 Main Tabs: আমাদের রিভিউ vs কোম্পানি রিভিউ ─── */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/80 border border-border/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleTabChange("platform")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  currentTab === "platform"
                    ? "bg-card text-primary shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>আমাদের রিভিউ</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    currentTab === "platform"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {homepageReviews.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("company")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  currentTab === "company"
                    ? "bg-card text-primary shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>কোম্পানি রিভিউ</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    currentTab === "company"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {testimonials.length}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-primary">{stats.total}</div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">মোট মতামত</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-3xl font-extrabold text-amber-500">
                <span>{stats.avg}</span>
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">গড় গ্রাহক রেটিং</div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-5 text-center shadow-sm flex flex-col justify-center items-center">
              <div className="flex items-center gap-1 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <span>১০০%</span>
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">যাচাইকৃত মতামত</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                currentTab === "platform" ? "নাম বা মতামত খুঁজুন..." : "নাম, ব্যবসা বা মতামত খুঁজুন..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full rounded-xl"
            />
          </div>

          {/* Star Rating Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleRatingChange(null)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedRating === null
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              সকল মতামত ({activeReviews.length})
            </button>
            <button
              onClick={() => handleRatingChange(5)}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedRating === 5
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>৫ স্টার</span>
              <Star className="h-3.5 w-3.5 fill-current" />
            </button>
            <button
              onClick={() => handleRatingChange(4)}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedRating === 4
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>৪ স্টার</span>
              <Star className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card py-20 text-center shadow-sm my-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">কোনো মতামত পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
              আপনার অনুসন্ধানের সাথে মিল রয়েছে এমন কোনো প্রশংসাপত্র এই মুহূর্তে নেই। দয়া করে অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।
            </p>
            {(searchQuery || selectedRating !== null) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleRatingChange(null);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredReviews.map((t: any, idx: number) => (
              <ReviewGridCard key={t.id || idx} item={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

