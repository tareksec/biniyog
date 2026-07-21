import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  {
    name: "রফিকুল ইসলাম",
    role: "বিনিয়োগকারী · ঢাকা",
    initials: "রই",
    quote:
      "প্রথমে সংশয় ছিল, কিন্তু চুক্তি ও রিপোর্টিং এত পরিষ্কার যে এখন প্রতি রাউন্ডে অংশ নিচ্ছি। মাসিক পেআউট সময়মতো আসে।",
  },
  {
    name: "আয়েশা সিদ্দিকা",
    role: "বিনিয়োগকারী · চট্টগ্রাম",
    initials: "আস",
    quote:
      "স্বচ্ছতা ছিল আমার প্রথম প্রায়োরিটি। প্রতিটি প্রজেক্টের সোর্স অফ ইনকাম আগেই যাচাই করে জানানো হয় — এটাই আসল পার্থক্য।",
  },
  {
    name: "তানভীর হোসেন",
    role: "SME পার্টনার · সিলেট",
    initials: "তহ",
    quote:
      "আমার এগ্রো বিজনেসে দ্রুত তহবিল পেয়েছি স্বচ্ছ চুক্তিতে। পার্টনারশিপ মডেলের কারণে চাপ কম, ফোকাস ব্যবসায়।",
  },
  {
    name: "সাদিয়া রহমান",
    role: "বিনিয়োগকারী · ঢাকা",
    initials: "সর",
    quote:
      "কনসালট্যান্সি সেশনটা নিয়ে সিদ্ধান্ত নেওয়াটা সহজ হয়েছে। প্রথম বছরেই টার্গেটেড রিটার্নের কাছাকাছি পেয়েছি।",
  },
  {
    name: "আব্দুর রহমান",
    role: "প্রবাসী বিনিয়োগকারী · দুবাই",
    initials: "আর",
    quote:
      "প্রবাস থেকে দেশে হালাল বিনিয়োগের সুযোগ খুঁজছিলাম। বিনিয়োগ বৃদ্ধির প্ল্যাটফর্মটি আমার সেই দুশ্চিন্তা দূর করেছে।",
  },
  {
    name: "মেহেদী হাসান",
    role: "ব্যবসায়ী · রাজশাহী",
    initials: "মহ",
    quote:
      "শরীয়াহ কমপ্লায়েন্ট হওয়ার কারণেই মূলত এখানে বিনিয়োগ শুরু করি। প্রতিটি প্রজেক্টের ইনকাম সোর্স সম্পর্কে তাদের স্বচ্ছতা সত্যিই প্রশংসনীয়।",
  },
  {
    name: "ফাতেমা আক্তার",
    role: "চাকরিজীবী · খুলনা",
    initials: "ফা",
    quote:
      "অল্প পুঁজিতেও ভালো মানের প্রজেক্টে বিনিয়োগের সুযোগ পেয়েছি। তাদের নিয়মিত আপডেট ও সময়মতো পেআউট আমাকে ভরসা দিয়েছে।",
  }
];

export function TestimonialsSection() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const item = ITEMS[i];

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            গ্রাহকদের মতামত
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            বিনিয়োগকারীদের অভিজ্ঞতা
          </h2>
        </div>

        <div
          className="mt-10 min-h-[220px] sm:min-h-[200px]"
          aria-live="polite"
          aria-atomic="true"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary/40">
                <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z"/>
              </svg>
              <p className="mt-4 text-lg leading-relaxed text-foreground sm:text-xl">
                {item.quote}
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {item.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{item.role}</div>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {ITEMS.map((_, idx) => (
            <button
              key={idx}
              aria-label={`${idx + 1} নম্বর মতামত দেখুন`}
              aria-current={idx === i ? "true" : undefined}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}