import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { OpportunityCard } from "@/components/OpportunityCard";
import { projects, isFullyFunded } from "@/lib/projects";
import { HeroIllustration } from "@/components/HeroIllustration";
import { CountUp } from "@/components/CountUp";
import {
  InstructorSection,
  CONSULTANCY_URL,
  LINKEDIN_URL,
} from "@/components/InstructorSection";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const open = projects.filter((p) => !isFullyFunded(p));
  const funded = projects.filter(isFullyFunded);
  const ordered = [...open, ...funded];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <WhyChoose />
      <HowItWorks />
      <InstructorSection />
      <Opportunities projects={ordered} />
      <FinalCTA />
      <Footer />
    </div>
  );
}

const revealItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
            </svg>
          </span>
          <span className="text-lg font-bold leading-none">বিনিয়োগ বৃদ্ধি</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#why" className="transition hover:text-primary">কেন আমরা</a>
          <a href="#how" className="transition hover:text-primary">কীভাবে কাজ করে</a>
          <a href="#expert" className="transition hover:text-primary">এক্সপার্ট</a>
          <a href="#opportunities" className="transition hover:text-primary">সুযোগসমূহ</a>
        </nav>
        <a
          href="#opportunities"
          className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.03] md:inline-flex"
        >
          বিনিয়োগ শুরু করুন
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-surface">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pt-20 pb-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8 lg:pt-28 lg:pb-24">
        <div>
          <span className="pill">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-muted-foreground">শরীয়াহ সম্মত · মুদারাবা মডেল</span>
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-[3.6rem]">
            হালাল বিনিয়োগে দেশের{" "}
            <span className="gradient-text">সম্ভাবনাময় ব্যবসায়</span>{" "}
            অংশীদার হোন
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            যাচাইকৃত SME এবং উঠতি স্টার্টআপে সম্পূর্ণ শরীয়াহ সম্মত উপায়ে
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
            <Stat value={<><CountUp to={18} />–<CountUp to={33} />%</>} label="বার্ষিক মুনাফা" />
            <Stat value={<><CountUp to={projects.length} />+</>} label="যাচাইকৃত প্রজেক্ট" />
            <Stat value={<><CountUp to={100} />%</>} label="শরীয়াহ সম্মত" />
          </div>
        </div>

        <div data-hero-art className="relative mx-auto w-full max-w-[560px]">
          <HeroIllustration className="h-auto w-full" />
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
    label: "নিরাপদ বিনিয়োগ",
    desc: "প্রতিটি বিনিয়োগে লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করা হয়।",
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    ),
  },
  {
    label: "হালাল ও শরীয়াহ সম্মত",
    desc: "মুদারাবা / পার্টনারশিপ মডেল — সম্পূর্ণ সুদ মুক্ত ও শরীয়াহ অনুমোদিত।",
    icon: <path d="M12 3v18M5 8a7 7 0 0 0 7 4 7 7 0 0 0 7-4" />,
  },
  {
    label: "আকর্ষণীয় মুনাফা",
    desc: "১৮%–৩৩% পর্যন্ত সম্ভাব্য বার্ষিক মুনাফা, স্বচ্ছ পেআউট শিডিউলে।",
    icon: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  },
];

function WhyChoose() {
  return (
    <section id="why" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeader
          eyebrow="কেন আমরা"
          title="বিশ্বস্ত ও শরীয়াহ সম্মত বিনিয়োগের জন্য"
        />
        <div
          data-stagger-group
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {WHY.map((w, i) => (
            <div
              key={w.label}
              data-stagger-item
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background text-primary shadow-sm"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {w.icon}
                </svg>
              </span>
              <h3 className="mt-6 text-xl font-bold leading-tight">
                {w.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {w.desc}
              </p>
              <a
                href="#opportunities"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
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
            </div>
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
    desc: "মুদারাবা / পার্টনারশিপ চুক্তি — লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক সহ।",
  },
  {
    title: "বিনিয়োগ করুন, মুনাফা নিন",
    desc: "নির্দিষ্ট সময় অন্তর সম্মত পদ্ধতিতে মুনাফা বুঝে নিন।",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden border-t border-border bg-surface">
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeader eyebrow="কীভাবে কাজ করে" title="তিন ধাপে বিনিয়োগ শুরু করুন" />
        <div data-stagger-group className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              data-stagger-item
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary num">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-xl font-bold leading-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Opportunities({ projects }: { projects: typeof import("@/lib/projects").projects }) {
  return (
    <section id="opportunities" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionHeader
              eyebrow="Live Opportunities"
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
                {projects.filter((p) => !isFullyFunded(p)).length}
              </span>{" "}
              টি সক্রিয় সুযোগ
            </span>
          </div>
        </div>

        <div data-stagger-group className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <div key={p.id} data-stagger-item>
              <OpportunityCard project={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
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
          দেশের সম্ভাবনাময় ব্যবসাগুলোতে শরীয়াহ সম্মত উপায়ে বিনিয়োগ শুরু করুন।
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
    <footer className="border-t border-border bg-surface">
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
        <p>© {new Date().getFullYear()} · শরীয়াহ সম্মত বিনিয়োগ প্ল্যাটফর্ম</p>
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
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.5rem]">
        {title}
      </h2>
    </div>
  );
}
