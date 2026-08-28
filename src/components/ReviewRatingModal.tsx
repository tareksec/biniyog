"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Lock, LogIn, UserCheck } from "lucide-react";
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
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Interpolates rating background color based on slider value (0.0 to 1.0)
 * - 0.0 -> 0.33: soft red (#FFCDD2 to #FFF9C4)
 * - 0.33 -> 0.66: yellow/orange (#FFF9C4 to #DCEDC8)
 * - 0.66 -> 1.0: soft green (#DCEDC8 to #C8E6C9)
 */
export function getRatingBackgroundColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.33) {
    const t = clamped / 0.33;
    return lerpColor("#FFCDD2", "#FFF9C4", t);
  } else if (clamped <= 0.66) {
    const t = (clamped - 0.33) / (0.66 - 0.33);
    return lerpColor("#FFF9C4", "#DCEDC8", t);
  } else {
    const t = (clamped - 0.66) / (1.0 - 0.66);
    return lerpColor("#DCEDC8", "#C8E6C9", t);
  }
}

/**
 * Interpolates rating theme border color based on slider value (0.0 to 1.0)
 * - 0.0 -> 0.33: red (#E53935 to #FBC02D)
 * - 0.33 -> 0.66: yellow/amber (#FBC02D to #689F38)
 * - 0.66 -> 1.0: green (#689F38 to #163832)
 */
export function getRatingThemeColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.33) {
    const t = clamped / 0.33;
    return lerpColor("#E53935", "#FBC02D", t);
  } else if (clamped <= 0.66) {
    const t = (clamped - 0.33) / (0.66 - 0.33);
    return lerpColor("#FBC02D", "#689F38", t);
  } else {
    const t = (clamped - 0.66) / (1.0 - 0.66);
    return lerpColor("#689F38", "#163832", t);
  }
}

/**
 * Returns textual status indicator for the rating value
 */
function getRatingStatus(value: number): "BAD" | "NOT BAD" | "GOOD" {
  if (value < 0.33) return "BAD";
  if (value <= 0.66) return "NOT BAD";
  return "GOOD";
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
  const [investmentDetails, setInvestmentDetails] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{ hasInvested?: string; userIdentity?: string; note?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset internal states when opened
  React.useEffect(() => {
    if (isOpen) {
      setSliderValue(0.5);
      setNote("");
      setHasInvested(null);
      setUserIdentity("");
      setInvestmentDetails("");
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
  const themeColor = getRatingThemeColor(activeSliderValue);
  const statusText = getRatingStatus(sliderValue);

  // Face SVG calculation:
  // - At sliderValue 0.0: control point Y = 110 (frown - curves up visually)
  // - At sliderValue 0.5: control point Y = 90 (straight line)
  // - At sliderValue 1.0: control point Y = 70 (smile - curves down)
  // Formula: controlPointY = 110 - (sliderValue * 40)
  const controlPointY = 110 - activeSliderValue * 40;
  const mouthPathD = `M 55 95 Q 80 ${controlPointY} 105 95`;

  const validateForm = (): boolean => {
    const newErrors: { hasInvested?: string; userIdentity?: string; note?: string } = {};

    if (hasInvested === null) {
      newErrors.hasInvested = "অনুগ্রহ করে বিনিয়োগ করেছেন কিনা তা নির্বাচন করুন";
    }

    if (!userIdentity.trim()) {
      newErrors.userIdentity = "আপনার পেশা বা পরিচয় উল্লেখ করুন (যেমন: ব্যবসায়ী, চাকরিজীবী)";
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
        investment_details: investmentDetails.trim() || undefined,
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
        {/* Animated backdrop overlay */}
        <DialogPrimitive.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          />
        </DialogPrimitive.Overlay>

        {/* Modal content container */}
        <DialogPrimitive.Content asChild>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              style={{ backgroundColor: !user ? "#F8FAFC" : backgroundColor }}
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl transition-colors duration-150 ease-out border border-white/40 text-[#051F20]"
            >
              {/* Accessibility Description */}
              <DialogPrimitive.Description className="sr-only">
                বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মে আপনার অভিজ্ঞতার রেটিং এবং মতামত জমা দিন।
              </DialogPrimitive.Description>

              {/* Top Row: Close IconButton (top-left) + Title (centered) */}
              <div className="relative flex items-center justify-between pb-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  aria-label="বন্ধ করুন"
                  className="p-2 rounded-full text-[#163832]/80 hover:text-[#051F20] hover:bg-black/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832] disabled:opacity-40 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <DialogPrimitive.Title className="text-lg sm:text-xl font-bold font-display text-[#163832] text-center flex-1 pr-9">
                  {!user ? "মতামত প্রদান" : "আপনার অভিজ্ঞতা কেমন ছিল?"}
                </DialogPrimitive.Title>
              </div>

              {/* ─── Case 1: Visitor is Logged Out ─── */}
              {authLoading ? (
                <div className="py-12 text-center text-[#163832]">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#163832]" />
                  <span className="text-sm font-semibold">যাচাই করা হচ্ছে...</span>
                </div>
              ) : !user ? (
                <div className="py-5 px-2 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-3xl bg-[#163832]/10 text-[#163832] flex items-center justify-center border border-[#163832]/20 shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-xl font-bold font-display text-[#163832]">
                      মতামত দিতে লগইন করুন
                    </h3>
                    <p className="text-xs sm:text-sm text-[#051F20]/80 leading-relaxed">
                      প্ল্যাটফর্ম ও বিনিয়োগ সুযোগের স্বচ্ছতা ও নির্ভরযোগ্যতা নিশ্চিত করতে শুধুমাত্র নিবন্ধিত ও লগইনকৃত বিনিয়োগকারীগণ রিভিউ জমা দিতে পারেন।
                    </p>
                  </div>

                  <div className="pt-3 flex flex-col gap-2.5 max-w-xs mx-auto">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#163832] text-white font-bold text-sm shadow-md hover:bg-[#0B2B26] hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>লগইন করুন</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-white/80 text-[#163832] font-bold text-xs sm:text-sm border border-black/10 hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
                    </Link>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-[#163832]/70 hover:text-[#163832] font-semibold pt-1 cursor-pointer transition-colors"
                    >
                      পরে করব
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── Case 2: User is Authenticated ─── */
                <>
                  {/* Verified Reviewer Header Badge */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/60 backdrop-blur-xs border border-black/5 text-xs text-[#163832] mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#163832]/15 text-[#163832] font-bold text-xs flex items-center justify-center shrink-0">
                        {reviewerDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-[#051F20]">{reviewerDisplayName}</span>
                        {user.email && (
                          <span className="text-[11px] text-gray-500 ml-1.5 hidden sm:inline">
                            ({user.email})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
                      ✓ যাচাইকৃত
                    </span>
                  </div>

                  {/* Center: Animated SVG Face (Fixed 160x160 container) */}
                  <div className="flex justify-center items-center py-2">
                    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                      <svg
                        viewBox="0 0 160 160"
                        className="w-full h-full drop-shadow-xs select-none"
                        aria-hidden="true"
                      >
                        {/* Face boundary background */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="#FFFFFF"
                          fillOpacity="0.45"
                          stroke="#163832"
                          strokeWidth="3.5"
                        />

                        {/* Two static circle eyes */}
                        <circle cx="55" cy="62" r="6" fill="#163832" />
                        <circle cx="105" cy="62" r="6" fill="#163832" />

                        {/* Dynamic mouth using quadratic bezier curve Q cx cy ex ey */}
                        <path
                          d={mouthPathD}
                          fill="none"
                          stroke="#163832"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Success State Overlay */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="flex flex-col items-center justify-center py-3 text-center"
                      >
                        <CheckCircle2 className="w-10 h-10 text-[#163832] mb-1.5 animate-bounce" />
                        <p className="text-base font-bold text-[#163832]">ধন্যবাদ!</p>
                        <p className="text-xs text-[#163832]/80 mt-0.5">
                          আপনার মতামত সফলভাবে জমা হয়েছে।
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Rating Slider & Stepper */}
                  {!isSuccess && (
                    <div className="space-y-2.5 pt-1 pb-2">
                      <div className="relative px-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={sliderValue}
                          onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                          disabled={isSubmitting || isSuccess}
                          aria-label="রেটিং নির্বাচন করুন"
                          className="review-rating-slider w-full h-3 bg-black/10 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832]"
                        />
                      </div>

                      {/* Row with 5 Tick points */}
                      <div className="flex justify-between items-center px-3 text-[#163832]/50 text-xs select-none">
                        {[0.0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                          const isClose = Math.abs(sliderValue - tick) < 0.12;
                          return (
                            <button
                              key={tick}
                              type="button"
                              onClick={() => setSliderValue(tick)}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-150 cursor-pointer ${
                                isClose
                                  ? "bg-[#163832] scale-125 ring-2 ring-white/60"
                                  : "bg-black/20 hover:bg-[#163832]/60"
                              }`}
                              aria-label={`রেটিং সেট করুন ${tick * 100}%`}
                            />
                          );
                        })}
                      </div>

                      {/* Row with "Bad", "Not Bad", "Good" labels */}
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-[#163832]/80 px-1 pt-0.5 select-none">
                        <span
                          onClick={() => setSliderValue(0.0)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "BAD" ? "text-[#163832] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Bad
                        </span>
                        <span
                          onClick={() => setSliderValue(0.5)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "NOT BAD" ? "text-[#163832] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Not Bad
                        </span>
                        <span
                          onClick={() => setSliderValue(1.0)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "GOOD" ? "text-[#163832] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Good
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ─── Form Fields (Investment status, Identity, Mandatory Note, Details) ─── */}
                  {!isSuccess && (
                    <div className="space-y-3.5 pt-1 pb-1">
                      {/* Field 1: আপনি কি বিনিয়োগ করেছেন? */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#163832] mb-1.5">
                          আপনি কি বিনিয়োগ করেছেন? <span className="text-rose-600 font-bold">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setHasInvested(true);
                              if (errors.hasInvested) {
                                setErrors((prev) => ({ ...prev, hasInvested: undefined }));
                              }
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                              hasInvested === true
                                ? "bg-[#163832] text-white border-[#163832] shadow-sm"
                                : "bg-white/40 text-[#163832] border-black/10 hover:bg-white/60"
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                              {hasInvested === true && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </span>
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
                            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                              hasInvested === false
                                ? "bg-[#163832] text-white border-[#163832] shadow-sm"
                                : "bg-white/40 text-[#163832] border-black/10 hover:bg-white/60"
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center">
                              {hasInvested === false && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </span>
                            <span>না</span>
                          </button>
                        </div>
                        {errors.hasInvested && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                            {errors.hasInvested}
                          </p>
                        )}
                      </div>

                      {/* Field 2: আপনার পরিচয় */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#163832] mb-1.5">
                          আপনার পরিচয় <span className="text-rose-600 font-bold">*</span>
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
                          placeholder="আপনি বর্তমানে কি করছেন? (যেমন: ব্যবসায়ী, চাকরিজীবী)"
                          disabled={isSubmitting || isSuccess}
                          className="w-full rounded-xl border border-black/10 bg-white/75 backdrop-blur-xs px-3.5 py-2.5 text-xs sm:text-sm text-[#051F20] placeholder:text-[#163832]/45 focus:bg-white focus:border-[#163832] focus:outline-none focus:ring-2 focus:ring-[#163832]/25 transition-all shadow-inner"
                        />
                        {errors.userIdentity && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                            {errors.userIdentity}
                          </p>
                        )}
                      </div>

                      {/* Field 3: মতামত দিন (MANDATORY, ALWAYS VISIBLE) */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#163832] mb-1.5">
                          মতামত দিন <span className="text-rose-600 font-bold">*</span>
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => {
                            setNote(e.target.value);
                            if (errors.note && e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, note: undefined }));
                            }
                          }}
                          placeholder="আপনার মূল্যবান মতামত ও অভিজ্ঞতা বিস্তারিত লিখুন..."
                          rows={3}
                          disabled={isSubmitting || isSuccess}
                          className="w-full rounded-xl border border-black/10 bg-white/75 backdrop-blur-xs p-3 text-xs sm:text-sm text-[#051F20] placeholder:text-[#163832]/45 focus:bg-white focus:border-[#163832] focus:outline-none focus:ring-2 focus:ring-[#163832]/25 resize-none transition-all shadow-inner"
                        />
                        {errors.note && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                            {errors.note}
                          </p>
                        )}
                      </div>

                      {/* Field 4: বিনিয়োগের বিবরণ (ঐচ্ছিক) */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs sm:text-sm font-bold text-[#163832]">
                            বিনিয়োগের বিবরণ
                          </label>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#163832]/70 font-semibold border border-black/5">
                            ঐচ্ছিক
                          </span>
                        </div>
                        <textarea
                          value={investmentDetails}
                          onChange={(e) => setInvestmentDetails(e.target.value)}
                          placeholder="আপনি মোট কত টাকা বিনিয়োগ করেছেন এবং রিটার্ন কেমন পাচ্ছেন? (যদি আপনার আপত্তি না থাকে)"
                          rows={2}
                          disabled={isSubmitting || isSuccess}
                          className="w-full rounded-xl border border-black/10 bg-white/75 backdrop-blur-xs p-3 text-xs sm:text-sm text-[#051F20] placeholder:text-[#163832]/45 focus:bg-white focus:border-[#163832] focus:outline-none focus:ring-2 focus:ring-[#163832]/25 resize-none transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!isSuccess && (
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isSuccess}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#163832] text-white font-bold text-sm shadow-md hover:bg-[#0B2B26] hover:shadow-lg active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>পাঠানো হচ্ছে...</span>
                          </>
                        ) : (
                          <span>মতামত জমা দিন &rarr;</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Inline CSS for range slider styling */}
              <style>{`
                .review-rating-slider::-webkit-slider-runnable-track {
                  height: 12px;
                  border-radius: 9999px;
                  background: rgba(0, 0, 0, 0.12);
                }
                .review-rating-slider::-moz-range-track {
                  height: 12px;
                  border-radius: 9999px;
                  background: rgba(0, 0, 0, 0.12);
                }
                .review-rating-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  background: #163832;
                  cursor: pointer;
                  margin-top: -7px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                  transition: transform 0.15s ease, background-color 0.15s ease;
                }
                .review-rating-slider::-moz-range-thumb {
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  background: #163832;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                  transition: transform 0.15s ease, background-color 0.15s ease;
                  border: none;
                }
                .review-rating-slider:hover::-webkit-slider-thumb {
                  transform: scale(1.1);
                  background: #0B2B26;
                }
                .review-rating-slider:hover::-moz-range-thumb {
                  transform: scale(1.1);
                  background: #0B2B26;
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
