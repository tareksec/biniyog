import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "মুদারাবা মডেল আসলে কী?",
    a: "মুদারাবা হলো একটি অংশীদারিত্ব মডেল যেখানে বিনিয়োগকারী মূলধন দেন এবং উদ্যোক্তা তার শ্রম ও দক্ষতা দিয়ে ব্যবসা পরিচালনা করেন। মুনাফা পূর্বনির্ধারিত অনুপাতে ভাগাভাগি হয়, আর ক্ষতি (উদ্যোক্তার অবহেলা না থাকলে) মূলধনদাতা বহন করেন।",
  },
  {
    q: "এই প্ল্যাটফর্ম কি সম্পূর্ণ শরীয়াহ সম্মত?",
    a: "হ্যাঁ। প্রতিটি প্রজেক্টের ব্যবসায়িক কার্যক্রম, আয়ের উৎস ও চুক্তি শরীয়াহ কমপ্লায়েন্সের নীতিমালা অনুযায়ী যাচাই করা হয়। সুদ, জুয়া বা হারাম পণ্যের সাথে জড়িত কোনো ব্যবসা তালিকাভুক্ত করা হয় না।",
  },
  {
    q: "মুনাফা কীভাবে ও কখন পাব?",
    a: "প্রতিটি প্রজেক্টের নির্দিষ্ট পেআউট শিডিউল থাকে — মাসিক, ত্রৈমাসিক বা বার্ষিক। মুনাফা প্রকৃত ব্যবসায়িক আয়ের ভিত্তিতে গণনা করে সরাসরি আপনার ব্যাংক অ্যাকাউন্টে পাঠানো হয়।",
  },
  {
    q: "আইনি সুরক্ষা কীভাবে নিশ্চিত হয়?",
    a: "প্রতিটি বিনিয়োগের জন্য নোটারাইজড চুক্তিনামা, সিকিউরিটি চেক এবং প্রয়োজন অনুযায়ী কোল্যাটারাল রাখা হয়। উদ্যোক্তার ব্যাকগ্রাউন্ড ও ব্যবসার আর্থিক বিবরণী স্বাধীনভাবে যাচাই করা হয়।",
  },
  {
    q: "বিনিয়োগ থেকে বের হতে চাইলে কী হবে?",
    a: "চুক্তির মেয়াদ শেষে মূলধন ও অর্জিত মুনাফা ফেরত পাওয়া যায়। মেয়াদের মাঝে বের হওয়ার প্রয়োজন হলে সেকেন্ডারি মার্কেট বা অন্য বিনিয়োগকারীর কাছে পোর্টফোলিও হস্তান্তরের সুযোগ থাকতে পারে।",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            সাধারণ জিজ্ঞাসা
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            মুদারাবা মডেল, আইনি কমপ্লায়েন্স ও মুনাফা বন্টন সম্পর্কে গুরুত্বপূর্ণ প্রশ্নের উত্তর।
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
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