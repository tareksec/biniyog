import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { FaqSection } from "@/components/FaqSection";
import { PolicySection } from "@/components/PolicySection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { Loader2, CalendarCheck, MapPin, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { usePrefersReducedMotion, revealVariants, staggerContainer, scaleIn } from "@/lib/animations";
import { FlipFadeText } from "@/components/ui/flip-fade-text";

type OpportunitiesSearch = {
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/")({
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
      className="homepage-bg min-h-screen text-foreground antialiased"
      style={{
        backgroundColor: "#f4fbf5",
      }}
    >
      {/* Full-page readability overlay — sits between fixed BG image and all sections */}
      <div
        className="homepage-overlay pointer-events-none fixed inset-0 z-0"
        style={{ background: "rgba(244, 251, 245, 0.45)" }}
        aria-hidden
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "সমৃদ্ধি",
            url: "https://samriddhi.techvrs.com",
            logo: "https://samriddhi.techvrs.com/favicon.svg",
            description: "সমৃদ্ধি একটি বিশ্বস্ত ও নিরাপদ হালাল বিনিয়োগ প্ল্যাটফর্ম।",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+880-1616-248740",
              contactType: "Customer Service",
              areaServed: "BD",
              availableLanguage: ["Bengali", "English"]
            },
            sameAs: [
              "https://www.facebook.com/groups/samriddhi.techvrs.bd",
              "https://www.youtube.com/@Samriddhibd"
            ]
          }),
        }}
      />
      <Hero stats={heroStats} opportunities={opportunities} />
      <WhyChooseSection />
      <PolicySection />
      <InstructorSection />
      <Opportunities opportunities={opportunities} />
      <HowItWorks />
      <div className="bg-background/75 backdrop-blur-[2px]">
        <InvestmentCalculator />
      </div>
      <TestimonialsSection />
      <FaqSection />
      <FinalCTA />
      
      {/* Sticky Mobile CTA — pushed above the bottom dock to avoid overlap */}
      <div className="fixed bottom-16 left-0 right-0 z-[51] p-4 bg-background/80 backdrop-blur-md border-t border-border/50 md:hidden pb-[max(env(safe-area-inset-bottom),1rem)]">
        <Link
          to="/opportunities"
          className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-lg btn-hover"
          style={{ background: "var(--gradient-primary)" }}
        >
          বিনিয়োগ শুরু করুন
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
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

function Hero({
  stats,
  opportunities,
}: {
  stats: { profitMin: number; profitMax: number; verifiedCount: number };
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
    <section id="top" className="relative z-[1] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:pt-32 lg:pb-24">
        {/* ── Text block ── */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={prefersReduced ? "show" : "hidden"}
          animate="show"
          variants={revealVariants}
        >
          <span className="pill">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-muted-foreground">যাচাইকৃত · বিনিয়োগ মডেল</span>
          </span>

          <div className="mt-7">
            <h1 className="sr-only">দেশের সম্ভাবনাময় ব্যবসায় বিনিয়োগ করুন</h1>
            <div aria-hidden="true">
              <FlipFadeText 
                words={["দেশের সম্ভাবনাময় ব্যবসায় বিনিয়োগ করুন"]}
                textClassName="text-4xl font-extrabold leading-[1.15] text-foreground sm:text-5xl lg:text-[3.5rem] flex flex-wrap justify-center text-center"
                className="justify-center min-h-[auto]"
                staggerDelay={0.03}
                letterDuration={0.4}
                splitMode="word"
              />
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় লাভ অর্জন করুন।
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              whileHover={prefersReduced ? {} : { y: -3, scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <Link
                to="/opportunities"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#163832] px-7 py-3.5 text-[15px] font-semibold text-white shadow-note hover:shadow-note-lift transition-shadow duration-300"
              >
                বিনিয়োগের সুযোগ দেখুন
                <motion.span
                  className="inline-flex"
                  animate={prefersReduced ? {} : { rotate: [0, 14, -8, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="size-4" />
                </motion.span>
              </Link>
            </motion.div>
            <a
              href={CONSULTANCY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[15px] font-medium text-foreground"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card shadow-sm transition group-hover:border-primary/40 group-hover:text-primary">
                <CalendarCheck className="h-5 w-5" />
              </span>
              Book one to one consultation service with Mohaimin Patwary
            </a>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-7">
            <Stat 
              value={
                stats.profitMin === stats.profitMax 
                  ? <><CountUp to={stats.profitMin} suffix="%" duration={1.2} /></>
                  : <><CountUp to={stats.profitMin} duration={1.2} />-<CountUp to={stats.profitMax} suffix="+%" duration={1.2} /></>
              } 
              label="বার্ষিক লাভ" 
            />
            <Stat 
              value={<CountUp to={stats.verifiedCount} suffix={stats.verifiedCount >= 10 ? "+" : ""} duration={1.2} />} 
              label="যাচাইকৃত প্রজেক্ট" 
            />
            <Stat 
              value={<CountUp to={100} suffix="%" duration={1.2} />} 
              label="সুদ এবং ঘুরিয়ে সুদ মুক্ত" 
            />
          </div>
        </motion.div>

        {/* ── Pinned sticky-note cards ── */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12 lg:mt-20">
          {/* Card 1 — Growth Stats */}
          <StickyNoteCard label="সামগ্রিক প্রবৃদ্ধি" delay={0.05} prefersReduced={prefersReduced}>
            <div className="mb-3">
              <p className="text-xs font-semibold text-foreground">{growthMetrics.totalAmountFormatted}</p>
              <p className="text-[11px] text-muted-foreground">মোট বিনিয়োগযোগ্য পরিমাণ</p>
            </div>
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={HERO_STATUS_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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
                      <span className="text-[10px] font-semibold text-muted-foreground truncate">{s.name.replace("বিনিয়োগ নেওয়া ", "")}</span>
                    </div>
                    <span className="text-[11px] font-bold num shrink-0">{s.value}</span>
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
                      <p className="text-[11px] font-semibold text-foreground truncate leading-tight">{opp.name}</p>
                      <p className="text-[10px] text-muted-foreground num">{opp.investment_amount}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </StickyNoteCard>
        </div>
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
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.5rem]">
        {title}
      </h2>
    </div>
  );
}
