import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fallbackProjects, fetchProjects, isFullyFunded, statusLabel, parseLinks, fundingProgress, getRiskLevel, resolveImageUrl } from "@/lib/projects";
import { motion } from "framer-motion";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0";

export const Route = createFileRoute("/opportunities/$id")({
  loader: async ({ params }) => {
    // First try fallback (local JSON) for instant lookup
    let project = fallbackProjects.find((p) => p.id === params.id);
    // If not found locally, try fetching live from Supabase
    if (!project) {
      const allProjects = await fetchProjects();
      project = allProjects.find((p) => p.id === params.id);
    }
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found · বিনিয়োগ বৃদ্ধি" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = `${p.project_name} · বিনিয়োগ বৃদ্ধি`;
    const desc = (p.entrepreneur_description || "যাচাইকৃত নিরাপদ বিনিয়োগের সুযোগ").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: OpportunityDetailsPage,
  notFoundComponent: NotFoundView,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-2xl">কিছু ভুল হয়েছে</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">হোমে ফিরে যান</Link>
    </div>
  ),
});

function NotFoundView() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">প্রজেক্ট পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm text-muted-foreground">এই বিনিয়োগ সুযোগটি আর সক্রিয় নেই বা লিংকটি ভুল।</p>
      <Link to="/" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        সব সুযোগ দেখুন
      </Link>
    </div>
  );
}

function OpportunityDetailsPage() {
  const { project } = Route.useLoaderData();
  const funded = isFullyFunded(project);
  const links = parseLinks(project.links);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব সুযোগ
          </Link>
          <span className="text-sm font-bold">বিনিয়োগ বৃদ্ধি</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Banner Image */}
        <div className="mb-10 w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={resolveImageUrl(project)}
            alt={project.project_name || "প্রজেক্টের ছবি"}
            className="h-64 w-full object-cover sm:h-80 lg:h-96"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
            }}
          />
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
        <h1 className="mt-4 font-display text-3xl sm:text-4xl">{project.project_name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {project.business_type} · {project.location || "বাংলাদেশ"}
        </p>

        <p className="mt-6 text-[15px] leading-relaxed text-foreground/85">
          {project.entrepreneur_description || "—"}
        </p>

        <FundingProgress percent={fundingProgress(project)} funded={funded} />

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-border bg-surface p-6 sm:grid-cols-3">
          <Field label="বিনিয়োগ প্রয়োজন" value={project.investment_required} num />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit_annual} num accent />
          <Field label="মুনাফা প্রদান" value={project.profit_payout_schedule} />
          <Field label="বিনিয়োগ মডেল" value={project.investment_model} />
          <Field label="যাচাইকরণ" value={project.verification_type} />
          <Field label="টার্নওভার" value={project.turnover_capital} num />
        </div>

        <BusinessBackground project={project} />
        <PayoutTrackRecord project={project} />
        <RiskAnalysis />
        <LegalSecurity />

        {project.investment_terms && (
          <section className="mt-8">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">বিনিয়োগের শর্তাবলী</h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{project.investment_terms}</p>
          </section>
        )}

        {links.length > 0 && (
          <section className="mt-8">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">লিংক</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {links.map((l) => (
                <li key={l}>
                  <a href={l} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-2 hover:underline">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-6">
          <h4 className="font-display text-lg">যোগাযোগ ও ব্যাংক তথ্য</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {funded
              ? "এই রাউন্ডের বিনিয়োগ সম্পন্ন। বিস্তারিত রেকর্ড ও যোগাযোগের তথ্য নিচের Google Sheet-এ দেখুন।"
              : "সম্পূর্ণ যোগাযোগ ও ব্যাংক তথ্য দেখতে নিচের Google Sheet ওপেন করুন।"}
          </p>
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              যোগাযোগ ও ব্যাংক তথ্য দেখুন
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
        </section>

        <div className="mt-12">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← আরও বিনিয়োগ সুযোগ দেখুন</Link>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, num, accent }: { label: string; value: string; num?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-medium ${num ? "num text-base" : ""} ${accent ? "text-primary" : "text-foreground"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function FundingProgress({ percent, funded }: { percent: number; funded: boolean }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">তহবিল সংগ্রহের অগ্রগতি</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {funded ? "এই রাউন্ডের বিনিয়োগ সম্পন্ন হয়েছে।" : "বর্তমান বিনিয়োগ কমিটমেন্টের অনুপাত।"}
          </p>
        </div>
        <div className="num text-2xl font-bold text-primary">{percent}%</div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </section>
  );
}

function BusinessBackground({ project }: { project: { entrepreneur_description: string; company_maturity: string; location: string; business_type: string } }) {
  return (
    <section className="mt-10">
      <h3 className="font-display text-xl">ব্যবসার পটভূমি</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">
        {project.entrepreneur_description ||
          "উদ্যোক্তা তার নিজস্ব দক্ষতা ও অভিজ্ঞতা কাজে লাগিয়ে ব্যবসাটি পরিচালনা করছেন।"}{" "}
        প্রতিষ্ঠানটি {project.location || "বাংলাদেশে"} {project.business_type ? `${project.business_type} খাতে ` : ""}
        কাজ করছে এবং বর্তমানে {project.company_maturity || "স্থিতিশীল"} পর্যায়ে রয়েছে। ব্যবসার আয়ের ধারা,
        গ্রাহক বেইজ ও অপারেশনাল খরচ যাচাই করে প্রজেক্টটি তালিকাভুক্ত করা হয়েছে।
      </p>
    </section>
  );
}

const RISKS: { label: string; level: "low" | "med" | "high"; text: string }[] = [
  { label: "মার্কেট রিস্ক", level: "med", text: "চাহিদা ও প্রতিযোগিতার পরিবর্তনে আয় ওঠানামা করতে পারে।" },
  { label: "অপারেশনাল রিস্ক", level: "low", text: "উদ্যোক্তার অভিজ্ঞতা ও প্রক্রিয়া পর্যাপ্তভাবে গঠিত।" },
  { label: "নগদ প্রবাহ ঝুঁকি", level: "med", text: "মৌসুমি সেলস চক্রের কারণে মাসভেদে ক্যাশফ্লো ভিন্ন হতে পারে।" },
];

function RiskAnalysis() {
  return (
    <section className="mt-10">
      <h3 className="font-display text-xl">ঝুঁকি বিশ্লেষণ</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {RISKS.map((r) => (
          <div key={r.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{r.label}</span>
              <RiskDot level={r.level} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskDot({ level }: { level: "low" | "med" | "high" }) {
  const map = {
    low: { c: "bg-primary", t: "কম" },
    med: { c: "bg-yellow-500", t: "মাঝারি" },
    high: { c: "bg-destructive", t: "উচ্চ" },
  }[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${map.c}`} />
      {map.t}
    </span>
  );
}

const LEGAL = [
  "নোটারাইজড চুক্তিনামা ও লিগ্যাল রিভিউ সম্পন্ন",
  "উদ্যোক্তার ব্যাকগ্রাউন্ড ও ক্রেডিট চেক যাচাইকৃত",
  "নিরাপত্তা হিসেবে পোস্ট-ডেটেড চেক / কোল্যাটারাল রাখা হয়",
  "প্রয়োজনে এসক্রো ব্যাংক অ্যাকাউন্ট ব্যবহারের ব্যবস্থা",
];

function LegalSecurity() {
  return (
    <section className="mt-10">
      <h3 className="font-display text-xl">আইনি নিরাপত্তা</h3>
      <ul className="mt-3 space-y-2">
        {LEGAL.map((l) => (
          <li key={l} className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <span className="text-foreground/85">{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PayoutTrackRecord({ project }: { project: any }) {
  // Mock tracking data for demonstration
  const records = [
    { cycle: "অক্টোবর ২০২৫", promised: "১৮.৫%", actual: "১৯.২%", status: "পেইড" },
    { cycle: "জানুয়ারি ২০২৬", promised: "১৮.৫%", actual: "১৮.৫%", status: "পেইড" },
    { cycle: "এপ্রিল ২০২৬", promised: "১৮.৫%", actual: "১৮.৮%", status: "পেইড" },
  ];

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-display text-xl">অতীত পেআউট পারফরম্যান্স</h3>
          <p className="mt-1 text-sm text-muted-foreground">এই ব্যবসার পূর্ববর্তী ফান্ডিং সাইকেলের ডেটা</p>
        </div>
      </div>
      
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm" aria-label="পেআউট শিডিউল">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">সাইকেল</th>
                <th className="px-4 py-3 font-medium">টার্গেট মুনাফা</th>
                <th className="px-4 py-3 font-medium">প্রকৃত মুনাফা</th>
                <th className="px-4 py-3 font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{r.cycle}</td>
                  <td className="px-4 py-3 num text-muted-foreground">{r.promised}</td>
                  <td className="px-4 py-3 num font-bold text-primary">{r.actual}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
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