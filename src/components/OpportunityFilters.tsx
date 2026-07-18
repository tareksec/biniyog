import { uniqueCategories, type PublicProject } from "@/lib/projects";

export type SortKey = "default" | "investment_asc" | "investment_desc" | "roi_desc";

export function OpportunityFilters({
  projects,
  category,
  onCategory,
  sort,
  onSort,
}: {
  projects: PublicProject[];
  category: string;
  onCategory: (c: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}) {
  const cats = ["all", ...uniqueCategories(projects)];
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {cats.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => onCategory(c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c === "all" ? "সব ক্যাটাগরি" : c}
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm">
        <label className="text-muted-foreground">সাজান:</label>
        <select
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