import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealFlow, maskPhone, type RevealedData } from "./RevealFlow";
import {
  type PublicProject,
  isFullyFunded,
  isOpen,
  statusLabel,
  parseLinks,
} from "@/lib/projects";

export function OpportunityCard({
  project,
  index,
}: {
  project: PublicProject;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const funded = isFullyFunded(project);
  const active = isOpen(project);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition ${
          funded
            ? "border-border/60 opacity-70 grayscale"
            : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
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
          {funded ? (
            <span className="text-xs text-muted-foreground">
              এই রাউন্ডের বিনিয়োগ সম্পন্ন
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              বিস্তারিত দেখুন
              <ArrowRight />
            </button>
          )}
        </div>
      </motion.article>

      <AnimatePresence>
        {open && <DetailModal project={project} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function DetailModal({
  project,
  onClose,
}: {
  project: PublicProject;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState<RevealedData | null>(null);
  const links = parseLinks(project.links);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto bg-foreground/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background p-6 shadow-[var(--shadow-elevated)] sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="pill bg-accent text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {statusLabel(project)}
        </span>
        <h2 className="mt-3 font-display text-3xl">{project.project_name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.business_type} · {project.location || "বাংলাদেশ"}
        </p>

        <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">
          {project.entrepreneur_description || "—"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-3">
          <Field label="বিনিয়োগ প্রয়োজন" value={project.investment_required} num />
          <Field label="সম্ভাব্য লাভ" value={project.expected_profit_annual} num accent />
          <Field label="মুনাফা প্রদান" value={project.profit_payout_schedule} />
          <Field label="বিনিয়োগ মডেল" value={project.investment_model} />
          <Field label="যাচাইকরণ" value={project.verification_type} />
          <Field label="টার্নওভার" value={project.turnover_capital} num />
        </div>

        {project.investment_terms && (
          <div className="mt-6">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
              বিনিয়োগের শর্তাবলী
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {project.investment_terms}
            </p>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
              লিংক
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {links.map((l) => (
                <li key={l}>
                  <a
                    href={l}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline break-all"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-5">
          <h4 className="font-display text-lg">যোগাযোগ ও ব্যাংক তথ্য</h4>

          {!revealed ? (
            <>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>ফোন:</span>
                  <span className="num tracking-wider">
                    {maskPhone("0000000000")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ব্যাংক ডিটেইলস যাচাইয়ের পরে দেখানো হবে।
                </p>
              </div>
              <div className="mt-4">
                <RevealFlow projectId={project.id} onRevealed={setRevealed} />
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-4 text-sm"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  উদ্যোক্তা
                </div>
                <div className="mt-0.5 text-foreground">
                  {revealed.contact_person || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  ফোন
                </div>
                <a
                  href={`tel:${revealed.phone_number.replace(/\s+/g, "")}`}
                  className="num mt-0.5 block text-lg font-semibold text-primary"
                >
                  {revealed.phone_number || "—"}
                </a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  ব্যাংক ডিটেইলস
                </div>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-xs leading-relaxed text-foreground/85">
{revealed.bank_details || "—"}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  num,
  accent,
}: {
  label: string;
  value: string;
  num?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-medium ${num ? "num text-base" : ""} ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
