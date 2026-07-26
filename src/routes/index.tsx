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
import { Loader2 } from "lucide-react";
import { PolicySection } from "@/components/PolicySection";

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
  // ─── SCROLL RESTORATION ───
  useEffect(() => {
    // Restore scroll position on mount
    const savedScroll = sessionStorage.getItem("landing_scroll_pos");
    if (savedScroll) {
      // Small timeout to allow the page and dynamic data to render
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
      }, 150);
    }

    // Save scroll position on scroll (debounced)
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem("landing_scroll_pos", window.scrollY.toString());
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <InstructorSection />
      <Opportunities />
      <WhyChoose />
      <PolicySection />
      <HowItWorks />
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
  const [activeSection, setActiveSection] = useState("");

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    
    const sections = ["top", "why", "how", "expert", "opportunities"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  const links = [
    { href: "#why", id: "why", label: "কেন আমরা" },
    { href: "#how", id: "how", label: "কীভাবে কাজ করে" },
    { href: "#expert", id: "expert", label: "এক্সপার্ট" },
    { href: "#opportunities", id: "opportunities", label: "সুযোগসমূহ" },
  ];

  return (
    <>
      <header className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-5xl rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-[12px] sm:px-6 transition-all duration-300">
        <div className="flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 transition-transform hover:scale-105" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
              </svg>
            </span>
            <span className="text-lg font-bold leading-none tracking-tight">সমৃদ্ধি</span>
          </a>
          
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="প্রধান নেভিগেশন">
            {links.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <a
                  key={l.id}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-[14.5px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
            <div className="mx-2 h-4 w-px bg-border/80"></div>
            <Link to="/insights" className="rounded-full px-4 py-2 text-[14.5px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">ইনসাইটস</Link>
            <Link to="/dashboard" className="rounded-full px-4 py-2 text-[14.5px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">ড্যাশবোর্ড</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <a
              href="#opportunities"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.03] hover:shadow-lg md:inline-flex"
            >
              বিনিয়োগ শুরু করুন
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </span>
            </a>
            
            {/* Mobile hamburger */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-muted/50 text-foreground transition hover:bg-muted active:scale-95 md:hidden"
              aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M4 12h16M4 6h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity md:hidden">
          <nav className="absolute left-4 right-4 top-24 rounded-3xl border border-border/50 bg-background/95 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-200" aria-label="মোবাইল নেভিগেশন">
            <div className="flex flex-col gap-1 text-[15px] font-medium">
              {links.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-5 py-3.5 transition-colors ${
                      isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="my-2 h-px w-full bg-border/50"></div>
              <Link to="/insights" onClick={() => setOpen(false)} className="rounded-2xl px-5 py-3.5 text-muted-foreground transition hover:bg-surface hover:text-foreground">
                ইনসাইটস
              </Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-2xl px-5 py-3.5 text-muted-foreground transition hover:bg-surface hover:text-foreground">
                ড্যাশবোর্ড
              </Link>
              <a
                href="#opportunities"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-full bg-primary px-5 py-4 text-center font-bold text-primary-foreground shadow-md transition active:scale-95"
              >
                বিনিয়োগ শুরু করুন
              </a>
            </div>
            
            <p className="mt-6 text-center text-xs font-semibold text-destructive/90 flex items-center justify-center gap-1.5 opacity-80 leading-relaxed px-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>সতর্কতা: বিনিয়োগ মানেই ঝুঁকি ও সম্ভাবনা। সুদ আর বিনিয়োগ এক বিষয় না। সরাসরি ব্যবসায়ীর সাথে যোগাযোগের মাধ্যমে নিজে বুঝে বিনিয়োগ সিদ্ধান্ত গ্রহণ করুন।</span>
            </p>
          </nav>
        </div>
      )}
    </>
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
            <span className="text-muted-foreground">যাচাইকৃত · বিনিয়োগ মডেল</span>
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-[3.6rem]">
            সঠিক বিনিয়োগে দেশের{" "}
            <span className="gradient-text">সম্ভাবনাময় ব্যবসায়</span>{" "}
            অংশীদার হোন
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত SME এবং জাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে আকর্ষণীয় মুনাফা অর্জন করুন।
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
            <Stat value="১৮%–২৫%" label="বার্ষিক মুনাফা" />
            <Stat value="১৫+" label="যাচাইকৃত প্রজেক্ট" />
            <Stat value="১০০%" label="সুদ এবং ঘুরিয়ে সুদ মুক্ত" />
          </div>

          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-400 flex items-start gap-2.5 max-w-xl shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span><strong className="font-semibold">সতর্কতা:</strong> বিনিয়োগ মানেই ঝুঁকি ও সম্ভাবনা। সুদ আর বিনিয়োগ এক বিষয় না। সরাসরি ব্যবসায়ীর সাথে যোগাযোগের মাধ্যমে নিজে বুঝে বিনিয়োগ সিদ্ধান্ত গ্রহণ করুন।</span>
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
    label: "সমাজের জন্য কল্যাণকর ব্যবসা",
    desc: "ক্ষতিকর পণ্য, ফটকাবাজি, জালিয়াতি, জুয়া, অস্বাস্থ্যকর খাবার, মাপে কম দেওয়া, পণ্যে ঠকানো হয় এমন ব্যবসাকে বাছাই করা হয় না।",
    icon: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  },
  {
    label: "স্বাধীন সিদ্ধান্ত",
    desc: "নিজে যাচাই বাছাই করে স্বাধীন ভাবে সিদ্ধান্ত নিবেন। নিজের পছন্দ না হলে বিনিয়োগ করবেন না।",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
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
    label: "আকর্ষণীয় মুনাফা",
    desc: "১৮%–২৫% পর্যন্ত সম্ভাব্য বার্ষিক মুনাফার সম্ভাবনা।",
    icon: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  },
  {
    label: "বিনিয়োগের আগে ও পরে সরেজমিনে যাচাইয়ের সুযোগ",
    desc: "বিনিয়োগকারী যেকোনো সময় ব্যবসাপ্রতিষ্ঠান ও হিসাব সরাসরি নিজে গিয়ে যাচাই করতে পারবেন।",
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
    desc: "আমাদের যাচাইকৃত তালিকা থেকে আপনার লক্ষ্য মিলিয়ে পছন্দের ব্যবসা প্রতিষ্ঠানগুলো বেছে নিন।",
  },
  {
    title: "উদ্যোক্তার সাথে চুক্তি স্বাক্ষর করুন",
    desc: "লিগ্যাল ডকুমেন্টে চুক্তি করুন এবং চেক বুঝে নিন।",
  },
  {
    title: "সময় মত মুনাফা নিন",
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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  // ─── FILTER RESTORATION & PERSISTENCE ───
  const [category, setCategoryState] = useState<string>(() => {
    return search.category || sessionStorage.getItem("landing_category") || "all";
  });
  const [sort, setSortState] = useState<SortKey>(() => {
    return (search.sort as SortKey) || (sessionStorage.getItem("landing_sort") as SortKey) || "default";
  });

  // Sync session storage to URL on initial mount if URL is empty
  useEffect(() => {
    const storedCat = sessionStorage.getItem("landing_category");
    const storedSort = sessionStorage.getItem("landing_sort") as SortKey;
    if (!search.category && storedCat && storedCat !== "all") {
      navigate({ search: (prev) => ({ ...prev, category: storedCat }), replace: true });
    }
    if (!search.sort && storedSort && storedSort !== "default") {
      navigate({ search: (prev) => ({ ...prev, sort: storedSort }), replace: true });
    }
  }, []);

  // Update URL if browser navigation (back button) changes query params
  useEffect(() => {
    if (search.category && search.category !== category) {
      setCategoryState(search.category);
      sessionStorage.setItem("landing_category", search.category);
    }
    if (search.sort && search.sort !== sort) {
      setSortState(search.sort as SortKey);
      sessionStorage.setItem("landing_sort", search.sort);
    }
  }, [search.category, search.sort]);

  const setCategory = (c: string) => {
    setCategoryState(c);
    sessionStorage.setItem("landing_category", c);
    navigate({ search: (prev) => ({ ...prev, category: c !== "all" ? c : undefined }), replace: true });
  };

  const setSort = (s: SortKey) => {
    setSortState(s);
    sessionStorage.setItem("landing_sort", s);
    navigate({ search: (prev) => ({ ...prev, sort: s !== "default" ? s : undefined }), replace: true });
  };

  const filtered = useMemo(() => {
    let list = (projects || []).slice();
    if (category !== "all") list = list.filter((p) => p.category === category);
    switch (sort) {
      case "investment_asc":
        list.sort((a, b) => parseAmount(a.investment_amount) - parseAmount(b.investment_amount));
        break;
      case "investment_desc":
        list.sort((a, b) => parseAmount(b.investment_amount) - parseAmount(a.investment_amount));
        break;
      case "roi_desc":
        list.sort((a, b) => parseRoi(b.expected_profit) - parseRoi(a.expected_profit));
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

        {isLoading ? (
          <div className="mt-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div key={p.id}>
                <OpportunityCard project={p} index={i} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
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
          বিনিয়োগ শুরু করুন
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
          <span className="font-bold text-foreground">সমৃদ্ধি</span>
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
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p>© {new Date().getFullYear()} · বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম</p>
          <p>
            Created by <a href="https://artx.techvrs.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground transition hover:text-primary">ArtX TechVRS</a>
          </p>
        </div>
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
