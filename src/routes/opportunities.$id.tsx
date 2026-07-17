import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { projects, isFullyFunded, statusLabel, parseLinks } from "@/lib/projects";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1-IvI2R8sSBPb5VOM8RmwClQw1hRINsfsTrKHGS08AR8/edit?gid=0#gid=0";

export const Route = createFileRoute("/opportunities/$id")({
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found · বিনিয়োগ বৃদ্ধি" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = `${p.project_name} · বিনিয়োগ বৃদ্ধি`;
    const desc = (p.entrepreneur_description || "যাচাইকৃত হালাল বিনিয়োগের সুযোগ").slice(0, 155);
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব সুযোগ
          </Link>
          <span className="text-sm font-bold">বিনিয়োগ বৃদ্ধি</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <span className={`pill ${funded ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${funded ? "bg-muted-foreground" : "bg-primary"}`} />
          {statusLabel(project)}
        </span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl">{project.project_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.business_type} · {project.location || "বাংলাদেশ"}
        </p>

        <p className="mt-6 text-[15px] leading-relaxed text-foreground/85">
          {project.entrepreneur_description || "—"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-border bg-surface p-6 sm:grid-cols-3">
          <Field label="বিনিয়োগ প্রয়োজন" value={project.investment_required} num />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit_annual} num accent />
          <Field label="মুনাফা প্রদান" value={project.profit_payout_schedule} />
          <Field label="বিনিয়োগ মডেল" value={project.investment_model} />
          <Field label="যাচাইকরণ" value={project.verification_type} />
          <Field label="টার্নওভার" value={project.turnover_capital} num />
        </div>

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

        {!funded && (
          <section className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-6">
            <h4 className="font-display text-lg">যোগাযোগ ও ব্যাংক তথ্য</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              সম্পূর্ণ যোগাযোগ ও ব্যাংক তথ্য দেখতে নিচের Google Sheet ওপেন করুন।
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
        )}

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