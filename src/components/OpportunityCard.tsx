import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, BadgeCheck, Sprout, AlertTriangle, Handshake, Clock } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
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
      return { bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40", text: "text-emerald-700 dark:text-emerald-400" };
    case "med":
      return { bg: "bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40", text: "text-orange-700 dark:text-orange-400" };
    case "high":
      return { bg: "bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40", text: "text-red-700 dark:text-red-400" };
  }
}

/* ──── Card Ambient Frosted Gradients (matching reference image) ──── */
const CARD_GRADIENTS = [
  // 1. Sage / Dark Forest Frosted Tint (Ref Card 1)
  "from-[#243d34]/95 via-[#1b2f28]/95 to-[#12201b]/95",
  // 2. Warm Sunset / Amber Slate Frosted Tint (Ref Card 2)
  "from-[#343e4c]/95 via-[#3a3229]/95 to-[#1d1d20]/95",
  // 3. Twilight Cyan / Blue Dusk Frosted Tint (Ref Card 3)
  "from-[#1c2c44]/95 via-[#1b2234]/95 to-[#111622]/95",
  // 4. Olive Forest / Meadow Frosted Tint (Ref Card 4)
  "from-[#2e3728]/95 via-[#232c20]/95 to-[#151c14]/95",
];

/* ────────────────────────────────────────────────────────────
   Main OpportunityCard - Replicated 1:1 from Reference Design
   ──────────────────────────────────────────────────────────── */
export function OpportunityCard({
  project,
  index = 0,
  onQuickView,
  isComparing = false,
  onCompareToggle,
}: {
  project: Opportunity;
  index?: number;
  onQuickView?: () => void;
  isComparing?: boolean;
  onCompareToggle?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(project.id);

  const handleCardClick = () => {
    navigate({ to: "/opportunities/$id", params: { id: project.id } });
  };

  const funded = isFullyFunded(project);
  const catIcon = getCategoryIcon(project.category);
  const risk = getRiskLevel(project);
  const profitData = formatProfit(project.expected_profit || "", project.profit_period);

  const cardImage =
    (project.image_urls && project.image_urls.length > 0 && project.image_urls[0]?.trim()) ||
    resolveImageUrl(project);

  const gradientClass = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

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
        className={`group relative flex flex-col justify-between min-h-[480px] overflow-hidden rounded-[2rem] border border-white/20 dark:border-white/10 bg-gradient-to-b ${gradientClass} backdrop-blur-md p-3.5 sm:p-4 shadow-xl shadow-black/10 cursor-pointer hover:scale-105 transition-transform duration-300 ${
          funded ? "opacity-80 hover:opacity-100" : ""
        }`}
      >
        {/* ── Top Inset Image ── */}
        <div className="relative w-full aspect-[4/3] rounded-[1.4rem] overflow-hidden bg-zinc-900/60 shadow-inner">
          {!imgError && cardImage ? (
            <img
              src={cardImage}
              alt={`${project.name} বিনিয়োগ সুযোগ`}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/40">
              <span className="text-3xl">{catIcon.icon}</span>
            </div>
          )}

          {/* Smooth gradient overlay over photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Top-Right Frosted Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(project.id);
            }}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white/90 hover:bg-black/50 hover:text-white transition-all shadow-sm cursor-pointer"
            title="বুকমার্ক"
          >
            <Bookmark className={`h-4 w-4 stroke-[2] ${saved ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        </div>

        {/* ── Agency/Category + Verified Badge & Title ── */}
        <div className="mt-3 flex flex-col items-center justify-center text-center px-1">
          {/* Category name + Verified check badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-white/85">
            <span className="line-clamp-1">{project.category || "ব্যবসা"}</span>
            <BadgeCheck className="h-3.5 w-3.5 fill-amber-400 text-zinc-950 shrink-0" />
          </div>

          {/* Bold White Title */}
          <h3 className="mt-1 text-center font-bold text-base sm:text-lg text-white tracking-tight line-clamp-1 group-hover:text-amber-100 transition-colors">
            {project.name || "—"}
          </h3>
        </div>

        {/* ── Middle Meta Info (3-Badge Row & Payment Schedule) ── */}
        <div className="my-auto py-2 flex flex-col items-center justify-center">
          {/* ── Badge row — 3 inline pill badges side by side ── */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 px-0.5">
            {/* Category: green background */}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm font-medium">
              <Sprout className="h-3 w-3 shrink-0 text-emerald-400" />
              <span className="truncate max-w-[85px]">{project.category || "এগ্রো/কৃষি"}</span>
            </span>

            {/* Risk Level: amber/orange background */}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm font-medium">
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
              <span>{risk.label || "মধ্যম ঝুঁকি"}</span>
            </span>

            {/* Investment Type: blue/purple background */}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm font-medium">
              <Handshake className="h-3 w-3 shrink-0 text-blue-400" />
              <span className="truncate max-w-[85px]">{project.investment_type || "মুশারাকা"}</span>
            </span>
          </div>

          {/* ── Payment Schedule ── */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-white/75 font-medium">
            <Clock className="h-3.5 w-3.5 text-white/60 shrink-0" />
            <span>{project.profit_period || "চুক্তি অনুযায়ী"}</span>
          </div>
        </div>

        {/* ── Dark Bottom Info Bar (Two Columns) ── */}
        <div className="mt-auto rounded-[1.25rem] bg-[#141816]/85 dark:bg-black/60 backdrop-blur-md border border-white/10 p-3 sm:p-3.5 grid grid-cols-2 gap-2 items-center">
          {/* Left Column (Timer-style) */}
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-zinc-400 tracking-wide mb-1 truncate">
              সর্বনিম্ন বিনিয়োগ
            </div>
            <div className="flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm tracking-tight truncate">
              <span className="h-2 w-2 rounded-full bg-white/90 shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
              <span className="truncate">{project.investment_amount || "৳ ৫০,০০০"}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="min-w-0 text-right">
            <div className="text-[11px] font-medium text-zinc-400 tracking-wide mb-1 truncate">
              মুনাফা
            </div>
            <div className="text-right font-bold text-xs sm:text-sm text-[#d4e857] tracking-tight truncate">
              {profitData.percentage}
            </div>
          </div>
        </div>
      </div>
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
