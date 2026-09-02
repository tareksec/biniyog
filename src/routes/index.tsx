import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { OpportunityCard, getCategoryIcon } from "@/components/OpportunityCard";
import { useOpportunities, isFullyFunded, isOpen, statusLabel, parseAmount, parseRoi } from "@/lib/projects";
import type { Opportunity } from "@/lib/projects";
import { CountUp } from "@/components/CountUp";
import {
  InstructorSection,
  CONSULTANCY_URL,
  LINKEDIN_URL,
} from "@/components/InstructorSection";
import { OpportunityFilters, type SortKey } from "@/components/OpportunityFilters";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ReviewRatingModal } from "@/components/ReviewRatingModal";
import { submitUserReview } from "@/lib/user_reviews";
import { Loader2, CalendarCheck, MapPin, Sparkles, ArrowRight, Star } from "lucide-react";
import { usePrefersReducedMotion, revealVariants, staggerContainer, scaleIn } from "@/lib/animations";
import { FlipFadeText } from "@/components/ui/flip-fade-text";
import { usePublishedBlogPosts } from "@/lib/blog";

// Lazy-load heavy below-fold sections to reduce initial bundle size
const WhyChooseSection = lazy(() => import("@/components/WhyChooseSection").then(m => ({ default: m.WhyChooseSection })));
const InvestmentCalculator = lazy(() => import("@/components/InvestmentCalculator").then(m => ({ default: m.InvestmentCalculator })));
const FaqSection = lazy(() => import("@/components/FaqSection").then(m => ({ default: m.FaqSection })));
const PolicySection = lazy(() => import("@/components/PolicySection").then(m => ({ default: m.PolicySection })));

type OpportunitiesSearch = {
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বিনিয়োগ বৃদ্ধি | যাচাইকৃত SME ব্যবসায় বিনিয়োগ বাংলাদেশ ২০২৬" },
      {
        name: "description",
        content:
          "বাংলাদেশে যাচাইকৃত SME ব্যবসায় বিনিয়োগ করুন। লাভজনক co-investment সুযোগ। বিনিয়োগ বৃদ্ধি — বাংলাদেশের বিশ্বস্ত বিনিয়োগ প্ল্যাটফর্ম।",
      },
      {
        property: "og:title",
        content: "বিনিয়োগ বৃদ্ধি | SME বিনিয়োগ প্ল্যাটফর্ম বাংলাদেশ",
      },
      {
        property: "og:description",
        content:
          "বাংলাদেশে যাচাইকৃত SME ব্যবসায় বিনিয়োগ করুন। লাভজনক co-investment সুযোগ। বিনিয়োগ বৃদ্ধি — বাংলাদেশের বিশ্বস্ত বিনিয়োগ প্ল্যাটফর্ম।",
      },
      { property: "og:image", content: "https://biniyogbriddhi.com/og-image.jpg" },
      { property: "og:url", content: "https://biniyogbriddhi.com" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "bn_BD" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "বিনিয়োগ বৃদ্ধি | SME বিনিয়োগ প্ল্যাটফর্ম বাংলাদেশ",
      },
      {
        name: "twitter:description",
        content:
          "বাংলাদেশে যাচাইকৃত SME ব্যবসায় বিনিয়োগ করুন। লাভজনক co-investment সুযোগ। বিনিয়োগ বৃদ্ধি — বাংলাদেশের বিশ্বস্ত বিনিয়োগ প্ল্যাটফর্ম।",
      },
      { name: "twitter:image", content: "https://biniyogbriddhi.com/og-image.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "বিনিয়োগ বৃদ্ধি",
          "alternateName": "Biniyog Briddhi",
          "url": "https://biniyogbriddhi.com",
          "logo": "https://biniyogbriddhi.com/logo.png",
          "description": "বাংলাদেশে যাচাইকৃত SME ব্যবসায় বিনিয়োগ প্ল্যাটফর্ম",
          "areaServed": {
            "@type": "Country",
            "name": "Bangladesh"
          },
          "currenciesAccepted": "BDT",
          "telephone": "+8801316110209",
          "email": "support@biniyogbriddhi.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BD"
          },
          "sameAs": [
            "https://www.facebook.com/mohaimin1",
            "https://www.linkedin.com/in/mohaimin-patwary-cfa-a8416aab/",
            "https://www.instagram.com/mohaiminpatwary"
          ],
          "founder": {
            "@type": "Person",
            "name": "মোহাইমিন পাটোয়ারী",
            "jobTitle": "CFA Charterholder"
          }
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "পার্টনারশিপ মডেল কীভাবে কাজ করে?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "পার্টনারশিপ মডেল হলো এমন একটি ব্যবসায়িক কাঠামো যেখানে দুই বা ততোধিক ব্যক্তি যৌথভাবে মূলধন বিনিয়োগ করে এবং চুক্তির শর্ত অনুযায়ী অর্জিত লাভ বা ক্ষতি ভাগ করে নেয়।"
              }
            },
            {
              "@type": "Question",
              "name": "প্রজেক্ট যাচাইকরণ কীভাবে হয়?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "প্রতিটি প্রজেক্টের ব্যবসায়িক কার্যক্রম, আয়ের উৎস, আর্থিক বিবরণী ও উদ্যোক্তার ব্যাকগ্রাউন্ড স্বাধীনভাবে যাচাই করা হয়।"
              }
            },
            {
              "@type": "Question",
              "name": "মুনাফা কীভাবে ও কখন পাব?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "প্রতিটি প্রজেক্টের নির্দিষ্ট পেআউট শিডিউল থাকে — মাসিক, ত্রৈমাসিক বা বার্ষিক। মুনাফা প্রকৃত ব্যবসায়িক আয়ের ভিত্তিতে সরাসরি আপনার ব্যাংক অ্যাকাউন্টে পাঠানো হয়।"
              }
            },
            {
              "@type": "Question",
              "name": "আইনি সুরক্ষা কীভাবে নিশ্চিত হয়?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "প্রতিটি বিনিয়োগের জন্য চুক্তিনামা, সিকিউরিটি চেক রাখা হয়। উদ্যোক্তার ব্যাকগ্রাউন্ড ও ব্যবসার আর্থিক বিবরণী স্বাধীনভাবে যাচাই করা হয়।"
              }
            },
            {
              "@type": "Question",
              "name": "বিনিয়োগ থেকে বের হতে চাইলে কী হবে?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "চুক্তির মেয়াদ শেষে মূলধন ও অর্জিত মুনাফা ফেরত পাওয়া যায়। মেয়াদের মাঝে বের হওয়ার প্রয়োজন হলে অন্য বিনিয়োগকারীর কাছে পোর্টফোলিও হস্তান্তরের সুযোগ থাকতে পারে।"
              }
            }
          ]
        }),
      },
    ],
  }),
  loader: async ({ context }) => {
    const { fetchOpportunitiesSSR } = await import("@/lib/projects");
    const { fetchHomepageReviewsSSR } = await import("@/lib/homepage_reviews");
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["opportunities"],
        queryFn: fetchOpportunitiesSSR,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["homepage_reviews"],
        queryFn: fetchHomepageReviewsSSR,
      }),
    ]);
  },
  validateSearch: (search: Record<string, unknown>): OpportunitiesSearch => {
    return {
      category: search.category as string | undefined,
      sort: search.sort as string | undefined,
    };
  },
  component: LandingPage,
});

function LandingPage() {
  const { data: opportunities = [] } = useOpportunities();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA only after user scrolls past the hero section (> 380px)
      if (window.scrollY > 380) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroStats = useMemo(() => {
    // Filter to non-funded opportunities for stat computation
    const active = opportunities.filter((p) => !isFullyFunded(p));
    const profits = active
      .map((p) => parseRoi(p.expected_profit))
      .filter((v): v is number => !isNaN(v) && v > 0);

    let profitMin = 18;
    let profitMax = 25;
    if (profits.length > 0) {
      profitMin = Math.floor(Math.min(...profits));
      profitMax = Math.ceil(Math.max(...profits));
    }

    const verifiedCount = opportunities.length;

    return { profitMin, profitMax, verifiedCount };
  }, [opportunities]);

  return (
    <div
      className="bg-background min-h-screen text-foreground antialiased"
    >
      <Hero stats={heroStats} />
      <GrowthStatsSection opportunities={opportunities} />
      <Suspense fallback={null}>
        <WhyChooseSection />
      </Suspense>
      <Suspense fallback={null}>
        <PolicySection />
      </Suspense>
      <LatestBlogSection />
      <InstructorSection />
      <Opportunities opportunities={opportunities} />
      <HowItWorks />
      <Suspense fallback={null}>
        <div className="bg-background/75 backdrop-blur-[2px]">
          <InvestmentCalculator />
        </div>
      </Suspense>

      {/* Testimonials with Review Button */}
      <div className="relative">
        <TestimonialsSection />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-12 flex justify-center -mt-6 relative z-10">
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>আপনার অভিজ্ঞতা কেমন ছিল? রিভিউ দিন</span>
          </button>
        </div>
      </div>

      <Suspense fallback={null}>
        <FaqSection />
      </Suspense>
      <FinalCTA />
      
      {/* Sleek Floating Mobile CTA — ergonomically positioned above the dock, scroll-aware */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-[45] md:hidden pointer-events-auto"
          >
            <Link
              to="/opportunities"
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_8px_25px_rgba(16,185,129,0.35)] border border-white/20 backdrop-blur-md transition-all active:scale-95 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #15803d 0%, #0d5231 100%)" }}
            >
              <span>বিনিয়োগ শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Homepage Review Modal */}
      <ReviewRatingModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetType="homepage"
        onSubmit={async (data) => {
          await submitUserReview({
            reviewer_name: "বিনিয়োগকারী",
            rating: data.rating,
            note: data.note,
            has_invested: data.has_invested,
            user_identity: data.user_identity,
            investment_details: data.investment_details,
            target_type: "homepage",
          });
        }}
      />
    </div>
  );
}

const revealItem = revealVariants;

/* ────────────────────────────────────────────────────────────
   Sticky-note card pattern — ported from Still-worker reference
   ──────────────────────────────────────────────────────────── */

const NOTE_EASE = [0.22, 0.61, 0.36, 1] as const;

function StickyPin({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <div className="flex justify-center pb-3">
      <motion.div
        animate={prefersReduced ? {} : { y: [0, -4, 0], rotate: [-12, -8, -12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MapPin className="size-6 fill-pin text-pin drop-shadow-sm" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}

function StickyNoteCard({
  label,
  children,
  delay,
  prefersReduced,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.div
      className="group [perspective:1000px]"
      initial={prefersReduced ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.85, delay: prefersReduced ? 0 : delay, ease: NOTE_EASE }}
    >
      <StickyPin prefersReduced={prefersReduced} />
      <p className="pb-3 text-center text-sm font-semibold text-foreground">{label}</p>
      <motion.div
        className="relative"
        whileHover={prefersReduced ? {} : { y: -8, rotate: -0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="absolute -right-2 -top-2 h-full w-full rotate-2 rounded-2xl border border-border bg-card/70 transition-transform duration-500 group-hover:rotate-3" />
        <div className="relative rounded-2xl border border-border bg-card p-4 shadow-note transition-shadow duration-500 group-hover:shadow-note-lift">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

const HERO_STATUS_COLORS: Record<string, string> = {
  "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে": "#146C43",
  "বিনিয়োগ নেওয়া শেষের দিকে": "#eab308",
  "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ": "#64748b",
  "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে": "#64748b",
};

function StatusDonutChart({
  data,
  total,
}: {
  data: { name: string; value: number }[];
  total: number;
}) {
  const size = 100;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      {total > 0 &&
        data.map((item, i) => {
          const percent = item.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;
          const color = HERO_STATUS_COLORS[item.name] || "#94a3b8";

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
    </svg>
  );
}

function Hero({
  stats,
}: {
  stats: { profitMin: number; profitMax: number; verifiedCount: number };
  opportunities?: Opportunity[];
}) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <section id="top" className="relative w-full">
      {/* ── Mobile Hero (below md) ── */}
      <div
        className="md:hidden relative overflow-hidden bg-white"
        style={{
          minHeight: "100svh",
        }}
      >
        {/* Background illustration */}
        <img
          src="/images/hero-bg-mobile.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Text Content */}
        <div
          className="relative text-left"
          style={{
            zIndex: 2,
            padding: "64px 20px 0 20px",
          }}
        >
          {/* Headline */}
          <div
            role="heading"
            aria-level={2}
            className="tracking-tight font-[900]"
            style={{
              fontSize: "clamp(1.85rem, 7.5vw, 2.5rem)",
              color: "#0d5231",
              lineHeight: 1.25,
              maxWidth: "360px",
            }}
          >
            সম্ভাবনাময় ব্যাবসা প্রতিষ্ঠানে বিনিয়োগ করুন
          </div>

          {/* Green underline */}
          <div
            style={{
              width: "48px",
              height: "4px",
              borderRadius: "9999px",
              background: "linear-gradient(to right, #15803d, #84cc16)",
              margin: "12px 0 16px 0",
            }}
          />

          {/* Subtext */}
          <p
            style={{
              color: "#1f2937",
              fontSize: "0.95rem",
              fontWeight: 600,
              lineHeight: 1.5,
              maxWidth: "320px",
            }}
          >
            যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় লাভ অর্জন করুন।
          </p>

          {/* Button */}
          <div style={{ marginTop: "20px" }}>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 font-bold text-white shadow-md transition-transform active:scale-95"
              style={{
                backgroundColor: "#0b703e",
                borderRadius: "9999px",
                padding: "13px 30px",
                fontSize: "1rem",
              }}
            >
              বিনিয়োগ করুন →
            </Link>
          </div>
        </div>

        {/* Feature bar floating card */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "16px",
            right: "16px",
            zIndex: 10,
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 10px 30px rgba(0, 40, 20, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)",
            padding: "14px 8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Item 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px", color: "#0d5231" }}
              >
                trending_up
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              অর্থনৈতিক প্রবৃদ্ধি
            </span>
          </div>

          {/* Divider 1 */}
          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#E5E7EB",
              alignSelf: "center",
            }}
          />

          {/* Item 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px", color: "#0d5231" }}
              >
                handshake
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              নিরাপদ বিনিয়োগ
            </span>
          </div>

          {/* Divider 2 */}
          <div
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: "#E5E7EB",
              alignSelf: "center",
            }}
          />

          {/* Item 3 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px", color: "#0d5231" }}
              >
                lightbulb
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              উজ্জ্বল সম্ভাবনা
            </span>
          </div>
        </div>
      </div>

      {/* ── Desktop Hero (md and above) ── */}
      <div className="hidden md:flex relative overflow-hidden bg-white px-[5%] py-[4%] pt-24 sm:pt-28 lg:py-[4%] min-h-auto lg:min-h-[90vh] flex-col justify-center w-full">
        {/* Background Image (Desktop) */}
        <img
          src="/images/hero-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute top-0 bottom-0 right-0 left-auto h-full w-auto object-contain z-0 pointer-events-none"
          style={{ objectPosition: "center right" }}
          loading="eager"
          fetchPriority="high"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none hero-gradient-overlay" />

        {/* Desktop Hero Content */}
        <div className="relative z-[2] mx-auto w-full max-w-7xl">
          {/* Main Hero Content (Left 55% on desktop) */}
          <div className="w-full lg:max-w-[55%]">
            <motion.div
              className="w-full flex flex-col items-center lg:items-start text-center lg:text-left"
              initial={prefersReduced ? "show" : "hidden"}
              animate="show"
              variants={revealVariants}
            >
              {/* 1. Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#166534] bg-transparent px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#166534]">
                যাচাইকৃত বিনিয়োগ মডেল
              </div>

              {/* 2. Headline */}
              <div className="mt-5 sm:mt-6 w-full">
                <h1 className="sr-only">বাংলাদেশে যাচাইকৃত ব্যবসায় বিনিয়োগ করুন</h1>
                <div aria-hidden="true">
                  <FlipFadeText 
                    words={["সম্ভাবনাময় ব্যাবসা প্রতিষ্ঠানে বিনিয়োগ করুন"]}
                    textClassName="font-[900] leading-[1.18] text-[#111827] text-[clamp(2rem,4vw,3.5rem)] flex flex-wrap justify-center lg:justify-start text-center lg:text-left tracking-tight"
                    className="justify-center lg:justify-start min-h-[auto]"
                    staggerDelay={0.03}
                    letterDuration={0.4}
                    splitMode="word"
                  />
                </div>
              </div>

              {/* 3. Subtext */}
              <p className="mt-4 sm:mt-5 text-[#6B7280] text-[1.1rem] leading-relaxed max-w-xl">
                যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় লাভ অর্জন করুন।
              </p>

              {/* 4. Buttons row */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <motion.div
                  whileHover={prefersReduced ? {} : { y: -2, scale: 1.02 }}
                  whileTap={prefersReduced ? {} : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                >
                  <Link
                    to="/opportunities"
                    className="inline-flex items-center gap-2 rounded-full bg-[#166534] hover:bg-[#14532d] px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200"
                  >
                    বিনিয়োগের সুযোগ দেখুন →
                  </Link>
                </motion.div>
                <a
                  href={CONSULTANCY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-transparent hover:bg-gray-50 px-5 py-3 text-[14px] font-medium text-[#374151] transition-colors"
                >
                  <CalendarCheck className="h-4 w-4 text-[#166534]" />
                  Book one to one consultation service with Mohaimin Patwary
                </a>
              </div>

              {/* 5. Stats row (3 items) */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start divide-x divide-[#E5E7EB] pt-6 border-t border-[#E5E7EB] w-full max-w-lg">
                <div className="pr-4 sm:pr-6 text-center lg:text-left">
                  <div className="num text-2xl sm:text-3xl font-black text-[#111827]">
                    {stats.profitMin === stats.profitMax ? (
                      <CountUp to={stats.profitMin} suffix="%" duration={1.2} />
                    ) : (
                      <>
                        <CountUp to={stats.profitMin} duration={1.2} />-
                        <CountUp to={stats.profitMax} suffix="+%" duration={1.2} />
                      </>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-semibold text-[#6B7280]">
                    বার্ষিক লাভ
                  </div>
                </div>
                <div className="px-4 sm:px-6 text-center lg:text-left">
                  <div className="num text-2xl sm:text-3xl font-black text-[#111827]">
                    <CountUp to={stats.verifiedCount} suffix={stats.verifiedCount >= 10 ? "+" : ""} duration={1.2} />
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-semibold text-[#6B7280]">
                    যাচাইকৃত প্রজেক্ট
                  </div>
                </div>
                <div className="pl-4 sm:pl-6 text-center lg:text-left">
                  <div className="num text-2xl sm:text-3xl font-black text-[#111827]">
                    <CountUp to={100} suffix="%" duration={1.2} />
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-semibold text-[#6B7280]">
                    সুদ এবং ঘুরিয়ে সুদ মুক্ত
                  </div>
                </div>
              </div>

              {/* 6. Bottom feature icons row (3 items) */}
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#166534]">trending_up</span>
                  <span className="text-[12px] font-medium text-[#374151]">অর্থনৈতিক প্রবৃদ্ধি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#166534]">handshake</span>
                  <span className="text-[12px] font-medium text-[#374151]">নিরাপদ বিনিয়োগ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#166534]">lightbulb</span>
                  <span className="text-[12px] font-medium text-[#374151]">উজ্জ্বল সম্ভাবনা</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GrowthStatsSection({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const prefersReduced = usePrefersReducedMotion();

  // Card 1 — Growth stats
  const growthMetrics = useMemo(() => {
    const active = opportunities.filter((p) => isOpen(p)).length;
    let totalAmount = 0;
    opportunities.filter((p) => isOpen(p)).forEach((p) => {
      totalAmount += parseAmount(p.investment_amount);
    });
    let formattedAmount = "";
    if (totalAmount >= 10000000) {
      formattedAmount = `৳ ${(totalAmount / 10000000).toFixed(2)} কোটি`;
    } else if (totalAmount >= 100000) {
      formattedAmount = `৳ ${(totalAmount / 100000).toFixed(1)} লক্ষ`;
    } else {
      formattedAmount = `৳ ${totalAmount.toLocaleString()}`;
    }
    const rois = opportunities
      .map((p) => parseRoi(p.expected_profit))
      .filter((v): v is number => !isNaN(v) && v > 0);
    const avgRoi = rois.length > 0 ? (rois.reduce((a, b) => a + b, 0) / rois.length).toFixed(1) : "0";

    return {
      total: opportunities.length,
      active,
      totalAmountFormatted: formattedAmount,
      avgRoi,
    };
  }, [opportunities]);

  // Card 2 — Status distribution
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    opportunities.forEach((p) => {
      const s = p.status || "অজানা";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [opportunities]);

  // Card 3 — Recent opportunities
  const recentOpps = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3);
  }, [opportunities]);

  const growthBars = [
    { label: "মোট সুযোগ", value: growthMetrics.total, max: Math.max(growthMetrics.total, 1), color: "#146C43" },
    { label: "সক্রিয় সুযোগ", value: growthMetrics.active, max: Math.max(growthMetrics.total, 1), color: "#2FA36F" },
    { label: "গড় লাভ", value: parseFloat(growthMetrics.avgRoi), max: 100, color: "#0ea5e9", suffix: "%" },
  ];

  return (
    <section
      className="w-full bg-[#F9FAFB] py-16 px-[5%]"
      style={{ backgroundColor: "#F9FAFB", padding: "64px 5%" }}
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12">
        {/* Card 1 — Growth Stats */}
        <StickyNoteCard label="সামগ্রিক প্রবৃদ্ধি" delay={0.05} prefersReduced={prefersReduced}>
          <ul className="space-y-3">
            {growthBars.map((bar, i) => (
              <li key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">{bar.label}</span>
                  <span className="text-[11px] font-bold text-foreground num">
                    {bar.value}{bar.suffix || ""}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-border/60"
                  role="progressbar"
                  aria-valuenow={bar.value}
                  aria-valuemin={0}
                  aria-valuemax={bar.max}
                  aria-label={`${bar.label} progress`}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: bar.color }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: NOTE_EASE }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </StickyNoteCard>

        {/* Card 2 — Status Distribution */}
        <StickyNoteCard label="স্ট্যাটাস ডিস্ট্রিবিউশন" delay={0.18} prefersReduced={prefersReduced}>
          <div className="flex flex-col items-center">
            <div className="relative size-28">
              <StatusDonutChart data={statusData} total={opportunities.length} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground num">{opportunities.length}</span>
                <span className="text-[9px] text-muted-foreground">মোট</span>
              </div>
            </div>
            <div className="mt-3 w-full space-y-1.5">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: HERO_STATUS_COLORS[s.name] || "#94a3b8" }} />
                    <span className="text-xs font-medium text-muted-foreground truncate">{s.name.replace("বিনিয়োগ নেওয়া ", "")}</span>
                  </div>
                  <span className="text-xs font-bold num shrink-0">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </StickyNoteCard>

        {/* Card 3 — Recent Opportunities */}
        <StickyNoteCard label="নতুন সুযোগসমূহ" delay={0.31} prefersReduced={prefersReduced}>
          <div className="space-y-3">
            {recentOpps.map((opp, i) => {
              const catIcon = getCategoryIcon(opp.category);
              return (
                <motion.div
                  key={opp.id}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 shadow-note"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: 0.3 + i * 0.08, ease: NOTE_EASE }}
                  whileHover={prefersReduced ? {} : { y: -4, scale: 1.04 }}
                >
                  <span className={`flex size-8 items-center justify-center rounded-lg ${catIcon.bg}`}>
                    {catIcon.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">{opp.name}</p>
                    <p className="text-xs text-muted-foreground num">{opp.investment_amount}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </StickyNoteCard>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="num text-2xl font-bold text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "পছন্দের ব্যবসা নির্বাচন করুন",
    desc: "আমাদের যাচাইকৃত তালিকা থেকে আপনার লক্ষ্য মিলিয়ে পছন্দের ব্যবসা প্রতিষ্ঠানগুলো বেছে নিন।",
  },
  {
    title: "উদ্যোক্তার সাথে চুক্তি স্বাক্ষর করুন",
    desc: "লিগ্যাল ডকুমেন্টে চুক্তি করুন এবং চেক বুঝে নিন।",
  },
  {
    title: "সময় মত লাভ নিন",
    desc: "নির্দিষ্ট সময় অন্তর ব্যবসার লাভ লোকসানের উপর ভিত্তি করে নিজের ভাগ বুঝে নিন।",
  },
];

function HowItWorks() {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <section id="how" className="relative overflow-hidden border-t border-border bg-surface/75 backdrop-blur-[2px]">
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <SectionHeader eyebrow="কীভাবে কাজ করে" title="তিন ধাপে বিনিয়োগ শুরু করুন" />
        <motion.div
          variants={staggerContainer}
          initial={prefersReduced ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={revealVariants}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] card-hover sm:p-8"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary num">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 text-lg font-bold leading-tight sm:mt-5 sm:text-xl">
                {s.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Opportunities({ opportunities }: { opportunities: Opportunity[] }) {
  const prefersReduced = usePrefersReducedMotion();
  const isLoading = opportunities.length === 0;
  
  const previewList = useMemo(() => {
    let list = (opportunities || []).slice();
    list.sort((a, b) => Number(isFullyFunded(a)) - Number(isFullyFunded(b)));
    return list.slice(0, 6);
  }, [opportunities]);

  return (
    <section id="opportunities" className="border-t border-border bg-surface/75 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionHeader
              eyebrow="সক্রিয় সুযোগ"
              title="বর্তমানে চলমান বিনিয়োগের সুযোগ"
              align="left"
            />
            <p className="mt-4 text-muted-foreground">
              প্রতিটি সুযোগ যাচাইকৃত। ব্যাংক ও যোগাযোগের তথ্য নিরাপত্তা যাচাইয়ের
              পরে দৃশ্যমান।
            </p>
          </div>
          <div className="pill bg-card">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">
              <span className="num font-bold text-foreground">
                {(opportunities || []).filter((p) => !isFullyFunded(p)).length}
              </span>{" "}
              টি সক্রিয় সুযোগ
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial={prefersReduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {previewList.map((p, i) => (
                <motion.div key={p.id} variants={revealVariants}>
                  <OpportunityCard project={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
            
            <div className="mt-16 flex justify-center">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-background px-8 py-3.5 text-[15px] font-bold text-primary shadow-sm btn-hover hover:bg-primary hover:text-primary-foreground"
              >
                সব সুযোগ দেখুন
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function toBanglaDigits(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function calculateBlogReadingTime(html?: string): string {
  if (!html) return "২ মিনিট";
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${toBanglaDigits(minutes)} মিনিট পড়া`;
}

function formatBlogDateBengali(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    const day = toBanglaDigits(d.getDate());
    const year = toBanglaDigits(d.getFullYear());
    const monthsBn = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    const month = monthsBn[d.getMonth()];
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

function LatestBlogSection() {
  const prefersReduced = usePrefersReducedMotion();
  const { data: dbPosts = [], isLoading } = usePublishedBlogPosts();

  const posts = useMemo(() => {
    if (dbPosts.length > 0) {
      return dbPosts.slice(0, 3).map((post) => ({
        id: post.id,
        title: post.title,
        tag: post.category?.name || "ব্লগ",
        date: formatBlogDateBengali(post.published_at || post.created_at),
        readTime: calculateBlogReadingTime(post.content_html),
        excerpt: post.excerpt || "",
        image: post.cover_image_url || "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop",
        link: `/blog/${post.slug}`,
      }));
    }
    // Fallback articles if database has no posts yet
    return [
      {
        id: "fallback-1",
        title: "কেন 'বিনিয়োগ বৃদ্ধি'-তে বিনিয়োগ করবেন: একটি সম্পূর্ণ গাইড",
        tag: "বিনিয়োগ গাইড",
        date: "৩১ জুলাই ২০২৬",
        readTime: "৮ মিনিট পড়া",
        excerpt: "বাংলাদেশে যাচাইকৃত ও স্বচ্ছ উপায়ে SME ব্যবসায় বিনিয়োগের সুযোগ দিন দিন বাড়ছে। সঠিক প্ল্যাটফর্ম বেছে নেওয়ার গাইডলাইন...",
        image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop",
        link: "/insights/keno-somriddhite-biniyog",
      },
      {
        id: "fallback-2",
        title: "এসএমই (SME) খাতে লাভজনক বিনিয়োগের নিয়মাবলী",
        tag: "বিনিয়োগ গাইড",
        date: "১৫ আগস্ট ২০২৬",
        readTime: "৫ মিনিট পড়া",
        excerpt: "ছোট ও মাঝারি ব্যবসায় যাচাইকৃত উপায়ে কীভাবে বিনিয়োগ করবেন এবং লাভজনক মুনাফা নিশ্চিত করবেন তার বিস্তারিত দিকনির্দেশনা।",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
        link: "/insights/sme-halal-biniyog",
      },
      {
        id: "fallback-3",
        title: "বিনিয়োগের ঝুঁকি কমানোর কার্যকরী কৌশল",
        tag: "ঝুঁকি ব্যবস্থাপনা",
        date: "২৫ আগস্ট ২০২৬",
        readTime: "৬ মিনিট পড়া",
        excerpt: "যে কোনো ব্যবসায় বিনিয়োগে ঝুঁকি থাকে। সঠিক বিশ্লেষণ ও পোর্টফোলিও বৈচিত্র্যকরণের মাধ্যমে কীভাবে ঝুঁকি কমানো যায় তা জেনে নিন।",
        image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop",
        link: "/insights/krishi-khate-biniyog",
      }
    ];
  }, [dbPosts]);

  return (
    <section id="blog-preview" className="relative overflow-hidden border-t border-border bg-surface/75 backdrop-blur-[2px]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          eyebrow="সর্বশেষ ব্লগ ও ইনসাইটস"
          title="বিনিয়োগ ও ব্যবসা সম্পর্কিত সর্বশেষ ব্লগ"
          align="center"
        />
        
        {isLoading ? (
          <div className="mt-12 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial={prefersReduced ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={revealVariants}>
                <Link
                  to={post.link}
                  className="flex flex-col h-full overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elevated)] group"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3.5 left-3.5">
                      <span className="pill bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md text-primary font-bold shadow-sm border-none text-xs px-3 py-1">
                        {post.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium mb-3">
                      <span>{post.date}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2.5">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50 text-sm font-semibold text-primary">
                      <span>বিস্তারিত পড়ুন</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-14 flex justify-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-background px-8 py-3.5 text-[15px] font-bold text-primary shadow-sm btn-hover hover:bg-primary hover:text-primary-foreground transition-all"
          >
            সব ব্লগ পোস্ট দেখুন
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-[#000A0B] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-28"
      >
        <h2 className="text-3xl font-bold leading-tight sm:text-5xl text-white">
          আজই <span className="text-emerald-400">অংশীদার</span> হোন
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          দেশের সম্ভাবনাময় ব্যবসাগুলোতে বিনিয়োগ শুরু করুন।
        </p>
        <Link
          to="/opportunities"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] btn-hover"
          style={{ background: "var(--gradient-primary)" }}
        >
          বিনিয়োগ শুরু করুন
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}



function SectionHeader({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
}) {
  const cls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`${cls} max-w-2xl`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
