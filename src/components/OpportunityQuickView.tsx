import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import {
  type Opportunity,
  statusLabel,
  getRiskLevel,
  resolveImageUrl,
} from "@/lib/projects";
import {
  getCategoryIcon,
  riskChipStyle,
  formatProfit
} from "@/components/OpportunityCard";

export function OpportunityQuickView({
  project,
  isOpen,
  onClose,
}: {
  project: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!project) return null;

  const risk = getRiskLevel(project);
  const catIcon = getCategoryIcon(project.category);
  const profitData = formatProfit(project.expected_profit || "", project.profit_period);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl gap-0">
        <div className="relative h-48 w-full bg-muted">
          <img
            src={resolveImageUrl(project)}
            alt={project.name || "Project image"}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=80&auto=format&fit=crop";
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-background/90 backdrop-blur text-foreground shadow-sm">
              {statusLabel(project)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <DialogTitle className="text-xl font-bold font-display text-foreground leading-tight mb-2">
            {project.name || "—"}
          </DialogTitle>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${catIcon.bg} ${catIcon.fg}`}>
              {catIcon.icon} {project.category || "অন্যান্য"}
            </span>
            {risk && (
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${riskChipStyle(risk.level).bg} ${riskChipStyle(risk.level).text}`}>
                {risk.level === "low" && "নিম্ন ঝুঁকি"}
                {risk.level === "med" && "মধ্যম ঝুঁকি"}
                {risk.level === "high" && "উচ্চ ঝুঁকি"}
              </span>
            )}
            {project.profit_period && (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold bg-muted/50 text-muted-foreground">
                {project.profit_period}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl bg-surface p-4 border border-border/50">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                নুন্যতম বিনিয়োগ
              </div>
              <div className="text-lg font-bold text-foreground">
                {project.investment_amount || "—"}
              </div>
            </div>
            <div className="rounded-xl bg-surface p-4 border border-border/50">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                প্রত্যাশিত লাভ
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">
                  {profitData.percentage}
                </span>
                {profitData.percentage !== "—" && (
                  <span className="text-xs font-medium text-muted-foreground">
                    /{profitData.freq}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/opportunities/$id"
            params={{ id: project.id }}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-[15px] font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            সম্পূর্ণ বিস্তারিত দেখুন
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
