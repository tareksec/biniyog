import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter, useNavigate } from "@tanstack/react-router";
import { fetchOpportunities, isFullyFunded, statusLabel, parseLinks, fundingProgress, getRiskLevel, resolveImageUrl, resolveImageUrls, getStatusConfig, fetchOpportunitySubsections, type Opportunity, type OpportunityRisk, type OpportunityPayout, type OpportunityLegalCheck, parseRoi } from "@/lib/projects";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
  const router = useRouter();
  const navigate = useNavigate();

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const hasRouterHistory = typeof window !== "undefined" && window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0;
    const hasReferrer = typeof document !== "undefined" && document.referrer && document.referrer.includes(window.location.host);

    if (hasRouterHistory || (typeof window !== "undefined" && window.history.length > 1 && hasReferrer)) {
      if (typeof router.history?.back === "function") {
        router.history.back();
      } else {
        window.history.back();
      }
    } else {
      navigate({ to: "/opportunities" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব সুযোগ
          </button>
          <img src="/logo.png" alt="সমৃদ্ধি" className="h-6 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Back navigation button above image/title */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/80 hover:border-primary/40 hover:-translate-x-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary transition-transform group-hover:-translate-x-1" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>সব সুযোগ</span>
          </button>
        </div>

        {/* Banner Images */}
        <div className="mb-10 w-full overflow-hidden rounded-2xl border border-border bg-muted">
          {resolveImageUrls(project).length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {resolveImageUrls(project).map((url, i) => (
                  <CarouselItem key={i}>
                    <img
                      src={url}
                      alt={`${project.name || "প্রজেক্টের ছবি"} ${i + 1}`}
                      className="h-64 w-full object-cover sm:h-80 lg:h-96"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="left-4 bg-background/80 hover:bg-background" />
                <CarouselNext className="right-4 bg-background/80 hover:bg-background" />
              </div>
            </Carousel>
          ) : (
            <img
              src={resolveImageUrl(project)}
              alt={project.name || "প্রজেক্টের ছবি"}
              className="h-64 w-full object-cover sm:h-80 lg:h-96"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
              }}
            />
          )}
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
            <a
              href="https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground transition shadow-2xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>যোগাযোগের তথ্য দেখুন (গুগল শিট)</span>
            </a>

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
          <Field label="নুন্যতম বিনিয়োগ" value={project.investment_amount || ""} num highlight />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit || ""} num highlight accent />
          <Field label="লাভ প্রদান" value={project.profit_period || ""} />
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

        <InvestmentCalculator project={project} />

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
              className="group inline-flex items-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>সকল প্রজেক্টের যোগাযোগ ও ব্যাংক তথ্য দেখুন (গুগল শিট)</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
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

function InvestmentCalculator({ project }: { project: Opportunity }) {
  const defaultRoi = parseRoi(project.expected_profit) || 15;
  const [amount, setAmount] = useState(100000);
  const [roi, setRoi] = useState(defaultRoi);

  const estimatedProfit = Math.round((amount * roi) / 100);
  const totalReturn = amount + estimatedProfit;

  return (
    <section className="mt-12 border-t border-border/80 pt-10">
      <div className="flex items-center gap-3 border-l-4 border-primary pl-3.5 mb-6">
        <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">রিটার্ন ক্যালকুলেটর</h3>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">বিনিয়োগের পরিমাণ</span>
              <span className="text-lg font-bold text-foreground num">৳ {(amount).toLocaleString()}</span>
            </div>
            <Slider
              value={[amount]}
              min={10000}
              max={1000000}
              step={10000}
              onValueChange={([val]) => setAmount(val)}
              className="py-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">প্রত্যাশিত লাভ (বার্ষিক)</span>
              <span className="text-lg font-bold text-foreground num">{roi}%</span>
            </div>
            <Slider
              value={[roi]}
              min={5}
              max={40}
              step={1}
              onValueChange={([val]) => setRoi(val)}
              className="py-2"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-primary/10 pb-3">
              <span className="text-sm font-medium text-muted-foreground">মূলধন</span>
              <span className="text-base font-bold text-foreground num">৳ {(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-3">
              <span className="text-sm font-medium text-primary">সম্ভাব্য লাভ</span>
              <span className="text-base font-bold text-primary num">+ ৳ {(estimatedProfit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-foreground">মোট সম্ভাব্য প্রাপ্তি</span>
              <span className="text-xl font-extrabold text-foreground num">৳ {(totalReturn).toLocaleString()}</span>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground text-center italic">
            * এটি একটি সম্ভাব্য হিসাব। প্রকৃত লাভ ব্যবসার বাস্তব অবস্থার উপর নির্ভর করবে।
          </p>
        </div>
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
                <th className="px-4 py-3.5 font-bold">টার্গেট লাভ</th>
                <th className="px-4 py-3.5 font-bold">প্রকৃত লাভ</th>
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