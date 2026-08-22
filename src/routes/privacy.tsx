import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, FileSpreadsheet, Lock, AlertOctagon, Users, HeartHandshake, ChevronRight, BookOpen, Database, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "নীতিমালা ও গোপনীয়তা নীতি (Privacy Policy) · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "বিনিয়োগ বৃদ্ধি কীভাবে তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত রাখে তার নীতিমালা।" },
      { property: "og:title", content: "নীতিমালা ও গোপনীয়তা নীতি (Privacy Policy) · বিনিয়োগ বৃদ্ধি" },
      { property: "og:description", content: "বিনিয়োগ বৃদ্ধি কীভাবে তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত রাখে তার নীতিমালা।" },
      { name: "twitter:title", content: "নীতিমালা ও গোপনীয়তা নীতি (Privacy Policy) · বিনিয়োগ বৃদ্ধি" },
      { name: "twitter:description", content: "বিনিয়োগ বৃদ্ধি কীভাবে তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত রাখে তার নীতিমালা।" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
              <span className="text-foreground font-semibold">গোপনীয়তা নীতি</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/terms"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted text-foreground px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">শর্তাবলী</span>
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>নিরাপত্তা ও গোপনীয়তা নীতি (Privacy Policy)</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
            নীতিমালা ও তথ্য সুরক্ষা
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            আমাদের প্রদানকৃত তথ্য কীভাবে সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখা হয়, তা নিচে স্পষ্টভাবে তুলে ধরা হলো।
          </p>

          {/* Quick Sub-navigation Toggle */}
          <div className="pt-3 flex items-center justify-center gap-2">
            <div className="inline-flex p-1 rounded-full bg-muted border border-border text-xs font-semibold">
              <Link to="/terms" className="px-4 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                শর্তাবলী (Terms)
              </Link>
              <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                গোপনীয়তা নীতি (Privacy)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container ────────────────────────────────── */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 space-y-8">
        
        {/* ─── SECTION 1: তথ্য সংগ্রহ ─── */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
              ১
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                Data Collection
              </span>
              <h2 className="text-xl font-bold font-display text-foreground mt-0.5">১. তথ্য সংগ্রহ</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span>ব্যবসায়ীর তথ্য</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                ব্যবসা যাচাই-বাছাই, মূল্যায়ন ও রিপোর্ট তৈরির জন্য প্রয়োজনীয় আর্থিক নথিপত্র, ট্রেড লাইসেন্স, ব্যাংক স্টেটমেন্ট এবং মালিকানা সংক্রান্ত বিবরণ আমরা সংগ্রহ করে থাকি।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>গ্রাহক / সদস্যের তথ্য</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                গ্রাহকের নাম, যোগাযোগের নম্বর (ফোন নাম্বার), ঠিকানা এবং প্রোফাইল তথ্য আমরা সংরক্ষণ করি।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: তথ্যের ব্যবহার ─── */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
              ২
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                Data Usage
              </span>
              <h2 className="text-xl font-bold font-display text-foreground mt-0.5">২. তথ্যের ব্যবহার</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                <strong>যাচাই বাছাই করে বস্তুনিষ্ঠ রিপোর্ট প্রদান করা:</strong> ব্যবসায়িক তথ্যের সত্যতা নিশ্চিত করে বিনিয়োগকারীদের জন্য নিরপেক্ষ ও কার্যকর মূল্যায়ন প্রস্তুত করা।
              </p>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                <strong>অনাকাঙ্ক্ষিত প্রতারণা, জালিয়াতি বা অপব্যবহার প্রতিরোধ করা:</strong> জালিয়াতি ও মিথ্যা তথ্যের ঝুঁকি রুখতে প্রয়োজনীয় নিরাপত্তা প্রক্রিয়া পরিচালন।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: তথ্য সুরক্ষা ও গোপনীয়তা ─── */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
              ৩
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                Security & Privacy
              </span>
              <h2 className="text-xl font-bold font-display text-foreground mt-0.5">৩. তথ্য সুরক্ষা ও গোপনীয়তা</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-start gap-3.5">
              <Lock className="h-5 w-5 text-purple-700 dark:text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                আমরা কোনো সদস্য বা ব্যবসায়ীর ব্যক্তিগত তথ্য, ফোন নম্বর বা স্পর্শকাতর নথিপত্র কোনো তৃতীয় পক্ষ বা বাণিজ্যিক প্রতিষ্ঠানের কাছে <strong className="text-purple-900 dark:text-purple-300">বিক্রি, ভাড়া বা শেয়ার করি না</strong>।
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-purple-700 dark:text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                গ্রুপের কোনো সদস্য যেন অন্য কোনো সদস্যের নম্বর সংগ্রহ করে অনাকাঙ্ক্ষিত অফার বা মেসেজ পাঠাতে না পারে, সে বিষয়ে কঠোর নজরদারি রাখা হয়। এমন আচরণ ধরা পড়লে সেই নাম্বার <strong className="text-purple-900 dark:text-purple-300">ব্লক ও রিপোর্ট করে আমাদেরকে সাথে সাথে জানাবেন</strong>।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: সদস্যদের দায়িত্ব ─── */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
              ৪
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Member Responsibilities
              </span>
              <h2 className="text-xl font-bold font-display text-foreground mt-0.5">৪. সদস্যদের দায়িত্ব</h2>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3.5">
              <AlertOctagon className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                আমাদের প্রস্তাবিত প্রতিষ্ঠানের বাহিরে অনলাইনে বিভিন্ন চটকদার বিজ্ঞাপন ও Whatsapp এ লোভনীয় মেসেজ দিলে সেটি পূর্ণাঙ্গ যাচাই বাছাই না করে অর্থনৈতিক লেনদেন করবেন না। প্রয়োজনে <strong className="text-amber-900 dark:text-amber-300">কনসালট্যান্সি সেবা গ্রহণ করে সিদ্ধান্ত গ্রহণ করুন</strong>।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                গ্রুপের কোনো সদস্যের মাধ্যমে গোপনীয়তা লঙ্ঘিত হলে বা অনাকাঙ্ক্ষিত বার্তা পেলে অবিলম্বে <strong className="text-amber-900 dark:text-amber-300">অ্যাডমিনদের অবহিত করুন</strong>।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3.5">
              <HeartHandshake className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                সুদ মুক্ত ভাবে সমৃদ্ধির লক্ষ্যে আপনারা, আমরা এবং ব্যবসায়ীরা সকলে একে অন্যের সাথী। তাই একে অপরের প্রতি <strong className="text-amber-900 dark:text-amber-300">সহযোগিতা ও আস্থার সম্পর্ক বজায় রাখুন</strong>। কেউ যদি প্রতারণা করে তার ব্যাপারে সম্মিলিত প্রতিরোধ গড়ে তুলুন।
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3.5">
              <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                বিনিয়োগের সুস্থ পরিবেশ নিশ্চিতে ভালো কাজে একে অন্যের সহযোগী হন। সুদ ও প্রতারণার বিরুদ্ধে সম্মিলিত প্রতিরোধ গড়ে তুলুন। আমাদের সকলের অংশগ্রহণে একটি সুন্দর পরিবেশ গড়ে উঠবে।
              </p>
            </div>
          </div>
        </section>

        {/* ─── Switch to Terms Banner ─── */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
              <BookOpen className="h-4 w-4" />
              <span>নিয়ম ও শর্তাবলী</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-foreground">আমাদের সাধারণ শর্তাবলী (Terms) দেখুন</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              প্ল্যাটফর্মের সুযোগ গ্রহণ ও ব্যবহারের সাধারণ শর্তাবলী সম্পর্কে বিস্তারিত জানুন।
            </p>
          </div>

          <Link
            to="/terms"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-102"
          >
            <span>শর্তাবলী পড়ুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Support & Contact Card */}
        <div className="rounded-3xl border border-border bg-muted/40 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">গোপনীয়তা সংক্রান্ত কোনো জিজ্ঞাসা?</div>
            <p className="text-xs text-muted-foreground">আমরা আপনার তথ্যের সর্বোচ্চ নিরাপত্তা বিধানে প্রতিশ্রুতিবদ্ধ।</p>
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
