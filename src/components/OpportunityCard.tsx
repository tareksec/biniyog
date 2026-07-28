import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  type Opportunity,
  isFullyFunded,
  isOpen,
  statusLabel,
  fundingProgress,
  getRiskLevel,
  resolveImageUrl,
  getStatusConfig,
} from "@/lib/projects";

/* ────────────────────────────────────────────────────────────
   Category icon map — maps common Bengali category keywords
   to small SVG icons
   ──────────────────────────────────────────────────────────── */
export function getCategoryIcon(category: string | null): { icon: JSX.Element; bg: string; fg: string } {
  const c = (category || "").toLowerCase();

  if (c.includes("এগ্রো") || c.includes("কৃষি") || c.includes("খামার") || c.includes("মাছ") || c.includes("ডেইরি"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 0 0-6.88 17.26L12 12V2z"/><circle cx="12" cy="12" r="10"/></svg>
      ),
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      fg: "text-emerald-600 dark:text-emerald-400",
    };
  if (c.includes("গার্মেন্টস") || c.includes("ফ্যাশন") || c.includes("টেক্সটাইল") || c.includes("টেইলার্স"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.18l.88 7.04A3 3 0 0 0 6.14 15H9l3 5 3-5h2.86a3 3 0 0 0 2.98-2.32l.88-7.04a2 2 0 0 0-1.34-2.18z"/></svg>
      ),
      bg: "bg-pink-100 dark:bg-pink-900/40",
      fg: "text-pink-600 dark:text-pink-400",
    };
  if (c.includes("আইটি") || c.includes("টেক") || c.includes("সফটওয়্যার") || c.includes("ডিজিটাল"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      ),
      bg: "bg-violet-100 dark:bg-violet-900/40",
      fg: "text-violet-600 dark:text-violet-400",
    };
  if (c.includes("খাবার") || c.includes("রেস্টুরেন্ট") || c.includes("ফুড") || c.includes("বেকারি"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>
      ),
      bg: "bg-orange-100 dark:bg-orange-900/40",
      fg: "text-orange-600 dark:text-orange-400",
    };
  if (c.includes("ই-কমার্স") || c.includes("রিটেইল") || c.includes("দোকান") || c.includes("শপ"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
      ),
      bg: "bg-sky-100 dark:bg-sky-900/40",
      fg: "text-sky-600 dark:text-sky-400",
    };
  if (c.includes("ট্রেডিং") || c.includes("বাণিজ্য"))
    return {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      ),
      bg: "bg-teal-100 dark:bg-teal-900/40",
      fg: "text-teal-600 dark:text-teal-400",
    };

  // Default
  return {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>
    ),
    bg: "bg-primary/10",
    fg: "text-primary",
  };
}

/* ──── Ring colors mapping from status ──── */
export function getStatusRingColors(status: string | null): { stroke: string; trail: string } {
  switch (status) {
    case "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে":
      return { stroke: "url(#ringGradGreen)", trail: "stroke-emerald-100 dark:stroke-emerald-900/30" };
    case "বিনিয়োগ নেওয়া শেষের দিকে":
      return { stroke: "url(#ringGradAmber)", trail: "stroke-amber-100 dark:stroke-amber-900/30" };
    case "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ":
      return { stroke: "url(#ringGradSlate)", trail: "stroke-slate-100 dark:stroke-slate-800/40" };
    case "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।":
      return { stroke: "url(#ringGradNeutral)", trail: "stroke-neutral-200 dark:stroke-neutral-800/40" };
    case "আমরা তাদের নিয়ে এখন আর কাজ করছি না":
      return { stroke: "#71717a", trail: "stroke-zinc-200 dark:stroke-zinc-800/40" };
    default:
      return { stroke: "url(#ringGradGreen)", trail: "stroke-emerald-100 dark:stroke-emerald-900/30" };
  }
}

/* ──── Risk chip styles ──── */
export function riskChipStyle(level: "low" | "med" | "high"): { bg: string; text: string } {
  switch (level) {
    case "low":
      return { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" };
    case "med":
      return { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" };
    case "high":
      return { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400" };
  }
}

/* ────────────────────────────────────────────────────────────
   Circular Ring Progress
   ──────────────────────────────────────────────────────────── */
export function CircularProgress({
  percent,
  status,
  label,
  size = 88,
  strokeWidth = 6,
}: {
  percent: number;
  status: string | null;
  label: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const ringColors = getStatusRingColors(status);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="ringGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="ringGradSlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="ringGradNeutral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3a3a3" />
            <stop offset="100%" stopColor="#737373" />
          </linearGradient>
        </defs>
        {/* Trail */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={ringColors.trail}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={ringColors.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none text-foreground num">{label}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main OpportunityCard
   ──────────────────────────────────────────────────────────── */
export function OpportunityCard({
  project,
  index,
  isSelectedForCompare,
  onToggleCompare,
  isCompareDisabled,
  onQuickView,
}: {
  project: Opportunity;
  index: number;
  isSelectedForCompare?: boolean;
  onToggleCompare?: () => void;
  isCompareDisabled?: boolean;
  onQuickView?: () => void;
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(project.id);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView();
    } else {
      navigate({ to: "/opportunities/$id", params: { id: project.id } });
    }
  };
  const funded = isFullyFunded(project);
  const active = isOpen(project);
  const percent = fundingProgress(project);
  const risk = getRiskLevel(project);
  const catIcon = getCategoryIcon(project.category);
  const profitData = formatProfit(project.expected_profit || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div
        onClick={handleCardClick}
        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-muted/40 p-2 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 ${
          funded ? "opacity-75 hover:opacity-100" : ""
        }`}
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
      >
        {onToggleCompare && (
          <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={isSelectedForCompare} 
              onCheckedChange={onToggleCompare} 
              disabled={isCompareDisabled && !isSelectedForCompare}
              className="h-5 w-5 rounded border-2 border-border/80 bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark(project.id); }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors shadow-sm"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} />
        </button>
        {/* Inner card — the "card floating on card" effect */}
        <div
          className="flex flex-1 flex-col rounded-[1.35rem] bg-card p-5 sm:p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          {/* ── Header Row ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Category icon in tinted circle */}
              <span className={`flex-shrink-0 grid h-10 w-10 place-items-center rounded-xl ${catIcon.bg} ${catIcon.fg}`}>
                {catIcon.icon}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[17px] sm:text-lg font-bold leading-snug text-foreground line-clamp-2">
                  {project.name || "—"}
                </h3>
                {project.owner_name && (
                  <p className="mt-0.5 text-[13px] text-muted-foreground font-medium line-clamp-1">
                    {project.owner_name}
                  </p>
                )}
              </div>
            </div>

            {/* Avatar / image circle */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden ring-2 ring-border/30 bg-muted">
              <img
                src={resolveImageUrl(project)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=80&auto=format&fit=crop";
                }}
              />
            </div>
          </div>

          {/* ── Status badge ── */}
          <div className="mt-4">
            <span
              className={`pill text-[11px] font-semibold tracking-wide shadow-none ${
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-muted text-muted-foreground border-border/60"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"}`} />
              {statusLabel(project)}
            </span>
          </div>

          {/* ── Primary Metric + Ring ── */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">নুন্যতম বিনিয়োগ</p>
              <p className="mt-1.5 num text-2xl sm:text-[28px] font-extrabold text-foreground leading-none tracking-tight">
                {project.investment_amount || "—"}
              </p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="num text-lg font-bold text-primary leading-none">{profitData.percentage}</span>
                <span className="text-[11px] font-medium text-muted-foreground">{profitData.freq} মুনাফা</span>
              </div>
            </div>

            {/* Circular ring */}
            <CircularProgress
              percent={percent}
              status={project.status}
              label={`${Math.round(percent)}%`}
            />
          </div>

          {/* ── Info Chips ── */}
          <div className="mt-5 flex flex-wrap gap-2">
            {/* Category chip */}
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${catIcon.bg} ${catIcon.fg}`}>
              {catIcon.icon}
              {project.category || "ব্যবসা"}
            </span>

            {/* Risk chip */}
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${riskChipStyle(risk.level).bg} ${riskChipStyle(risk.level).text}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 22h20L12 2zM12 16v-5M12 20h.01"/></svg>
              {risk.label}
            </span>

            {/* Investment type chip */}
            {project.investment_type && (
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {project.investment_type}
              </span>
            )}
            {/* Duration chip */}
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-muted/50 text-muted-foreground dark:bg-muted/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {project.profit_period || "চুক্তি অনুযায়ী"}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/opportunities/$id"
              params={{ id: project.id }}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              বিস্তারিত দেখুন
            </Link>
            <a
              href="https://docs.google.com/spreadsheets/d/1HsSR7t_2zZaNbvqmbhWiuYikfYsF8rfzcQK2gmfIB4U/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary shadow-2xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              যোগাযোগ ও ব্যাংক তথ্য (গুগল শিট)
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──── Helpers ──── */

export function formatProfit(profitStr: string) {
  if (!profitStr) return { percentage: "—", freq: "বার্ষিক" };

  const match = profitStr.match(/([\d०-९০-৯\-–\s]+%)/);
  const percentage = match ? match[1].trim() : profitStr.replace(/^বছরে\s*সম্ভাব্য\s*লাভ\s*/, "");

  let freq = "বার্ষিক";
  if (profitStr.includes("মাসিক")) freq = "মাসিক";
  else if (profitStr.includes("ত্রৈমাসিক")) freq = "ত্রৈমাসিক";
  else if (profitStr.includes("ষাণ্মাসিক") || profitStr.includes("ষান্মাসিক")) freq = "ষাণ্মাসিক";

  return { percentage, freq };
}
