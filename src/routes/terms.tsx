import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldAlert, FileCheck, Ban, UserX, AlertTriangle, CheckCircle2, ChevronRight, BookOpen, ShieldCheck, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মের ব্যবহারের নিয়মাবলী ও বিনিয়োগের আবশ্যকীয় শর্তাবলী।" },
      { property: "og:title", content: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { property: "og:description", content: "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মের ব্যবহারের নিয়মাবলী ও বিনিয়োগের আবশ্যকীয় শর্তাবলী।" },
      { name: "twitter:title", content: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { name: "twitter:description", content: "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মের ব্যবহারের নিয়মাবলী ও বিনিয়োগের আবশ্যকীয় শর্তাবলী।" },
    ],
  }),
  component: TermsPage,
});

const TERMS_ITEMS = [
  {
    id: 1,
    icon: ShieldAlert,
    title: "আমরা নিজেরা ব্যাক্তিগতভাবে কোনো প্রকার বিনিয়োগ গ্রহণ করি না।",
    subtitle: "সরাসরি ডিপোজিট বা তহবিল মুক্ত নীতি",
    description: "বিনিয়োগ বৃদ্ধি শুধুমাত্র ব্যবসায়িক তথ্য যাচাই-বাছাই ও নিরপেক্ষ মূল্যায়ন রিপোর্ট (Evaluation Report) প্রস্তুতকারী প্ল্যাটফর্ম হিসেবে কাজ করে। আমরা কোনো আর্থিক প্রতিষ্ঠান নই এবং নিজেরা কোনো বিনিয়োগ বা আমানত গ্রহণ করি না।",
    badge: "মূল নীতি",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    id: 2,
    icon: FileCheck,
    title: "ব্যাবসা প্রতিষ্ঠানের প্রয়োজনীয় তথ্য ও নথিপত্র পুঙ্খানুপুঙ্খভাবে যাচাই-বাছাই করার পরই কেবল মূল্যায়ন রিপোর্ট প্রকাশ করি।",
    subtitle: "পেশাদার অডিট ও ডেটা অ্যানালাইসিস",
    description: "উদ্যোক্তার সততা, ব্যবসায়িক ট্র্যাক রেকর্ড, আর্থিক বিবরণী, ট্রেড লাইসেন্স এবং মাঠপর্যায়ের বাস্তবতা কঠোরভাবে যাচাই করার পরই প্রতিটি প্রকল্পের বিস্তারিত মূল্যায়ন রিপোর্ট প্রকাশ করা হয়।",
    badge: "যাচাই প্রক্রিয়া",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    id: 3,
    icon: Ban,
    title: "অনলাইনে বিজ্ঞাপন দিয়ে ক্রাউড ফান্ডিং করা ব্যবসা, MLM, ইনস্যুরেন্স, ভূমি দস্যুতা, সুদের সাথে ইচ্ছাকৃত জড়িত কোনো প্রতিষ্ঠান আমরা মূল্যায়ণ করি না।",
    subtitle: "কঠোরভাবে নিষিদ্ধ খাত ও অননুমোদিত কার্যক্রম",
    description: "শরীয়াহ ও আইনগতভাবে প্রশ্নবিদ্ধ যেকোনো ব্যবসা মডেল সম্পূর্ণভাবে আমাদের আওতাবহির্ভূত। আমরা শুধুমাত্র স্বচ্ছ, বাস্তবমুখী ও হালাল উৎপাদনশীল ব্যবসার সাথে সম্পৃক্ত থাকি।",
    badge: "কঠোর নিষেধাজ্ঞা",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    id: 4,
    icon: UserX,
    title: "যেসকল প্রতিষ্ঠানের অর্থনৈতিক অবস্থা আশঙ্কাজনক, মালিক ব্যবসা অযোগ্য, ব্যক্তিগত জীবনে অসৎ বা যাদের বিরুদ্ধে অসদাচরণের সুস্পষ্ট অভিযোগ রয়েছে তাদেরকে গ্রহণ করা হবে না।",
    subtitle: "উদ্যোক্তা যোগ্যতা ও চারিত্রিক সততার মানদণ্ড",
    description: "ব্যবসার পাশাপাশি উদ্যোক্তার সততা ও দায়বদ্ধতা আমাদের কাছে সর্বাধিক গুরুত্বপূর্ণ। অদক্ষ বা অনৈতিক আচরণের প্রমাণ থাকলে কোনো ব্যবসা মূল্যায়ন তালিকায় স্থান পাবে না।",
    badge: "যোগ্যতা মানদণ্ড",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    id: 5,
    icon: AlertTriangle,
    title: "সুদ মুক্ত বিনিয়োগে ব্যাবসা ঝুঁকি থাকবেই। বিনিয়োগকারীকে বিনিয়োগজনিত ক্ষতি বা সিদ্ধান্তের দায় নেবার মানসিকতা রাখতে হবে।",
    subtitle: "ঝুঁকি সচেতনতা ও লাভ-ক্ষতির অংশীদারিত্ব",
    description: "হালাল ব্যবসায় শতভাগ নিশ্চয়তা বলে কিছু নেই; লাভ ও ক্ষতির সম্ভাবনা উভয়ই বিদ্যমান। তাই প্রতিটি বিনিয়োগকারীকে নিজ বিবেচনায় ঝুঁকি পর্যালোচনা করে সিদ্ধান্ত গ্রহণ করতে হবে।",
    badge: "ঝুঁকি সতর্কতা",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* ─── Top Sticky Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-lg sm:text-xl font-black text-primary">
              <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-8 sm:h-9 w-auto rounded-lg" />
              <span>বিনিয়োগ বৃদ্ধি</span>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-border/60" />
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
              <Link to="/opportunities" className="hover:text-primary transition-colors">সুযোগসমূহ</Link>
              <Link to="/blog" className="hover:text-primary transition-colors">ব্লগ</Link>
              <span className="text-foreground font-semibold">শর্তাবলী</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted text-foreground px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">গোপনীয়তা নীতি</span>
            </Link>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              বিনিয়োগের সুযোগ
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="relative border-b border-border/50 bg-gradient-to-b from-muted/40 via-background to-background py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>নিয়ম ও শর্তাবলী (Terms of Service)</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
            শর্তাবলী ও বিনিয়োগ নির্দেশিকা
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম ব্যবহার এবং ব্যবসায়িক মূল্যায়ন রিপোর্ট অনুসরণের পূর্বে অনুগ্রহ করে নিচের শর্তাবলী সতর্কতার সাথে পড়ুন।
          </p>

          {/* Quick Sub-navigation Toggle */}
          <div className="pt-3 flex items-center justify-center gap-2">
            <div className="inline-flex p-1 rounded-full bg-muted border border-border text-xs font-semibold">
              <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                শর্তাবলী (Terms)
              </span>
              <Link to="/privacy" className="px-4 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                গোপনীয়তা নীতি (Privacy)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container ────────────────────────────────── */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 space-y-6">
        
        {/* Intro Alert Box */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6 sm:p-7 flex items-start gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-display text-foreground">স্বচ্ছ ও বিশ্বস্ত হালাল বিনিয়োগ পরিবেশ</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              আমরা সুদ ও অনিয়মমুক্ত সুস্থ অর্থনৈতিক সংস্কৃতি গড়ে তুলতে প্রতিশ্রুতিবদ্ধ। বিনিয়োগকারী ও উদ্যোক্তা উভয়ের অধিকার ও স্বচ্ছতা নিশ্চিত করাই আমাদের অন্যতম লক্ষ্য।
            </p>
          </div>
        </div>

        {/* Terms Stack */}
        <div className="space-y-4">
          {TERMS_ITEMS.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                        শর্ত #{item.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-display text-foreground leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Switch to Privacy Policy Banner ─── */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>তথ্য সুরক্ষা ও গোপনীয়তা</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-foreground">আমাদের গোপনীয়তা নীতি (Privacy Policy) দেখুন</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি সে সম্পর্কে বিস্তারিত অবগত হতে নীতিমালা পেইজটি পড়ুন।
            </p>
          </div>

          <Link
            to="/privacy"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-102"
          >
            <span>গোপনীয়তা নীতি পড়ুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Support & Contact Card */}
        <div className="rounded-3xl border border-border bg-muted/40 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">কোনো প্রশ্ন বা পরামর্শ আছে?</div>
            <p className="text-xs text-muted-foreground">আমাদের সাপোর্ট টিম সবসময় সহযোগিতার জন্য প্রস্তুত।</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="tel:+8801316110209"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:bg-card/80 transition-colors shadow-2xs"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>+880 1316-110209</span>
            </a>
            <a
              href="mailto:support@biniyogbriddhi.com"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-xs font-semibold text-foreground hover:bg-card/80 transition-colors shadow-2xs"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>support@biniyogbriddhi.com</span>
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}
