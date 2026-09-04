import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createFileRoute, Link, notFound, useRouter, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Testimonial, UserReview } from "@/lib/database.types";
import { ReviewRatingModal } from "@/components/ReviewRatingModal";
import { getApprovedReviews, submitUserReview } from "@/lib/user_reviews";
import {
  fetchOpportunitiesSSR,
  fetchOpportunities,
  isFullyFunded,
  statusLabel,
  parseLinks,
  getRiskLevel,
  resolveImageUrl,
  resolveImageUrls,
  getStatusConfig,
  fetchOpportunitySubsections,
  fetchTestimonialsSSR,
  type Opportunity,
  type OpportunityRisk,
  type OpportunityPayout,
  type OpportunityLegalCheck,
} from "@/lib/projects";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Lock,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Clock,
  ShieldAlert,
  MessageSquarePlus,
  Star,
  Share2,
  Bookmark,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Coins,
} from "lucide-react";
import { formatProfit } from "@/components/OpportunityCard";
import { toast } from "sonner";

const InvestmentCalculator = lazy(() => import("@/components/InvestmentCalculator").then(m => ({ default: m.InvestmentCalculator })));

export const Route = createFileRoute("/opportunities/$id")({
  loader: async ({ params, context }) => {
    const allProjects = await fetchOpportunitiesSSR();
    const project = allProjects.find((p) => p.id === params.id || p.slug === params.id);
    if (!project) throw notFound();
    const subsections = await fetchOpportunitySubsections(project.id);
    await context.queryClient.ensureQueryData({
      queryKey: ["testimonials-opp", project.id],
      queryFn: () => fetchTestimonialsSSR(project.id),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["user-reviews-opp", project.id],
      queryFn: () => getApprovedReviews("opportunity", project.id),
    });
    return { project, ...subsections };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found · বিনিয়োগ বৃদ্ধি" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = `${p.name} | SME বিনিয়োগ সুযোগ | বিনিয়োগ বৃদ্ধি`;
    const description = `${p.name} এ বিনিয়োগ করুন। ${p.expected_profit} মুনাফা। নূন্যতম বিনিয়োগ: ${p.investment_amount}। যাচাইকৃত ব্যবসা বিনিয়োগ বাংলাদেশ।`;
    const rawOgImage =
      (Array.isArray(p.image_urls) && p.image_urls[0]) ||
      (p as any).image_url ||
      "https://biniyogbriddhi.com/new-og-image.png";
    const ogImage = rawOgImage.startsWith("http")
      ? rawOgImage
      : `https://biniyogbriddhi.com${rawOgImage.startsWith("/") ? "" : "/"}${rawOgImage}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      brand: {
        "@type": "Brand",
        name: "বিনিয়োগ বৃদ্ধি",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "BDT",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "বিনিয়োগ বৃদ্ধি",
        },
      },
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:image:secure_url", content: ogImage },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: OpportunityDetailsPage,
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
  notFoundComponent: NotFoundView,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-2xl">কিছু ভুল হয়েছে</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">হোমে ফিরে যান</Link>
    </div>
  ),
});

function NotFoundView() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">প্রজেক্ট পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">এই বিনিয়োগ সুযোগটি আর সক্রিয় নেই বা লিংকটি ভুল।</p>
      <Link to="/" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        সব সুযোগ দেখুন
      </Link>
    </div>
  );
}

function OpportunityDetailsPage() {
  const { project, risks, payouts, legalChecks } = Route.useLoaderData();
  const funded = isFullyFunded(project);
  const links = parseLinks(project.website_url);
  const router = useRouter();
  const navigate = useNavigate();
  const [showStickyCta, setShowStickyCta] = useState(false);
  const profitData = formatProfit(project.expected_profit || "", project.profit_period);
  const risk = getRiskLevel(project);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem("biniyog_saved_opps");
      if (!stored) return false;
      const ids: string[] = JSON.parse(stored);
      return ids.includes(project.id);
    } catch {
      return false;
    }
  });

  const handleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem("biniyog_saved_opps");
        const ids: string[] = stored ? JSON.parse(stored) : [];
        const nextIds = next ? Array.from(new Set([...ids, project.id])) : ids.filter((id) => id !== project.id);
        localStorage.setItem("biniyog_saved_opps", JSON.stringify(nextIds));
        if (next) toast.success("বুকমার্কে সংরক্ষণ করা হয়েছে");
        else toast.info("বুকমার্ক থেকে সরানো হয়েছে");
      } catch {}
      return next;
    });
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          text: `${project.name} - লাভজনক বিনিয়োগ সুযোগ`,
          url: window.location.href,
        });
      } catch {}
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("লিংক কপি করা হয়েছে");
    }
  };

  const scrollToContact = () => {
    const el = document.getElementById("bank-details-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const hasRouterHistory =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0;
    const hasReferrer =
      typeof document !== "undefined" &&
      document.referrer &&
      document.referrer.includes(window.location.host);

    if (hasRouterHistory || (typeof window !== "undefined" && window.history.length > 1 && hasReferrer)) {
      if (typeof router.history?.back === "function") {
        router.history.back();
      } else {
        window.history.back();
      }
    } else {
      navigate({ to: "/opportunities" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0">
      {/* Desktop Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur hidden md:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব সুযোগ
          </button>
          <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-6 w-auto" />
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          SCREEN 3: Detail page mobile (/opportunities/$id)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Full-bleed hero image at top (no border radius, edge to edge) */}
        <div className="relative w-full h-[360px] sm:h-[400px] overflow-hidden bg-zinc-900">
          <img
            src={resolveImageUrl(project)}
            alt={`${project.name} SME বিনিয়োগ`}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14181f] via-transparent to-black/50 pointer-events-none" />

          {/* Back button top-left, share + bookmark top-right — floating over image */}
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/65 transition-colors shadow-md cursor-pointer"
            aria-label="ফিরে যান"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/65 transition-colors shadow-md cursor-pointer"
              aria-label="শেয়ার করুন"
              title="শেয়ার করুন"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleBookmark}
              className="h-10 w-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/65 transition-colors shadow-md cursor-pointer"
              aria-label="বুকমার্ক"
              title="বুকমার্ক"
            >
              <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Below image: PrimeHouse app dark styling */}
        <div className="relative -mt-6 rounded-t-[28px] bg-[#14181f] text-white p-5 border-t border-white/10 shadow-2xl z-10">
          {/* Below image: two pill badges — ⭐ মুনাফা XX% + মুশারাকা */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/90 text-amber-300 border border-zinc-700/80 text-xs font-semibold backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>মুনাফা {profitData.percentage}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 text-xs font-semibold backdrop-blur-sm">
              {project.investment_type || "মুশারাকা"}
            </span>
          </div>

          {/* Large bold opportunity name */}
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            {project.name}
          </h1>

          {/* Location row with pin icon: district/city if available */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>{project.address || "ঢাকা, বাংলাদেশ"}</span>
          </div>

          {/* Large prominent minimum investment amount */}
          <div className="mt-4">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              সর্বনিম্ন বিনিয়োগ
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {project.investment_amount || "৳ ১,০০,০০০"}
            </div>
          </div>

          {/* Info row: মুনাফা X% · মেয়াদ X মাস · ঝুঁকি: নিম্ন with dividers */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">মুনাফা:</span>
              <span className="text-white font-bold">{profitData.percentage}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">মেয়াদ:</span>
              <span className="text-white font-bold">{project.profit_period || "১২ মাস"}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">ঝুঁকি:</span>
              <span className="text-white font-bold">{risk.label}</span>
            </div>
          </div>

          {/* Full-width dark CTA button at bottom: "বিস্তারিত জানুন ও যোগাযোগ করুন →" */}
          <button
            type="button"
            onClick={scrollToContact}
            className="w-full mt-6 py-3.5 px-6 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
          >
            <span>বিস্তারিত জানুন ও যোগাযোগ করুন</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-8 sm:py-14">
        {/* Desktop-only back navigation button & banner images & title */}
        <div className="hidden md:block">
          {/* Back navigation button */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/80 hover:border-primary/40 hover:-translate-x-0.5 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary transition-transform group-hover:-translate-x-1" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>সব সুযোগ</span>
            </button>
          </div>

          {/* Banner Images */}
          <div className="mb-10 w-full overflow-hidden rounded-2xl border border-border bg-muted">
            {resolveImageUrls(project).length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {resolveImageUrls(project).map((url, i) => (
                    <CarouselItem key={i}>
                      <img
                        src={url}
                        alt={`${project.name} SME বিনিয়োগ সুযোগ বাংলাদেশ`}
                        className="h-64 w-full object-cover sm:h-80 lg:h-96"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={i === 0 ? "high" : "auto"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="left-4 bg-background/80 hover:bg-background" />
                  <CarouselNext className="right-4 bg-background/80 hover:bg-background" />
                </div>
              </Carousel>
            ) : (
              <img
                src={resolveImageUrl(project)}
                alt={`${project.name} SME বিনিয়োগ সুযোগ বাংলাদেশ`}
                className="h-64 w-full object-cover sm:h-80 lg:h-96"
                decoding="async"
                fetchPriority="high"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`pill ${funded ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${funded ? "bg-muted-foreground" : "bg-primary"}`} />
              {statusLabel(project)}
            </span>
            <span className={`pill border-none ${getRiskLevel(project).bg} ${getRiskLevel(project).color}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2L2 22h20L12 2zM12 16v-6M12 20h.01" />
              </svg>
              {getRiskLevel(project).label}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-foreground">{project.name}</h1>
        </div>
        
        {/* Owner Info Card */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-lg border border-primary/20 shadow-sm">
              {project.owner_name ? project.owner_name.slice(0, 2).toUpperCase() : "উদ্যোক্তা".slice(0, 2)}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-teal-400/90">ব্যবসার মালিক / উদ্যোক্তা</div>
              <div className="mt-0.5 text-base font-bold text-foreground sm:text-lg">
                {project.owner_name || "উদ্যোক্তার নাম সংরক্ষিত"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm font-medium">
            <a
              href="https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground transition shadow-2xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>যোগাযোগের তথ্য দেখুন (গুগল শিট)</span>
            </a>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-muted-foreground">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{project.address || "বাংলাদেশ"}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-teal-500"></span>
              <span>{project.category}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-foreground font-normal">
          {project.description || "—"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm sm:grid-cols-3 sm:gap-6 sm:p-7">
          <Field label="নুন্যতম বিনিয়োগ" value={project.investment_amount || ""} num highlight />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit || ""} num highlight accent />
          <Field label="লাভ প্রদান" value={project.profit_period || ""} />
          <Field label="বিনিয়োগ মডেল" value={project.investment_type || ""} />
          <Field label="যাচাইকরণ" value={project.guarantee || ""} />
          <Field label="টার্নওভার" value={project.estimated_capital || ""} num />
        </div>

        <BusinessBackground project={project} />
        <PayoutTrackRecord records={payouts} />
        <RiskAnalysis risks={risks} />
        <LegalSecurity checks={legalChecks} />

        {project.cfa_comment && (
          <section className="mt-12 border-t border-border/80 pt-10">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
              <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">বিনিয়োগের শর্তাবলী</h3>
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground font-normal">{project.cfa_comment}</p>
          </section>
        )}

        {links.length > 0 && (
          <section className="mt-12 border-t border-border/80 pt-10">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
              <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">লিংক ও ডকুমেন্টস</h3>
            </div>
            <ul className="mt-4 space-y-2 text-base font-medium">
              {links.map((l) => (
                <li key={l}>
                  <a
                    href={l}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-primary underline-offset-4 hover:underline inline-flex items-center gap-1.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Suspense fallback={null}>
          <InvestmentCalculator />
        </Suspense>

        <OpportunityReviewsSection project={project} />

        <BankDetailsSection project={project} funded={funded} />

        <div className="mt-12">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← আরও বিনিয়োগ সুযোগ দেখুন
          </Link>
        </div>
      </main>
      
      {/* Sleek Floating Mobile CTA on Opportunity Detail */}
      <AnimatePresence>
        {!funded && showStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-[68px] left-1/2 -translate-x-1/2 z-[45] md:hidden pointer-events-auto"
          >
            <button
              type="button"
              onClick={scrollToContact}
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_25px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-md transition-all active:scale-95 whitespace-nowrap bg-zinc-900 cursor-pointer"
            >
              <span>বিস্তারিত জানুন ও যোগাযোগ করুন</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
  num,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  num?: boolean;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "rounded-xl border border-primary/30 bg-primary/10 dark:bg-primary/5 p-3.5 sm:p-4 shadow-sm" : "p-2"}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-teal-400/90">{label}</div>
      <div
        className={`mt-1.5 font-bold ${num ? "num" : ""} ${
          highlight
            ? "text-lg sm:text-xl md:text-2xl text-primary font-extrabold"
            : "text-base sm:text-lg text-foreground"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function BusinessBackground({ project }: { project: any }) {
  return (
    <section className="mt-12 border-t border-border/80 pt-10">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
        <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">ব্যবসার পটভূমি</h3>
      </div>
      <p className="mt-4 text-base leading-relaxed text-foreground font-normal">
        {project.description ||
          "উদ্যোক্তা তার নিজস্ব দক্ষতা ও অভিজ্ঞতা কাজে লাগিয়ে ব্যবসাটি পরিচালনা করছেন।"}{" "}
        প্রতিষ্ঠানটি {project.address || "বাংলাদেশে"} {project.category ? `${project.category} খাতে ` : ""}
        কাজ করছে এবং বর্তমানে {project.organization_type || "স্থিতিশীল"} পর্যায়ে রয়েছে। ব্যবসার আয়ের ধারা,
        গ্রাহক বেইজ ও অপারেশনাল খরচ যাচাই করে প্রজেক্টটি তালিকাভুক্ত করা হয়েছে।
      </p>
    </section>
  );
}

function RiskAnalysis({ risks = [] }: { risks?: OpportunityRisk[] }) {
  if (!risks || risks.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border/80 pt-10">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
        <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">ঝুঁকি বিশ্লেষণ</h3>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {risks.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{r.risk_name}</span>
              <RiskDot level={r.risk_level} />
            </div>
            {r.description && <p className="mt-2.5 text-sm leading-relaxed text-foreground/90 font-normal">{r.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskDot({ level }: { level: string }) {
  let c = "bg-yellow-500";
  let t = "মধ্যম";
  const l = level?.toLowerCase() || "";
  if (l === "low" || l === "নিম্ন" || l === "কম") {
    c = "bg-primary";
    t = "নিম্ন";
  } else if (l === "high" || l === "উচ্চ" || l === "বেশি") {
    c = "bg-destructive";
    t = "উচ্চ";
  } else if (l === "med" || l === "medium" || l === "মধ্যম" || l === "মাঝারি") {
    c = "bg-yellow-500";
    t = "মধ্যম";
  } else {
    t = level;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${c}`} />
      {t}
    </span>
  );
}

function LegalSecurity({ checks = [] }: { checks?: OpportunityLegalCheck[] }) {
  if (!checks || checks.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border/80 pt-10">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
        <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">আইনি নিরাপত্তা</h3>
      </div>
      <ul className="mt-4 space-y-2.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-base shadow-2xs">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary font-bold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-foreground font-normal leading-relaxed">{c.check_text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PayoutTrackRecord({ records = [] }: { records?: OpportunityPayout[] }) {
  if (!records || records.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border/80 pt-10">
      <div className="flex items-end justify-between">
        <div className="border-l-4 border-primary pl-3.5">
          <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">অতীত পেআউট পারফরম্যান্স</h3>
          <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">এই ব্যবসার পূর্ববর্তী ফান্ডিং সাইকেলের ডেটা</p>
        </div>
      </div>
      
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm" aria-label="পেআউট শিডিউল">
            <thead className="bg-primary/10 text-left text-xs uppercase tracking-wider text-foreground font-bold border-b-2 border-primary/20">
              <tr>
                <th className="px-4 py-3.5 font-bold">সাইকেল</th>
                <th className="px-4 py-3.5 font-bold">টার্গেট লাভ</th>
                <th className="px-4 py-3.5 font-bold">প্রকৃত লাভ</th>
                <th className="px-4 py-3.5 font-bold">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {records.map((r, i) => (
                <tr key={r.id || i} className={i % 2 === 0 ? "bg-card hover:bg-muted/40 transition" : "bg-surface/60 hover:bg-muted/40 transition"}>
                  <td className="px-4 py-3.5 font-bold text-foreground">{r.cycle_name}</td>
                  <td className="px-4 py-3.5 num text-muted-foreground font-semibold">{r.target_profit || "—"}</td>
                  <td className="px-4 py-3.5 num font-extrabold text-primary text-base">{r.actual_profit || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                        r.status === "পেইড" || r.status.includes("Paid")
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : r.status === "চলমান" || r.status === "প্রক্রিয়াধীন" || r.status === "Pending"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : "bg-destructive/15 text-destructive border-destructive/30"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          r.status === "পেইড" || r.status.includes("Paid") ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

interface UnifiedReviewItem {
  id: string;
  source: "testimonial" | "user_review";
  companyName: string;
  quote: string;
  reviewerName: string;
  roleOrOccupation: string;
  avatarUrl?: string | null;
  rating?: number | null;
  investmentAmount?: string | null;
  hasInvested?: boolean;
  createdAt?: string | null;
}

function UnifiedReviewCard({
  review,
  opportunityName,
}: {
  review: UnifiedReviewItem;
  opportunityName: string;
}) {
  const initial = (review.reviewerName || "").trim().charAt(0) || "ব";
  const starCount =
    review.rating && review.rating > 0
      ? review.rating > 1
        ? Math.min(5, Math.max(1, Math.round(review.rating)))
        : Math.round(review.rating * 5)
      : 5;

  return (
    <div className="w-[320px] sm:w-[420px] h-[210px] sm:h-[230px] shrink-0 snap-start rounded-[24px] border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Background Large Faint Watermark Quote */}
      <svg
        className="absolute -bottom-4 -right-4 w-32 h-32 text-foreground/[0.04] dark:text-foreground/[0.03] rotate-12 pointer-events-none transition-transform duration-500 group-hover:scale-105"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14 17h3l2-4V7h-6v6h3M6 17h3l2-4V7H5v6h3" />
      </svg>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top Header: Avatar + Reviewer Name/Role + Star Rating */}
        <header className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.reviewerName}
                className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full object-cover border border-border shadow-xs"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full bg-[#e6f0ed] text-[#164e3f] dark:bg-primary/20 dark:text-primary text-sm font-bold border border-[#c4e0d7] dark:border-primary/30 shadow-xs">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm sm:text-base font-bold text-foreground">
                {review.reviewerName}
              </div>
              <div className="truncate text-xs text-muted-foreground font-medium">
                {review.roleOrOccupation || "বিনিয়োগকারী"}
              </div>
            </div>
          </div>

          {/* 5 Yellow Stars */}
          <div className="flex items-center gap-0.5 shrink-0 self-start pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < starCount
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </header>

        {/* Quote Content with small quote icon */}
        <div className="flex-1 min-h-0 relative pl-4 sm:pl-4.5 pt-0.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-muted-foreground/30 dark:text-muted-foreground/40 absolute top-0 left-0"
            aria-hidden="true"
          >
            <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z" />
          </svg>
          <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/90 line-clamp-4 font-normal">
            {review.quote}
          </p>
        </div>
      </div>
    </div>
  );
}

function OpportunityReviewsSection({ project }: { project: Opportunity }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Source 1: old manually added testimonials (SSR preloaded + query cache)
  const { data: testimonials = [], isLoading: isLoadingOld } = useQuery({
    queryKey: ["testimonials-opp", project.id],
    queryFn: () => fetchTestimonialsSSR(project.id),
    staleTime: 1000 * 60 * 5,
  });

  // Source 2: user submitted reviews for this opportunity
  const { data: userReviews = [], isLoading: isLoadingNew } = useQuery({
    queryKey: ["user-reviews-opp", project.id],
    queryFn: () => getApprovedReviews("opportunity", project.id),
    staleTime: 1000 * 60 * 5,
  });

  const oldReviews: Testimonial[] =
    Array.isArray((project as any).testimonials) && (project as any).testimonials.length > 0
      ? (project as any).testimonials
      : testimonials;

  const newReviews: UserReview[] = userReviews ?? [];

  // Combine both sources: all old reviews first, then user-submitted reviews below them
  const allReviews: UnifiedReviewItem[] = [
    ...oldReviews.map((t) => ({
      id: `testimonial-${t.id}`,
      source: "testimonial" as const,
      companyName: t.brand_name || project.name,
      quote: t.quote,
      reviewerName: t.name || "বিনিয়োগকারী",
      roleOrOccupation: [t.role_title, t.location].filter(Boolean).join(" • ") || "বিনিয়োগকারী",
      avatarUrl: t.avatar_url,
      rating: t.rating,
      investmentAmount: t.investment_amount,
      hasInvested: true,
      createdAt: t.created_at,
    })),
    ...newReviews.map((r) => ({
      id: `user-review-${r.id}`,
      source: "user_review" as const,
      companyName: project.name,
      quote: r.note,
      reviewerName: (r.reviewer_name || "").trim() || "বিনিয়োগকারী",
      roleOrOccupation: r.user_identity || (r.has_invested ? "বিনিয়োগকারী" : "যাচাইকৃত মতামত"),
      avatarUrl: null,
      rating: typeof r.rating === "number" ? (r.rating > 1 ? r.rating : Math.round(r.rating * 5)) : null,
      investmentAmount: r.investment_details,
      hasInvested: r.has_invested,
      createdAt: r.created_at,
    })),
  ];

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [allReviews.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  const isLoading = isLoadingOld && isLoadingNew && allReviews.length === 0;

  return (
    <section className="mt-14 border-t border-border/80 pt-10">
      {/* Schema.org Review structured data */}
      {allReviews.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "@id": `https://biniyogbriddhi.com/opportunities/${project.slug || project.id}`,
              review: allReviews.filter((r) => r.rating).map((r) => ({
                "@type": "Review",
                author: {
                  "@type": "Person",
                  name: r.reviewerName,
                },
                datePublished: r.createdAt,
                reviewBody: r.quote,
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                },
              })),
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (
                  allReviews.filter((r) => r.rating).reduce((acc, curr) => acc + (curr.rating || 5), 0) /
                  (allReviews.filter((r) => r.rating).length || 1)
                ).toFixed(1),
                reviewCount: allReviews.filter((r) => r.rating).length || 1,
              },
            }),
          }}
        />
      )}

      {/* Header: Section heading + subtext on left, Next / Prev controls + "রিভিউ দিন" button on top-right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              বিনিয়োগকারীদের মতামত
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              এই প্রতিষ্ঠানে বিনিয়োগকারীদের বাস্তব অভিজ্ঞতা ও মূল্যায়ন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Next / Prev scroll buttons */}
          {allReviews.length > 1 && (
            <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-full border border-border/80 shadow-2xs">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="h-8 w-8 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="পূর্ববর্তী রিভিউ"
                title="পূর্ববর্তী রিভিউ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="h-8 px-3 rounded-full flex items-center gap-1 text-xs font-semibold text-foreground hover:bg-background transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="পরবর্তী রিভিউ"
                title="পরবর্তী রিভিউ"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>রিভিউ দিন</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          রিভিউ লোড হচ্ছে...
        </div>
      ) : allReviews.length > 0 ? (
        <div className="relative group/carousel">
          <div
            ref={scrollContainerRef}
            className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x scroll-smooth"
          >
            {allReviews.map((r) => (
              <UnifiedReviewCard
                key={r.id}
                review={r}
                opportunityName={project.name}
              />
            ))}
          </div>

          {/* Floating Next Button at right edge */}
          {allReviews.length > 1 && canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/95 hover:bg-background border border-border shadow-lg items-center justify-center text-foreground transition-all hover:scale-110 z-20 cursor-pointer"
              aria-label="পরবর্তী রিভিউ দেখুন"
              title="পরবর্তী রিভিউ"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          )}

          {/* Floating Prev Button at left edge */}
          {allReviews.length > 1 && canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/95 hover:bg-background border border-border shadow-lg items-center justify-center text-foreground transition-all hover:scale-110 z-20 cursor-pointer"
              aria-label="পূর্ববর্তী রিভিউ দেখুন"
              title="পূর্ববর্তী রিভিউ"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>
      ) : (
        /* Empty state: If zero total reviews → show empty state with "প্রথম মতামত দিন" CTA */
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-foreground mb-1">
            এখনো কোনো মতামত নেই। প্রথম মতামত দিন!
          </p>
          <p className="text-xs text-muted-foreground mb-5 max-w-sm mx-auto">
            আপনার অভিজ্ঞতা শেয়ার করে অন্য বিনিয়োগকারীদের সঠিক সিদ্ধান্ত নিতে সহায়তা করুন।
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#163832] hover:bg-[#0B2B26] shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>প্রথম মতামত দিন</span>
          </button>
        </div>
      )}

      {/* Review Rating Modal */}
      <ReviewRatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="opportunity"
        targetId={project.id}
        onSubmit={async (data) => {
          await submitUserReview({
            reviewer_name: "বিনিয়োগকারী",
            rating: data.rating,
            note: data.note,
            has_invested: data.has_invested,
            user_identity: data.user_identity,
            investment_details: data.investment_details,
            target_type: "opportunity",
            target_id: project.id,
          });
          queryClient.invalidateQueries({ queryKey: ["user-reviews-opp", project.id] });
          queryClient.invalidateQueries({ queryKey: ["testimonials-opp", project.id] });
        }}
      />
    </section>
  );
}

function BankDetailsSection({ project, funded }: { project: Opportunity; funded: boolean }) {
  const { user, session, profile, status, isApproved, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Debug session / user state as required
  useEffect(() => {
    console.log("[BankDetailsSection] Auth Check Debug:", {
      isLoggedIn: !!user,
      userId: user?.id,
      email: user?.email,
      status,
      isApproved,
      authLoading,
      bankDetails: project.bank_details ? `${project.bank_details.slice(0, 30)}...` : "None",
    });
  }, [user, session, status, isApproved, authLoading, project.bank_details]);

  const handleCopy = () => {
    if (project.bank_details) {
      navigator.clipboard.writeText(project.bank_details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const redirectPath = `/opportunities/${project.slug || project.id}`;

  return (
    <section id="bank-details-section" className="mt-12 border-t border-border/80 pt-10 rounded-2xl border border-dashed border-border bg-surface/70 p-6 sm:p-8">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
        <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">যোগাযোগ ও ব্যাংক তথ্য</h3>
      </div>

      {authLoading ? (
        <div className="mt-6 py-8 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !user ? (
        /* State 1: Not Logged in -> Show Lock Screen */
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-lg sm:text-xl font-bold text-foreground">ব্যাংক অ্যাকাউন্ট বিবরণী দেখতে লগইন প্রয়োজন</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              উদ্যোক্তা ও বিনিয়োগকারীদের তথ্যের সুরক্ষার্থে ব্যাংক অ্যাকাউন্ট নম্বর ও লেনদেনের গোপনীয় তথ্য শুধুমাত্র লগইন করা সদস্যদের জন্য উন্মুক্ত।
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              to="/login"
              search={{ redirect: redirectPath }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm sm:text-base font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
            >
              <span>🔒 ব্যাংক বিস্তারিত দেখতে Login করুন</span>
            </Link>

            <Link
              to="/register"
              search={{ redirect: redirectPath }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer w-full sm:w-auto"
            >
              <span>নতুন রেজিস্ট্রেশন</span>
            </Link>
          </div>
        </div>
      ) : status === "pending" || !isApproved ? (
        /* State 2: Logged in but Pending Approval */
        <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-7 w-7 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
              অ্যাকাউন্ট স্ট্যাটাস: অপেক্ষমান (Pending)
            </span>
            <h4 className="text-lg sm:text-2xl font-bold text-amber-950 dark:text-amber-100">
              আপনার একাউন্ট অনুমোদনের অপেক্ষায় আছে
            </h4>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
              বিনিয়োগকারী ও উদ্যোক্তাদের তথ্যের সুরক্ষার জন্য অ্যাডমিন কর্তৃক একাউন্ট যাচাই প্রক্রিয়াধীন রয়েছে। অনুমোদন সম্পন্ন হলে এই পেইজে ব্যাংক হিসাব নম্বর ও পেমেন্ট বিবরণী স্বয়ংক্রিয়ভাবে উন্মুক্ত হবে।
            </p>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            লগইনকৃত অ্যাকাউন্ট: <strong>{user.email}</strong> {profile?.full_name ? `(${profile.full_name})` : ""}
          </div>
        </div>
      ) : (
        /* State 3: Logged in & Approved -> Show Bank Details */
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full w-fit">
            <ShieldCheck className="h-4 w-4" />
            <span>অনুমোদিত বিনিয়োগকারী ভিউ — ব্যাংক বিবরণ দৃশ্যমান</span>
          </div>

          <div className="rounded-xl border border-primary/20 bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5 text-foreground font-bold text-base sm:text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                <span>ব্যাংক অ্যাকাউন্ট ও অর্থ প্রদানের বিবরণ</span>
              </div>
              {project.bank_details && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {project.bank_details ? (
              <div className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed text-foreground/90 bg-muted/40 p-4 sm:p-5 rounded-xl border border-border/50">
                {project.bank_details}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                এই প্রজেক্টের জন্য ব্যাংক বিবরণ শীঘ্রই যুক্ত করা হবে অথবা গুগল শিটে বিস্তারিত দেখুন।
              </p>
            )}
          </div>

          <div className="pt-2">
            <a
              href="https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.01]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Building2 className="h-4 w-4" />
              <span>সকল প্রজেক্টের যোগাযোগ ও ব্যাংক তথ্য গুগল শিটে দেখুন</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}