import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";

export const Route = createFileRoute("/insights/sme-halal-biniyog")({
  head: () => ({
    meta: [
      { title: "এসএমই ব্যবসায় হালাল বিনিয়োগের গুরুত্ব এবং পদ্ধতি · বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "হালাল বিনিয়োগ শুধু একটি ধর্মীয় দায়িত্ব নয়, বরং এটি একটি টেকসই অর্থনৈতিক ব্যবস্থা গড়ে তুলতে সাহায্য করে। বিস্তারিত জানুন কীভাবে এসএমই খাতে শরীয়াহ সম্মত বিনিয়োগ করা যায়।",
      },
    ],
  }),
  component: SmeHalalBiniyogArticle,
});

const SECTIONS = [
  {
    id: "importance",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "বাংলাদেশের অর্থনীতিতে এসএমই খাতের ভূমিকা",
    paragraphs: [
      "বাংলাদেশের মতো উন্নয়নশীল দেশের অর্থনীতির মেরুদণ্ড হলো ক্ষুদ্র ও মাঝারি শিল্প (SME)। দেশে কর্মসংস্থানের একটি বিশাল অংশ তৈরি হয় এই খাতের মাধ্যমে। ছোট পরিসরে শুরু হওয়া এসব ব্যবসা যেমন স্থানীয় চাহিদা মেটায়, তেমনি জাতীয় অর্থনীতিতেও গুরুত্বপূর্ণ অবদান রাখে।",
      "তবে আমাদের দেশের অনেক সম্ভাবনাময় এসএমই উদ্যোক্তা মূলধনের অভাবে তাদের ব্যবসাকে বড় করতে পারেন না। প্রচলিত ব্যাংক থেকে ঋণ পাওয়া তাদের জন্য বেশ কঠিন, আর পেলেও সুদের হারের কারণে ব্যবসার লাভের একটি বড় অংশ চলে যায় ঋণের কিস্তি মেটাতে। এখানেই প্রয়োজন হালাল বা শরীয়াহ-সম্মত বিনিয়োগের।",
    ],
  },
  {
    id: "halal-concept",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    title: "হালাল বিনিয়োগ কী এবং কেন এটি ভিন্ন?",
    paragraphs: [
      "হালাল বিনিয়োগের মূল ভিত্তি হলো লাভ ও ক্ষতির সমবণ্টন এবং সুদমুক্ত লেনদেন। ইসলামে টাকাকে পণ্য হিসেবে বিবেচনা করা হয় না, বরং টাকাকে ব্যবসায়ের একটি মাধ্যম হিসেবে দেখা হয়। তাই শুধু টাকা ধার দিয়ে নির্দিষ্ট হারে সুদ নেওয়া সম্পূর্ণ হারাম।",
      "হালাল পদ্ধতিতে যখন আপনি কোনো এসএমই-তে বিনিয়োগ করেন, তখন আপনি মূলত ওই ব্যবসার একজন অংশীদার (Partner) বা বিনিয়োগকারী (Rab-ul-mal) হিসেবে যুক্ত হন। ব্যবসা যদি লাভ করে, তবে পূর্বনির্ধারিত অনুপাতে আপনি লাভের অংশ পাবেন। আর যদি বাস্তবসম্মত কারণে ক্ষতি হয়, তবে তা মূলধন থেকে সমন্বয় করা হবে। এটি শুধু শরীয়াহ-সম্মত নয়, বরং এটি উদ্যোক্তাকে ঋণের পাহাড় থেকে বাঁচিয়ে একটি সুস্থ ব্যবসায়িক পরিবেশ নিশ্চিত করে।",
    ],
  },
  {
    id: "method",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "এসএমই খাতে বিনিয়োগের সঠিক পদ্ধতি",
    paragraphs: [
      "এসএমই-তে বিনিয়োগ করার আগে কয়েকটি বিষয় খুব ভালোভাবে যাচাই করা উচিত। প্রথমত, ব্যবসার মডেলটি বুঝতে হবে। ব্যবসাটি কোন পণ্য বা সেবা নিয়ে কাজ করছে এবং বাজারে তার চাহিদা কেমন তা জানা জরুরি।",
      "দ্বিতীয়ত, উদ্যোক্তার সততা ও অভিজ্ঞতা যাচাই করা। তৃতীয়ত, একটি সঠিক ও আইনি চুক্তি (Legal Agreement) করা, যেখানে মুদারাবা বা মুশারাকা নীতির আওতায় লাভ-ক্ষতির হার স্পষ্টভাবে উল্লেখ থাকবে। বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম ঠিক এই কাজটিই বিনিয়োগকারীদের জন্য সহজ করে দিয়েছে।",
      "আমরা প্রতিটি এসএমই ব্যবসার ব্যাকগ্রাউন্ড, আর্থিক অবস্থা এবং শরীয়াহ পরিপালন পুঙ্খানুপুঙ্খভাবে যাচাই করার পরেই কেবল সেগুলোকে বিনিয়োগের জন্য উন্মুক্ত করি।",
    ],
  },
  {
    id: "impact",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "সামাজিক প্রভাব ও টেকসই অর্থনীতি",
    paragraphs: [
      "আপনি যখন একটি হালাল এসএমই ব্যবসায় বিনিয়োগ করেন, তখন আপনি শুধু নিজের জন্য মুনাফাই অর্জন করছেন না, বরং সমাজের কল্যাণও করছেন। আপনার বিনিয়োগের ফলে হয়তো নতুন কর্মসংস্থান সৃষ্টি হচ্ছে, দেশের উৎপাদন বাড়ছে এবং অর্থনীতি আরও শক্তিশালী হচ্ছে।",
      "ক্ষতিকর পণ্য, ফটকাবাজি বা সুদী কারবারে বিনিয়োগ না করে যখন আমরা হালাল উৎপাদনে অর্থ বিনিয়োগ করি, তখন সম্পদের সুষম বণ্টন নিশ্চিত হয়। এটাই হলো হালাল বিনিয়োগের আসল সৌন্দর্য।",
    ],
  },
];

function SmeHalalBiniyogArticle() {
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
              শরীয়াহ ফাইন্যান্স
            </span>
            <span className="text-xs text-muted-foreground font-medium">২০ জুলাই ২০২৬</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground font-medium">৫ মিনিট পড়া</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-bold leading-tight">
            এসএমই ব্যবসায় হালাল বিনিয়োগের গুরুত্ব এবং পদ্ধতি
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            হালাল বিনিয়োগ শুধু একটি ধর্মীয় দায়িত্ব নয়, বরং এটি একটি টেকসই অর্থনৈতিক ব্যবস্থা গড়ে তুলতে সাহায্য করে। বিস্তারিত জানুন কীভাবে এসএমই খাতে শরীয়াহ সম্মত বিনিয়োগ করা যায়।
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
            হালাল উপায়ে বিনিয়োগ শুরু করুন
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            যাচাইকৃত এসএমই প্রতিষ্ঠানগুলোতে বিনিয়োগের সুযোগ দেখুন এবং হালাল আয়ের পথ সুগম করুন।
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
