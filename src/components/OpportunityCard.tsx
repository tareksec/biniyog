import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ReviewRatingModal } from "@/components/ReviewRatingModal";
import { submitUserReview } from "@/lib/user_reviews";
import {
  type Opportunity,
  isFullyFunded,
  isOpen,
  statusLabel,
  getRiskLevel,
  resolveImageUrl,
} from "@/lib/projects";

/* ────────────────────────────────────────────────────────────
   Category icon map — maps common Bengali category keywords
   to small SVG icons
   ──────────────────────────────────────────────────────────── */
export function getCategoryIcon(category: string | null): { icon: ReactNode; bg: string; fg: string } {
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
      return { stroke: "url(#ringGradGreen)", trail: "stroke-[#DAF1DE]" };
    case "বিনিয়োগ নেওয়া শেষের দিকে":
      return { stroke: "url(#ringGradAmber)", trail: "stroke-[#DAF1DE]" };
    case "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ":
      return { stroke: "url(#ringGradSlate)", trail: "stroke-slate-100 dark:stroke-slate-800/40" };
    case "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।":
      return { stroke: "url(#ringGradNeutral)", trail: "stroke-neutral-200 dark:stroke-neutral-800/40" };
    case "আমরা তাদের নিয়ে এখন আর কাজ করছি না":
      return { stroke: "#71717a", trail: "stroke-zinc-200 dark:stroke-zinc-800/40" };
    default:
      return { stroke: "url(#ringGradGreen)", trail: "stroke-[#DAF1DE]" };
  }
}

/* ──── Risk chip styles ──── */
export function riskChipStyle(level: "low" | "med" | "high"): { bg: string; text: string } {
  switch (level) {
    case "low":
      return { bg: "bg-[#DAF1DE]", text: "text-[#163832]" };
    case "med":
      return { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" };
    case "high":
      return { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400" };
  }
}

/* ────────────────────────────────────────────────────────────
   Main OpportunityCard
   ──────────────────────────────────────────────────────────── */
export function OpportunityCard({
  project,
  index,
  onQuickView,
  isComparing = false,
  onCompareToggle,
}: {
  project: Opportunity;
  index: number;
  onQuickView?: () => void;
  isComparing?: boolean;
  onCompareToggle?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(project.id);
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView();
    } else {
      navigate({ to: "/opportunities/$id", params: { id: project.id } });
    }
  };
  const funded = isFullyFunded(project);
  const active = isOpen(project);
  const risk = getRiskLevel(project);
  const catIcon = getCategoryIcon(project.category);
  const profitData = formatProfit(project.expected_profit || "", project.profit_period);

  const cardImage =
    (project.image_urls && project.image_urls.length > 0 && project.image_urls[0]?.trim()) ||
    resolveImageUrl(project);

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
        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-card border border-border/80 card-hover cursor-pointer shadow-sm transition-all duration-300 ${
          funded ? "opacity-75 hover:opacity-100" : ""
        } ${isComparing ? "ring-2 ring-primary bg-primary/5" : ""}`}
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
      >
        {/* ── Top Image Section (h-48, full width, rounded top) ── */}
        <div className="relative w-full h-48 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900 overflow-hidden rounded-t-[1.5rem]">
          {!imgError && cardImage ? (
            <img
              src={cardImage}
              alt={project.name || "Opportunity image"}
              className="h-48 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <span className="text-4xl">{catIcon.icon}</span>
            </div>
          )}

          {/* Live / Status Badge (Top-Left corner over image) */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-md border border-white/10">
              <span className="relative flex h-2 w-2">
                {active && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    active ? "bg-emerald-400" : "bg-zinc-400"
                  }`}
                />
              </span>
              <span>{statusLabel(project)}</span>
            </span>
          </div>

          {/* Heart / Favourite icon & Compare button (Top-Right corner over image) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {onCompareToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareToggle();
                }}
                className={`h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-md transition-all ${
                  isComparing
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white/90 text-zinc-700 hover:bg-white dark:bg-zinc-900/90 dark:text-zinc-200"
                }`}
                title={isComparing ? "তুলনা থেকে সরান" : "তুলনা করুন"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(project.id);
              }}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 text-zinc-700 hover:text-rose-600 dark:bg-zinc-900/90 dark:text-zinc-200"
              title={saved ? "সংরক্ষণ থেকে সরান" : "সংরক্ষণ করুন"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  saved ? "fill-rose-500 text-rose-500" : "text-zinc-600 hover:text-rose-500 dark:text-zinc-300"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Inner card content below image ── */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Header Row: Category Icon & Title */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`flex-shrink-0 grid h-10 w-10 place-items-center rounded-xl ${catIcon.bg} ${catIcon.fg}`}>
                {catIcon.icon}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[17px] sm:text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {project.name || "—"}
                </h3>
                {project.owner_name && (
                  <p className="mt-0.5 text-[13px] text-muted-foreground font-medium line-clamp-1">
                    {project.owner_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Primary Metric */}
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
          </div>

          {/* Info Chips */}
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

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/opportunities/$id"
              params={{ id: project.id }}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              বিস্তারিত দেখুন
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReviewModalOpen(true);
              }}
              className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-transparent px-4 py-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              রিভিউ দিন
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewRatingModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        targetType="opportunity"
        targetId={project.id}
        onSubmit={async (data) => {
          await submitUserReview({
            reviewer_name: "বিনিয়োগকারী",
            rating: data.rating,
            note: data.note,
            has_invested: data.has_invested,
            user_identity: data.user_identity,
            investment_details: data.investment_details,
            target_type: "opportunity",
            target_id: project.id,
          });
        }}
      />
    </motion.div>
  );
}

/* ──── Helpers ──── */

export function formatProfit(profitStr: string, profitPeriod?: string | null) {
  if (!profitStr) return { percentage: "—", freq: profitPeriod || "বার্ষিক" };

  const match = profitStr.match(/([\d०-९০-৯\-–\s]+%)/);
  const percentage = match ? match[1].trim() : profitStr.replace(/^বছরে\s*সম্ভাব্য\s*লাভ\s*/, "");

  let freq = profitPeriod;
  if (!freq) {
    freq = "বার্ষিক";
    if (profitStr.includes("মাসিক")) freq = "মাসিক";
    else if (profitStr.includes("ত্রৈমাসিক")) freq = "ত্রৈমাসিক";
    else if (profitStr.includes("ষাণ্মাসিক") || profitStr.includes("ষান্মাসিক")) freq = "ষাণ্মাসিক";
  }

  return { percentage, freq };
}
