"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

export interface ReviewRatingModalSubmitData {
  rating: number;
  note: string;
  has_invested: boolean;
  user_identity: string;
  investment_details?: string;
}

export interface ReviewRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewRatingModalSubmitData) => Promise<void>;
  targetType: "opportunity" | "homepage" | "general";
  targetId?: string;
}

/**
 * Converts a 6-digit hex string to RGB tuple
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

/**
 * Linearly interpolates between two hex colors by factor t (0.0 to 1.0)
 */
function lerpColor(c1: string, c2: string, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Background interpolation based on slider value (0.0 to 1.0):
 * - Not Good (0.0): #F5C518 (bold yellow)
 * - Good: interpolate #F5C518 -> #7BC043
 * - Excellent (1.0): #7BC043 (bold green)
 */
export function getRatingBackgroundColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  return lerpColor("#F5C518", "#7BC043", clamped);
}

/**
 * Returns textual status indicator for the rating value
 */
export function getRatingStatus(value: number): "Not Good" | "Good" | "Excellent" {
  if (value < 0.33) return "Not Good";
  if (value <= 0.66) return "Good";
  return "Excellent";
}

export function ReviewRatingModal({
  isOpen,
  onClose,
  onSubmit,
  targetType,
  targetId,
}: ReviewRatingModalProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [sliderValue, setSliderValue] = React.useState<number>(0.5);
  const [note, setNote] = React.useState<string>("");
  const [hasInvested, setHasInvested] = React.useState<boolean | null>(null);
  const [userIdentity, setUserIdentity] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{ hasInvested?: string; userIdentity?: string; note?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const noteInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset internal states when opened
  React.useEffect(() => {
    if (isOpen) {
      setSliderValue(0.5);
      setNote("");
      setHasInvested(null);
      setUserIdentity("");
      setErrors({});
      setIsSubmitting(false);
      setIsSuccess(false);
    } else {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    }
  }, [isOpen]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const activeSliderValue = isSuccess ? 1.0 : sliderValue;
  const backgroundColor = getRatingBackgroundColor(activeSliderValue);
  const statusText = getRatingStatus(sliderValue);

  // Watermark logic:
  // sliderValue 0.0-0.33: left="NOT GOOD", right="GOOD"
  // sliderValue 0.33-0.66: left="GOOD", right="EXCELLENT"
  // sliderValue 0.66-1.0: left="GOOD", right="EXCELLENT"
  const leftWatermark = sliderValue < 0.33 ? "NOT GOOD" : "GOOD";
  const rightWatermark = sliderValue < 0.33 ? "GOOD" : "EXCELLENT";

  // Mouth Bezier Curve control point:
  // M 10 30 Q 60 [controlY] 110 30
  // controlY = 10 + (sliderValue * 40)
  const mouthControlY = 10 + activeSliderValue * 40;

  const validateForm = (): boolean => {
    const newErrors: { hasInvested?: string; userIdentity?: string; note?: string } = {};

    if (hasInvested === null) {
      newErrors.hasInvested = "অনুগ্রহ করে নির্বাচন করুন";
    }

    if (!userIdentity.trim()) {
      newErrors.userIdentity = "আপনার পেশা বা পরিচয় লিখুন";
    }

    if (!note.trim()) {
      newErrors.note = "অনুগ্রহ করে আপনার মতামত লিখুন";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        rating: sliderValue,
        note: note.trim(),
        has_invested: Boolean(hasInvested),
        user_identity: userIdentity.trim(),
      });
      setIsSuccess(true);

      // Auto close after 2 seconds
      autoCloseTimerRef.current = setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewerDisplayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "সম্মানিত বিনিয়োগকারী";

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop overlay */}
        <DialogPrimitive.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
          />
        </DialogPrimitive.Overlay>

        {/* Modal container */}
        <DialogPrimitive.Content asChild>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ backgroundColor: !user ? "#FFFFFF" : backgroundColor }}
              className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl transition-colors duration-200 border border-black/5 text-[#111827] overflow-hidden"
            >
              {/* Accessibility Description */}
              <DialogPrimitive.Description className="sr-only">
                বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মে আপনার অভিজ্ঞতার রেটিং এবং মতামত জমা দিন।
              </DialogPrimitive.Description>

              {/* Top Row: Close Button + Title */}
              <div className="relative flex items-center justify-between pb-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  aria-label="বন্ধ করুন"
                  className="p-1.5 rounded-md text-[#111827]/70 hover:text-[#111827] hover:bg-black/5 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <DialogPrimitive.Title className="text-base sm:text-lg font-semibold text-[#111827] text-center flex-1 pr-7">
                  {!user ? "মতামত প্রদান" : "আপনার অভিজ্ঞতা কেমন ছিল?"}
                </DialogPrimitive.Title>
              </div>

              {/* ─── Case 1: Visitor is Logged Out ─── */}
              {authLoading ? (
                <div className="py-12 text-center text-[#6B7280]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#111827]" />
                  <span className="text-xs font-medium">যাচাই করা হচ্ছে...</span>
                </div>
              ) : !user ? (
                <div className="py-6 px-2 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 text-[#111827] flex items-center justify-center border border-gray-200">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h3 className="text-base font-semibold text-[#111827]">
                      মতামত দিতে লগইন করুন
                    </h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      প্ল্যাটফর্মের স্বচ্ছতা ও নির্ভরযোগ্যতা বজায় রাখতে শুধুমাত্র নিবন্ধিত বিনিয়োগকারীগণ রিভিউ দিতে পারেন।
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[6px] bg-[#111827] text-white font-medium text-xs shadow-xs hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>লগইন করুন</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-[6px] bg-transparent text-[#374151] font-medium text-xs border border-[#E5E7EB] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
                    </Link>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-[11px] text-[#6B7280] hover:text-[#111827] font-medium pt-1 cursor-pointer transition-colors"
                    >
                      পরে করব
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── Case 2: User is Authenticated ─── */
                <form onSubmit={handleSubmit}>
                  {/* Reviewer Header Badge */}
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white/30 border border-white/40 text-xs text-[#111827] mb-3 backdrop-blur-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-[#111827] text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {reviewerDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#111827] truncate text-xs">{reviewerDisplayName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-400/50 shrink-0">
                      ✓ যাচাইকৃত
                    </span>
                  </div>

                  {/* ─── Face Section (NO circle, NO container, NO border around face) ─── */}
                  <div className="flex flex-col items-center justify-center gap-2 pt-2 pb-1 select-none">
                    {/* Eyes: Two black (#111827) rounded rectangles (50x28px, rx 14px, 24px gap, centered) */}
                    <div className="flex items-center justify-center gap-[24px]">
                      <div className="w-[50px] h-[28px] rounded-[14px] bg-[#111827]" />
                      <div className="w-[50px] h-[28px] rounded-[14px] bg-[#111827]" />
                    </div>

                    {/* Mouth: Single SVG 120x50px, quadratic bezier M 10 30 Q 60 controlY 110 30 */}
                    <svg
                      width="120"
                      height="50"
                      viewBox="0 0 120 50"
                      className="overflow-visible"
                      aria-hidden="true"
                    >
                      <motion.path
                        d={`M 10 30 Q 60 ${mouthControlY.toFixed(2)} 110 30`}
                        fill="none"
                        stroke="#111827"
                        strokeWidth={3}
                        strokeLinecap="round"
                        transition={{ type: "spring", stiffness: 80, damping: 18 }}
                      />
                    </svg>
                  </div>

                  {/* ─── Status Text (below face: 36px, 900, opacity 0.9, animated) ─── */}
                  <div className="h-10 flex items-center justify-center select-none overflow-hidden my-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={statusText}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 0.9, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-[36px] font-black tracking-tight uppercase text-[#111827] leading-none"
                      >
                        {statusText.toUpperCase()}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Success State */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-4 text-center"
                      >
                        <CheckCircle2 className="w-9 h-9 text-emerald-950 mb-1.5" />
                        <p className="text-sm font-semibold text-[#111827]">ধন্যবাদ!</p>
                        <p className="text-xs text-[#111827]/75 mt-0.5">
                          আপনার মতামত সফলভাবে জমা হয়েছে।
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ─── Slider Section (position: relative, overflow: hidden) ─── */}
                  {!isSuccess && (
                    <div className="relative overflow-hidden py-4 my-1 select-none">
                      {/* Left Watermark: absolute, left -16px, top 50%, translateY(-50%), z-0 */}
                      <span
                        className="absolute -left-[16px] top-1/2 -translate-y-1/2 text-[56px] font-black tracking-normal uppercase text-[#111827] opacity-[0.12] select-none leading-none whitespace-nowrap pointer-events-none z-0"
                      >
                        {leftWatermark}
                      </span>

                      {/* Right Watermark: absolute, right -16px, top 50%, translateY(-50%), z-0 */}
                      <span
                        className="absolute -right-[16px] top-1/2 -translate-y-1/2 text-[56px] font-black tracking-normal uppercase text-[#111827] opacity-[0.12] select-none leading-none whitespace-nowrap pointer-events-none z-0"
                      >
                        {rightWatermark}
                      </span>

                      {/* Actual Slider: z-index: 1, position: relative */}
                      <div className="relative z-[1] space-y-2.5">
                        {/* Track height 3px, bg rgba(0,0,0,0.2), active #111827, Thumb 22px circle #111827 */}
                        <div className="relative px-0.5 flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                            disabled={isSubmitting || isSuccess}
                            aria-label="রেটিং নির্বাচন করুন"
                            className="corporate-rating-slider w-full h-[3px] appearance-none cursor-pointer focus:outline-none"
                            style={{
                              background: `linear-gradient(to right, #111827 0%, #111827 ${sliderValue * 100}%, rgba(0, 0, 0, 0.2) ${sliderValue * 100}%, rgba(0, 0, 0, 0.2) 100%)`,
                            }}
                          />
                        </div>

                        {/* 3 Tick Dots at 0%, 50%, 100% positions (6px circle, active opacity 1.0, inactive 0.4) */}
                        <div className="flex justify-between items-center px-1 select-none">
                          {[0.0, 0.5, 1.0].map((tick) => {
                            const isActive = sliderValue >= tick - 0.05;
                            return (
                              <button
                                key={tick}
                                type="button"
                                onClick={() => setSliderValue(tick)}
                                className={`w-[6px] h-[6px] rounded-full bg-[#111827] transition-opacity duration-150 cursor-pointer ${
                                  isActive ? "opacity-100 scale-110" : "opacity-40 hover:opacity-75"
                                }`}
                                aria-label={`রেটিং ${tick * 100}%`}
                              />
                            );
                          })}
                        </div>

                        {/* Labels below dots: 11px, color #111827, opacity 0.7 */}
                        <div className="flex justify-between items-center text-[11px] text-[#111827] opacity-70 px-0.5 select-none font-medium">
                          <button
                            type="button"
                            onClick={() => setSliderValue(0.0)}
                            className={`cursor-pointer transition-all ${
                              statusText === "Not Good" ? "font-bold opacity-100 text-[#111827]" : "hover:opacity-100"
                            }`}
                          >
                            Not Good
                          </button>
                          <button
                            type="button"
                            onClick={() => setSliderValue(0.5)}
                            className={`cursor-pointer transition-all ${
                              statusText === "Good" ? "font-bold opacity-100 text-[#111827]" : "hover:opacity-100"
                            }`}
                          >
                            Good
                          </button>
                          <button
                            type="button"
                            onClick={() => setSliderValue(1.0)}
                            className={`cursor-pointer transition-all ${
                              statusText === "Excellent" ? "font-bold opacity-100 text-[#111827]" : "hover:opacity-100"
                            }`}
                          >
                            Excellent
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Form Fields (below slider: bg rgba(255,255,255,0.25), border 1px solid rgba(255,255,255,0.4), rounded 8px) ─── */}
                  {!isSuccess && (
                    <div className="space-y-3 pt-1">
                      {/* Field 1: আপনি কি বিনিয়োগ করেছেন? (radio হ্যাঁ/না) — required */}
                      <div>
                        <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                          আপনি কি বিনিয়োগ করেছেন? <span className="text-rose-600">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setHasInvested(true);
                              if (errors.hasInvested) {
                                setErrors((prev) => ({ ...prev, hasInvested: undefined }));
                              }
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] text-xs font-medium transition-all cursor-pointer border ${
                              hasInvested === true
                                ? "bg-[#111827] text-white border-[#111827] shadow-xs"
                                : "bg-white/25 text-[#111827] border-white/40 hover:bg-white/35"
                            }`}
                          >
                            <span>হ্যাঁ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setHasInvested(false);
                              if (errors.hasInvested) {
                                setErrors((prev) => ({ ...prev, hasInvested: undefined }));
                              }
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] text-xs font-medium transition-all cursor-pointer border ${
                              hasInvested === false
                                ? "bg-[#111827] text-white border-[#111827] shadow-xs"
                                : "bg-white/25 text-[#111827] border-white/40 hover:bg-white/35"
                            }`}
                          >
                            <span>না</span>
                          </button>
                        </div>
                        {errors.hasInvested && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.hasInvested}
                          </p>
                        )}
                      </div>

                      {/* Field 2: আপনার পরিচয় — required */}
                      <div>
                        <label className="block text-[12px] font-medium text-[#111827] mb-1">
                          আপনার পরিচয় <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={userIdentity}
                          onChange={(e) => {
                            setUserIdentity(e.target.value);
                            if (errors.userIdentity && e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, userIdentity: undefined }));
                            }
                          }}
                          placeholder="পেশা (যেমন: ব্যবসায়ী, চাকরিজীবী)"
                          disabled={isSubmitting || isSuccess}
                          className="w-full rounded-[8px] border border-white/40 bg-white/25 px-3 py-2 text-[14px] text-[#111827] placeholder:text-black/45 focus:border-[#111827] focus:outline-none transition-colors"
                        />
                        {errors.userIdentity && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.userIdentity}
                          </p>
                        )}
                      </div>

                      {/* Field 3: মতামত — single textarea, required */}
                      <div>
                        <label className="block text-[12px] font-medium text-[#111827] mb-1">
                          মতামত <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          ref={noteInputRef}
                          value={note}
                          onChange={(e) => {
                            setNote(e.target.value);
                            if (errors.note && e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, note: undefined }));
                            }
                          }}
                          placeholder="আপনার মতামত ও বিনিয়োগের অভিজ্ঞতা লিখুন..."
                          rows={3}
                          disabled={isSubmitting || isSuccess}
                          className="w-full rounded-[8px] border border-white/40 bg-white/25 p-2.5 text-[14px] text-[#111827] placeholder:text-black/45 focus:border-[#111827] focus:outline-none resize-none transition-colors"
                        />
                        {errors.note && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Bottom Buttons: space-between ─── */}
                  {!isSuccess && (
                    <div className="pt-4 flex items-center justify-between gap-3">
                      {/* Left: "নোট যোগ করুন" (ghost button, border: 1px solid rgba(0,0,0,0.25), bg: transparent, rounded: 8px) */}
                      <button
                        type="button"
                        onClick={() => noteInputRef.current?.focus()}
                        className="py-2.5 px-4 rounded-[8px] border border-black/25 bg-transparent text-[#111827] text-xs font-medium hover:bg-black/5 transition-colors cursor-pointer"
                      >
                        নোট যোগ করুন
                      </button>

                      {/* Right: "জমা দিন →" (bg: #111827, color: white, rounded: 24px pill, padding: 12px 28px) */}
                      <button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className="inline-flex items-center justify-center gap-1.5 py-3 px-7 rounded-[24px] bg-[#111827] text-white font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>পাঠানো হচ্ছে...</span>
                          </>
                        ) : (
                          <span>জমা দিন →</span>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Slider Styling (3px track, 22px black thumb) */}
              <style>{`
                .corporate-rating-slider::-webkit-slider-runnable-track {
                  height: 3px;
                  border-radius: 9999px;
                  background: transparent;
                }
                .corporate-rating-slider::-moz-range-track {
                  height: 3px;
                  border-radius: 9999px;
                  background: transparent;
                }
                .corporate-rating-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #111827;
                  cursor: pointer;
                  margin-top: -9.5px;
                  box-shadow: none;
                  border: none;
                  transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .corporate-rating-slider::-moz-range-thumb {
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: #111827;
                  cursor: pointer;
                  box-shadow: none;
                  border: none;
                  transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .corporate-rating-slider:hover::-webkit-slider-thumb {
                  opacity: 0.9;
                  transform: scale(1.05);
                }
                .corporate-rating-slider:hover::-moz-range-thumb {
                  opacity: 0.9;
                  transform: scale(1.05);
                }
              `}</style>
            </motion.div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default ReviewRatingModal;
