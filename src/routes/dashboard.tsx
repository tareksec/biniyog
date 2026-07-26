import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
} from "recharts";
import { fetchOpportunities, parseAmount, parseRoi, statusLabel } from "@/lib/projects";
import { getCategoryIcon } from "@/components/OpportunityCard";
import { ArrowRight, Briefcase, Activity, TrendingUp, PiggyBank, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    return await fetchOpportunities();
  },
  head: () => ({
    meta: [
      { title: "সুযোগসমূহ ওভারভিউ · সমৃদ্ধি" },
      {
        name: "description",
        content: "সব বিনিয়োগ সুযোগের সার্বিক চিত্র এবং অ্যানালিটিক্স।",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: DashboardPage,
});

// A tiny static decorative sparkline for KPI cards
function MiniSparkline({ color }: { color: string }) {
  return (
    <svg width="60" height="25" viewBox="0 0 60 25" className="opacity-40">
      <path
        d="M0 20 Q 10 5, 20 15 T 40 10 T 60 5"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const STATUS_COLORS: Record<string, string> = {
  "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে": "#146C43",
  "বিনিয়োগ নেওয়া শেষের দিকে": "#eab308",
  "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ": "#64748b",
  "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে": "#64748b",
};

function DashboardPage() {
  const opportunities = Route.useLoaderData();

  const metrics = useMemo(() => {
    let active = 0;
    let totalAmount = 0;
    let totalRoi = 0;
    let validRoiCount = 0;

    const categoryMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const rangeMap = {
      "< ১ লক্ষ": 0,
      "১ - ৫ লক্ষ": 0,
      "৫ - ১০ লক্ষ": 0,
      "১০+ লক্ষ": 0,
    };

    opportunities.forEach((p) => {
      // Basic counts
      if (p.status?.includes("চলমান-সুযোগ আছে")) active++;

      // Amount
      const amt = parseAmount(p.investment_amount);
      totalAmount += amt;

      if (amt < 100000) rangeMap["< ১ লক্ষ"]++;
      else if (amt <= 500000) rangeMap["১ - ৫ লক্ষ"]++;
      else if (amt <= 1000000) rangeMap["৫ - ১০ লক্ষ"]++;
      else rangeMap["১০+ লক্ষ"]++;

      // ROI
      const roi = parseRoi(p.expected_profit);
      if (roi > 0) {
        totalRoi += roi;
        validRoiCount++;
      }

      // Categories
      const cat = p.category || "অন্যান্য";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      // Status
      const stat = p.status || "অজানা";
      statusMap[stat] = (statusMap[stat] || 0) + 1;
    });

    // Formatting total amount
    let formattedAmount = "";
    if (totalAmount >= 10000000) {
      formattedAmount = `${(totalAmount / 10000000).toFixed(2)} কোটি`;
    } else if (totalAmount >= 100000) {
      formattedAmount = `${(totalAmount / 100000).toFixed(2)} লক্ষ`;
    } else {
      formattedAmount = totalAmount.toLocaleString();
    }

    return {
      total: opportunities.length,
      active,
      avgRoi: validRoiCount > 0 ? (totalRoi / validRoiCount).toFixed(1) : "0",
      totalAmountFormatted: `৳ ${formattedAmount}`,
      totalAmountRaw: totalAmount,
      categories: Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      statuses: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      ranges: Object.entries(rangeMap).map(([name, value]) => ({ name, value })),
    };
  }, [opportunities]);

  const recentOpps = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [opportunities]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg z-50">
          <p className="font-bold text-foreground text-sm mb-1">{label || payload[0].name}</p>
          <p className="text-primary font-semibold text-sm">
            পরিমাণ: <span className="num">{payload[0].value}</span> টি
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary/5 pt-28 pb-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight mb-2">
              সুযোগসমূহ ওভারভিউ
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              সব বিনিয়োগ সুযোগের সার্বিক চিত্র ও পরিসংখ্যান
            </p>
          </div>
          <Link 
            to="/opportunities" 
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-foreground shadow-sm hover:shadow transition-shadow border border-border"
          >
            সব সুযোগ দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 -mt-6 space-y-6">
        
        {/* Top Highlight & KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Highlight Card */}
          <div className="lg:col-span-1 rounded-[2rem] bg-gradient-to-br from-primary via-[#0f5434] to-[#0a3621] p-8 text-primary-foreground shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-transform hover:scale-[1.01] duration-300">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm text-white/90 mb-4">
                <Activity className="h-3.5 w-3.5" /> লাইভ মার্কেট
              </div>
              <h2 className="text-lg font-medium text-white/80 mb-1">মোট বিনিয়োগযোগ্য পরিমাণ</h2>
              <div className="text-4xl sm:text-5xl font-display font-black tracking-tight num">
                {metrics.totalAmountFormatted}
              </div>
            </div>
            <div className="relative z-10 mt-6 flex justify-between items-end">
              <p className="text-sm font-medium text-white/70 max-w-[200px]">
                প্ল্যাটফর্মে থাকা সকল সুযোগের মোট মূলধন।
              </p>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* 3 KPIs */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KpiCard 
              label="মোট সুযোগ" 
              value={metrics.total.toString()} 
              icon={<Briefcase className="h-5 w-5" />} 
              color="#146C43"
            />
            <KpiCard 
              label="সক্রিয় সুযোগ" 
              value={metrics.active.toString()} 
              icon={<Activity className="h-5 w-5" />} 
              color="#2FA36F"
            />
            <KpiCard 
              label="গড় সম্ভাব্য লাভ" 
              value={`${metrics.avgRoi}%`} 
              icon={<PiggyBank className="h-5 w-5" />} 
              color="#0ea5e9"
            />
          </div>
        </div>

        {/* Charts Grid Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Breakdown */}
          <div className="rounded-[1.5rem] bg-card p-6 shadow-sm border border-border transition-shadow hover:shadow-md duration-300">
            <h3 className="text-base font-bold text-foreground mb-6">ক্যাটাগরি অনুযায়ী সুযোগ</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} allowDecimals={false} className="text-muted-foreground" />
                  <Tooltip cursor={{ fill: 'rgba(20, 108, 67, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#146C43" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-[1.5rem] bg-card p-6 shadow-sm border border-border transition-shadow hover:shadow-md duration-300">
            <h3 className="text-base font-bold text-foreground mb-6">স্ট্যাটাস ডিস্ট্রিবিউশন</h3>
            <div className="h-[280px] w-full flex flex-col sm:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.statuses}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {metrics.statuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 w-full sm:w-1/2 px-2 mt-4 sm:mt-0">
                {metrics.statuses.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || "#94a3b8" }} />
                      <span className="text-xs font-semibold text-muted-foreground line-clamp-2">{s.name.replace("বিনিয়োগ নেওয়া ", "")}</span>
                    </div>
                    <span className="font-bold text-sm num ml-2">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Third Row: Investment Range & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Investment Range */}
          <div className="lg:col-span-2 rounded-[1.5rem] bg-card p-6 shadow-sm border border-border transition-shadow hover:shadow-md duration-300">
            <h3 className="text-base font-bold text-foreground mb-6">বিনিয়োগের পরিমাণ (রেঞ্জ)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ranges} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} allowDecimals={false} className="text-muted-foreground" />
                  <Tooltip cursor={{ fill: 'rgba(20, 108, 67, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#5BBF8F" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Opportunities */}
          <div className="lg:col-span-1 rounded-[1.5rem] bg-card shadow-sm border border-border overflow-hidden flex flex-col transition-shadow hover:shadow-md duration-300">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">নতুন সুযোগসমূহ</h3>
              <Link to="/opportunities" className="text-xs font-bold text-primary hover:underline">সব দেখুন</Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentOpps.map((opp, i) => {
                const catIcon = getCategoryIcon(opp.category);
                return (
                  <Link 
                    key={opp.id}
                    to="/opportunities/$id"
                    params={{ id: opp.id }}
                    className={`block p-4 hover:bg-muted/60 transition-colors ${i !== recentOpps.length -1 ? 'border-b border-border/60' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{opp.name}</h4>
                      <div className="text-right shrink-0">
                        <div className="text-[13px] font-bold text-primary num">{opp.investment_amount}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${catIcon.bg} ${catIcon.fg}`}>
                        {catIcon.icon} <span className="line-clamp-1 max-w-[80px]">{opp.category || "অন্যান্য"}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground truncate ml-2">
                        {statusLabel(opp)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="rounded-[1.5rem] bg-card p-6 shadow-sm border border-border relative overflow-hidden flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 cursor-default min-h-[160px]">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0" style={{ color }}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <div className="text-3xl font-display font-extrabold text-foreground num tracking-tight">
          {value}
        </div>
      </div>
      <div className="absolute -bottom-3 -right-4 pointer-events-none">
        <MiniSparkline color={color} />
      </div>
    </div>
  );
}