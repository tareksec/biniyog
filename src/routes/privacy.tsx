import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Database, FileSpreadsheet, Lock, AlertOctagon, Users, HeartHandshake, ChevronRight, BookOpen } from "lucide-react";

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
    <div className="min-h-screen bg-[#F4FAF6] text-[#051F20] pb-24">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-gradient-to-b from-[#0B2B26] to-[#163832] text-white pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
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
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>নিরাপত্তা ও নীতিমালা</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
              নীতিমালা ও গোপনীয়তা নীতি (Privacy Policy)
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
              আমাদের প্রদানকৃত তথ্য কীভাবে সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখা হয়, তা নিচে স্পষ্টভাবে তুলে ধরা হলো।
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
        
        {/* ─── SECTION 1: তথ্য সংগ্রহ ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              ১
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Data Collection
              </span>
              <h2 className="text-xl font-bold text-[#051F20] mt-0.5">তথ্য সংগ্রহ</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-emerald-900/5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B2B26]">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                <span>ব্যবসায়ীর তথ্য</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                ব্যবসা যাচাই-বাছাই, মূল্যায়ন ও রিপোর্ট তৈরির জন্য প্রয়োজনীয় আর্থিক নথিপত্র, ট্রেড লাইসেন্স, ব্যাংক স্টেটমেন্ট এবং মালিকানা সংক্রান্ত বিবরণ আমরা সংগ্রহ করে থাকি।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-emerald-900/5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B2B26]">
                <Users className="h-4 w-4 text-emerald-700" />
                <span>গ্রাহক / সদস্যের তথ্য</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                গ্রাহকের নাম, যোগাযোগের নম্বর (ফোন নাম্বার), ঠিকানা এবং প্রোফাইল তথ্য আমরা সংরক্ষণ করি।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: তথ্যের ব্যবহার ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
              ২
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Data Usage
              </span>
              <h2 className="text-xl font-bold text-[#051F20] mt-0.5">তথ্যের ব্যবহার</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/70">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>বস্তুনিষ্ঠ রিপোর্ট প্রদান:</strong> সংগৃহীত তথ্যের পুঙ্খানুপুঙ্খ যাচাই-বাছাই করে বিনিয়োগকারীদের জন্য নির্ভরযোগ্য ও বস্তুনিষ্ঠ মূল্যায়ন রিপোর্ট তৈরি করা।
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/70">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>নিরাপত্তা ও প্রতিরোধ:</strong> অনাকাঙ্ক্ষিত প্রতারণা, জালিয়াতি বা তথ্যের অপব্যবহার প্রতিরোধ করা।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: তথ্য সুরক্ষা ও গোপনীয়তা ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm shrink-0">
              ৩
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                Security & Privacy
              </span>
              <h2 className="text-xl font-bold text-[#051F20] mt-0.5">তথ্য সুরক্ষা ও গোপনীয়তা</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/70 flex items-start gap-3.5">
              <Lock className="h-5 w-5 text-purple-700 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                আমরা কোনো সদস্য বা ব্যবসায়ীর ব্যক্তিগত তথ্য, ফোন নম্বর বা স্পর্শকাতর নথিপত্র কোনো তৃতীয় পক্ষ বা বাণিজ্যিক প্রতিষ্ঠানের কাছে <strong>বিক্রি, ভাড়া বা শেয়ার করি না</strong>।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/70 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-purple-700 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                গ্রুপের কোনো সদস্য যেন অন্য কোনো সদস্যের নম্বর সংগ্রহ করে অনাকাঙ্ক্ষিত অফার বা মেসেজ পাঠাতে না পারে, সে বিষয়ে কঠোর নজরদারি রাখা হয়। এমন আচরণ ধরা পড়লে সেই নাম্বার <strong>ব্লক ও রিপোর্ট করে আমাদেরকে সাথে সাথে জানাবেন</strong>।
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: সদস্যদের দায়িত্ব ─── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
              ৪
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Member Responsibilities
              </span>
              <h2 className="text-xl font-bold text-[#051F20] mt-0.5">সদস্যদের দায়িত্ব</h2>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/70 flex items-start gap-3.5">
              <AlertOctagon className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                আমাদের প্রস্তাবিত প্রতিষ্ঠানের বাহিরে অনলাইনে বিভিন্ন চটকদার বিজ্ঞাপন ও Whatsapp এ লোভনীয় মেসেজ দিলে সেটি পূর্ণাঙ্গ যাচাই বাছাই না করে অর্থনৈতিক লেনদেন করবেন না। প্রয়োজনে <strong>কনসালট্যান্সি সেবা গ্রহণ করে সিদ্ধান্ত গ্রহণ করুন</strong>।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/70 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                গ্রুপের কোনো সদস্যের মাধ্যমে গোপনীয়তা লঙ্ঘিত হলে বা অনাকাঙ্ক্ষিত বার্তা পেলে অবিলম্বে <strong>অ্যাডমিনদের অবহিত করুন</strong>।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/70 flex items-start gap-3.5">
              <HeartHandshake className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                সুদ মুক্ত ভাবে সমৃদ্ধির লক্ষ্যে আপনারা, আমরা এবং ব্যবসায়ীরা সকলে একে অন্যের সাথী। তাই একে অপরের প্রতি <strong>সহযোগিতা ও আস্থার সম্পর্ক বজায় রাখুন</strong>। কেউ যদি প্রতারণা করে তার ব্যাপারে সম্মিলিত প্রতিরোধ গড়ে তুলুন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex items-start gap-3.5">
              <Users className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-950 leading-relaxed font-medium">
                বিনিয়োগের সুস্থ পরিবেশ নিশ্চিতে ভালো কাজে একে অন্যের সহযোগী হন। সুদ ও প্রতারণার বিরুদ্ধে সম্মিলিত প্রতিরোধ গড়ে তুলুন। আমাদের সকলের অংশগ্রহণেই একটি সুন্দর পরিবেশ গড়ে উঠবে।
              </p>
            </div>
          </div>
        </section>

        {/* Navigation to Terms Card */}
        <div className="bg-gradient-to-br from-[#0B2B26] to-[#163832] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DAF1DE]">
              <BookOpen className="h-4 w-4" />
              <span>নিয়ম ও শর্তাবলী</span>
            </div>
            <h3 className="text-xl font-bold text-white">আমাদের সাধারণ শর্তাবলী দেখুন</h3>
            <p className="text-xs sm:text-sm text-white/70">
              প্ল্যাটফর্মের সুযোগ গ্রহণ ও ব্যবহারের বিস্তারিত শর্তাবলী জানুন।
            </p>
          </div>

          <Link
            to="/terms"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#DAF1DE] hover:bg-white text-[#0B2B26] font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            <span>শর্তাবলী পড়ুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
