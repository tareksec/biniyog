import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "পার্টনারশিপ মডেল কীভাবে কাজ করে?",
    a: "আপনার টাকায় পণ্য কেনা হবে। সেই পণ্য বিক্রি হলে যা লাভ হবে তা আপনি ও উদ্যোক্তা ভাগাভাগি করে নিবেন। কোন কারণে পণ্য নষ্ট হলে যদি এতে উদ্যোক্তার গাফেলতি বা অবহেলা থাকে তাহলে উদ্যোক্তা জরিমানা বহন করবেন। আর যদি উদ্যোক্তার ক্ষমতার বাহিরে কোন কারণে পণ্য নষ্ট হয় যেমন রোড এক্সিডেন্ট, ভূমিকান্ড, দেশে দাঙ্গা হাঙ্গামা ইত্যাদি যা কিছুর সাথে উদ্যোক্তার হাত নেই তার ভার মালের মালিক হিসেবে বিনিয়োগকারী বহন করবেন।",
  },
  {
    q: "প্রজেক্ট যাচাইকরণ কীভাবে হয়?",
    a: "প্রতিটি প্রজেক্টের ব্যবসায়িক কার্যক্রম, আয়ের উৎস, আর্থিক বিবরণী ও উদ্যোক্তার ব্যাকগ্রাউন্ড স্বাধীনভাবে যাচাই করা হয়। যাচাই সম্পন্ন হলেই প্ল্যাটফর্মে তালিকাভুক্ত করা হয়।",
  },
  {
    q: "মুনাফা কীভাবে ও কখন পাব?",
    a: "প্রতিটি প্রজেক্টের নির্দিষ্ট পেআউট শিডিউল থাকে — মাসিক, ত্রৈমাসিক বা বার্ষিক। মুনাফা প্রকৃত ব্যবসায়িক আয়ের ভিত্তিতে গণনা করে সরাসরি আপনার ব্যাংক অ্যাকাউন্টে পাঠানো হয়।",
  },
  {
    q: "আইনি সুরক্ষা কীভাবে নিশ্চিত হয়?",
    a: "প্রতিটি বিনিয়োগের জন্য চুক্তিনামা, সিকিউরিটি চেক রাখা হয়। উদ্যোক্তার ব্যাকগ্রাউন্ড ও ব্যবসার আর্থিক বিবরণী স্বাধীনভাবে যাচাই করা হয়।",
  },
  {
    q: "বিনিয়োগ থেকে বের হতে চাইলে কী হবে?",
    a: "চুক্তির মেয়াদ শেষে মূলধন ও অর্জিত মুনাফা ফেরত পাওয়া যায়। মেয়াদের মাঝে বের হওয়ার প্রয়োজন হলে সেকেন্ডারি মার্কেট বা অন্য বিনিয়োগকারীর কাছে পোর্টফোলিও হস্তান্তরের সুযোগ থাকতে পারে। পাশাপশি নোটিশ দিয়ে সময় মতো বিনিয়োগকারীরা মূলধন তুলে আনতে পারেন।",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-background" aria-label="সাধারণ জিজ্ঞাসা">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            সাধারণ জিজ্ঞাসা
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            পার্টনারশিপ মডেল, আইনি কম্প্লায়েন্স ও মুনাফা বন্টন সম্পর্কে গুরুত্বপূর্ণ প্রশ্নের উত্তর।
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <AccordionItem
              key={f.q}
              value={f.q}
              className="rounded-2xl border border-border bg-card px-5 shadow-[var(--shadow-card)] data-[state=open]:border-primary/40"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline sm:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[14.5px] leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}