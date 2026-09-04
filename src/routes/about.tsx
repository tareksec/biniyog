import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Building2,
  Scale,
  Sparkles,
  Globe,
  MapPin,
  HeartHandshake,
  ChevronRight,
  Briefcase,
  FileCheck,
  Target,
  Compass,
} from "lucide-react";
import cfaImage from "@/hero/cfa.jpg";
import { CONSULTANCY_URL, LINKEDIN_URL } from "@/components/InstructorSection";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে | বিনিয়োগ বৃদ্ধি বাংলাদেশ" },
      {
        name: "description",
        content:
          "বিনিয়োগ বৃদ্ধি (Biniyog Briddhi) — মোহাইমিন পাটোয়ারী CFA এর নেতৃত্বে পরিচালিত বাংলাদেশের শীর্ষস্থানীয় স্বচ্ছ অংশীদারিত্বমূলক ও সুদমুক্ত ব্যবসায়িক বিনিয়োগ প্ল্যাটফর্ম। জানুন আমাদের গল্প, মিশন ও টিম সম্পর্কে।",
      },
      {
        name: "keywords",
        content:
          "বিনিয়োগ বৃদ্ধি, Biniyog Briddhi, বিনিয়োগ বৃদ্ধি বাংলাদেশ, মোহাইমিন পাটোয়ারী, Mohaimin Patwary CFA, হালাল বিনিয়োগ, এসএমই বিনিয়োগ, ব্যবসা বিনিয়োগ বাংলাদেশ, biniyog briddhi bangladesh",
      },
      { property: "og:title", content: "আমাদের সম্পর্কে | বিনিয়োগ বৃদ্ধি বাংলাদেশ" },
      {
        property: "og:description",
        content:
          "বিনিয়োগ বৃদ্ধি (Biniyog Briddhi) — মোহাইমিন পাটোয়ারী CFA এর নেতৃত্বে পরিচালিত বাংলাদেশের শীর্ষস্থানীয় স্বচ্ছ অংশীদারিত্বমূলক ও সুদমুক্ত ব্যবসায়িক বিনিয়োগ প্ল্যাটফর্ম।",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://biniyogbriddhi.com/about" },
      { property: "og:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:secure_url", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "আমাদের সম্পর্কে | বিনিয়োগ বৃদ্ধি বাংলাদেশ" },
      {
        name: "twitter:description",
        content:
          "বিনিয়োগ বৃদ্ধি (Biniyog Briddhi) — মোহাইমিন পাটোয়ারী CFA এর নেতৃত্বে পরিচালিত বাংলাদেশের শীর্ষস্থানীয় স্বচ্ছ ব্যবসায়িক বিনিয়োগ প্ল্যাটফর্ম।",
      },
      { name: "twitter:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "আইনি সুরক্ষা ও স্বচ্ছ চুক্তি",
    desc: "প্রতিটি ব্যবসা ও বিনিয়োগকারী সরাসরি লিখিত চুক্তিপত্রে আবদ্ধ হন। লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করে প্রতিটি বিনিয়োগ কার্যকর করা হয়।",
  },
  {
    icon: HeartHandshake,
    title: "১০০% সুদমুক্ত ও নৈতিক",
    desc: "কোনো প্রকার বাহানা বা ঘুরিয়ে সুদ গ্রহণের সুযোগ নেই। প্রকৃত লাভ ও ক্ষতির অংশীদারিত্বের ভিত্তিতে নৈতিক শরীয়াহ সম্মত বিনিয়োগ নিশ্চিত করা হয়।",
  },
  {
    icon: Users,
    title: "সরাসরি অংশীদারিত্ব",
    desc: "মাঝে কোনো থার্ড-পার্টি বা মধ্যস্বত্বভোগী নেই। বিনিয়োগকারী সরাসরি উদ্যোক্তা ও ব্যবসার সার্বিক অবস্থা পর্যবেক্ষণ করতে পারেন।",
  },
  {
    icon: FileCheck,
    title: "নিয়মিত স্বচ্ছ অডিট ও রিপোর্টিং",
    desc: "ব্যবসায়ের মাসিক আর্থিক হিসাব, ক্যাশ-ফ্লো এবং লাভের বিস্তারিত বিবরণ নিয়মিত বিনিয়োগকারীদের সামনে স্বচ্ছভাবে উন্মোচিত করা হয়।",
  },
];

const STATS = [
  { value: "৫০০+", label: "কন্স্যাল্ট্যান্সি ক্লায়েন্ট" },
  { value: "২০+", label: "সফল বিনিয়োগ চুক্তি" },
  { value: "১০টি", label: "বেস্টসেলার অর্থবিজ্ঞান বই" },
  { value: "CFA", label: "ইউএসএ চার্টারহোল্ডার" },
  { value: "৩টি", label: "আন্তর্জাতিক শীর্ষ বিশ্ববিদ্যালয়" },
  { value: "২০+", label: "দেশ ভ্রমণ ও বাস্তব অভিজ্ঞতা" },
];

const METHODOLOGY_STEPS = [
  {
    step: "০১",
    title: "কঠোর স্ক্রিনিং ও ব্যাকগ্রাউন্ড চেক",
    desc: "ব্যবসায়ীর পূর্ব অভিজ্ঞতা, ট্রেড লাইসেন্স, ব্যাংক সলভেন্সি এবং সততা সরেজমিনে পরীক্ষা করা হয়। স্বপ্নচারী বা অনভিজ্ঞ কাউকে সুযোগ দেওয়া হয় না।",
  },
  {
    step: "০২",
    title: "CFA-নেতৃত্বাধীন আর্থিক মূল্যায়ন (Valuation)",
    desc: "ব্যবসায়ের লাভজনকতা, কার্যকরী মূলধন (Working Capital), মার্জিন এবং রিস্ক-রিটার্ন অনুপাত আন্তর্জাতিক মানের ফাইন্যান্সিয়াল মডেলিং দিয়ে যাচাই করা হয়।",
  },
  {
    step: "০৩",
    title: "লিগ্যাল সিকিউরিটি ও ডকুমেন্টস",
    desc: "অভিজ্ঞ আইনজীবীর তত্ত্বাবধানে স্ট্যাম্প চুক্তিপত্র, ব্যাংক চেক এবং আইনি গ্যারান্টির আনুষ্ঠানিকতা নিশ্চিত করা হয়।",
  },
  {
    step: "০৪",
    title: "মনিটরিং ও সময়মতো মুনাফা বণ্টন",
    desc: "নিয়মিত সেলস ট্র্যাকিং, অ্যাকাউন্টস অডিট এবং ব্যবসা থেকে প্রাপ্ত প্রকৃত মুনাফা চুক্তি অনুযায়ী বিনিয়োগকারীদের একাউন্টে বিতরণ।",
  },
];

function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://biniyogbriddhi.com/#organization",
        name: "বিনিয়োগ বৃদ্ধি",
        alternateName: [
          "Biniyog Briddhi",
          "বিনিয়োগ বৃদ্ধি বাংলাদেশ",
          "Biniyog Briddhi Bangladesh",
        ],
        url: "https://biniyogbriddhi.com",
        logo: "https://biniyogbriddhi.com/logo.png",
        sameAs: [
          "https://www.facebook.com/mohaimin1",
          "https://www.linkedin.com/in/mohaimin-patwary-cfa-a8416aab/",
        ],
        description:
          "বাংলাদেশের প্রথম ও শীর্ষস্থানীয় স্বচ্ছ, সুদমুক্ত এবং শরীয়াহ-সম্মত ব্যবসায়িক অংশীদারিত্ব বিনিয়োগ প্ল্যাটফর্ম।",
        founder: {
          "@type": "Person",
          name: "মোহাইমিন পাটোয়ারী",
          alternateName: "Mohaimin Patwary, CFA",
          jobTitle: "Founder & Chief Investment Analyst",
          alumniOf: [
            "Institute of Business Administration, University of Dhaka",
            "University of Mannheim",
            "Norwegian School of Economics",
          ],
          hasCredential: "CFA Charterholder (CFA Institute, USA)",
        },
      },
      {
        "@type": "AboutPage",
        "@id": "https://biniyogbriddhi.com/about#webpage",
        url: "https://biniyogbriddhi.com/about",
        name: "আমাদের সম্পর্কে | বিনিয়োগ বৃদ্ধি বাংলাদেশ",
        inLanguage: "bn-BD",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* Schema.org JSON-LD for SEO Dominance */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ─── Breadcrumb & Top Bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 font-display text-lg sm:text-xl font-black text-primary"
            >
              <img
                src="/logo.png"
                alt="বিনিয়োগ বৃদ্ধি"
                width={36}
                height={36}
                className="h-8 sm:h-9 w-auto rounded-lg"
                loading="lazy"
                decoding="async"
              />
              <span>বিনিয়োগ বৃদ্ধি</span>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-border/60" />
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                হোম
              </Link>
              <Link to="/opportunities" className="hover:text-primary transition-colors">
                সুযোগসমূহ
              </Link>
              <Link to="/blog" className="hover:text-primary transition-colors">
                ব্লগ
              </Link>
              <span className="text-foreground font-semibold">আমাদের সম্পর্কে</span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/opportunities"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <span>সুযোগগুলো দেখুন</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO SECTION ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-[#daf1de]/30 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span>স্বচ্ছ অংশীদারিত্বমূলক বিনিয়োগ প্ল্যাটফর্ম</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.2]">
              আমাদের সম্পর্কে —{" "}
              <span className="bg-gradient-to-r from-[#15803d] via-[#166534] to-[#047857] bg-clip-text text-transparent">
                বিনিয়োগ বৃদ্ধি বাংলাদেশ
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base sm:text-xl text-muted-foreground leading-relaxed font-normal">
              <strong>বিনিয়োগ বৃদ্ধি (Biniyog Briddhi)</strong> বাংলাদেশের উদ্যোক্তা ও বিনিয়োগকারীদের মাঝে 
              একটি নির্ভরযোগ্য, স্বচ্ছ ও সুদমুক্ত অংশীদারিত্বমূলক সেতুবন্ধন। প্রচলিত ব্যাংক ঋণের চড়া সুদ 
              এবং অনিরাপদ তথাকথিত মুনাফার বিকল্প হিসেবে আমরা গড়ে তুলেছি সরাসরি ব্যবসায় বিনিয়োগের নির্ভরযোগ্য প্ল্যাটফর্ম।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>বিনিয়োগের সুযোগসমূহ</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={CONSULTANCY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all"
              >
                <span>কনসালট্যান্সি বুক করুন</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── COMPANY STORY & VISION ───────────────────────────────── */}
        <section className="py-16 sm:py-24 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  <Compass className="h-4 w-4" />
                  <span>আমাদের গল্প ও পথচলা</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
                  কেন তৈরি হলো <br />
                  <span className="text-primary">"বিনিয়োগ বৃদ্ধি"</span> প্ল্যাটফর্ম?
                </h2>
                <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>
                    আমাদের দেশের বহু সৎ ও পরিশ্রমী ব্যবসায়ী মূলধনের অভাবে ব্যবসা সম্প্রসারণ করতে পারেন না। 
                    অন্যদিকে সাধারণ মানুষ তাদের হালাল উপার্জিত সঞ্চয় বিনিয়োগের নিরাপদ ও লাভজনক কোনো জায়গা খুঁজে পান না। 
                    ব্যাংকের আমানতে সুদের স্পষ্ট উপস্থিতি এবং বিভিন্ন অনিবন্ধিত এমএলএম বা ভূঁইফোড় স্কিমে টাকা খোয়ানোর ভয় মানুষের আস্থাকে নষ্ট করেছে।
                  </p>
                  <p>
                    এই প্রেক্ষাপটে বিশ্বমানের ফাইন্যান্সিয়াল অ্যানালাইসিস এবং ইসলামী শরীয়াহর অংশীদারিত্ব নীতিকে একীভূত করে 
                    শুরু হয় <strong>বিনিয়োগ বৃদ্ধি</strong>। আমাদের লক্ষ্য অত্যন্ত সুনির্দিষ্ট — বিনিয়োগকারী জানবেন তার টাকা 
                    কোন ব্যবসায় খাটছে, পণ্যটি কী, এবং কীভাবে ব্যবসা থেকে লাভ সৃষ্টি হচ্ছে।
                  </p>
                  <p>
                    আমরা কোনো ফিক্সড মুনাফা বা কৃত্রিম রিটার্নের মিথ্যা আশ্বাস দিই না। ব্যবসা ঝুঁকিকে বাস্তববাদী দৃষ্টিকোণ থেকে 
                    ম্যানেজ করে, আইনি ডকুমেন্টস ও চেক সিকিউরিটি নিশ্চিত করে আমরা স্বচ্ছ অংশীদারিত্ব তৈরি করি।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PILLARS.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-2">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOUNDER PROFILE: MOHAIMIN PATWARY, CFA ──────────────── */}
        <section id="founder" className="py-16 sm:py-24 bg-muted/20 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
                <GraduationCap className="h-4 w-4" />
                <span>প্ল্যাটফর্মের রূপকার ও প্রধান এক্সপার্ট</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
                মোহাইমিন পাটোয়ারী, <abbr title="Chartered Financial Analyst" className="no-underline">CFA</abbr>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                লেখক · ফাইন্যান্স বিশেষজ্ঞ · চার্টার্ড ফাইন্যান্সিয়াল অ্যানালিস্ট (CFA)
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-14 items-start">
              {/* Left Profile Card */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm text-center">
                <div className="mx-auto h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-md">
                  <img
                    src={cfaImage}
                    alt="মোহাইমিন পাটোয়ারী CFA"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="160"
                    height="160"
                  />
                </div>

                <h3 className="mt-6 text-xl font-bold text-foreground">
                  মোহাইমিন পাটোয়ারী, CFA
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-primary font-semibold">
                  Founder & Chief Analyst · Biniyog Briddhi
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  ঢাকা বিশ্ববিদ্যালয়ের IBA থেকে গ্র্যাজুয়েশন এবং ইউরোপ ও আমেরিকার খ্যাতনামা প্রতিষ্ঠান থেকে উচ্চতর ফাইন্যান্স ও চার্টারহোল্ডার।
                </p>

                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2.5">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#084e96] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.26V22H7.72V8z" />
                    </svg>
                    <span>LinkedIn প্রোফাইল</span>
                  </a>
                  <a
                    href="https://mohaimin.techvrs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>একাডেমিক কোর্স ও ক্লাস</span>
                  </a>
                </div>
              </div>

              {/* Right Bio & Stats */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
                  <h3 className="text-xl font-bold text-foreground">
                    আর্থিক ক্ষমতায়নে এক দশকের আন্তর্জাতিক অভিজ্ঞতা
                  </h3>
                  <p>
                    মোহাইমিন পাটোয়ারী একজন বিশিষ্ট লেখক, শিক্ষক এবং ফাইন্যান্স বিশেষজ্ঞ। তিনি ঢাকা বিশ্ববিদ্যালয়ের 
                    আইবিএ (IBA) থেকে পড়াশোনা শেষ করে জার্মানির স্বনামধন্য <strong>Mannheim বিশ্ববিদ্যালয়</strong> 
                    এবং নরওয়ের <strong>Norwegian School of Economics (NHH)</strong> থেকে উচ্চতর ডিগ্রি অর্জন করেন। 
                    পরবর্তীতে আমেরিকার মর্যাদাপূর্ণ <strong>CFA (Chartered Financial Analyst)</strong> পরীক্ষার প্রতিটি ধাপ 
                    সফলভাবে সম্পন্ন করে আন্তর্জাতিক চার্টারহোল্ডার হন।
                  </p>
                  <p>
                    অর্থনীতি ও সাধারণ মানুষের আর্থিক সাক্ষরতা নিয়ে তিনি নিয়মিত লিখে চলেছেন। এ পর্যন্ত অর্থনীতি ও ফাইন্যান্স বিষয়ক 
                    তাঁর <strong>১০টি বই</strong> প্রকাশিত হয়েছে, যা পাঠকমহলে ব্যাপক সমাদৃত ও বেস্টসেলার হয়েছে।
                  </p>
                  <p>
                    ২০ টিরও বেশি দেশ ভ্রমণের বাস্তব ব্যবসায়িক অভিজ্ঞতা ও আন্তর্জাতিক করপোরেট ফাইন্যান্সের জ্ঞানকে কাজে লাগিয়ে 
                    তিনি বাংলাদেশে সাধারণ মানুষের জন্য সুদমুক্ত ও সুরক্ষিত বিনিয়োগের সুযোগ সৃষ্টিতে <strong>বিনিয়োগ বৃদ্ধি</strong> প্ল্যাটফর্ম প্রতিষ্ঠা করেছেন।
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {STATS.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border bg-card px-4 py-3.5 text-center shadow-xs"
                    >
                      <div className="text-xl sm:text-2xl font-black text-primary">{s.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── METHODOLOGY & VERIFICATION PROCESS ───────────────────── */}
        <section className="py-16 sm:py-24 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
                <Target className="h-4 w-4" />
                <span>যাচাইকরণ মানদণ্ড</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
                আমরা কীভাবে প্রতিটি সুযোগ যাচাই করি
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                শত শত আবেদনের মধ্য থেকে কঠোর ৪-ধাপের যাচাইকরণ পেরিয়ে মাত্র অল্প কয়েকটি টেকসই ব্যবসা বিনিয়োগের জন্য নির্বাচিত হয়।
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {METHODOLOGY_STEPS.map((m, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="font-mono text-2xl font-black text-primary/40 mb-3">{m.step}</div>
                    <h3 className="text-base font-bold text-foreground mb-2">{m.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>মানসম্মত ফিল্টারিং</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BRAND POSITIONING & CLARITY ──────────────────────────── */}
        <section className="py-16 sm:py-20 bg-muted/10 border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1 text-xs font-semibold text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>প্রামাণিক প্ল্যাটফর্ম তথ্য</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              বিনিয়োগ বৃদ্ধি (biniyogbriddhi.com) — সততা ও আস্থার প্রতীক
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify sm:text-center">
              বাংলাদেশে বিনিয়োগ সংশ্লিষ্ট নানা নামের সংগঠন বা প্রোগ্রাম থাকলেও, <strong>biniyogbriddhi.com</strong> হলো 
              মোহাইমিন পাটোয়ারী CFA এর সরাসরি দিকনির্দেশনায় পরিচালিত একমাত্র মূল প্ল্যাটফর্ম যেখানে সাধারণ নাগরিক ও প্রবাসী বাংলাদেশিরা 
              সরাসরি ক্ষুদ্র ও মাঝারি শিল্পে (SME) বিনিয়োগ অংশীদারিত্ব স্থাপন করতে পারেন। আমরা কোনো অনুদানভিত্তিক প্রকল্প নই, 
              বরং এটি একটি আধুনিক, আইনি ও লাভজনক ব্যবসায়িক বিনিয়োগ সমাধান।
            </p>
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-[#daf1de]/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              আপনার হালাল ও সুরক্ষিত বিনিয়োগ যাত্রা শুরু হোক আজই
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              সক্রিয় সুযোগগুলো যাচাই করুন, চুক্তিপত্র পড়ুন এবং স্বাধীন সিদ্ধান্তের ভিত্তিতে সম্ভাবনাময় ব্যবসায় বিনিয়োগ করুন।
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>চলমান সুযোগগুলো দেখুন</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <span>অ্যাকাউন্ট খুলুন</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
