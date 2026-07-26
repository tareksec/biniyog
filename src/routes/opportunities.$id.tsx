import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchOpportunities, isFullyFunded, statusLabel, parseLinks, fundingProgress, getRiskLevel, resolveImageUrl, getStatusConfig, fetchOpportunitySubsections, type Opportunity, type OpportunityRisk, type OpportunityPayout, type OpportunityLegalCheck } from "@/lib/projects";
import { motion } from "framer-motion";

export const Route = createFileRoute("/opportunities/$id")({
  loader: async ({ params }) => {
    const allProjects = await fetchOpportunities();
    const project = allProjects.find((p) => p.id === params.id || p.slug === params.id);
    if (!project) throw notFound();
    const subsections = await fetchOpportunitySubsections(project.id);
    return { project, ...subsections };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found · সমৃদ্ধি" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = `${p.name} · সমৃদ্ধি`;
    const desc = (p.description || "যাচাইকৃত বিনিয়োগের সুযোগ").slice(0, 155);
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
  const { project, risks, payouts, legalChecks } = Route.useLoaderData();
  const funded = isFullyFunded(project);
  const links = parseLinks(project.website_url);

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
          <span className="text-sm font-bold">সমৃদ্ধি</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Banner Image */}
        <div className="mb-10 w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={resolveImageUrl(project)}
            alt={project.name || "প্রজেক্টের ছবি"}
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
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-foreground">{project.name}</h1>
        
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
            {project.owner_phone && (
              <a
                href={`tel:${project.owner_phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground transition shadow-2xs"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{project.owner_phone}</span>
              </a>
            )}

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

        <FundingProgress project={project} />

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm sm:grid-cols-3 sm:gap-6 sm:p-7">
          <Field label="বিনিয়োগ প্রয়োজন" value={project.investment_amount || ""} num highlight />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit || ""} num highlight accent />
          <Field label="মুনাফা প্রদান" value={project.profit_period || ""} />
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
                  <a href={l} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-4 hover:underline inline-flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 border-t border-border/80 pt-10 rounded-2xl border border-dashed border-border bg-surface/70 p-6 sm:p-8">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5">
            <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">যোগাযোগ ও ব্যাংক তথ্য</h3>
          </div>
          <p className="mt-3 text-base text-muted-foreground font-medium">
            {funded
              ? "এই রাউন্ডের বিনিয়োগ সম্পন্ন।"
              : "ব্যাংক তথ্য ও বিনিয়োগের বিস্তারিত জানতে নিচের লিংকে ভিজিট করুন।"}
          </p>
          
          <div className="mt-6">
            <a 
              href="https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-glow hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              ব্যাংক তথ্য দেখুন (Google Sheet)
            </a>
          </div>
        </section>

        <div className="mt-12">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← আরও বিনিয়োগ সুযোগ দেখুন</Link>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, num, accent, highlight }: { label: string; value: string; num?: boolean; accent?: boolean; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-xl border border-primary/30 bg-primary/10 dark:bg-primary/5 p-3.5 sm:p-4 shadow-sm" : "p-2"}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 dark:text-teal-400/90">{label}</div>
      <div className={`mt-1.5 font-bold ${num ? "num" : ""} ${
        highlight 
          ? "text-lg sm:text-xl md:text-2xl text-primary font-extrabold" 
          : "text-base sm:text-lg text-foreground"
      }`}>
        {value || "—"}
      </div>
    </div>
  );
}

function FundingProgress({ project }: { project: Opportunity }) {
  const percent = fundingProgress(project);
  const config = getStatusConfig(project.status);
  const funded = isFullyFunded(project);

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">বিনিয়োগ করুন</h4>
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
          className={`h-full rounded-full ${config.color}`}
        />
      </div>
    </section>
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
          <p className="mt-1 text-sm font-medium text-muted-foreground">এই ব্যবসার পূর্ববর্তী ফান্ডিং সাইকেলের ডেটা</p>
        </div>
      </div>
      
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm" aria-label="পেআউট শিডিউল">
            <thead className="bg-primary/10 text-left text-xs uppercase tracking-wider text-foreground font-bold border-b-2 border-primary/20">
              <tr>
                <th className="px-4 py-3.5 font-bold">সাইকেল</th>
                <th className="px-4 py-3.5 font-bold">টার্গেট মুনাফা</th>
                <th className="px-4 py-3.5 font-bold">প্রকৃত মুনাফা</th>
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                      r.status === "পেইড" || r.status.includes("Paid")
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : r.status === "চলমান" || r.status === "প্রক্রিয়াধীন" || r.status === "Pending"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : "bg-destructive/15 text-destructive border-destructive/30"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        r.status === "পেইড" || r.status.includes("Paid") ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
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