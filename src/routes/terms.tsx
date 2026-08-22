import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, FileCheck, Ban, UserX, AlertTriangle, CheckCircle2, ChevronRight, BookOpen, Lock } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "বিনিয়োগ বৃদ্ধির প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও বিনিয়োগের শর্তাবলী।" },
      { property: "og:title", content: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { property: "og:description", content: "বিনিয়োগ বৃদ্ধির প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও বিনিয়োগের শর্তাবলী।" },
      { name: "twitter:title", content: "শর্তাবলী (Terms & Conditions) · বিনিয়োগ বৃদ্ধি" },
      { name: "twitter:description", content: "বিনিয়োগ বৃদ্ধির প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও বিনিয়োগের শর্তাবলী।" },
    ],
  }),
  component: TermsPage,
});

const TERMS_ITEMS = [
  {
    id: 1,
    icon: ShieldAlert,
    title: "সরাসরি বিনিয়োগ গ্রহণ না করা",
    description: "আমরা নিজেরা ব্যাক্তিগতভাবে কোনো প্রকার বিনিয়োগ গ্রহণ করি না। বিনিয়োগ বৃদ্ধি শুধুমাত্র মূল্যায়ন ও তথ্য সহায়তা প্রদানকারী প্ল্যাটফর্ম হিসেবে কাজ করে।",
    badge: "মূল নীতি",
    highlightColor: "from-emerald-500/10 to-teal-500/5",
    iconBg: "bg-emerald-100 text-emerald-800",
  },
  {
    id: 2,
    icon: FileCheck,
    title: "পুঙ্খানুপুঙ্খ তথ্য ও নথি যাচাই",
    description: "ব্যাবসা প্রতিষ্ঠানের প্রয়োজনীয় তথ্য ও নথিপত্র পুঙ্খানুপুঙ্খভাবে যাচাই-বাছাই করার পরই কেবল মূল্যায়ন রিপোর্ট (Evaluation Report) প্রকাশ করি।",
    badge: "যাচাই প্রক্রিয়া",
    highlightColor: "from-blue-500/10 to-cyan-500/5",
    iconBg: "bg-blue-100 text-blue-800",
  },
  {
    id: 3,
    icon: Ban,
    title: "নিষিদ্ধ ব্যবসা ও অননুমোদিত খাত",
    description: "অনলাইনে বিজ্ঞাপন দিয়ে ক্রাউড ফান্ডিং (Crowdfunding) করা ব্যবসা, MLM (এমএলএম), ইনস্যুরেন্স (বীমা), ভূমি দস্যুতা, সুদের সাথে ইচ্ছাকৃত জড়িত কোনো প্রতিষ্ঠান আমরা মূল্যায়ণ করি না।",
    badge: "কঠোর নিষেধাজ্ঞা",
    highlightColor: "from-rose-500/10 to-red-500/5",
    iconBg: "bg-rose-100 text-rose-800",
  },
  {
    id: 4,
    icon: UserX,
    title: "অযোগ্য ও অসৎ উদ্যোক্তা বর্জন",
    description: "যেসকল প্রতিষ্ঠানের অর্থনৈতিক অবস্থা আশঙ্কাজনক, মালিক ব্যবসা অযোগ্য, ব্যক্তিগত জীবনে অসৎ বা যাদের বিরুদ্ধে অসদাচরণের সুস্পষ্ট অভিযোগ রয়েছে তাদেরকে গ্রহণ করা হবে না।",
    badge: "যোগ্যতা মানদণ্ড",
    highlightColor: "from-amber-500/10 to-orange-500/5",
    iconBg: "bg-amber-100 text-amber-800",
  },
  {
    id: 5,
    icon: AlertTriangle,
    title: "বিনিয়োগ ঝুঁকি ও ব্যক্তিগত সিদ্ধান্তের দায়",
    description: "সুদ মুক্ত বিনিয়োগে ব্যাবসা ঝুঁকি থাকবেই। বিনিয়োগকারীকে বিনিয়োগজনিত ক্ষতি বা সিদ্ধান্তের দায় নেবার মানসিকতা রাখতে হবে। লাভ-ক্ষতি উভয়ই হালাল ব্যবসার অবিচ্ছেদ্য অংশ।",
    badge: "ঝুঁকি সতর্কতা",
    highlightColor: "from-purple-500/10 to-indigo-500/5",
    iconBg: "bg-purple-100 text-purple-800",
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F4FAF6] text-[#051F20] pb-24">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-gradient-to-b from-[#0B2B26] to-[#163832] text-white pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#DAF1DE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Back Navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#DAF1DE] hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full backdrop-blur-xs transition-all mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAF1DE]/15 border border-[#DAF1DE]/30 text-xs font-bold text-[#DAF1DE] uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>নিয়ম ও নির্দেশিকা</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
              শর্তাবলী (Terms & Conditions)
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
              বিনিয়োগ বৃদ্ধি প্ল্যাটফর্ম ব্যবহার এবং ব্যবসায়িক মূল্যায়ন রিপোর্ট অনুসরণের পূর্বে অনুগ্রহ করে নিচের শর্তাবলী সতর্কতার সাথে পড়ুন।
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
        
        {/* Intro Alert Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-900/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#0B2B26] flex items-center justify-center font-bold text-xl shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#051F20]">স্বচ্ছ ও বিশ্বস্ত প্ল্যাটফর্ম</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              আমরা সুদ ও অনিয়মমুক্ত সুস্থ বিনিয়োগ পরিবেশ তৈরিতে প্রতিশ্রুতিবদ্ধ। বিনিয়োগকারী ও উদ্যোক্তা উভয়ের অধিকার ও সুরক্ষা নিশ্চিতে এই শর্তাবলী প্রণীত হয়েছে।
            </p>
          </div>
        </div>

        {/* Terms Cards Grid / Stack */}
        <div className="space-y-4">
          {TERMS_ITEMS.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 hover:border-[#235347]/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground bg-slate-100 px-2.5 py-0.5 rounded-full">
                          শর্ত #{item.id}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DAF1DE] text-[#0B2B26]">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#051F20]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation to Privacy Policy Card */}
        <div className="bg-gradient-to-br from-[#0B2B26] to-[#163832] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DAF1DE]">
              <Lock className="h-4 w-4" />
              <span>তথ্য সুরক্ষা ও গোপনীয়তা</span>
            </div>
            <h3 className="text-xl font-bold text-white">আমাদের নীতিমালা ও গোপনীয়তা নীতি দেখুন</h3>
            <p className="text-xs sm:text-sm text-white/70">
              আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি তা বিস্তারিত জানুন।
            </p>
          </div>

          <Link
            to="/privacy"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#DAF1DE] hover:bg-white text-[#0B2B26] font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            <span>গোপনীয়তা নীতি পড়ুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
