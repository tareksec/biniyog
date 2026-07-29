import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useOpportunities, isFullyFunded, parseAmount, parseRoi } from "@/lib/projects";
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

type OpportunitiesSearch = {
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): OpportunitiesSearch => {
    return {
      category: search.category as string | undefined,
      sort: search.sort as string | undefined,
    };
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Hero />
      <WhyChoose />
      <PolicySection />
      <InstructorSection />
      <Opportunities />
      <HowItWorks />
      <div className="bg-background">
        <InvestmentCalculator />
      </div>
      <TestimonialsSection />
      <FaqSection />
      <FinalCTA />
    </div>
  );
}

const revealItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
} as const;

function Hero() {
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
        <div>
          <span className="pill">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-muted-foreground">যাচাইকৃত · বিনিয়োগ মডেল</span>
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-[3.6rem]">
            দেশের <span className="gradient-text">সম্ভাবনাময় ব্যবসায়</span>{" "}
            বিনিয়োগ করুন
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় লাভ অর্জন করুন।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.03]"
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
            <Stat value="১৮-২৫+%" label="বার্ষিক লাভ" />
            <Stat value="১৫+" label="যাচাইকৃত প্রজেক্ট" />
            <Stat value="১০০%" label="সুদ এবং ঘুরিয়ে সুদ মুক্ত" />
          </div>
        </div>

        <div data-hero-art className="relative mx-auto w-full max-w-[620px] lg:max-w-[720px] flex items-center justify-center py-2 lg:-mr-6 scale-105 sm:scale-110 lg:scale-115 transition-all">
          {/* Vibrant ambient glow behind the hero image */}
          <motion.div 
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-emerald-500/20 to-teal-400/20 blur-[70px] rounded-full pointer-events-none -z-10" 
          />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute inset-8 bg-primary/25 blur-[50px] rounded-full pointer-events-none -z-10" 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full flex items-center justify-center"
          >
            <motion.img 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              src={heroImage} 
              alt="Business Investment Growth" 
              className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-transform duration-500 hover:scale-[1.03]"
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
      <div className="mt-1 text-xs text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const WHY = [
  {
    label: "ব্যবসায়ীর সাথে সরাসরি সংযোগ",
    desc: "আপনার ও ব্যবসায়ীর মাঝে সরাসরি যোগাযোগ এবং সম্পর্ক হবে। মাঝে কেউ থাকবে না।",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: "সুদ মুক্ত আয়",
    desc: "সকল প্রকার আয় সুদ মুক্ত। কোন প্রকার বাহানা ও ঘুরিয়ে সুদ খাওয়ার সুযোগ নেই।",
    icon: <path d="M9 12l2 2 4-4M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />,
  },

  {
    label: "আইনি সুরক্ষা",
    desc: "প্রতিটি বিনিয়োগ লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করে করবেন।",
    icon: <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />,
  },
  {
    label: "স্বচ্ছ চুক্তি",
    desc: "প্রতি মাসের হিসাব প্রদর্শন বাবদ লাভ-ক্ষতি ভাগাভাগি — সম্পূর্ণ স্বচ্ছ রিপোর্টিং।",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </>
    ),
  },
  {
    label: "আকর্ষণীয় লাভ",
    desc: "২৫+% পর্যন্ত সম্ভাব্য বার্ষিক লাভের সম্ভাবনা।",
    icon: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  },
  {
    label: "বিনিয়োগের আগে ও পরে সরেজমিনে যাচাইয়ের সুযোগ",
    desc: "বিনিয়োগকারী যেকোনো সময় ব্যবসাপ্রতিষ্ঠান ও হিসাব সরাসরি নিজে গিয়ে যাচাই করতে পারবেন।",
    icon: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  },
  {
    label: "সমাজের জন্য কল্যাণকর ব্যবসা",
    desc: "ক্ষতিকর পণ্য, ফটকাবাজি, জুয়া, অস্বাস্থ্যকর খাবার ।  এমন ব্যবসাকে  বাছাই করা হয় না |",
    icon: (
      <>
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
      </>
    ),
  },
  {
    label: "স্বাধীন সিদ্ধান্ত",
    desc: "নিজে যাচাই বাছাই করে স্বাধীন ভাবে সিদ্ধান্ত নিবেন।",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </>
    ),
  },
];

function WhyChoose() {
  return (
    <section id="why" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <SectionHeader
          title="কেন আমরা"
        />
        <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, i) => (
            <motion.div
              key={w.label}
              variants={revealItem}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] sm:p-7 flex flex-col justify-between"
            >
              <div>
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {w.icon}
                  </svg>
                </span>
                <h3 className="mt-5 text-lg font-bold leading-tight sm:mt-6 sm:text-xl">
                  {w.label}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm">
                  {w.desc}
                </p>
              </div>
              <Link
                to="/opportunities"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5 sm:mt-6"
              >
                আরও জানুন
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <span
                aria-hidden
                className="num pointer-events-none absolute -bottom-4 right-4 text-6xl font-bold text-primary/10"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.div>
          ))}
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
  return (
    <section id="how" className="relative overflow-hidden border-t border-border bg-surface">
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <SectionHeader eyebrow="কীভাবে কাজ করে" title="তিন ধাপে বিনিয়োগ শুরু করুন" />
        <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={revealItem}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] sm:p-8"
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
        </div>
      </div>
    </section>
  );
}

function Opportunities() {
  const { data: projects, isLoading } = useOpportunities();
  
  const previewList = useMemo(() => {
    let list = (projects || []).slice();
    list.sort((a, b) => Number(isFullyFunded(a)) - Number(isFullyFunded(b)));
    return list.slice(0, 6);
  }, [projects]);

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
                {(projects || []).filter((p) => !isFullyFunded(p)).length}
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
            <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {previewList.map((p, i) => (
                <div key={p.id}>
                  <OpportunityCard project={p} index={i} />
                </div>
              ))}
            </div>
            
            <div className="mt-16 flex justify-center">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-background px-8 py-3.5 text-[15px] font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:scale-[1.02]"
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
    <section className="relative overflow-hidden border-t border-border bg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-28">
        <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
          আজই <span className="gradient-text">অংশীদার</span> হোন
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          দেশের সম্ভাবনাময় ব্যবসাগুলোতে বিনিয়োগ শুরু করুন।
        </p>
        <Link
          to="/opportunities"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.03]"
          style={{ background: "var(--gradient-primary)" }}
        >
          বিনিয়োগ শুরু করুন
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
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
