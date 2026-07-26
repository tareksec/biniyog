import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  UserCheck, 
  ShieldAlert, 
  Handshake, 
  CheckCircle2, 
  Search, 
  FileText, 
  AlertTriangle,
  Scale,
  Users,
  HeartHandshake
} from "lucide-react";

type PolicyCategory = "all" | "business" | "entrepreneur" | "investor" | "commitment";

interface PolicyItem {
  id: number;
  text: string;
  category: "business" | "entrepreneur" | "investor" | "commitment";
  categoryLabel: string;
}

const POLICY_ITEMS: PolicyItem[] = [
  {
    id: 1,
    text: "বর্তমানে লোকসান করছে, বিভিন্ন সমস্যায় পড়ে দ্রুত বন্ধ হয়ে যেতে পারে এমন কোম্পানি পাওয়া মাত্রই বাতিল। ভবিষ্যৎ সম্ভাবনা ভালো এমন প্রতিষ্ঠান বাছাই করা হয়।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 2,
    text: "স্বপ্নচারী উদ্যোক্তা যারা স্বপ্নকে পুঁজি করে অভিজ্ঞতাবিহীন ভাবে ব্যবসা পরিচালনা করছে তাদেরকে বাদ দেওয়া হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 3,
    text: "কোম্পানিতে এমন ব্যয় করা যা লাভ আনবে না যেমন দামী ফিটিংস, গাড়ি কেনা, অপ্রয়োজনীয় অফিস স্পেস সহ যা কিছু ব্যবসা লাভের সাথে সরাসরি সম্পর্কিত না কিন্তু প্রতিষ্ঠান মালিক তার শখের জায়গা থেকে করছে সেই সকল ব্যবসা প্রতিষ্ঠান গ্রহণ করা হবে না।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 4,
    text: "যারা অনলাইনে বিজ্ঞাপন দিয়ে ক্রাউড ফান্ডিং করে তাদের বাদ দেওয়া হবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 5,
    text: "সাধারণ কৃষি কাজ, যেমন মুরগি চাষ, ছাগল চাষ, গরু পালন, দুধ উৎপাদন, মাছ চাষ ইত্যাদিতে বিনিয়োগ করার জন্য বাছাই করা হবে না। তবে কোন উদ্ভাবন থাকলে এবং কৃষি প্রক্রিয়াজাত করণ, বাণিজ্য, রপ্তানি ইত্যাদি ব্যবসা গৃহীত হতে পারবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 6,
    text: "ব্যবসা প্রতিষ্ঠাতার মোট বিনিয়োগ যদি দায় বা অন্যান্যদের বিনিয়োগের তুলনায় ৫০% এর কম হয় তাহলে বাদ দেওয়া হবে কিংবা সতর্কভাবে আগাতে হবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 7,
    text: "লাভ ক্ষতির হিসাব ও সম্পদের বিবরণের সাথে বাস্তবে মিল আছে কিনা। নিয়মিত গুদামের পণ্য পরিবর্তন হচ্ছে কিনা সেটা খতিয়ে দেখতে হবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 8,
    text: "আমরা ব্যবসা পণ্য কিনে বা ক্রেতার দৃষ্টিতে দেখে যদি মনে করি এই পণ্য গুণে মানে ভালো ও সম্ভাবনাময় তাহলে আগানো হবে। অন্যথায় বাতিল বলে গণ্য হবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 9,
    text: "একজন সত্যিকারের ব্যবসায়ী যেভাবে আচরণ করে, কথা বলে এবং চিন্তা করে সেই প্যাটার্নের সাথে মিলিয়ে দেখা হবে যে সব ঠিক আছে কিনা।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 10,
    text: "সমজাতীয় পণ্য নিয়ে পরিচিত যারা ব্যবসা করছেন তাদের দ্বারা সম্ভব হলে অনুসন্ধান করে রিপোর্ট গ্রহণ করা হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 11,
    text: "একজন ব্যবসায়ীর আচরণ, পরিবার, ব্যক্তিগত জীবন সম্পর্কে দেখে যদি মনে হয় সন্দেহজনক তাহলে তাকে বাদ দেওয়া হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 12,
    text: "ব্যবসার সাথে পরিচিত ব্যক্তিবর্গ যেমন দারোয়ানের, কর্মচারী বা প্রতিবেশীদের থেকে খোঁজ নিয়ে কোন ঋণাত্মক বিষয় খুঁজে পেলে বাদ দেওয়া হবে। যদি কোন ব্যবসায়ী এই সকল বিষয়ে লুকোচুরি করে তাহলে আরও কঠোর যাচাই বাছাইয়ে ফেলা হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 13,
    text: "আমরা ব্যক্তিগত ভাবে একক রুদ্ধ দ্বার ইন্টারভিউ নিবো",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 14,
    text: "যারা কথা দিয়ে কথা রাখে না এবং রাগী আজেবাজে ব্যবহার করে তাদেরকে বাতিল করা হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 15,
    text: "ব্যবসায়ীকে ব্যবসা দক্ষ হতে হবে। উপরের সকল গুণাবলি থাকার পরেও যদি মনে হয় তিনি ব্যবসায় অদক্ষ তাহলে সাথে সাথে বাতিল করা হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 16,
    text: "ব্যবসায়ীকে সৎ, সত্যবাদী ও আমানতদার ব্যক্তি হতে হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 17,
    text: "বিনিয়োগের টাকায় যা কেনার কথা তা বাদে অন্য কিছু কেনার বিষয় প্রমাণিত হলে ব্যবস্থা নেওয়া হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 18,
    text: "ব্যক্তি জীবনে যেই ব্যক্তি অপচয় করে ও ব্যবসার টাকা বেড় করে বিলাস-বহুল জীবন যাপন করে তাকে বাদ দেওয়া হবে।",
    category: "entrepreneur",
    categoryLabel: "উদ্যোক্তা যাচাই"
  },
  {
    id: 19,
    text: "ফাইন্যান্সিয়াল স্টেটমেন্ট সহ আরও সকল একাউন্টিং তথ্য দেখা হবে।",
    category: "business",
    categoryLabel: "ব্যবসা বাছাই"
  },
  {
    id: 20,
    text: "এত কিছুর পরে আমাদের পছন্দ হলে বিনিয়োগের জন্য প্রস্তাব করা হবে।",
    category: "commitment",
    categoryLabel: "আমাদের অবস্থান"
  },
  {
    id: 21,
    text: "এর পরবর্তীতে বিনিয়োগকারীরা নিজেরা যাচাই বাছাই করে পছন্দ হলে বিনিয়োগ করবে এবং পছন্দ না হলে করবে না।",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 22,
    text: "বিনিয়োগকারীদের চোখে কোন সমস্যা পড়লে আমাদের জানাবে এবং যার ব্যাপারে অভিযোগ প্রমাণিত হবে তাকে বাদ দেওয়া হবে।",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 23,
    text: "আমরা কেবল নাম প্রস্তাব করি। বিনিয়োগের সিদ্ধান্ত গ্রহণ এবং এর পরবর্তীতে সকল দায় বিনিয়োগকারীকে নিতে হবে",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 24,
    text: "বিনিয়োগকারীরা কোন ভাবেই ব্যবসায়ীকে কষ্ট দেওয়ার মানসিকতা রাখতে পারবেন না। এই কথা মনে রাখতে হবে যে একজন ভালো ব্যবসায়ী সুদের থেকে বাঁচতে আপনাদের স্মরনাপন্ন হয়েছেন। তাই বিনিয়োগকারীদের সম্মানজনক আচরণ করতে হবে।",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 25,
    text: "বিনিয়োগকারীরা অকারণে খারাপ ধারনা পোষণ করবেন না এবং ব্যবসা মানসিকতা রাখবেন। কোন বিনিয়োগকারী যদি সুদের মানসিকতা রেখে বিনিয়োগের জগতে প্রবেশ করেন তাকে সম্মিলিত বয়কট করা হবে।",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 26,
    text: "ব্যবসায়ীরা চান আমাদের প্লাটফর্মে নাম লেখাতে। যাচাই বাছাই করে কেবলমাত্র পছন্দ হলেই এখানে স্থান দেই এবং আমাদের কাজের বিনিময়ে ব্যবসায়ীদের থেকে ফি গ্রহণ করি। বিনিয়োগকারীদের সাথে আমরা কোন লেনদেন করি না।",
    category: "commitment",
    categoryLabel: "আমাদের অবস্থান"
  },
  {
    id: 27,
    text: "আমরা ভুলের ঊর্ধ্বে না। ব্যবসায়ীরাও মানুষ। তাই নিজ জায়গা থেকে দায় ও দরদের সাথে বিনিয়োগ করতে হবে।",
    category: "commitment",
    categoryLabel: "আমাদের অবস্থান"
  },
  {
    id: 28,
    text: "সকলে বন্ধুত্বপুর্ণ ও সহযোগিতার মনোভাব রেখে একত্রে সুদের বিরুদ্ধে ও ব্যবসার পক্ষে যুদ্ধ করতে হবে।",
    category: "investor",
    categoryLabel: "বিনিয়োগকারী দায়িত্ব"
  },
  {
    id: 29,
    text: "ফ্রড বা প্রতারক যদি আমাদের এপ্রোচ করে প্রমাণ পাওয়া মাত্রই তার বিরুদ্ধে পাবলিক নোটিশ দেয়া হবে জনস্বার্থে।",
    category: "commitment",
    categoryLabel: "আমাদের অবস্থান"
  },
  {
    id: 30,
    text: "আমরা আমাদের জায়গা থেকে সর্বোচ্চ চেষ্টা করার পরেও যদি মানুষ হিসেবে কোন ভুল ভ্রান্তি থাকে তার জন্য সর্বোচ্চ ক্ষমাপ্রার্থী।",
    category: "commitment",
    categoryLabel: "আমাদের অবস্থান"
  }
];

const CATEGORY_TABS = [
  { id: "all", label: "সকল নীতিমালা (৩০টি)", icon: FileText },
  { id: "business", label: "ব্যবসা বাছাই (৮টি)", icon: Building2 },
  { id: "entrepreneur", label: "উদ্যোক্তা যাচাই (১১টি)", icon: UserCheck },
  { id: "investor", label: "বিনিয়োগকারী দায়িত্ব (৬টি)", icon: Users },
  { id: "commitment", label: "আমাদের অবস্থান (৫টি)", icon: HeartHandshake },
] as const;

function toBengaliNumber(num: number): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((d) => bengaliDigits[parseInt(d, 10)] || d)
    .join("");
}

export function PolicySection() {
  const [activeTab, setActiveTab] = useState<PolicyCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return POLICY_ITEMS.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesSearch = searchQuery === "" || item.text.includes(searchQuery);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <section id="policy" className="border-t border-border bg-surface py-20 sm:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            আমাদের নীতিমালা
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-[2.5rem]">
            চুম্বক অংশ
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            স্বচ্ছতা, নিরাপত্তা ও নৈতিকতার সাথে হালাল বিনিয়োগ পরিচালনার জন্য আমাদের অনুসৃত ৩০টি মূল নীতিমালা ও শর্তাবলী।
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PolicyCategory)}
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                    : "bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search filter optional */}
        <div className="mt-8 max-w-md mx-auto relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="নীতিমালা খুঁজুন (যেমন: সুদ, অপচয়, মুনাফা)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-muted rounded-full px-2 py-0.5"
              >
                মুছুন
              </button>
            )}
          </div>
        </div>

        {/* Grid of Policy Cards */}
        <motion.div 
          layout
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold font-mono">
                      #{toBengaliNumber(item.id).padStart(2, "০")}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-foreground font-normal">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="mt-12 text-center py-10 rounded-2xl border border-dashed border-border bg-card/50">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="text-base font-medium text-muted-foreground">কোনো নীতিমালা খুঁজে পাওয়া যায়নি।</p>
            <button
              onClick={() => { setActiveTab("all"); setSearchQuery(""); }}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              সকল নীতিমালা দেখুন
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
