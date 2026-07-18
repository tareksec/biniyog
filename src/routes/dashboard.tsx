import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড · বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content: "আপনার পোর্টফোলিও, বিনিয়োগ বন্টন ও মুনাফা পেআউটের বিস্তারিত ওভারভিউ।",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const PIE = [
  { name: "এগ্রো", value: 35 },
  { name: "ই-কমার্স", value: 25 },
  { name: "রিটেইল", value: 20 },
  { name: "টেক / স্টার্টআপ", value: 15 },
  { name: "অন্যান্য", value: 5 },
];

const BARS = [
  { m: "জানু", payout: 12000 },
  { m: "ফেব্রু", payout: 14500 },
  { m: "মার্চ", payout: 13800 },
  { m: "এপ্রিল", payout: 16200 },
  { m: "মে", payout: 15400 },
  { m: "জুন", payout: 17800 },
];

const PAYOUTS = [
  { date: "১০ জুলাই ২০২৬", project: "গ্রীন এগ্রো লিমিটেড", amount: "৳ ১৮,৫০০", status: "সম্পন্ন" },
  { date: "২৮ জুন ২০২৬", project: "নোভা ই-কমার্স", amount: "৳ ২২,০০০", status: "সম্পন্ন" },
  { date: "১৫ জুন ২০২৬", project: "সবুজ রিটেইল চেইন", amount: "৳ ১০,২০০", status: "সম্পন্ন" },
  { date: "১০ আগস্ট ২০২৬", project: "গ্রীন এগ্রো লিমিটেড", amount: "৳ ১৮,৫০০", status: "নির্ধারিত" },
  { date: "৩০ আগস্ট ২০২৬", project: "টেকল্যাব স্টার্টআপ", amount: "৳ ১২,৭৫০", status: "নির্ধারিত" },
];

const COLORS = ["#146C43", "#2FA36F", "#5BBF8F", "#A7DCC0", "#D6ECDE"];

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            হোমে ফিরে যান
          </Link>
          <span className="text-sm font-bold">ড্যাশবোর্ড (প্রোটোটাইপ)</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">আপনার পোর্টফোলিও</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ডেমো ডেটা · প্রকৃত অ্যাকাউন্টের সাথে যুক্ত হলে এখানে লাইভ তথ্য দেখাবে।
            </p>
          </div>
          <span className="pill bg-accent text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            লাইভ প্রিভিউ
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="মোট বিনিয়োগ" value="৳ ৫,৪০,০০০" hint="৭ টি সক্রিয় প্রজেক্ট" />
          <SummaryCard label="YTD মুনাফা" value="৳ ৯৪,৭০০" hint="+১৭.৫% ROI" accent />
          <SummaryCard label="পরবর্তী পেআউট" value="৳ ১৮,৫০০" hint="১০ আগস্ট ২০২৬" />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-5">
          <ChartCard title="পোর্টফোলিও বন্টন" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={PIE}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="none"
                >
                  {PIE.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="মাসিক পেআউট (৳)" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BARS}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => `৳ ${v.toLocaleString()}`} />
                <Bar dataKey="payout" fill="#146C43" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold">পেআউট শিডিউল</h3>
            <span className="text-xs text-muted-foreground">গত ও আসন্ন ট্রানজেকশন</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">তারিখ</th>
                  <th className="px-5 py-3 font-medium">প্রজেক্ট</th>
                  <th className="px-5 py-3 font-medium">পরিমাণ</th>
                  <th className="px-5 py-3 font-medium">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="px-5 py-3 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3">{r.project}</td>
                    <td className="num px-5 py-3 font-semibold">{r.amount}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "সম্পন্ন"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            r.status === "সম্পন্ন" ? "bg-primary" : "bg-muted-foreground"
                          }`}
                        />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`num mt-2 text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}>
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </div>
  );
}