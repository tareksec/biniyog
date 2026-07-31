import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";

export const Route = createFileRoute("/insights/inflation-portfolio")({
  head: () => ({
    meta: [
      { title: "ইনফ্লেশনের সময়ে নিজের পোর্টফোলিও কীভাবে সাজাবেন? · সমৃদ্ধি" },
      {
        name: "description",
        content:
          "মুদ্রাস্ফীতির কারণে টাকার মান কমে যাচ্ছে। এই সময়ে শুধুমাত্র সঞ্চয় না করে কীভাবে একটি স্মার্ট ইনভেস্টমেন্ট পোর্টফোলিও তৈরি করবেন তা নিয়ে কিছু কার্যকরী টিপস।",
      },
    ],
  }),
  component: InflationPortfolioArticle,
});

const SECTIONS = [
  {
    id: "inflation-effect",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "ইনফ্লেশন বা মুদ্রাস্ফীতি কীভাবে আপনার সঞ্চয়কে খাচ্ছে?",
    paragraphs: [
      "ধরা যাক, আজ আপনার কাছে ১০০ টাকা আছে। এই টাকা দিয়ে আপনি যে পরিমাণ জিনিস কিনতে পারছেন, আগামী বছর যদি মূল্যস্ফীতি বা ইনফ্লেশন ১০% হয়, তবে ওই একই জিনিস কিনতে আপনার ১১০ টাকা লাগবে। অর্থাৎ, ব্যাংক অ্যাকাউন্টে ফেলে রাখা আপনার ১০০ টাকার ক্রয়ক্ষমতা কমে ৯০ টাকার সমান হয়ে যাচ্ছে।",
      "আমাদের দেশে ইনফ্লেশনের হার গত কয়েক বছরে বেশ বেড়েছে। এই পরিস্থিতিতে শুধুমাত্র টাকা জমিয়ে রাখা মানে নিজের সম্পদকে ধীরে ধীরে ক্ষয় হতে দেওয়া। এই ক্ষতি পুষিয়ে নিতে হলে এমন কোনো খাতে বিনিয়োগ করতে হবে যার রিটার্ন ইনফ্লেশন হারের চেয়ে বেশি।",
    ],
  },
  {
    id: "traditional-savings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "প্রচলিত সঞ্চয় বা ফিক্সড ডিপোজিট কি সমাধান?",
    paragraphs: [
      "অনেকেই মনে করেন ফিক্সড ডিপোজিট বা সঞ্চয়পত্রে টাকা রাখলে তা নিরাপদ থাকে। কিন্তু বাস্তবে, ব্যাংকের ফিক্সড ডিপোজিটের রিটার্ন (যা সাধারণত ৭-৯% এর মধ্যে থাকে) പല সময়ই প্রকৃত ইনফ্লেশন রেটকে অতিক্রম করতে পারে না।",
      "এর মানে হলো, বছর শেষে আপনি কিছু টাকা বেশি পেলেও, তার প্রকৃত ক্রয়ক্ষমতা আগের চেয়ে কমই থাকছে। উপরন্তু, সুদের কারবার ইসলামে কঠোরভাবে নিষিদ্ধ হওয়ার কারণে হালাল উপার্জনের ব্যাপারে সচেতন মুসলিমরা ফিক্সড ডিপোজিট থেকে বিরত থাকেন।",
    ],
  },
  {
    id: "sme-real-assets",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "রিয়েল অ্যাসেট ও ব্যবসায় বিনিয়োগের সুবিধা",
    paragraphs: [
      "ইনফ্লেশনের বিরুদ্ধে সবচেয়ে ভালো সুরক্ষা বা 'হেজ (Hedge)' হলো বাস্তব সম্পদ (Real Assets) ও লাভজনক ব্যবসায় বিনিয়োগ করা। যখন জিনিসপত্রের দাম বাড়ে, তখন সাধারণত সফল ব্যবসার আয়ের পরিমাণও আনুপাতিক হারে বেড়ে যায়।",
      "সরাসরি এসএমই বা এগ্রো ব্যবসায় হালাল উপায়ে বিনিয়োগ করলে আপনি ব্যবসায়ের প্রকৃত মুনাফার একটি অংশ পান, যা প্রায়শই ইনফ্লেশন রেটের চেয়ে অনেক ভালো রিটার্ন দেয় (যেমন ১৮-২৫%)। যদিও এতে কিছুটা ঝুঁকি থাকে, তবে সঠিক পোর্টফোলিও সাজানোর মাধ্যমে এই ঝুঁকি কমানো সম্ভব।",
    ],
  },
  {
    id: "diversification",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    title: "ডাইভারসিফিকেশন বা পোর্টফোলিও বৈচিত্র্যকরণ",
    paragraphs: [
      "বিনিয়োগের একটি সুপরিচিত প্রবাদ হলো, 'Don't put all your eggs in one basket'। অর্থাৎ আপনার সব টাকা একটি মাত্র ব্যবসায় না খাটিয়ে একাধিক খাতে ভাগ করে বিনিয়োগ করুন।",
      "উদাহরণস্বরূপ, আপনি আপনার বিনিয়োগযোগ্য তহবিলের একটি অংশ ট্রেডিং ব্যবসায়, আরেকটি অংশ কৃষি খাতে এবং বাকি অংশ ম্যানুফ্যাকচারিং খাতে বিনিয়োগ করতে পারেন। এতে কোনো একটি ব্যবসায় ক্ষতি হলেও অন্যগুলোর লাভে আপনার সামগ্রিক পোর্টফোলিও ইতিবাচক থাকবে। সমৃদ্ধি প্ল্যাটফর্মে আমরা এই ডাইভারসিফিকেশনের সুযোগটিই করে দেই।",
    ],
  },
];

function InflationPortfolioArticle() {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 300);
      }
    };
    
    handleHashScroll();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            ইনসাইটস
          </Link>
          <span className="text-sm font-bold text-primary">ব্লগ আর্টিকেল</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="pill bg-primary/10 text-primary font-semibold border-none">
              বিনিয়োগ গাইড
            </span>
            <span className="text-xs text-muted-foreground font-medium">০৫ জুলাই ২০২৬</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground font-medium">৬ মিনিট পড়া</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
            ইনফ্লেশনের সময়ে নিজের পোর্টফোলিও কীভাবে সাজাবেন?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            মুদ্রাস্ফীতির কারণে টাকার মান কমে যাচ্ছে। এই সময়ে শুধুমাত্র সঞ্চয় না করে কীভাবে একটি স্মার্ট ইনভেস্টমেন্ট পোর্টফোলিও তৈরি করবেন তা নিয়ে কিছু কার্যকরী টিপস।
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-border/50 pt-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              মপ
            </div>
            <div>
              <p className="text-sm font-semibold">মোহাইমিন পাটোয়ারী</p>
              <p className="text-xs text-muted-foreground">ফাউন্ডার, সমৃদ্ধি</p>
            </div>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial={prefersReduced ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="space-y-16"
        >
          {SECTIONS.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              variants={revealVariants}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  {section.icon}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-[15px] sm:text-base leading-[1.85] text-muted-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        <div className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-[var(--shadow-card)]">
          <h3 className="text-xl sm:text-2xl font-bold">
            স্মার্ট ও বৈচিত্র্যময় পোর্টফোলিও গড়ুন
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            বিভিন্ন খাতের লাভজনক ব্যবসায় বিনিয়োগ করে আপনার সম্পদকে ইনফ্লেশনের হাত থেকে রক্ষা করুন।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] btn-hover"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            সব আর্টিকেল
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            হোমে ফিরে যান
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
