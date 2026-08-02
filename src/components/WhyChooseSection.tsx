import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/animations";
import {
  Users,
  BadgeCheck,
  Scale,
  FileCheck,
  TrendingUp,
  Eye,
  HeartHandshake,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Data: 8 reasons with expanded descriptions
   ──────────────────────────────────────────────────────────── */

interface WhyItem {
  id: number;
  label: string;
  shortDesc: string;
  expandedDesc: string;
  gradient: string;
  isLight: boolean;
  Icon: React.FC<{ size?: number; className?: string }>;
  articleHash: string;
}

const WHY_DATA: WhyItem[] = [
  {
    id: 0,
    label: "ব্যবসায়ীর সাথে সরাসরি সংযোগ",
    shortDesc:
      "আপনার ও ব্যবসায়ীর মাঝে সরাসরি যোগাযোগ এবং সম্পর্ক হবে। মাঝে কেউ থাকবে না।",
    expandedDesc:
      "আপনার বিনিয়োগকৃত অর্থ সরাসরি ব্যবসায়ীর কাছে পৌঁছায় এবং আপনি নিজেই ব্যবসায়ীর সাথে সম্পর্ক স্থাপন করতে পারেন। কোনো মধ্যস্বত্বভোগী বা তৃতীয় পক্ষ নেই। এতে করে আপনি আপনার বিনিয়োগের সার্বিক অবস্থা সম্পর্কে সরাসরি অবগত থাকতে পারবেন, ব্যবসায়ীর সাথে নিয়মিত যোগাযোগ রক্ষা করতে পারবেন এবং প্রয়োজন অনুযায়ী সরাসরি মতামত দিতে পারবেন। এটি বিনিয়োগকারী ও উদ্যোক্তার মধ্যে একটি স্বচ্ছ এবং বিশ্বাসযোগ্য সম্পর্ক গড়ে তোলে, যা দীর্ঘমেয়াদে উভয় পক্ষের জন্যই লাভজনক।",
    gradient: "linear-gradient(135deg, #daf1de 0%, #c8e6d0 50%, #a8d5b5 100%)",
    isLight: true,
    Icon: Users,
    articleHash: "connect",
  },
  {
    id: 1,
    label: "সুদ মুক্ত আয়",
    shortDesc:
      "সকল প্রকার আয় সুদ মুক্ত। কোন প্রকার বাহানা ও ঘুরিয়ে সুদ খাওয়ার সুযোগ নেই।",
    expandedDesc:
      "আমাদের প্ল্যাটফর্মে সকল প্রকার আয় সম্পূর্ণরূপে সুদ মুক্ত। আমরা ইসলামী শরিয়াহ ও নৈতিক বিনিয়োগ নীতি অনুসরণ করি। এখানে বিনিয়োগের অর্থ সরাসরি ব্যবসায় বিনিয়োগ করা হয় এবং ব্যবসার প্রকৃত লাভ-ক্ষতির ভিত্তিতে মুনাফা বণ্টন করা হয়। কোনো অবস্থাতেই নির্দিষ্ট হারে সুদ প্রদান বা গ্রহণ করা হয় না, এমনকি কোনো প্রকার ঘুরিয়ে বা বাহানা করেও সুদ খাওয়ার কোনো সুযোগ রাখা হয়নি। এটি একটি প্রকৃত অংশীদারিত্বভিত্তিক বিনিয়োগ মডেল, যেখানে আপনি ব্যবসার প্রকৃত মালিকানার অংশীদার হন।",
    gradient: "linear-gradient(135deg, #b8d9c5 0%, #8EB69B 50%, #6ba87a 100%)",
    isLight: true,
    Icon: BadgeCheck,
    articleHash: "interest-free",
  },
  {
    id: 2,
    label: "আইনি সুরক্ষা",
    shortDesc:
      "প্রতিটি বিনিয়োগ লিগ্যাল ডকুমেন্ট ও সিকিউরিটি চেক নিশ্চিত করে করবেন।",
    expandedDesc:
      "প্রতিটি বিনিয়োগ চুক্তি সম্পূর্ণ আইনগতভাবে সম্পাদিত হয়। বিনিয়োগের পূর্বে প্রয়োজনীয় সকল ডকুমেন্ট যাচাই করা হয়, যার মধ্যে রয়েছে ট্রেড লাইসেন্স, ব্যবসায়িক চুক্তিপত্র, ব্যাংক সলভেন্সি সার্টিফিকেট এবং অন্যান্য প্রয়োজনীয় সিকিউরিটি চেক। একজন অভিজ্ঞ আইনজীবীর তত্ত্বাবধানে সকল চুক্তি সম্পাদিত হয়, যা বিনিয়োগকারীর স্বার্থ সম্পূর্ণরূপে সুরক্ষিত করে। কোনো প্রকার আইনি জটিলতা বা অনিয়মের সম্ভাবনা প্রশমনে আমরা সর্বোচ্চ সতর্কতা অবলম্বন করি, যাতে আপনার বিনিয়োগ সর্বদা নিরাপদ থাকে।",
    gradient: "linear-gradient(135deg, #235347 0%, #1a4038 50%, #163832 100%)",
    isLight: false,
    Icon: Scale,
    articleHash: "legal",
  },
  {
    id: 3,
    label: "স্বচ্ছ চুক্তি",
    shortDesc:
      "প্রতি মাসের হিসাব প্রদর্শন বাবদ লাভ-ক্ষতি ভাগাভাগি — সম্পূর্ণ স্বচ্ছ রিপোর্টিং।",
    expandedDesc:
      "আমাদের প্ল্যাটফর্মে সকল লেনদেন ও হিসাব সম্পূর্ণ স্বচ্ছ। প্রতিমাসে ব্যবসার আয়-ব্যয়ের বিস্তারিত হিসাব বিনিয়োগকারীদের কাছে পেশ করা হয় এবং এর ভিত্তিতে লাভ-ক্ষতি নির্ধারিত হয়। আপনি যেকোনো সময় আপনার বিনিয়োগের সর্বশেষ অবস্থা জানতে পারবেন। কোনো লুকানো চার্জ বা অস্বচ্ছ শর্ত নেই। চুক্তির প্রতিটি ধারা সহজবোধ্য ভাষায় লেখা থাকে যাতে বিনিয়োগকারী সম্পূর্ণরূপে বুঝতে পারেন তিনি কীসে সম্মতি দিচ্ছেন। এই স্বচ্ছতা আমাদের প্ল্যাটফর্মের প্রতি বিনিয়োগকারীদের আস্থার মূল ভিত্তি।",
    gradient: "linear-gradient(135deg, #163832 0%, #0B2B26 50%, #051F20 100%)",
    isLight: false,
    Icon: FileCheck,
    articleHash: "transparent",
  },
  {
    id: 4,
    label: "আকর্ষণীয় লাভ",
    shortDesc: "অনেক ভালো লাভ পাবার সম্ভাবনা",
    expandedDesc:
      "আমাদের প্ল্যাটফর্মের মাধ্যমে বিনিয়োগকারীরা প্রচলিত বিনিয়োগ মাধ্যমগুলোর তুলনায় অনেক বেশি হারে মুনাফা অর্জনের সুযোগ পান। যাচাইকৃত ও সম্ভাবনাময় ব্যবসাগুলোতে বিনিয়োগের মাধ্যমে আপনার মূলধন দ্রুত বৃদ্ধি পাওয়ার সম্ভাবনা থাকে। প্রতিটি ব্যবসার পূর্ববর্তী পারফরম্যান্স, বাজার চাহিদা, ব্যবসায়িক পরিকল্পনা এবং ভবিষ্যৎ সম্ভাবনা বিশদভাবে বিশ্লেষণ করে বিনিয়োগের সুপারিশ করা হয়। তবে আমরা কখনোই নিশ্চিত লাভের প্রতিশ্রুতি দেই না — বাস্তবসম্মত প্রত্যাশা ও ঝুঁকি সম্পর্কে বিনিয়োগকারীকে সম্পূর্ণ অবহিত করা হয়।",
    gradient: "linear-gradient(135deg, #8EB69B 0%, #6a9e7a 50%, #4a8c5c 100%)",
    isLight: true,
    Icon: TrendingUp,
    articleHash: "returns",
  },
  {
    id: 5,
    label: "সরেজমিনে যাচাইয়ের সুযোগ",
    shortDesc:
      "বিনিয়োগকারী যেকোনো সময় ব্যবসাপ্রতিষ্ঠান ও হিসাব সরাসরি নিজে গিয়ে যাচাই করতে পারবেন।",
    expandedDesc:
      "বিনিয়োগকারী চাইলে যেকোনো সময় সরাসরি ব্যবসাপ্রতিষ্ঠান পরিদর্শন করে নিজ চোখে সবকিছু যাচাই করতে পারেন। বিনিয়োগের পূর্বে যেমন আপনি ব্যবসার অবস্থান, কার্যক্রম, যন্ত্রপাতি ও অন্যান্য সম্পদ সরেজমিনে দেখে নিতে পারেন, তেমনি বিনিয়োগের পরেও নিয়মিত পরিদর্শনের মাধ্যমে আপনার বিনিয়োগকৃত অর্থের সদ্ব্যবহার নিশ্চিত করতে পারেন। সরেজমিনে যাচাইয়ের এই সুযোগ বিনিয়োগকারীকে একটি অতিরিক্ত নিরাপত্তা ও মানসিক প্রশান্তি প্রদান করে, যা শুধুমাত্র কাগজ-পত্রের উপর নির্ভর করে বিনিয়োগ করলে সম্ভব নয়।",
    gradient: "linear-gradient(135deg, #e2f2e5 0%, #c8e6d0 50%, #b8d9c5 100%)",
    isLight: true,
    Icon: Eye,
    articleHash: "verify",
  },
  {
    id: 6,
    label: "সমাজের জন্য কল্যাণকর ব্যবসা",
    shortDesc:
      "ক্ষতিকর পণ্য, ফটকাবাজি, জুয়া, অস্বাস্থ্যকর খাবার — এমন ব্যবসাকে বাছাই করা হয় না।",
    expandedDesc:
      "আমরা শুধুমাত্র সমাজ ও দেশের জন্য ইতিবাচক প্রভাব রাখে এমন ব্যবসায় বিনিয়োগের সুযোগ প্রদান করি। ক্ষতিকর পণ্য উৎপাদন, ফটকাবাজি, জুয়া, অস্বাস্থ্যকর খাদ্যপণ্য — এরকম কোনো ব্যবসায় আমরা বিনিয়োগের সুযোগ দেই না। আমরা বিশ্বাস করি বিনিয়োগ শুধু ব্যক্তিগত মুনাফার মাধ্যম নয়, এটি সমাজের উন্নয়নেরও একটি গুরুত্বপূর্ণ হাতিয়ার। আমাদের বাছাইকৃত ব্যবসাগুলো দেশীয় কর্মসংস্থান সৃষ্টি, স্থানীয় অর্থনীতি উন্নয়ন এবং টেকসই উন্নয়নে অবদান রাখে। আপনি নিশ্চিন্ত থাকতে পারেন যে আপনার বিনিয়োগকৃত অর্থ কোনো অনৈতিক বা সমাজবিরোধী কাজে ব্যবহৃত হচ্ছে না।",
    gradient: "linear-gradient(135deg, #0B2B26 0%, #071c19 50%, #051F20 100%)",
    isLight: false,
    Icon: HeartHandshake,
    articleHash: "social",
  },
  {
    id: 7,
    label: "স্বাধীন সিদ্ধান্ত",
    shortDesc: "নিজে যাচাই বাছাই করে স্বাধীন ভাবে সিদ্ধান্ত নিবেন।",
    expandedDesc:
      "বিনিয়োগের চূড়ান্ত সিদ্ধান্ত সম্পূর্ণরূপে আপনার নিজস্ব। আমরা কেবল আপনাকে প্রয়োজনীয় তথ্য, বিশ্লেষণ ও যাচাইয়ের সুযোগ প্রদান করি — কোনো প্রকার চাপ সৃষ্টি বা প্রলোভন দেখিয়ে বিনিয়োগে উৎসাহিত করি না। প্রতিটি ব্যবসা সম্পর্কে পর্যাপ্ত তথ্য, ডকুমেন্ট ও রিপোর্ট আপনার কাছে সরবরাহ করা হয় যাতে আপনি নিজে সবকিছু যাচাই-বাছাই করে একটি সুচিন্তিত সিদ্ধান্ত নিতে পারেন। আমরা বিশ্বাস করি একজন সচেতন ও স্বাধীন সিদ্ধান্তগ্রহণকারী বিনিয়োগকারীই সফল বিনিয়োগের মূল চাবিকাঠি।",
    gradient: "linear-gradient(135deg, #c8e6d0 0%, #a8d5b5 50%, #8EB69B 100%)",
    isLight: true,
    Icon: Lightbulb,
    articleHash: "connect",
  },
];

/* ────────────────────────────────────────────────────────────
   Bengali numerals helper
   ──────────────────────────────────────────────────────────── */
const BENGALI_NUMS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮"];
function toBengaliNumeral(n: number): string {
  return String(n)
    .split("")
    .map((ch) => BENGALI_NUMS[Number(ch)] ?? ch)
    .join("");
}

/* ────────────────────────────────────────────────────────────
   Number badge (circular, small)
   ──────────────────────────────────────────────────────────── */
function NumBadge({
  n,
  isActive,
  isLight,
}: {
  n: number;
  isActive: boolean;
  isLight: boolean;
}) {
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold leading-none transition-colors duration-300"
      style={{
        backgroundColor: isActive
          ? isLight
            ? "rgba(35,83,71,0.15)"
            : "rgba(255,255,255,0.18)"
          : isLight
            ? "rgba(35,83,71,0.07)"
            : "rgba(255,255,255,0.08)",
        color: isActive
          ? isLight
            ? "#143d33"
            : "#ffffff"
          : undefined,
      }}
    >
      {toBengaliNumeral(n)}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Icon badge wrapper (in the right detail panel)
   ──────────────────────────────────────────────────────────── */
function IconBadge({
  item,
  size = 22,
  floating = false,
}: {
  item: WhyItem;
  size?: number;
  floating?: boolean;
}) {
  const { Icon } = item;
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.span
      className="grid shrink-0 place-items-center rounded-[14px]"
      style={{
        width: size + 24,
        height: size + 24,
        backgroundColor: item.isLight
          ? "rgba(35,83,71,0.12)"
          : "rgba(255,255,255,0.15)",
      }}
      animate={
        floating && !prefersReduced
          ? { y: [0, -3, 0] }
          : {}
      }
      transition={
        floating && !prefersReduced
          ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
    >
      <Icon
        size={size}
        strokeWidth={1.8}
        color={item.isLight ? "#235347" : "#ffffff"}
      />
    </motion.span>
  );
}

/* ────────────────────────────────────────────────────────────
   Sidebar stagger variants
   ──────────────────────────────────────────────────────────── */
const sidebarContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ────────────────────────────────────────────────────────────
   WhyChooseSection — main export
   ──────────────────────────────────────────────────────────── */
export function WhyChooseSection() {
  const prefersReduced = usePrefersReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);

  /* For scroll-triggered entrance */
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "0px 0px -10% 0px" });

  /* Scroll snap functionality */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setSelectedIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.51,
      }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    itemRefs.current[index]?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const panelTransition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

  return (
    <section
      id="why"
      className="border-t border-border bg-background/75 backdrop-blur-[2px]"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-[2.5rem]">
            কেন আমরা
          </h2>
        </div>

        {/* ──── LIST + DETAIL LAYOUT ──── */}
        <div
          ref={sectionRef}
          className="mt-12 flex flex-col gap-5 sm:mt-14 sm:flex-row sm:gap-6"
        >
          {/* ── LEFT SIDEBAR: Unified list (desktop & mobile) ── */}
          <motion.div
            className="shrink-0 flex flex-col gap-1 w-full sm:w-[230px] lg:w-[260px]"
            variants={prefersReduced ? {} : sidebarContainerVariants}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <div 
              ref={scrollContainerRef}
              className="flex flex-col rounded-2xl border border-border/60 bg-card/80 p-2 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm h-[280px] overflow-y-auto snap-y snap-mandatory scroll-pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ overscrollBehaviorY: 'contain', scrollBehavior: prefersReduced ? 'auto' : 'smooth' }}
            >
              {WHY_DATA.map((item, i) => {
                const isActive = i === selectedIndex;
                return (
                  <motion.button
                    key={item.id}
                    ref={(el) => (itemRefs.current[i] = el)}
                    data-index={i}
                    type="button"
                    onClick={() => handleItemClick(i)}
                    variants={prefersReduced ? {} : sidebarItemVariants}
                    whileHover={prefersReduced || isActive ? {} : { scale: 1.02 }}
                    whileTap={prefersReduced || isActive ? {} : { scale: 0.98 }}
                    className={
                      "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 my-0.5 text-left text-[13px] leading-snug font-medium transition-colors duration-200 snap-start shrink-0 " +
                      (isActive
                        ? "text-[#143d33]"
                        : "text-muted-foreground hover:bg-[#daf1de]/40 hover:text-foreground")
                    }
                    style={{ scrollSnapStop: "always" }}
                  >
                    {/* Active pill background (animated layout) */}
                    {isActive && (
                      <motion.span
                        layoutId="why-active-pill"
                        className="absolute inset-1 rounded-[10px] bg-[#daf1de] shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Content */}
                    <span className="relative z-10">
                      <NumBadge
                        n={i + 1}
                        isActive={isActive}
                        isLight={true}
                      />
                    </span>
                    <span className="relative z-10 flex-1">{item.label}</span>

                    {/* Hover chevron */}
                    <ChevronRight
                      size={13}
                      strokeWidth={2}
                      className={
                        "relative z-10 shrink-0 transition-all duration-200 " +
                        (isActive
                          ? "opacity-60 text-[#143d33]"
                          : "opacity-0 -translate-x-1 text-muted-foreground group-hover:opacity-50 group-hover:translate-x-0")
                      }
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── RIGHT DETAIL PANEL ── */}
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={
                  prefersReduced
                    ? {}
                    : { opacity: 0, x: 14, scale: 0.995 }
                }
                animate={
                  prefersReduced ? {} : { opacity: 1, x: 0, scale: 1 }
                }
                exit={
                  prefersReduced
                    ? {}
                    : { opacity: 0, x: -14, scale: 0.995 }
                }
                transition={panelTransition}
                className="overflow-hidden rounded-[26px] p-6 sm:p-10"
                style={{
                  background: WHY_DATA[selectedIndex].gradient,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <IconBadge
                  item={WHY_DATA[selectedIndex]}
                  size={28}
                  floating
                />

                <div className="mt-5 flex items-baseline gap-3 sm:mt-6">
                  <span
                    className="text-[48px] font-bold leading-none sm:text-[56px]"
                    style={{
                      color: WHY_DATA[selectedIndex].isLight
                        ? "#143d33"
                        : "#ffffff",
                      opacity: 0.5,
                    }}
                  >
                    {toBengaliNumeral(selectedIndex + 1)}
                  </span>
                  <h3
                    className="text-xl font-bold leading-tight sm:text-2xl"
                    style={{
                      color: WHY_DATA[selectedIndex].isLight
                        ? "#143d33"
                        : "#ffffff",
                    }}
                  >
                    {WHY_DATA[selectedIndex].label}
                  </h3>
                </div>

                <p
                  className="mt-4 max-w-[65ch] text-[14.5px] leading-[1.85] sm:text-[15px]"
                  style={{
                    color: WHY_DATA[selectedIndex].isLight
                      ? "rgba(20,61,51,0.85)"
                      : "rgba(255,255,255,0.85)",
                  }}
                >
                  {WHY_DATA[selectedIndex].expandedDesc}
                </p>
                <Link
                  to={"/insights/keno-somriddhite-biniyog#" + WHY_DATA[selectedIndex].articleHash}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-4 transition-colors"
                  style={{
                    color: WHY_DATA[selectedIndex].isLight ? "#143d33" : "#8EB69B",
                  }}
                >
                  বিস্তারিত পড়ুন 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseSection;
