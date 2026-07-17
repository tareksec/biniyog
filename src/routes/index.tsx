import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HeroWave } from "@/components/HeroWave";
import { OpportunityCard } from "@/components/OpportunityCard";
import { projects, isFullyFunded } from "@/lib/projects";

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
      <Opportunities projects={ordered} />
      <FinalCTA />
      <Footer />
    </div>
  );
}

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
          <span className="font-display text-lg leading-none">বিনিয়োগ বৃদ্ধি</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#why" className="hover:text-foreground">কেন আমরা</a>
          <a href="#how" className="hover:text-foreground">কীভাবে কাজ করে</a>
          <a href="#opportunities" className="hover:text-foreground">সুযোগসমূহ</a>
        </nav>
        <a
          href="#opportunities"
          className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 md:inline-flex"
        >
          বিনিয়োগ শুরু করুন
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="wireframe-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <HeroWave className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[900px] -translate-x-1/2 opacity-80" />

      <div className="relative mx-auto max-w-5xl px-5 pt-24 pb-28 text-center sm:pt-32 sm:pb-36">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pill mx-auto"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">শরীয়াহ সম্মত · মুদারাবা মডেল</span>
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          হালাল ও নিরাপদ বিনিয়োগের মাধ্যমে দেশের{" "}
          <span className="gradient-text">সম্ভাবনাময় ব্যবসায়</span>{" "}
          অংশীদার হোন
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          যাচাইকৃত SME এবং উঠতি স্টার্টআপে বিনিয়োগ করে সম্পূর্ণ শরীয়াহ সম্মত
          উপায়ে আকর্ষণীয় মুনাফা অর্জন করুন।
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex items-center justify-center"
        >
          <a
            href="#opportunities"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background shadow-[var(--shadow-elevated)] transition hover:scale-[1.02]"
            style={{ background: "var(--gradient-primary)" }}
          >
            বিনিয়োগের সুযোগগুলো দেখুন
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-border/70 pt-8 text-left sm:gap-10"
        >
          <Stat value="১৮–৩৩%" label="সম্ভাব্য বার্ষিক মুনাফা" />
          <Stat value={`${projects.length}+`} label="যাচাইকৃত প্রজেক্ট" />
          <Stat value="১০০%" label="শরীয়াহ সম্মত" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="num text-2xl font-semibold text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const WHY = [
  {
    label: "নিরাপদ বিনিয়োগ",
    desc: "প্রতিটি বিনিয়োগে লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক।",
    icon: (
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    ),
  },
  {
    label: "হালাল ও শরীয়াহ সম্মত",
    desc: "মুদারাবা / পার্টনারশিপ মডেল, সুদ মুক্ত।",
    icon: <path d="M12 3v18M5 8a7 7 0 0 0 7 4 7 7 0 0 0 7-4" />,
  },
  {
    label: "যাচাইকৃত উদ্যোক্তা",
    desc: "অভিজ্ঞ, সক্রিয় ব্যবসায়ীদের সাথে সরাসরি অংশীদারিত্ব।",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </>
    ),
  },
  {
    label: "আকর্ষণীয় মুনাফা",
    desc: "১৮%–৩৩% পর্যন্ত সম্ভাব্য বার্ষিক মুনাফা।",
    icon: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
  },
];

function WhyChoose() {
  return (
    <section id="why" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeader
          eyebrow="কেন আমরা"
          title="বিশ্বস্ত ও শরীয়াহ সম্মত বিনিয়োগের জন্য"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {w.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-lg leading-tight">
                {w.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {w.desc}
              </p>
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
    desc: "মুদারাবা / পার্টনারশিপ চুক্তি — লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক সহ।",
  },
  {
    title: "বিনিয়োগ করুন, মুনাফা নিন",
    desc: "নির্দিষ্ট সময় অন্তর সম্মত পদ্ধতিতে মুনাফা বুঝে নিন।",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden border-t border-border">
      <div className="wireframe-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeader eyebrow="কীভাবে কাজ করে" title="তিন ধাপে বিনিয়োগ শুরু করুন" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card p-7"
            >
              <div className="num text-xs font-semibold tracking-widest text-primary">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 font-display text-xl leading-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Opportunities({ projects }: { projects: typeof import("@/lib/projects").projects }) {
  return (
    <section id="opportunities" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
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
          <div className="pill bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">
              <span className="num font-semibold text-foreground">
                {projects.filter((p) => !isFullyFunded(p)).length}
              </span>{" "}
              টি সক্রিয় সুযোগ
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <OpportunityCard key={p.id} project={p} index={i} />
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
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <h2 className="font-display text-3xl leading-tight sm:text-5xl">
          আজই <span className="gradient-text">অংশীদার</span> হোন
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          দেশের সম্ভাবনাময় ব্যবসাগুলোতে শরীয়াহ সম্মত উপায়ে বিনিয়োগ শুরু করুন।
        </p>
        <a
          href="#opportunities"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.02]"
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
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
            </svg>
          </span>
          <span className="font-display text-foreground">বিনিয়োগ বৃদ্ধি</span>
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
      <span className="text-xs uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
    </div>
  );
}
