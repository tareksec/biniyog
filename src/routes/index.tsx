import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useProjects, isFullyFunded, parseAmount, parseRoi } from "@/lib/projects";
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
      <Nav />
      <Hero />
      <WhyChoose />
      <HowItWorks />
      <InstructorSection />
      <Opportunities />
      <div className="bg-background">
        <InvestmentCalculator />
      </div>
      <TestimonialsSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

const revealItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
} as const;

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
            </svg>
          </span>
          <span className="text-lg font-bold leading-none">বিনিয়োগ বৃদ্ধি</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="প্রধান নেভিগেশন">
          <a href="#why" className="transition hover:text-primary">কেন আমরা</a>
          <a href="#how" className="transition hover:text-primary">কীভাবে কাজ করে</a>
          <a href="#expert" className="transition hover:text-primary">এক্সপার্ট</a>
          <a href="#opportunities" className="transition hover:text-primary">সুযোগসমূহ</a>
          <Link to="/insights" className="transition hover:text-primary">ইনসাইটস</Link>
          <Link to="/dashboard" className="transition hover:text-primary">ড্যাশবোর্ড</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#opportunities"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.03] md:inline-flex"
          >
            বিনিয়োগ শুরু করুন
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </a>
          {/* Mobile hamburger */}
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card shadow-sm md:hidden"
            aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {open && (
        <nav className="border-t border-border bg-background/95 backdrop-blur px-5 pb-4 md:hidden" aria-label="মোবাইল নেভিগেশন">
          <div className="flex flex-col gap-1 pt-2 text-sm font-medium">
            {[
              { href: "#why", label: "কেন আমরা" },
              { href: "#how", label: "কীভাবে কাজ করে" },
              { href: "#expert", label: "এক্সপার্ট" },
              { href: "#opportunities", label: "সুযোগসমূহ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-muted-foreground transition hover:bg-surface hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <Link to="/insights" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-muted-foreground transition hover:bg-surface hover:text-primary">
              ইনসাইটস
            </Link>
            <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-muted-foreground transition hover:bg-surface hover:text-primary">
              ড্যাশবোর্ড
            </Link>
            <a
              href="#opportunities"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              বিনিয়োগ শুরু করুন
            </a>
          </div>

          <p className="mt-6 text-xs sm:text-sm font-semibold text-destructive/90 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            সতর্কতা: বিনিয়োগ মানেই ঝুঁকি আছে। নিজ দায়িত্বে বুঝে বিনিয়োগ করুন।
          </p>
        </nav>
      )}
    </header>
  );
}

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
            <span className="text-muted-foreground">যাচাইকৃত · পার্টনারশিপ মডেল</span>
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-[3.6rem]">
            সঠিক বিনিয়োগে দেশের{" "}
            <span className="gradient-text">সম্ভাবনাময় ব্যবসায়</span>{" "}
            অংশীদার হোন
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত SME এবং উঠতি স্টার্টআপে স্বচ্ছ উপায়ে
            আকর্ষণীয় মুনাফা অর্জন করুন।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.03]"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </a>
            <a
              href="#how"
              className="group inline-flex items-center gap-3 text-[15px] font-medium text-foreground"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card shadow-sm transition group-hover:border-primary/40 group-hover:text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4l14 8-14 8V4z" />
                </svg>
              </span>
              কীভাবে কাজ করে
            </a>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-7 text-left">
            <Stat value="১৮%–৩৩%" label="বার্ষিক মুনাফা" />
            <Stat value="১৫+" label="যাচাইকৃত প্রজেক্ট" />
            <Stat value="১০০%" label="শরীয়াহ কমপ্লায়েন্ট" />
          </div>
        </div>

        <div data-hero-art className="relative mx-auto w-full max-w-[480px] flex items-center justify-center">
          {/* Subtle glowing background behind the transparent image */}
          <motion.div 
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full mix-blend-multiply" 
          />
          <motion.div 
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute inset-10 bg-[var(--primary-glow)] blur-[60px] rounded-full mix-blend-multiply" 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full"
          >
            <motion.img 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              src={heroImage} 
              alt="Business Investment Growth" 
              className="w-full h-auto drop-shadow-2xl"
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
    label: "যাচাইকৃত বিনিয়োগ",
    desc: "প্রতিটি বিনিয়োগে লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করা হয়।",
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    ),
  },
  {
    label: "স্বচ্ছ পার্টনারশিপ",
    desc: "পার্টনারশিপ মডেলে মুনাফা-ক্ষতি ভাগাভাগি — সম্পূর্ণ স্বচ্ছ চুক্তি ও রিপোর্টিং।",
    icon: <path d="M12 3v18M5 8a7 7 0 0 0 7 4 7 7 0 0 0 7-4" />,
  },
  {
    label: "আকর্ষণীয় মুনাফা",
    desc: "১৮%–৩৩% পর্যন্ত সম্ভাব্য বার্ষিক মুনাফা, স্বচ্ছ পেআউট শিডিউলে।",
    icon: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  },
  {
    label: "সরাসরি যোগাযোগ ও চুক্তি",
    desc: "কোনো মধ্যস্থতাকারী ছাড়াই ব্যবসায়ীর সাথে সরাসরি যোগাযোগ ও চুক্তি করুন। সম্পূর্ণ দায়িত্ব ও সিদ্ধান্ত আপনার নিজের।",
    icon: <path d="M8 10h.01M12 10h.01M16 10h.01M21 12a8 8 0 0 1-11.6 7.2L3 21l1.8-6.4A8 8 0 1 1 21 12z" />,
  },
  {
    label: "সুদ বিরোধী ব্যবসা যাচাই",
    desc: "এমন কোনো প্রতিষ্ঠান রাখা হয় না যারা একই সাথে সুদে ঋণ নেয় এবং বিনিয়োগও নেয়। সব ব্যবসা যাচাই করে তালিকাভুক্ত করা হয়।",
    icon: <path d="M9 12l2 2 4-4M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />,
  },
  {
    label: "সরেজমিনে যাচাইয়ের সুযোগ",
    desc: "বিনিয়োগকারী যেকোনো সময় ব্যবসাপ্রতিষ্ঠান ও হিসাব সরাসরি গিয়ে যাচাই করতে পারবেন — সবসময় প্রবেশাধিকার থাকবে।",
    icon: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  },
];

function WhyChoose() {
  return (
    <section id="why" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        <SectionHeader
          eyebrow="কেন আমরা"
          title="বিশ্বস্ত বিনিয়োগের জন্য"
        />
        <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {WHY.map((w, i) => (
            <motion.div
              key={w.label}
              variants={revealItem}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] sm:p-7"
            >
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
              <a
                href="#opportunities"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5 sm:mt-6"
              >
                আরও জানুন
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
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
    desc: "যাচাইকৃত SME ও স্টার্টআপের তালিকা থেকে আপনার লক্ষ্য মিলিয়ে বেছে নিন।",
  },
  {
    title: "উদ্যোক্তার সাথে চুক্তি স্বাক্ষর করুন",
    desc: "পার্টনারশিপ চুক্তি — লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক সহ।",
  },
  {
    title: "বিনিয়োগ করুন, মুনাফা নিন",
    desc: "নির্দিষ্ট সময় অন্তর সম্মত পদ্ধতিতে মুনাফা বুঝে নিন।",
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
  const { data: projects } = useProjects();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const category = search.category || "all";
  const sort = (search.sort as SortKey) || "default";

  const setCategory = (c: string) => navigate({ search: (prev) => ({ ...prev, category: c }), replace: true });
  const setSort = (s: SortKey) => navigate({ search: (prev) => ({ ...prev, sort: s }), replace: true });

  const filtered = useMemo(() => {
    let list = (projects || []).slice();
    if (category !== "all") list = list.filter((p) => p.business_type === category);
    switch (sort) {
      case "investment_asc":
        list.sort((a, b) => parseAmount(a.investment_required) - parseAmount(b.investment_required));
        break;
      case "investment_desc":
        list.sort((a, b) => parseAmount(b.investment_required) - parseAmount(a.investment_required));
        break;
      case "roi_desc":
        list.sort((a, b) => parseRoi(b.expected_profit_annual) - parseRoi(a.expected_profit_annual));
        break;
      default:
        // funded last
        list.sort((a, b) => Number(isFullyFunded(a)) - Number(isFullyFunded(b)));
    }
    return list;
  }, [category, sort, projects]);

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
                {filtered.filter((p) => !isFullyFunded(p)).length}
              </span>{" "}
              টি সক্রিয় সুযোগ
            </span>
          </div>
        </div>

        <OpportunityFilters
          projects={projects || []}
          category={category}
          onCategory={setCategory}
          sort={sort}
          onSort={setSort}
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <div key={p.id}>
              <OpportunityCard project={p} index={i} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            এই ক্যাটাগরিতে বর্তমানে কোনো সুযোগ নেই।
          </p>
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
        <a
          href="#opportunities"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.03]"
          style={{ background: "var(--gradient-primary)" }}
        >
          বিনিয়োগের সুযোগগুলো দেখুন
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
            </svg>
          </span>
          <span className="font-bold text-foreground">বিনিয়োগ বৃদ্ধি</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={CONSULTANCY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            📋 কনসালট্যান্সি
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.26V22H7.72V8z" />
            </svg>
            LinkedIn
          </a>
        </div>
        <p>© {new Date().getFullYear()} · বিনিয়োগ প্ল্যাটফর্ম</p>
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  const cls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`${cls} max-w-2xl`}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.5rem]">
        {title}
      </h2>
    </div>
  );
}
