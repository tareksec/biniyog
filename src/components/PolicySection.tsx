import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Users,
  HeartHandshake
} from "lucide-react";

interface BroadPolicy {
  id: number;
  title: string;
  description: string;
  points: string[];
  icon: React.ElementType;
}

const BROAD_POLICIES: BroadPolicy[] = [
  {
    id: 1,
    title: "কঠোর ব্যবসা বাছাই",
    description: "আমরা শুধুমাত্র লাভজনক এবং সম্ভাবনাময় ব্যবসা বাছাই করি। স্বপ্নচারী বা পূর্ব অভিজ্ঞতাবিহীন ব্যবসায়ী, অযোগ্য, অদক্ষ ব্যক্তি, ব্যবসা লাভের সাথে সম্পর্কবিহীন ব্যয় করেন, এমন প্রতিষ্ঠানকে আমরা পরিহার করি।",
    points: [
      "লোকসান করছে বা দ্রুত বন্ধ হতে পারার ঝুঁকিতে থাকা কোম্পানি পাওয়া মাত্রই বাতিল।",
      "শখের বসে অপ্রয়োজনীয় ব্যয় করা ব্যবসা গ্রহণযোগ্য নয়।",
      "প্রতিষ্ঠাতার নিজস্ব মূলধন সকল প্রকার দায়ের তুলনায় ৫০% এর কম হলে সতর্কভাবে বিবেচনা।",
      "লাভ-ক্ষতির হিসাব এবং গুদামের পণ্যের সাথে বাস্তব মিল থাকা বাধ্যতামূলক।"
    ],
    icon: Building2
  },
  {
    id: 2,
    title: "উদ্যোক্তা যাচাই ও বিশ্লেষণ",
    description: "উদ্যোক্তার সততা, ব্যবসায়িক দক্ষতা এবং ব্যক্তিজীবন গভীরভাবে যাচাই করা হয়।",
    points: [
      "উদ্যোক্তার আচরণ, ব্যক্তিগত জীবন এবং সততা কঠোরভাবে যাচাই করা হয়।",
      "ব্যক্তিগত রুদ্ধদ্বার ইন্টারভিউ এবং সমজাতীয় ব্যবসায়ীদের থেকে গোপন খোঁজ নেওয়া।",
      "ব্যবসায় অদক্ষ বা বিলাসবহুল জীবনযাপনকারী উদ্যোক্তাদের বাতিল করা।",
      "কথা দিয়ে কথা না রাখা বা বাজে ব্যবহার করা ব্যক্তিদের সুযোগ দেওয়া হয় না।"
    ],
    icon: UserCheck
  },
  {
    id: 3,
    title: "স্বচ্ছতা ও জিরো টলারেন্স নীতি",
    description: "বিনিয়োগের অর্থের যথাযথ ব্যবহার নিশ্চিত করা আমাদের অগ্রাধিকার। কোনো প্রকার প্রতারণা বা অপচয় প্রমাণিত হলে আমরা জিরো টলারেন্স নীতি গ্রহণ করি এবং প্রয়োজনে আইনি ব্যবস্থা ও পাবলিক নোটিশ জারি করি।",
    points: [
      "বিনিয়োগের টাকায় অন্য কিছু কেনার বিষয় প্রমাণিত হলে সাথে সাথে ব্যবস্থা।",
      "প্রতারণা বা জালিয়াতির প্রমাণ পাওয়া মাত্রই জনস্বার্থে পাবলিক নোটিশ প্রদান।",
      "যারা অনলাইনে বিজ্ঞাপন দিয়ে ক্রাউড ফান্ডিং করেন, তাদের বিনিয়োগ প্রস্তাবনা গ্রহণ করা হয় না।",
      "কৃষিকাজ, পশু-পালন ও মুরগির খামার জাতীয় প্রজেক্ট নেওয়া হয় না। তবে এই কৃষি পণ্যের ব্যবসা গ্রহণ করা হয়।"
    ],
    icon: ShieldAlert
  },
  {
    id: 4,
    title: "বিনিয়োগকারীদের দায়িত্ব",
    description: "আমরা কেবল মানসম্পন্ন ব্যবসার প্রস্তাব দেই, চূড়ান্ত সিদ্ধান্ত বিনিয়োগকারীদের নিতে হবে নিজে পছন্দ করে নিজ দায়িত্বে। বিনিয়োগকারীদের অবশ্যই ব্যবসায়িক মানসিকতা নিয়ে, সুদের চিন্তা পরিহার করে এবং উদ্যোক্তাদের প্রতি সম্মানজনক আচরণ বজায় রেখে যুক্ত হবেন।",
    points: [
      "আমরা কেবল প্রস্তাব দিই, চূড়ান্ত সিদ্ধান্ত এবং বিনিয়োগের সকল দায় বিনিয়োগকারীর।",
      "সুদের মানসিকতা পরিহার করে প্রকৃত ব্যবসায়িক মানসিকতা নিয়ে বিনিয়োগ করতে হবে।",
      "উদ্যোক্তাদের সম্মানজনক আচরণ করা আবশ্যিক, কোনোভাবেই কষ্ট দেওয়া যাবে না।",
      "সন্দেহজনক কিছু নজরে এলে আমাদের জানাতে হবে, প্রমাণিত হলে ব্যবস্থা নেওয়া হবে।"
    ],
    icon: Users
  },
  {
    id: 5,
    title: "আমাদের অবস্থান ও অঙ্গীকার",
    description: "মানুষ হিসেবে আমাদের কোনো ভুল-ভ্রান্তি হলে আমরা ক্ষমাপ্রার্থী এবং সবার সহযোগিতায় একটি সুস্থ বিনিয়োগ পরিবেশ তৈরি করতে অঙ্গীকারবদ্ধ।",
    points: [
      "আমরা যাচাই-বাছাইয়ের বিনিময়ে শুধু ব্যবসায়ীদের থেকে ফি গ্রহণ করি।",
      "বিনিয়োগকারীদের সাথে আমাদের কোনো প্রকার আর্থিক লেনদেন হয় না।",
      "মানুষ হিসেবে আমরা ভুল ভ্রান্তির উর্ধ্বে না।",
      "সুস্থ বিনিয়োগ বৃদ্ধির পরিবেশ তৈরি করা আমাদের লক্ষ্য।"
    ],
    icon: HeartHandshake
  }
];

function StickyScrollCard({ 
  policy, 
  index, 
  totalCards, 
  scrollYProgress 
}: { 
  policy: BroadPolicy; 
  index: number; 
  totalCards: number; 
  scrollYProgress: any;
}) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = policy.icon;

  // We want the card to scale down slightly AFTER it has stuck.
  // Using an index-based fraction of the overall container's scroll progress.
  // The +0.1 offset gives it a little buffer so it stays at scale 1 for a moment before shrinking.
  const startScale = Math.min((index / totalCards) + 0.1, 1);
  const endScale = Math.min(startScale + (1 / totalCards), 1);
  
  const scale = useTransform(
    scrollYProgress,
    [startScale, endScale, 1],
    [1, prefersReducedMotion ? 1 : 0.94, prefersReducedMotion ? 1 : 0.94]
  );
  
  // The dark overlay opacity acts as a shadow to create depth, avoiding bleed-through
  // that would happen if we changed the parent container's opacity.
  // REMOVED: User requested the cards to remain purely white.

  return (
    <motion.div
      style={{
        scale,
        // Calculate dynamic top offset. Starts at 15vh, increases by 20px per card.
        top: `calc(15vh + ${index * 20}px)`,
        zIndex: index + 10,
      }}
      className={`sticky w-full max-w-4xl mx-auto ${index !== totalCards - 1 ? 'mb-[50vh]' : 'mb-0'}`}
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] will-change-transform">
        
        {/* Depth overlay removed per user request to keep cards white */}
        <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 mb-4 text-[11px] font-bold tracking-widest text-primary bg-primary/10 rounded-full uppercase">
              নীতিমালা ০{policy.id}
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4">
              {policy.title}
            </h3>
            <p className="text-[15px] sm:text-[17px] text-muted-foreground leading-relaxed font-medium mb-6">
              {policy.description}
            </p>
            <ul className="space-y-3">
              {policy.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span className="text-[14px] sm:text-[15px] text-muted-foreground/90 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PolicySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section 
      id="policy" 
      // Important: Removed 'overflow-hidden' because it breaks 'position: sticky'
      className="border-t border-border bg-surface/75 backdrop-blur-[2px] relative overflow-x-clip py-20 sm:py-28"
    >
      <div ref={containerRef} className="px-5 sm:px-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-32">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            আমাদের নীতিমালা
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.5rem]">
            চুম্বক অংশ
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            স্বচ্ছতা ও নৈতিকতার সাথে বিনিয়োগ বৃদ্ধি পরিচালনায় আমাদের অনুসৃত ৫টি মূল ভিত্তি।
          </p>
        </div>

        {/* Stacking Cards Container */}
        <div className="relative pb-[15vh]">
          {BROAD_POLICIES.map((policy, i) => (
            <StickyScrollCard 
              key={policy.id} 
              policy={policy} 
              index={i} 
              totalCards={BROAD_POLICIES.length}
              scrollYProgress={scrollYProgress} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}
