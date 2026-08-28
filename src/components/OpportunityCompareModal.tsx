import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { type Opportunity, resolveImageUrl, statusLabel, getRiskLevel } from "@/lib/projects";
import { getCategoryIcon, riskChipStyle, formatProfit } from "@/components/OpportunityCard";

export function OpportunityCompareModal({
  projects,
  isOpen,
  onClose,
  onRemove,
}: {
  projects: Opportunity[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <DialogTitle className="text-xl font-bold font-display text-foreground">
            সুযোগ তুলনা
          </DialogTitle>
          <DialogDescription>
            পাশাপাশি ২-৩টি সুযোগের বিস্তারিত তুলনা দেখুন
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-x-auto flex-1 bg-surface">
          <div className="min-w-[600px] p-6">
            <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-4 mb-8">
              {/* Row: Header / Images */}
              <div className="font-semibold text-muted-foreground pt-4">প্রজেক্ট</div>
              <div className={`grid gap-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => {
                  const catIcon = getCategoryIcon(p.category);
                  return (
                    <div key={p.id} className="relative rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center">
                      <button 
                        onClick={() => onRemove(p.id)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold shadow-sm hover:scale-110 transition-transform"
                      >
                        ×
                      </button>
                      <div className="h-16 w-16 rounded-full overflow-hidden mb-3 ring-2 ring-muted">
                        <img 
                          src={resolveImageUrl(p)} 
                          alt="" 
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=80&auto=format&fit=crop"; }}
                        />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold mb-2 ${catIcon.bg} ${catIcon.fg}`}>
                        {catIcon.icon} {p.category || "অন্যান্য"}
                      </span>
                      <h4 className="font-bold text-[13px] leading-tight line-clamp-2">{p.name || "—"}</h4>
                    </div>
                  );
                })}
              </div>

              {/* Row: Status */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">স্ট্যাটাস</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => (
                  <div key={p.id} className="text-[13px] font-medium text-foreground">{statusLabel(p)}</div>
                ))}
              </div>

              {/* Row: Investment Amount */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">নুন্যতম বিনিয়োগ</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => (
                  <div key={p.id} className="text-[15px] font-bold text-foreground num">{p.investment_amount || "—"}</div>
                ))}
              </div>

              {/* Row: Expected Profit */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">প্রত্যাশিত লাভ</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => {
                  const data = formatProfit(p.expected_profit || "", p.profit_period);
                  return (
                    <div key={p.id} className="flex flex-col">
                      <span className="text-[15px] font-bold text-primary num">{data.percentage}</span>
                      <span className="text-[11px] text-muted-foreground">{data.freq}</span>
                    </div>
                  );
                })}
              </div>

              {/* Row: Profit Period */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">চুক্তির মেয়াদ</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => (
                  <div key={p.id} className="text-[13px] font-medium text-foreground">{p.profit_period || "—"}</div>
                ))}
              </div>

              {/* Row: Risk Level */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">ঝুঁকির মাত্রা</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => {
                  const r = getRiskLevel(p);
                  return (
                    <div key={p.id}>
                      {r ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${riskChipStyle(r.level).bg} ${riskChipStyle(r.level).text}`}>
                          {r.level === "low" && "নিম্ন ঝুঁকি"}
                          {r.level === "med" && "মধ্যম ঝুঁকি"}
                          {r.level === "high" && "উচ্চ ঝুঁকি"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row: Investment Type */}
              <div className="font-semibold text-sm text-muted-foreground flex items-center border-t border-border/50 pt-4">বিনিয়োগ ধরণ</div>
              <div className={`grid gap-4 border-t border-border/50 pt-4 ${projects.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {projects.map((p) => (
                  <div key={p.id} className="text-[13px] font-medium text-foreground">{p.investment_type || "—"}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
