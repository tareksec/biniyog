import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  type PublicProject,
  isFullyFunded,
  isOpen,
  statusLabel,
  fundingProgress,
  getRiskLevel,
  resolveImageUrl,
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
  const percent = fundingProgress(project);
  const risk = getRiskLevel(project);
  
  const imageUrl = resolveImageUrl(project);

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
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.25rem] border bg-card shadow-[var(--shadow-card)] transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 hover:shadow-[var(--shadow-elevated)] ${
          funded
            ? "border-border/60 opacity-80 grayscale hover:grayscale-0 hover:border-primary/40"
            : "border-border hover:border-primary/40 hover:ring-1 hover:ring-primary/20"
        }`}
      >
        <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
          <img 
            src={imageUrl} 
            alt={project.project_name || "প্রজেক্টের ছবি"}
            loading="lazy"
            onError={(e) => {
              // If the image fails to load, use the category fallback directly
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop";
            }}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
            <span
              className={`pill backdrop-blur-md border-none shadow-sm font-medium ${
                active
                  ? "bg-white/90 text-primary"
                  : "bg-white/80 text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
              {statusLabel(project)}
            </span>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs uppercase tracking-widest text-white/90 font-semibold drop-shadow-md">
                {project.company_maturity || "—"}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm backdrop-blur-md bg-white/90 ${risk.color} shadow-sm`}>
                {risk.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-foreground line-clamp-2">
            {project.project_name || "—"}
          </h3>
          {project.founder_name && (
            <p className="mt-1.5 text-[15px] font-semibold text-foreground/85 line-clamp-1">
              {project.founder_name}
            </p>
          )}
          <p className="mt-1.5 text-sm text-muted-foreground font-medium">
            {project.business_type || "ব্যবসার ধরন —"}
          </p>

          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-muted-foreground">তহবিল সংগ্রহ</span>
              <span className="text-primary font-bold">{Math.round(percent)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percent}%` }} 
              />
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  বিনিয়োগ প্রয়োজন
                </div>
                <div className="num mt-1.5 text-[17px] font-bold text-foreground leading-none">
                  {project.investment_required || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  সম্ভাব্য লাভ
                </div>
                <div className="num mt-1.5 text-[17px] font-bold text-primary leading-none">
                  {formatProfit(project.expected_profit_annual || "").percentage}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-primary/70">
                  {formatProfit(project.expected_profit_annual || "").freq} পেআউট
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition group-hover:gap-2.5">
                বিস্তারিত দেখুন
                <ArrowRight />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function formatProfit(profitStr: string) {
  if (!profitStr) return { percentage: "—", freq: "বার্ষিক" };
  
  const match = profitStr.match(/([\d०-९০-৯\-–\s]+%)/);
  const percentage = match ? match[1].trim() : profitStr.replace(/^বছরে\s*সম্ভাব্য\s*লাভ\s*/, "");
  
  let freq = "বার্ষিক";
  if (profitStr.includes("মাসিক")) freq = "মাসিক";
  else if (profitStr.includes("ত্রৈমাসিক")) freq = "ত্রৈমাসিক";
  else if (profitStr.includes("ষাণ্মাসিক") || profitStr.includes("ষান্মাসিক")) freq = "ষাণ্মাসিক";
  
  return { percentage, freq };
}
