import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useOpportunities, isFullyFunded, parseAmount, parseRoi } from "@/lib/projects";
import type { Opportunity } from "@/lib/projects";
import { HeroIllustration } from "@/components/HeroIllustration";
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
import heroImage from "@/hero/hero.png";
import { PolicySection } from "@/components/PolicySection";
import { Loader2, CalendarCheck } from "lucide-react";
import { usePrefersReducedMotion, revealVariants, staggerContainer, scaleIn } from "@/lib/animations";
import { FlipFadeText } from "@/components/ui/flip-fade-text";

type OpportunitiesSearch = {
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const { fetchOpportunitiesSSR } = await import("@/lib/projects");
    await context.queryClient.ensureQueryData({
      queryKey: ["opportunities"],
      queryFn: fetchOpportunitiesSSR,
    });
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
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Hero stats={heroStats} />
      <WhyChoose />
      <PolicySection />
      <InstructorSection />
      <Opportunities opportunities={opportunities} />
      <HowItWorks />
      <div className="bg-background">
        <InvestmentCalculator />
      </div>
      <TestimonialsSection />
      <FaqSection />
      <FinalCTA />
      
      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 md:hidden pb-[max(env(safe-area-inset-bottom),1rem)]">
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

function Hero({ stats }: { stats: { profitMin: number; profitMax: number; verifiedCount: number } }) {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <section id="top" className="relative overflow-hidden bg-surface dot-pattern">
      <div
        className="pointer-events-none absolute inset-0 bg-background/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pt-20 pb-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pt-28 lg:pb-24">
        <motion.div
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

          <div className="mt-6">
            <h1 className="sr-only">দেশের সম্ভাবনাময় ব্যবসায় বিনিয়োগ করুন</h1>
            <div aria-hidden="true">
              <FlipFadeText 
                words={["দেশের সম্ভাবনাময় ব্যবসায় বিনিয়োগ করুন"]}
                textClassName="text-3xl font-bold leading-[1.25] tracking-tight text-foreground sm:text-4xl md:text-[3.2rem] flex flex-wrap justify-start text-left"
                className="justify-start min-h-[auto]"
                staggerDelay={0.03}
                letterDuration={0.4}
              />
            </div>
          </div>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় লাভ অর্জন করুন।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] btn-hover"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
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

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-7 text-left">
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
              label="সুদ এবং ঘুরিয়ে সুদ মুক্ত" 
            />
          </div>
        </motion.div>

        <div data-hero-art className="relative mx-auto w-full max-w-[620px] lg:max-w-[720px] flex items-center justify-center py-2 lg:-mr-6 scale-105 sm:scale-110 lg:scale-115 transition-all">
          {/* Static ambient glow for mobile (performance) */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-emerald-500/20 to-teal-400/20 blur-[60px] rounded-full pointer-events-none -z-10 md:hidden" />
          <div className="absolute inset-8 bg-primary/25 blur-[40px] rounded-full pointer-events-none -z-10 md:hidden" />

          {/* Animated vibrant ambient glow behind the hero image (desktop only) */}
          <motion.div 
            animate={prefersReduced ? {} : { opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-emerald-500/20 to-teal-400/20 blur-[70px] rounded-full pointer-events-none -z-10 hidden md:block" 
          />
          <motion.div 
            animate={prefersReduced ? {} : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute inset-8 bg-primary/25 blur-[50px] rounded-full pointer-events-none -z-10 hidden md:block" 
          />
          
          <motion.div
            initial={prefersReduced ? "show" : "hidden"}
            animate="show"
            variants={scaleIn}
            className="relative z-10 w-full flex items-center justify-center"
          >
            <motion.img 
              animate={prefersReduced ? {} : { y: [-8, 8] }}
              transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              src={heroImage} 
              alt="Business Investment Growth" 
              className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-[1.03]"
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="num text-2xl font-bold text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const WHY_COLORS = [
  { tint: "var(--card-tint-1)", solid: "var(--card-solid-1)", border: "var(--card-border-1)", text: "var(--card-text-1)" },
  { tint: "var(--card-tint-2)", solid: "var(--card-solid-2)", border: "var(--card-border-2)", text: "var(--card-text-2)" },
  { tint: "var(--card-tint-3)", solid: "var(--card-solid-3)", border: "var(--card-border-3)", text: "var(--card-text-3)" },
  { tint: "var(--card-tint-4)", solid: "var(--card-solid-4)", border: "var(--card-border-4)", text: "var(--card-text-4)" },
];

const WHY = [
  {
    label: "ব্যবসায়ীর সাথে সরাসরি সংযোগ",
    desc: "আপনার ও ব্যবসায়ীর মাঝে সরাসরি যোগাযোগ এবং সম্পর্ক হবে। মাঝে কেউ থাকবে না।",
    iconPath: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    colorIndex: 0,
    hash: "connect",
  },
  {
    label: "সুদ মুক্ত আয়",
    desc: "সকল প্রকার আয় সুদ মুক্ত। কোন প্রকার বাহানা ও ঘুরিয়ে সুদ খাওয়ার সুযোগ নেই।",
    iconPath: <path d="M9 12l2 2 4-4M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />,
    colorIndex: 1,
    hash: "interest-free",
  },
  {
    label: "আইনি সুরক্ষা",
    desc: "প্রতিটি বিনিয়োগ লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করে করবেন।",
    iconPath: <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />,
    colorIndex: 2,
    hash: "legal",
  },
  {
    label: "স্বচ্ছ চুক্তি",
    desc: "প্রতি মাসের হিসাব প্রদর্শন বাবদ লাভ-ক্ষতি ভাগাভাগি — সম্পূর্ণ স্বচ্ছ রিপোর্টিং।",
    iconPath: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </>
    ),
    colorIndex: 3,
    hash: "transparent",
  },
  {
    label: "আকর্ষণীয় লাভ",
    desc: "অনেক ভালো লাভ পাবার সম্ভাবনা",
    iconPath: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
    colorIndex: 0,
    hash: "returns",
  },
  {
    label: "বিনিয়োগের আগে ও পরে সরেজমিনে যাচাইয়ের সুযোগ",
    desc: "বিনিয়োগকারী যেকোনো সময় ব্যবসাপ্রতিষ্ঠান ও হিসাব সরাসরি নিজে গিয়ে যাচাই করতে পারবেন।",
    iconPath: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
    colorIndex: 1,
    hash: "verify",
  },
  {
    label: "সমাজের জন্য কল্যাণকর ব্যবসা",
    desc: "ক্ষতিকর পণ্য, ফটকাবাজি, জুয়া, অস্বাস্থ্যকর খাবার ।  এমন ব্যবসাকে  বাছাই করা হয় না |",
    iconPath: (
      <>
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
      </>
    ),
    colorIndex: 2,
    hash: "social",
  },
  {
    label: "স্বাধীন সিদ্ধান্ত",
    desc: "নিজে যাচাই বাছাই করে স্বাধীন ভাবে সিদ্ধান্ত নিবেন।",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </>
    ),
    colorIndex: 3,
    hash: "connect",
  },
];

function WhyChoose() {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <section id="why" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <SectionHeader
          title="কেন আমরা"
        />
        <motion.div
          variants={staggerContainer}
          initial={prefersReduced ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {WHY.map((w, i) => {
            const c = WHY_COLORS[w.colorIndex];
            return (
              <motion.div
                key={w.label}
                variants={revealVariants}
                onClick={() => {
                  window.location.href = `/insights/keno-somriddhite-biniyog#${w.hash}`;
                }}
                className="why-card group relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer"
                style={{
                  backgroundColor: c.tint,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: c.border,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <span
                    className="why-card-badge grid h-12 w-12 place-items-center rounded-[14px]"
                    style={{ backgroundColor: c.solid }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {w.iconPath}
                    </svg>
                  </span>
                  <h3
                    className="mt-4 text-base font-medium leading-snug sm:mt-4"
                    style={{ color: c.text }}
                  >
                    {w.label}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground sm:text-[13.5px]">
                    {w.desc}
                  </p>
                </div>
                <div
                  className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-200 group-hover:gap-2.5 sm:mt-6"
                  style={{ color: c.text }}
                >
                  আরও জানুন
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
                <span
                  aria-hidden
                  className="num pointer-events-none absolute -bottom-3 right-4 text-[56px] font-bold select-none"
                  style={{ color: c.text, opacity: 0.06 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center sm:mt-12">
          <Link
            to="/insights/keno-somriddhite-biniyog"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-[15px] font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-[var(--shadow-elevated)]"
          >
            বিস্তারিত পড়ুন
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
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
    <section id="how" className="relative overflow-hidden border-t border-border bg-surface">
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
    <section id="opportunities" className="border-t border-border bg-surface">
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
    <section className="relative overflow-hidden border-t border-border bg-[#051F20] text-white">
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
