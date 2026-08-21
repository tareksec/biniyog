import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";

export const Route = createFileRoute("/insights/krishi-khate-biniyog")({
  head: () => ({
    meta: [
      { title: "বাংলাদেশের কৃষি খাতে বিনিয়োগের সম্ভাবনা ও ঝুঁকি · বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "কৃষি খাত আমাদের অর্থনীতির মূল চালিকাশক্তি। কিন্তু এই খাতে বিনিয়োগের ক্ষেত্রে কী কী সম্ভাবনা ও ঝুঁকি রয়েছে? জানুন এক্সপার্ট অ্যানালাইসিস।",
      },
    ],
  }),
  component: KrishiKhateBiniyogArticle,
});

const SECTIONS = [
  {
    id: "potential",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "কৃষি খাতে বিপুল সম্ভাবনা",
    paragraphs: [
      "বাংলাদেশ মূলত একটি কৃষিপ্রধান দেশ। আধুনিক প্রযুক্তির ছোঁয়ায় আমাদের কৃষি খাত এখন আর শুধু জীবনধারণের মাধ্যম নয়, বরং এটি একটি লাভজনক শিল্পে পরিণত হয়েছে। ডেইরি ফার্ম, পোল্ট্রি, মৎস্য চাষ এবং বাণিজ্যিক কৃষি—এগুলো এখন অত্যন্ত সম্ভাবনাময় বিনিয়োগের ক্ষেত্র।",
      "যথাযথ জ্ঞান ও প্রযুক্তির ব্যবহার নিশ্চিত করতে পারলে কৃষি খাত থেকে ২০-৩০% বা তারও বেশি মুনাফা অর্জন করা সম্ভব। এছাড়া, কৃষিতে বিনিয়োগ সরাসরি দেশের খাদ্য নিরাপত্তায় অবদান রাখে, যা একটি মহৎ কাজ।",
    ],
  },
  {
    id: "risks",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "বিনিয়োগের ঝুঁকি ও সতর্কতা",
    paragraphs: [
      "সম্ভাবনার পাশাপাশি কৃষি খাতে বেশ কিছু ঝুঁকিও রয়েছে। প্রাকৃতিক দুর্যোগ, যেমন—বন্যা, খরা বা সাইক্লোন যেকোনো সময় বড় ধরনের ক্ষতি করতে পারে। তাছাড়া গবাদিপশু বা হাঁস-মুরগির মড়ক, বাজারে পণ্যের দামের হঠাৎ পতন—এগুলো কৃষি খাতের নিত্যদিনের ঝুঁকি।",
      "সরাসরি কৃষকের সাথে লেনদেনের ক্ষেত্রে অনেক সময় সঠিক হিসাব-নিকাশ রাখা সম্ভব হয় না, যার ফলে বিনিয়োগকারীরা ক্ষতির সম্মুখীন হন। তাই এখানে পেশাদারিত্বের অভাব একটি বড় বাধা।",
    ],
  },
  {
    id: "mitigation",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "বিনিয়োগ বৃদ্ধির মাধ্যমে ঝুঁকি নিয়ন্ত্রণ",
    paragraphs: [
      "এই ঝুঁকিগুলো এড়ানোর জন্য বিনিয়োগ বৃদ্ধি একটি নিয়মতান্ত্রিক প্রক্রিয়ায় কাজ করে। আমরা এমন খামার বা কৃষি উদ্যোক্তাদের নির্বাচন করি, যাদের পর্যাপ্ত অভিজ্ঞতা আছে এবং যারা আধুনিক উপায়ে খামার পরিচালনা করেন।",
      "এছাড়া, প্রতিটি প্রকল্পের জন্য বীমা (Insurance/Takaful) এবং আপদকালীন ফান্ডিংয়ের বিষয়ে আমরা বিশেষ গুরুত্ব দেই। আমাদের প্ল্যাটফর্মের মাধ্যমে স্বচ্ছ অ্যাকাউন্টিং এবং নিয়মিত মনিটরিং নিশ্চিত করা হয়, ফলে আপনার বিনিয়োগ থাকে অনেকটাই সুরক্ষিত।",
    ],
  },
];

function KrishiKhateBiniyogArticle() {
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
              মার্কেট অ্যানালাইসিস
            </span>
            <span className="text-xs text-muted-foreground font-medium">১৫ জুলাই ২০২৬</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground font-medium">৪ মিনিট পড়া</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-bold leading-tight">
            বাংলাদেশের কৃষি খাতে বিনিয়োগের সম্ভাবনা ও ঝুঁকি
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            কৃষি খাত আমাদের অর্থনীতির মূল চালিকাশক্তি। কিন্তু এই খাতে বিনিয়োগের ক্ষেত্রে কী কী সম্ভাবনা ও ঝুঁকি রয়েছে? জানুন এক্সপার্ট অ্যানালাইসিস।
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-border/50 pt-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              মপ
            </div>
            <div>
              <p className="text-sm font-semibold">মোহাইমিন পাটোয়ারী</p>
              <p className="text-xs text-muted-foreground">ফাউন্ডার, বিনিয়োগ বৃদ্ধি</p>
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
            কৃষি খাতে বিনিয়োগ করে অংশীদার হোন
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            যাচাইকৃত কৃষি প্রকল্পগুলোতে নিরাপদে বিনিয়োগ করতে আমাদের প্ল্যাটফর্ম ব্যবহার করুন।
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
