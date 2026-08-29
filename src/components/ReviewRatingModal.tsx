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
 * Linear color interpolation between 3 exact hex values (0.0 to 1.0)
 * - Not Good (0.0): #F5C518
 * - Good (0.5): #A8D840
 * - Excellent (1.0): #B8E855
 */
export function getRatingBackgroundColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.5) {
    const t = clamped / 0.5;
    return lerpColor("#F5C518", "#A8D840", t);
  } else {
    const t = (clamped - 0.5) / 0.5;
    return lerpColor("#A8D840", "#B8E855", t);
  }
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

  // Watermark text logic for slider row level
  const leftWatermark = sliderValue < 0.5 ? "NOT GOOD" : "GOOD";
  const rightWatermark = sliderValue < 0.5 ? "GOOD" : "EXCELLENT";

  // ─── Face Calculations (200x200 coordinate space) ───
  // Mouth: single SVG bezier stroke only (strokeWidth 3, stroke #111827, no fill)
  // Frown at 0.0, Straight at 0.5, Smile at 1.0
  let mouthStartY: number, mouthCtrlY: number, mouthEndY: number;

  if (activeSliderValue <= 0.5) {
    const t = activeSliderValue / 0.5;
    // 0.0 (Frown): M 65 144 Q 100 120 135 144 (arches up)
    // 0.5 (Straight): M 65 134 Q 100 134 135 134 (flat)
    mouthStartY = 144 + (134 - 144) * t;
    mouthCtrlY = 120 + (134 - 120) * t;
    mouthEndY = 144 + (134 - 144) * t;
  } else {
    const t = (activeSliderValue - 0.5) / 0.5;
    // 0.5 (Straight): M 65 134 Q 100 134 135 134 (flat)
    // 1.0 (Smile): M 65 124 Q 100 150 135 124 (arches down)
    mouthStartY = 134 + (124 - 134) * t;
    mouthCtrlY = 134 + (150 - 134) * t;
    mouthEndY = 134 + (124 - 134) * t;
  }

  const mouthD = `M 65 ${mouthStartY.toFixed(2)} Q 100 ${mouthCtrlY.toFixed(2)} 135 ${mouthEndY.toFixed(2)}`;

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
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white/40 border border-white/60 text-xs text-[#111827] mb-2 backdrop-blur-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-[#111827] text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {reviewerDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#111827] truncate text-xs">{reviewerDisplayName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/60 shrink-0">
                      ✓ যাচাইকৃত
                    </span>
                  </div>

                  {/* Center: Face Area (200x200px centered) */}
                  <div className="relative w-[200px] h-[200px] mx-auto flex items-center justify-center select-none my-1">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-[200px] h-[200px]"
                      aria-hidden="true"
                    >
                      {/* Eyes: two large rounded rectangles (width 45px, height 30px, rx 12px, fill #111827, 20px gap, centered) */}
                      <rect x={45} y={58} width={45} height={30} rx={12} fill="#111827" />
                      <rect x={110} y={58} width={45} height={30} rx={12} fill="#111827" />

                      {/* Mouth: single SVG bezier stroke only (strokeWidth 3, stroke #111827, no fill) */}
                      <motion.path
                        d={mouthD}
                        fill="none"
                        stroke="#111827"
                        strokeWidth={3}
                        strokeLinecap="round"
                        transition={{ type: "spring", stiffness: 80, damping: 20 }}
                      />
                    </svg>
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
                        <CheckCircle2 className="w-9 h-9 text-emerald-800 mb-1.5" />
                        <p className="text-sm font-semibold text-[#111827]">ধন্যবাদ!</p>
                        <p className="text-xs text-[#111827]/70 mt-0.5">
                          আপনার মতামত সফলভাবে জমা হয়েছে।
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Rating Slider with Two Watermarks at Track Level */}
                  {!isSuccess && (
                    <div className="relative overflow-hidden py-3 my-1 select-none">
                      {/* Left word: position absolute, left -20px, transform translateY(-50%), top 50%, z-index 0 */}
                      <span
                        className="absolute -left-[20px] top-1/2 -translate-y-1/2 text-[56px] font-black tracking-[0.05em] uppercase text-[#111827] opacity-[0.12] select-none leading-none whitespace-nowrap pointer-events-none z-0"
                      >
                        {leftWatermark}
                      </span>

                      {/* Right word: position absolute, right -20px, transform translateY(-50%), top 50%, z-index 0 */}
                      <span
                        className="absolute -right-[20px] top-1/2 -translate-y-1/2 text-[56px] font-black tracking-[0.05em] uppercase text-[#111827] opacity-[0.12] select-none leading-none whitespace-nowrap pointer-events-none z-0"
                      >
                        {rightWatermark}
                      </span>

                      {/* Slider components layered on top of watermarks: position relative, z-index 1 */}
                      <div className="relative z-[1] space-y-2">
                        {/* Full width, thin track 2px, Thumb 20px black circle #111827 */}
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
                            className="corporate-rating-slider w-full h-[2px] appearance-none cursor-pointer focus:outline-none"
                            style={{
                              background: `linear-gradient(to right, #111827 0%, #111827 ${sliderValue * 100}%, rgba(17, 24, 39, 0.2) ${sliderValue * 100}%, rgba(17, 24, 39, 0.2) 100%)`,
                            }}
                          />
                        </div>

                        {/* Tick dots: 3 only (Bad, Not Bad, Good positions: 0.0, 0.5, 1.0) */}
                        <div className="flex justify-between items-center px-1 select-none">
                          {[0.0, 0.5, 1.0].map((tick) => {
                            const isClose = Math.abs(sliderValue - tick) < 0.15;
                            return (
                              <button
                                key={tick}
                                type="button"
                                onClick={() => setSliderValue(tick)}
                                className={`w-[6px] h-[6px] rounded-full transition-all duration-150 cursor-pointer ${
                                  isClose ? "bg-[#111827] scale-125" : "bg-[#111827]/30 hover:bg-[#111827]/60"
                                }`}
                                aria-label={`রেটিং ${tick * 100}%`}
                              />
                            );
                          })}
                        </div>

                        {/* Labels below: "Not Good", "Good", "Excellent" (font-size 11px, color #111827, opacity 0.6) */}
                        <div className="flex justify-between items-center text-[11px] text-[#111827] opacity-60 px-0.5 pt-0.5 select-none font-medium">
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

                  {/* ─── Form Fields (Always visible, Glass styling on colored background) ─── */}
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
                                : "bg-white/30 text-[#111827] border-white/50 hover:bg-white/40"
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
                                : "bg-white/30 text-[#111827] border-white/50 hover:bg-white/40"
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
                          className="w-full rounded-[8px] border border-white/50 bg-white/30 px-3 py-2 text-[14px] text-[#111827] placeholder:text-black/40 focus:border-[#111827] focus:outline-none transition-colors"
                        />
                        {errors.userIdentity && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.userIdentity}
                          </p>
                        )}
                      </div>

                      {/* Field 3: মতামত — single textarea, always open, no toggle, required */}
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
                          className="w-full rounded-[8px] border border-white/50 bg-white/30 p-2.5 text-[14px] text-[#111827] placeholder:text-black/40 focus:border-[#111827] focus:outline-none resize-none transition-colors"
                        />
                        {errors.note && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Buttons (bottom row) ─── */}
                  {!isSuccess && (
                    <div className="pt-4 flex items-center justify-between gap-3">
                      {/* Left: "নোট যোগ করুন" (ghost, left aligned, border 1px solid rgba(0,0,0,0.2), bg transparent) */}
                      <button
                        type="button"
                        onClick={() => noteInputRef.current?.focus()}
                        className="py-2.5 px-4 rounded-[8px] border border-black/20 bg-transparent text-[#111827] text-xs font-medium hover:bg-black/5 transition-colors cursor-pointer"
                      >
                        নোট যোগ করুন
                      </button>

                      {/* Right: "জমা দিন →" (pill shape, bg #111827, text white, right aligned) */}
                      <button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-full bg-[#111827] text-white font-medium text-xs hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
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

              {/* Slider Styling (2px track, 20px black thumb) */}
              <style>{`
                .corporate-rating-slider::-webkit-slider-runnable-track {
                  height: 2px;
                  border-radius: 9999px;
                  background: transparent;
                }
                .corporate-rating-slider::-moz-range-track {
                  height: 2px;
                  border-radius: 9999px;
                  background: transparent;
                }
                .corporate-rating-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #111827;
                  cursor: pointer;
                  margin-top: -9px;
                  box-shadow: none;
                  border: none;
                  transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .corporate-rating-slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
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
