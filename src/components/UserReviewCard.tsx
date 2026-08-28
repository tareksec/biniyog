"use client";

import * as React from "react";
import { Star, MessageSquare, Building2, User, Sparkles, Smile, Meh, Frown } from "lucide-react";
import type { UserReview } from "@/lib/user_reviews";
import type { Opportunity } from "@/lib/database.types";
import { Link } from "@tanstack/react-router";

export interface UserReviewCardProps {
  review: UserReview;
  opportunity?: Opportunity | null;
  showTargetBadge?: boolean;
}

/**
 * Returns face icon and color info based on numeric rating (0.0 to 1.0)
 */
function getRatingSentiment(rating: number) {
  if (rating < 0.33) {
    return {
      label: "খারাপ",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
      barBg: "bg-rose-500",
      icon: <Frown className="w-5 h-5 text-rose-500" />,
      tag: "উন্নতি প্রয়োজন",
    };
  }
  if (rating <= 0.66) {
    return {
      label: "মোটামুটি",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
      barBg: "bg-amber-500",
      icon: <Meh className="w-5 h-5 text-amber-500" />,
      tag: "সন্তোষজনক",
    };
  }
  return {
    label: "চমৎকার",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    barBg: "bg-emerald-600",
    icon: <Smile className="w-5 h-5 text-emerald-600" />,
    tag: "উচ্চ প্রশংসা",
  };
}

/**
 * Formats ISO timestamp to Bengali localized relative or absolute date
 */
function formatBengaliDate(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} দিন আগে`;

    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "সম্প্রতি";
  }
}

export function UserReviewCard({
  review,
  opportunity,
  showTargetBadge = true,
}: UserReviewCardProps) {
  const rating = typeof review.rating === "number" ? review.rating : 0.5;
  const sentiment = getRatingSentiment(rating);
  const name = (review.reviewer_name || "").trim() || "সম্মানিত বিনিয়োগকারী";
  const initial = name.charAt(0).toUpperCase() || "ব";
  const percentScore = Math.round(rating * 100);

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group">
      <div>
        {/* Top Header: Rating Sentiment Badge & Score */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${sentiment.bg} ${sentiment.color}`}>
            {sentiment.icon}
            <span>{sentiment.label} ({percentScore}%)</span>
          </div>

          {/* Rating Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-24 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${sentiment.barBg} transition-all duration-500`}
                style={{ width: `${percentScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Note / Feedback */}
        {review.note ? (
          <div className="relative my-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-primary/25 mb-1.5"
              aria-hidden="true"
            >
              <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7.83H6.5C6.5 8.7 7.7 7.5 9.17 7.5V6h-2zM17.17 6c-2.3 0-4.17 1.87-4.17 4.17V18h7v-7.83h-3.5c0-1.47 1.2-2.67 2.67-2.67V6h-2z" />
            </svg>
            <p className="text-base leading-relaxed text-foreground sm:text-[16.5px] font-normal">
              "{review.note}"
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground/80 my-3">
            (ব্যবহারকারী কোনো অতিরিক্ত মন্তব্য যোগ করেননি)
          </p>
        )}

        {/* Target Badge (e.g. Opportunity or Homepage) */}
        {showTargetBadge && (
          <div className="mt-3">
            {review.target_type === "opportunity" && opportunity ? (
              <Link
                to="/opportunities/$id"
                params={{ id: opportunity.id }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{opportunity.name}</span>
              </Link>
            ) : review.target_type === "homepage" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-500" />
                প্ল্যাটফর্ম অভিজ্ঞতা
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer: Reviewer Info + Date */}
      <footer className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#1a6b4a]/10 text-[#1a6b4a] dark:bg-primary/20 dark:text-primary-foreground flex items-center justify-center font-bold text-sm border border-[#1a6b4a]/20">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-foreground">
              {name}
            </div>
            <div className="truncate text-xs text-muted-foreground font-medium">
              যাচাইকৃত মতামত
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground font-medium shrink-0 text-right">
          {formatBengaliDate(review.created_at)}
        </div>
      </footer>
    </div>
  );
}

export default UserReviewCard;
