## Scope

Enhance the landing page with filtering/sorting, richer detail page, FAQ, testimonials, dashboard mockup, and UI polish. All frontend/presentation only — no backend or schema changes.

## Changes

### 1. Filter & Sort bar (`src/routes/index.tsx` + new `src/components/OpportunityFilters.tsx`)
- Extract the `Opportunities` section into a client component with `useState` for category filter + sort key.
- Categories derived from unique `business_type` values in `public-projects.json` (Bengali labels as-is).
- Sort options: `default`, `investment_asc`, `investment_desc`, `roi_desc` — parse leading numeric from `investment_required` / `expected_profit_annual` strings via a small helper in `src/lib/projects.ts`.
- Pills-style filter chips (mobile: horizontal scroll), sort as a `<select>` styled to match the design.
- Keep funded-last ordering as a secondary sort.

### 2. Detail page enhancements (`src/routes/opportunities.$id.tsx`)
- Add sections (placeholder copy in Bengali):
  - **ব্যবসার পটভূমি** — reuse `entrepreneur_description` + placeholder paragraph.
  - **ঝুঁকি বিশ্লেষণ** — 3 risk items with severity dots (low/med/high placeholders).
  - **আইনি নিরাপত্তা** — bullet list (chuktinama, security check, escrow placeholder).
  - **তহবিল সংগ্রহের অগ্রগতি** — animated progress bar (funded % — deterministic pseudo value from id hash so it's stable; 100% for fully-funded).
- Keep existing Google Sheet reveal button.

### 3. FAQ accordion (`src/components/FaqSection.tsx`)
- Use existing shadcn `accordion` (check `components.json` — install if missing).
- 5 items: Mudaraba model, legal compliance, profit distribution, risk, exit.
- Mount on landing page between Testimonials and FinalCTA.

### 4. Testimonials carousel (`src/components/TestimonialsSection.tsx`)
- Use `embla-carousel-react` (already common in shadcn stack; add if missing) or simple framer-motion auto-scroll.
- 4–5 mock investor testimonials (Bengali names, quotes, avatar initials).
- Mount on landing page between InstructorSection and Opportunities (or after Opportunities — placed after Opportunities for flow).

### 5. Dashboard mockup (`src/routes/dashboard.tsx`)
- New route `/dashboard`, linked from `Nav` in `index.tsx` + published in `__root.tsx` head metadata if needed.
- Sections:
  - Summary cards (Total invested, Active projects, YTD profit).
  - Portfolio distribution donut chart (`recharts` PieChart).
  - Monthly payout bar chart (`recharts` BarChart).
  - Payout schedule table (mock rows).
- All static mock data.

### 6. UI polish
- `OpportunityCard`: tighten hover — `hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl transition-all duration-300`, subtle ring on hover.
- Ensure filter bar + new sections use the responsive grid patterns (`min-w-0`, `shrink-0`).
- Confirm mobile layout for dashboard charts (stack < md).

### Technical

- Deps to add if missing: `recharts` (dashboard). Accordion likely already present under `src/components/ui/accordion.tsx` — check first.
- No backend changes. No sensitive-data changes.
- Bengali copy only (no Arabic loanwords per prior rule).
- Keep existing `HeroIllustration`, `InstructorSection`, footer intact.

### Out of scope

- Real filtering persistence in URL (can add later via TanStack search params if desired).
- Real dashboard auth / data.
