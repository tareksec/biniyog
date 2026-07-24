import { uniqueCategories, type Opportunity } from "@/lib/projects";

export type SortKey = "default" | "investment_asc" | "investment_desc" | "roi_desc";

export function OpportunityFilters({
  projects,
  category,
  onCategory,
  sort,
  onSort,
}: {
  projects: Opportunity[];
  category: string;
  onCategory: (c: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}) {
  const cats = ["all", ...uniqueCategories(projects)];

  const getCategoryIcon = (c: string) => {
    if (c === "all") return "🚀";
    if (c.includes("এগ্রো") || c.includes("কৃষি")) return "🌾";
    if (c.includes("গার্মেন্টস") || c.includes("ফ্যাশন") || c.includes("কাপড়")) return "👕";
    if (c.includes("আইটি") || c.includes("টেক")) return "💻";
    if (c.includes("ট্রেডিং") || c.includes("বাণিজ্য")) return "📦";
    if (c.includes("ফার্মেসী") || c.includes("হেলথ") || c.includes("মেডিসিন")) return "⚕️";
    if (c.includes("ই-কমার্স") || c.includes("রিটেইল")) return "🛒";
    if (c.includes("খাবার") || c.includes("রেস্টুরেন্ট") || c.includes("ফুড")) return "🍽️";
    return "💡";
  };
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {cats.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => onCategory(c)}
              className={`shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elevated)] scale-105"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-sm"
              }`}
            >
              <span>{getCategoryIcon(c)}</span>
              {c === "all" ? "সব ক্যাটাগরি" : c}
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm">
        <label htmlFor="sort-select" className="text-muted-foreground">সাজান:</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground outline-none transition focus:border-primary"
        >
          <option value="default">ডিফল্ট</option>
          <option value="investment_asc">বিনিয়োগ: কম → বেশি</option>
          <option value="investment_desc">বিনিয়োগ: বেশি → কম</option>
          <option value="roi_desc">সম্ভাব্য মুনাফা: বেশি → কম</option>
        </select>
      </div>
    </div>
  );
}