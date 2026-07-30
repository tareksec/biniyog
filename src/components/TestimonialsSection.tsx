import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { Testimonial } from "@/lib/database.types";
import { Loader2, Star } from "lucide-react";

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

function getMarqueeItems(list: Testimonial[], minCount = 6): Testimonial[] {
  if (!list || list.length === 0) return [];
  let result = [...list];
  while (result.length < minCount) {
    result = result.concat(list);
  }
  // Double the array so the 0% -> -50% CSS translation loop is 100% identical and seamless
  return [...result, ...result];
}

export function TestimonialCard({ item }: { item: Testimonial }) {
  const brandContent = item.brand_name ? (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit mb-3 transition-colors hover:bg-primary/15">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span>{item.brand_name}</span>
    </div>
  ) : null;

  return (
    <div className="w-[300px] sm:w-[380px] shrink-0 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] flex flex-col justify-between transition-transform duration-300 hover:scale-[1.02]">
      <div>
        {/* Brand Badge */}
        {item.related_opportunity_id ? (
          <Link to={`/opportunities/${item.related_opportunity_id}`}>
            {brandContent}
          </Link>
        ) : (
          brandContent
        )}

        {/* Star Rating */}
        {item.rating && item.rating > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        ) : null}

        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary/40">
          <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z"/>
        </svg>
        <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
          {item.quote}
        </p>

        {/* Investment Amount Badge */}
        {item.investment_amount && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
            <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item.investment_amount}</span>
          </div>
        )}
      </div>

      <footer className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
        {item.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={item.name}
            className="h-11 w-11 shrink-0 rounded-full object-cover border border-border"
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {item.name.substring(0, 2)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[item.role_title, item.location].filter(Boolean).join(" • ") || "বিনিয়োগকারী"}
          </div>
        </div>
      </footer>
    </div>
  );
}

export function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const [isTouching, setIsTouching] = useState(false);

  if (!isLoading && testimonials.length === 0) {
    return null; // Don't show the section if no testimonials exist
  }

  // Build rows with duplicated data for seamless looping
  const row1Items = getMarqueeItems(testimonials, 6);
  
  // Shift/offset Row 2 base array by 1 index so cards don't vertically align with Row 1
  const row2Base = testimonials.length > 1 
    ? [...testimonials.slice(1), testimonials[0]] 
    : testimonials;
  const row2Items = getMarqueeItems(row2Base, 6);

  return (
    <section 
      className="border-t border-border bg-surface overflow-hidden py-16 sm:py-24"
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => setIsTouching(false)}
      onTouchCancel={() => setIsTouching(false)}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            গ্রাহকদের মতামত
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            বিনিয়োগকারীদের অভিজ্ঞতা
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Row 1: Left to Right (0% to -50%) */}
          <div className="flex overflow-hidden">
            <div 
              className="animate-marquee-left flex gap-6 pr-6 sm:gap-8 sm:pr-8"
              style={{ animationPlayState: isTouching ? "paused" : undefined }}
            >
              {row1Items.map((item, idx) => (
                <TestimonialCard key={`r1-${item.id || idx}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* Row 2: Opposite Direction (-50% to 0%) */}
          <div className="flex overflow-hidden">
            <div 
              className="animate-marquee-right flex gap-6 pr-6 sm:gap-8 sm:pr-8"
              style={{ animationPlayState: isTouching ? "paused" : undefined }}
            >
              {row2Items.map((item, idx) => (
                <TestimonialCard key={`r2-${item.id || idx}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* See All Reviews Button */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/reviews"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              <span>সব রিভিউ দেখুন</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}