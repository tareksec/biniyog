"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Lock, LogIn, MessageSquarePlus } from "lucide-react";
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
 * Desaturated corporate background interpolation based on slider value (0.0 to 1.0)
 * - Not Good: #FEE2E2
 * - Good: #EFF6FF
 * - Excellent: #DCFCE7
 */
export function getRatingBackgroundColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.5) {
    const t = clamped / 0.5;
    return lerpColor("#FEE2E2", "#EFF6FF", t);
  } else {
    const t = (clamped - 0.5) / 0.5;
    return lerpColor("#EFF6FF", "#DCFCE7", t);
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
  const [showNoteField, setShowNoteField] = React.useState<boolean>(false);
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
      setShowNoteField(false);
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
  const statusText = getRatingStatus(sliderValue);

  // ─── Corporate Minimalist Face Calculations ───

  // Eyebrows (Two thin lines, strokeWidth 2, color #1F2937)
  let leftY1: number, leftY2: number;
  let rightY1: number, rightY2: number;

  if (activeSliderValue <= 0.5) {
    const t = activeSliderValue / 0.5;
    // Not Good (<0.33): angled down toward center
    // Good (0.5): flat neutral
    leftY1 = 49 + (51 - 49) * t;
    leftY2 = 53 + (51 - 53) * t;
    rightY1 = 53 + (51 - 53) * t;
    rightY2 = 49 + (51 - 49) * t;
  } else {
    const t = (activeSliderValue - 0.5) / 0.5;
    // Good (0.5): flat neutral
    // Excellent (1.0): very slight arch upward
    leftY1 = 51 + (50 - 51) * t;
    leftY2 = 51 + (48 - 51) * t;
    rightY1 = 51 + (48 - 51) * t;
    rightY2 = 51 + (50 - 51) * t;
  }

  // Mouth (Single bezier curve, strokeWidth 2.5, stroke #1F2937, no fill)
  let mouthStartY: number, mouthCtrlY: number, mouthEndY: number;

  if (activeSliderValue <= 0.5) {
    const t = activeSliderValue / 0.5;
    // Not Good: subtle frown -> starts at 102, curves to 96
    // Good: flat straight line at 99
    mouthStartY = 102 + (99 - 102) * t;
    mouthCtrlY = 96 + (99 - 96) * t;
    mouthEndY = 102 + (99 - 102) * t;
  } else {
    const t = (activeSliderValue - 0.5) / 0.5;
    // Good: flat straight line at 99
    // Excellent: clean arc smile -> starts at 97, curves to 107
    mouthStartY = 99 + (97 - 99) * t;
    mouthCtrlY = 99 + (107 - 99) * t;
    mouthEndY = 99 + (97 - 99) * t;
  }

  const mouthD = `M 60 ${mouthStartY.toFixed(2)} Q 80 ${mouthCtrlY.toFixed(2)} 100 ${mouthEndY.toFixed(2)}`;

  const validateForm = (): boolean => {
    const newErrors: { hasInvested?: string; userIdentity?: string; note?: string } = {};

    if (hasInvested === null) {
      newErrors.hasInvested = "অনুগ্রহ করে নির্বাচন করুন";
    }

    if (!userIdentity.trim()) {
      newErrors.userIdentity = "আপনার পেশা বা পরিচয় লিখুন";
    }

    if (showNoteField && !note.trim()) {
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
      const submissionNote = note.trim() || statusText;
      await onSubmit({
        rating: sliderValue,
        note: submissionNote,
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
              className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-xl transition-colors duration-200 border border-[#E5E7EB] text-[#111827]"
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
                  className="p-1.5 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-black/5 transition-colors disabled:opacity-40 cursor-pointer"
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
                <>
                  {/* Reviewer Header Badge */}
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5E7EB] text-xs text-[#374151] mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-[#111827] text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {reviewerDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#111827] truncate text-xs">{reviewerDisplayName}</span>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      ✓ যাচাইকৃত
                    </span>
                  </div>

                  {/* Center: Corporate Minimalist Face (160x160) */}
                  <div className="flex flex-col justify-center items-center py-2">
                    <div
                      className="relative w-[160px] h-[160px] rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center select-none"
                      style={{
                        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <svg
                        viewBox="0 0 160 160"
                        className="w-full h-full"
                        aria-hidden="true"
                      >
                        {/* Breathing Animation Group (scale 1.0 -> 1.015 -> 1.0, 3s) */}
                        <motion.g
                          animate={{ scale: [1.0, 1.015, 1.0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: "80px 80px" }}
                        >
                          {/* Eyebrows: Two thin lines (strokeWidth 2, strokeLinecap round, color #1F2937) */}
                          <motion.line
                            x1={46}
                            y1={leftY1}
                            x2={66}
                            y2={leftY2}
                            stroke="#1F2937"
                            strokeWidth={2}
                            strokeLinecap="round"
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                          />
                          <motion.line
                            x1={94}
                            y1={rightY1}
                            x2={114}
                            y2={rightY2}
                            stroke="#1F2937"
                            strokeWidth={2}
                            strokeLinecap="round"
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                          />

                          {/* Left Eye: 8x8px circle (#1F2937), 2x2px shine dot top-right, blink every 4s */}
                          <motion.g
                            animate={{
                              scaleY: [1, 1, 0.05, 1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              times: [0, 0.96, 0.985, 1],
                              ease: "easeInOut",
                            }}
                            style={{
                              transformOrigin: "56px 64px",
                            }}
                          >
                            <circle cx={56} cy={64} r={4} fill="#1F2937" />
                            <circle cx={57.5} cy={62.5} r={1} fill="#FFFFFF" />
                          </motion.g>

                          {/* Right Eye: 8x8px circle (#1F2937), 2x2px shine dot top-right, blink every 4s */}
                          <motion.g
                            animate={{
                              scaleY: [1, 1, 0.05, 1],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              times: [0, 0.96, 0.985, 1],
                              ease: "easeInOut",
                            }}
                            style={{
                              transformOrigin: "104px 64px",
                            }}
                          >
                            <circle cx={104} cy={64} r={4} fill="#1F2937" />
                            <circle cx={105.5} cy={62.5} r={1} fill="#FFFFFF" />
                          </motion.g>

                          {/* Tear: Single small circle (3x3px, #60A5FA), translateY 0->12px, opacity 1->0, duration 1.2s */}
                          <AnimatePresence>
                            {activeSliderValue < 0.33 && (
                              <motion.circle
                                key="tear-dot"
                                cx={56}
                                cy={70}
                                r={1.5}
                                fill="#60A5FA"
                                initial={{ translateY: 0, opacity: 0 }}
                                animate={{ translateY: [0, 12], opacity: [1, 0] }}
                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  ease: "easeIn",
                                }}
                              />
                            )}
                          </AnimatePresence>

                          {/* Mouth: Single bezier curve, strokeWidth 2.5, stroke #1F2937, no fill */}
                          <motion.path
                            d={mouthD}
                            fill="none"
                            stroke="#1F2937"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                          />
                        </motion.g>
                      </svg>
                    </div>

                    {/* Status Text: 13px, tracking 0.15em, font-weight 500, uppercase, single color #111827 */}
                    <div className="h-6 flex items-center justify-center mt-3">
                      <span className="text-[13px] tracking-[0.15em] font-medium uppercase text-[#111827] select-none">
                        {statusText}
                      </span>
                    </div>
                  </div>

                  {/* Success State */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-3 text-center"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-700 mb-1" />
                        <p className="text-sm font-semibold text-[#111827]">ধন্যবাদ!</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          আপনার মতামত সফলভাবে জমা হয়েছে।
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Rating Slider & Stepper */}
                  {!isSuccess && (
                    <div className="space-y-2 pt-2 pb-2">
                      <div className="relative px-1 flex items-center">
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
                            background: `linear-gradient(to right, #111827 0%, #111827 ${sliderValue * 100}%, #E5E7EB ${sliderValue * 100}%, #E5E7EB 100%)`,
                          }}
                        />
                      </div>

                      {/* 5 Tick Points (5px, color #D1D5DB, active dot #111827) */}
                      <div className="flex justify-between items-center px-2 select-none">
                        {[0.0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                          const isClose = Math.abs(sliderValue - tick) < 0.12;
                          return (
                            <button
                              key={tick}
                              type="button"
                              onClick={() => setSliderValue(tick)}
                              className={`w-[5px] h-[5px] rounded-full transition-colors duration-150 cursor-pointer ${
                                isClose ? "bg-[#111827]" : "bg-[#D1D5DB] hover:bg-gray-400"
                              }`}
                              aria-label={`রেটিং ${tick * 100}%`}
                            />
                          );
                        })}
                      </div>

                      {/* Labels: 11px, #6B7280 */}
                      <div className="flex justify-between items-center text-[11px] text-[#6B7280] px-0.5 pt-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => setSliderValue(0.0)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "Not Good" ? "text-[#111827] font-semibold" : "hover:text-[#111827]"
                          }`}
                        >
                          Not Good
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderValue(0.5)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "Good" ? "text-[#111827] font-semibold" : "hover:text-[#111827]"
                          }`}
                        >
                          Good
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderValue(1.0)}
                          className={`cursor-pointer transition-colors ${
                            statusText === "Excellent" ? "text-[#111827] font-semibold" : "hover:text-[#111827]"
                          }`}
                        >
                          Excellent
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Form Fields ─── */}
                  {!isSuccess && (
                    <div className="space-y-3 pt-2">
                      {/* Field 1: আপনি কি বিনিয়োগ করেছেন? */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#6B7280] mb-1.5">
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
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[6px] text-xs font-medium transition-colors cursor-pointer border ${
                              hasInvested === true
                                ? "bg-[#111827] text-white border-[#111827]"
                                : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50"
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
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[6px] text-xs font-medium transition-colors cursor-pointer border ${
                              hasInvested === false
                                ? "bg-[#111827] text-white border-[#111827]"
                                : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50"
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

                      {/* Field 2: আপনার পরিচয় */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
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
                          className="w-full rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#111827] focus:outline-none transition-colors"
                        />
                        {errors.userIdentity && (
                          <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                            {errors.userIdentity}
                          </p>
                        )}
                      </div>

                      {/* Expandable Note Section */}
                      <AnimatePresence>
                        {showNoteField ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 pt-1 overflow-hidden"
                          >
                            {/* Note / Feedback */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-medium text-[#6B7280]">
                                  মতামত
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowNoteField(false)}
                                  className="text-[11px] text-[#6B7280] hover:text-[#111827] cursor-pointer"
                                >
                                  সংকোচন করুন
                                </button>
                              </div>
                              <textarea
                                value={note}
                                onChange={(e) => {
                                  setNote(e.target.value);
                                  if (errors.note && e.target.value.trim()) {
                                    setErrors((prev) => ({ ...prev, note: undefined }));
                                  }
                                }}
                                placeholder="আপনার মতামত লিখুন..."
                                rows={2}
                                disabled={isSubmitting || isSuccess}
                                className="w-full rounded-[6px] border border-[#E5E7EB] bg-white p-2.5 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#111827] focus:outline-none resize-none transition-colors"
                              />
                              {errors.note && (
                                <p className="text-[11px] text-rose-600 mt-1 pl-0.5">
                                  {errors.note}
                                </p>
                              )}
                            </div>

                            {/* Investment Details (Optional) */}
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <label className="text-[11px] font-medium text-[#6B7280]">
                                  বিনিয়োগের বিবরণ
                                </label>
                                <span className="text-[10px] text-[#9CA3AF]">(ঐচ্ছিক)</span>
                              </div>
                              <textarea
                                value={investmentDetails}
                                onChange={(e) => setInvestmentDetails(e.target.value)}
                                placeholder="বিনিয়োগের পরিমাণ বা রিটার্নের বিবরণ..."
                                rows={2}
                                disabled={isSubmitting || isSuccess}
                                className="w-full rounded-[6px] border border-[#E5E7EB] bg-white p-2.5 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#111827] focus:outline-none resize-none transition-colors"
                              />
                            </div>
                          </motion.div>
                        ) : (
                          /* Ghost Button: "নোট যোগ করুন" */
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setShowNoteField(true)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[6px] border border-[#E5E7EB] bg-transparent text-[#374151] text-xs font-medium hover:bg-black/[0.02] hover:opacity-85 transition-opacity cursor-pointer"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span>নোট যোগ করুন</span>
                            </button>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Submit Button: "জমা দিন" (bg #111827, text white, border-radius 6px, hover opacity 0.85, full width) */}
                  {!isSuccess && (
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isSuccess}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[6px] bg-[#111827] text-white font-medium text-xs hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>পাঠানো হচ্ছে...</span>
                          </>
                        ) : (
                          <span>জমা দিন</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Minimalist Range Slider Styling */}
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
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #111827;
                  cursor: pointer;
                  margin-top: -7.5px;
                  box-shadow: none;
                  border: none;
                  transition: opacity 0.15s ease;
                }
                .corporate-rating-slider::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #111827;
                  cursor: pointer;
                  box-shadow: none;
                  border: none;
                  transition: opacity 0.15s ease;
                }
                .corporate-rating-slider:hover::-webkit-slider-thumb {
                  opacity: 0.85;
                }
                .corporate-rating-slider:hover::-moz-range-thumb {
                  opacity: 0.85;
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
