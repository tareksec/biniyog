import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Testimonial } from "@/lib/database.types";
import { Loader2 } from "lucide-react";

async function fetchTestimonials() {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
  return data || [];
}

export function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || testimonials.length === 0) return;
    const t = setInterval(() => setI((v) => (v + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [paused, testimonials.length]);

  // Handle out of bounds if data length changes
  useEffect(() => {
    if (testimonials.length > 0 && i >= testimonials.length) {
      setI(0);
    }
  }, [testimonials.length, i]);

  if (!isLoading && testimonials.length === 0) {
    return null; // Don't show the section if no testimonials exist
  }

  const item = testimonials[i];

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
          {isLoading ? (
             <div className="flex h-full min-h-[200px] items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
             </div>
          ) : item ? (
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
                    {item.name.substring(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{item.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.location || "বিনিয়োগকারী"}</div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          ) : null}
        </div>

        {!isLoading && testimonials.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
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
        )}
      </div>
    </section>
  );
}