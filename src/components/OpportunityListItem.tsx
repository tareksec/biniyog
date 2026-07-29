import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
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
import {
  getCategoryIcon,
  getStatusRingColors,
  riskChipStyle,
  CircularProgress,
  formatProfit
} from "@/components/OpportunityCard";

export function OpportunityListItem({
  project,
  index,
  onQuickView,
}: {
  project: Opportunity;
  index: number;
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
  const profitData = formatProfit(project.expected_profit || "", project.profit_period);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        onClick={handleCardClick}
        className={`group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 overflow-hidden rounded-2xl bg-card p-4 sm:p-5 border border-border shadow-sm transition-all duration-300 ease-out cursor-pointer hover:shadow-md hover:border-primary/30 ${
          funded ? "opacity-75 hover:opacity-100" : ""
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark(project.id); }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors shadow-sm"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} />
        </button>

        {/* Left: Thumbnail and Progress Ring */}
        <div className="relative shrink-0 flex items-center justify-center mt-6 sm:mt-0">
          <CircularProgress
            percent={percent}
            status={project.status}
            label={percent + "%"}
            size={72}
            strokeWidth={4}
          />
          <div className="absolute h-12 w-12 rounded-full overflow-hidden ring-2 ring-background">
            <img
              src={resolveImageUrl(project)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=80&auto=format&fit=crop";
              }}
            />
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${catIcon.bg} ${catIcon.fg}`}>
              {catIcon.icon} {project.category || "অন্যান্য"}
            </span>
            {risk && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskChipStyle(risk.level).bg} ${riskChipStyle(risk.level).text}`}>
                {risk.level === "low" && "নিম্ন ঝুঁকি"}
                {risk.level === "med" && "মধ্যম ঝুঁকি"}
                {risk.level === "high" && "উচ্চ ঝুঁকি"}
              </span>
            )}
          </div>
          
          <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {project.name || "—"}
          </h3>
          
          {project.owner_name && (
            <p className="text-[13px] text-muted-foreground font-medium line-clamp-1">
              {project.owner_name}
            </p>
          )}
        </div>

        {/* Right: Key Stats & Status */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <div className="text-left sm:text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-0.5">
              প্রত্যাশিত লাভ
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold text-primary">
                {profitData.percentage}
              </span>
              {profitData.percentage !== "—" && (
                <span className="text-xs font-semibold text-muted-foreground">
                  /{profitData.freq}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <span
              className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold shadow-sm ${
                active
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : funded
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {statusLabel(project)}
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 ml-auto border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0 w-full sm:w-auto flex justify-center">
          <Link
            to="/opportunities/$id"
            params={{ id: project.id }}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            বিস্তারিত দেখুন
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
