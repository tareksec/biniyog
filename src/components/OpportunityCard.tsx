import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  type PublicProject,
  isFullyFunded,
  isOpen,
  statusLabel,
} from "@/lib/projects";

export function OpportunityCard({
  project,
  index,
}: {
  project: PublicProject;
  index: number;
}) {
  const funded = isFullyFunded(project);
  const active = isOpen(project);

  return (
    <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to="/opportunities/$id"
        params={{ id: project.id }}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] ${
          funded
            ? "border-border/60 opacity-80 grayscale hover:grayscale-0 hover:border-primary/40"
            : "border-border hover:border-primary/40"
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <span
              className={`pill ${
                active
                  ? "bg-accent text-accent-foreground border-accent-foreground/10"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground"}`} />
              {statusLabel(project)}
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {project.company_maturity || "—"}
            </span>
          </div>

          <h3 className="mt-4 font-display text-2xl leading-tight text-foreground">
            {project.project_name || "—"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.business_type || "ব্যবসার ধরন —"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              বিনিয়োগ প্রয়োজন
            </div>
            <div className="num mt-1 text-lg font-semibold text-foreground">
              {project.investment_required || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              সম্ভাব্য লাভ
            </div>
            <div className="num mt-1 text-lg font-semibold text-primary">
              {project.expected_profit_annual.replace(/^বছরে\s*সম্ভাব্য\s*লাভ\s*/, "") || "—"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition group-hover:opacity-90">
            বিস্তারিত দেখুন
            <ArrowRight />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
