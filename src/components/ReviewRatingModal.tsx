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
 * Interpolates rating background color based on slider value (0.0 to 1.0)
 * - 0.0 -> 0.33: Soft Red (#FFCDD2)
 * - 0.33 -> 0.66: Soft Blue (#BBDEFB)
 * - 0.66 -> 1.0: Soft Green (#C8E6C9)
 */
export function getRatingBackgroundColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.5) {
    const t = clamped / 0.5;
    return lerpColor("#FFCDD2", "#BBDEFB", t);
  } else {
    const t = (clamped - 0.5) / 0.5;
    return lerpColor("#BBDEFB", "#C8E6C9", t);
  }
}

/**
 * Interpolates rating theme border color based on slider value (0.0 to 1.0)
 * - 0.0 -> 0.33: Red (#E53935)
 * - 0.33 -> 0.66: Blue (#1976D2)
 * - 0.66 -> 1.0: Green (#163832)
 */
export function getRatingThemeColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped <= 0.5) {
    const t = clamped / 0.5;
    return lerpColor("#E53935", "#1976D2", t);
  } else {
    const t = (clamped - 0.5) / 0.5;
    return lerpColor("#1976D2", "#163832", t);
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

/**
 * Generates an SVG 4-point sparkle star path centered at (cx, cy)
 */
function getSparklePath(cx: number, cy: number, r: number): string {
  const inner = r * 0.22;
  return `M ${cx} ${cy - r} Q ${cx} ${cy - inner} ${cx + r} ${cy} Q ${cx + inner} ${cy} ${cx} ${cy + r} Q ${cx} ${cy + inner} ${cx - r} ${cy} Q ${cx - inner} ${cy} ${cx} ${cy - r} Z`;
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
  const statusText = getRatingStatus(sliderValue);

  // ─── Face Morphing Calculations (Continuous from 0.0 to 1.0) ───

  // 1. Eyebrows
  let leftY1: number, leftY2: number, leftCtrlY: number;
  let rightY1: number, rightY2: number, rightCtrlY: number;

  if (activeSliderValue <= 0.5) {
    const t = activeSliderValue / 0.5; // 0 (Not Good) -> 1 (Good)
    // Left: 0.0 -> (44, 46) to (64, 54); 0.5 -> (44, 48) to (64, 48)
    leftY1 = 46 + (48 - 46) * t;
    leftY2 = 54 + (48 - 54) * t;
    leftCtrlY = (leftY1 + leftY2) / 2;

    // Right: 0.0 -> (96, 54) to (116, 46); 0.5 -> (96, 48) to (116, 48)
    rightY1 = 54 + (48 - 54) * t;
    rightY2 = 46 + (48 - 46) * t;
    rightCtrlY = (rightY1 + rightY2) / 2;
  } else {
    const t = (activeSliderValue - 0.5) / 0.5; // 0 (Good) -> 1 (Excellent)
    // Left: 0.5 -> (44, 48) to (64, 48); 1.0 -> (44, 40) to (64, 42)
    leftY1 = 48 + (40 - 48) * t;
    leftY2 = 48 + (42 - 48) * t;
    leftCtrlY = (leftY1 + leftY2) / 2 - t * 4;

    // Right: 0.5 -> (96, 48) to (116, 48); 1.0 -> (96, 42) to (116, 40)
    rightY1 = 48 + (42 - 48) * t;
    rightY2 = 48 + (40 - 48) * t;
    rightCtrlY = (rightY1 + rightY2) / 2 - t * 4;
  }

  const leftEyebrowD = `M 44 ${leftY1.toFixed(2)} Q 54 ${leftCtrlY.toFixed(2)} 64 ${leftY2.toFixed(2)}`;
  const rightEyebrowD = `M 96 ${rightY1.toFixed(2)} Q 106 ${rightCtrlY.toFixed(2)} 116 ${rightY2.toFixed(2)}`;

  // 2. Eyes & Shine Dots
  const eyeRy = activeSliderValue <= 0.5 ? 3.2 + (activeSliderValue / 0.5) * 3.0 : 6.2;
  const arcEyeOpacity = Math.max(0, Math.min(1, (activeSliderValue - 0.66) / 0.18));
  const circleEyeOpacity = Math.max(0, 1 - arcEyeOpacity);

  // Shine dot inside top-right of eye (Good: 0.33 to 0.66)
  const shineOpacity =
    activeSliderValue <= 0.33
      ? 0
      : activeSliderValue <= 0.66
      ? Math.min(1, (activeSliderValue - 0.33) / 0.15)
      : Math.max(0, 1 - (activeSliderValue - 0.66) / 0.15);

  // Arc eyes happy squint (Excellent: 0.66 to 1.0)
  const arcSquintDepth = Math.max(0, Math.min(1, (activeSliderValue - 0.66) / 0.34)) * 9;
  const leftHappyEyeD = `M 47 64 Q 55 ${(64 - arcSquintDepth).toFixed(2)} 63 64`;
  const rightHappyEyeD = `M 97 64 Q 105 ${(64 - arcSquintDepth).toFixed(2)} 113 64`;

  // 3. Mouth & Teeth
  let mouthStartX: number, mouthStartY: number;
  let mouthEndX: number, mouthEndY: number;
  let mouthCtrlY: number;

  if (activeSliderValue <= 0.5) {
    const t = activeSliderValue / 0.5;
    mouthStartX = 52 + (54 - 52) * t;
    mouthStartY = 108 + (96 - 108) * t;
    mouthEndX = 108 + (106 - 108) * t;
    mouthEndY = 108 + (96 - 108) * t;
    mouthCtrlY = 82 + (110 - 82) * t;
  } else {
    const t = (activeSliderValue - 0.5) / 0.5;
    mouthStartX = 54 + (50 - 54) * t;
    mouthStartY = 96 + (92 - 96) * t;
    mouthEndX = 106 + (110 - 106) * t;
    mouthEndY = 96 + (92 - 96) * t;
    mouthCtrlY = 110 + (96 - 110) * t;
  }

  const mouthStrokeD = `M ${mouthStartX.toFixed(2)} ${mouthStartY.toFixed(2)} Q 80 ${mouthCtrlY.toFixed(2)} ${mouthEndX.toFixed(2)} ${mouthEndY.toFixed(2)}`;

  // Big open smile cavity for Excellent (>0.66)
  const openSmileT = Math.max(0, Math.min(1, (activeSliderValue - 0.66) / 0.34));
  const mouthBottomCtrlY = 96 + openSmileT * 30; // deepens mouth cavity down to 126
  const openMouthD = `M ${mouthStartX.toFixed(2)} ${mouthStartY.toFixed(2)} Q 80 ${mouthCtrlY.toFixed(2)} ${mouthEndX.toFixed(2)} ${mouthEndY.toFixed(2)} Q 80 ${mouthBottomCtrlY.toFixed(2)} ${mouthStartX.toFixed(2)} ${mouthStartY.toFixed(2)} Z`;

  // 4. Sparkles for Excellent
  const sparkles = [
    { cx: 138, cy: 34, r: 8.5, delay: 0 },
    { cx: 22, cy: 38, r: 7.5, delay: 0.25 },
    { cx: 142, cy: 114, r: 7, delay: 0.5 },
    { cx: 18, cy: 110, r: 6.5, delay: 0.75 },
  ];

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
              <div className="relative flex items-center justify-between pb-2">
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
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/60 backdrop-blur-xs border border-black/5 text-xs text-[#163832] mb-2">
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

                  {/* Center: Dynamic Animated SVG Face (Fixed 160x160 container) */}
                  <div className="flex flex-col justify-center items-center py-1">
                    <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                      <svg
                        viewBox="0 0 160 160"
                        className="w-full h-full drop-shadow-xs select-none overflow-visible"
                        aria-hidden="true"
                      >
                        {/* Sparkles around face (Excellent >= 0.66) */}
                        <AnimatePresence>
                          {activeSliderValue >= 0.66 && (
                            <motion.g
                              key="sparkles-group"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                            >
                              {sparkles.map((sp, idx) => (
                                <motion.path
                                  key={idx}
                                  d={getSparklePath(sp.cx, sp.cy, sp.r)}
                                  fill="#F59E0B"
                                  stroke="#D97706"
                                  strokeWidth="0.75"
                                  initial={{ scale: 0.75, rotate: 0 }}
                                  animate={{
                                    scale: [0.75, 1.25, 0.75],
                                    rotate: [0, 45, 90],
                                    opacity: [0.75, 1, 0.75],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: sp.delay,
                                    ease: "easeInOut",
                                  }}
                                  style={{
                                    transformOrigin: `${sp.cx}px ${sp.cy}px`,
                                  }}
                                />
                              ))}
                            </motion.g>
                          )}
                        </AnimatePresence>

                        {/* Face boundary background */}
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          fill="#FFFFFF"
                          fillOpacity="0.55"
                          stroke="#163832"
                          strokeWidth="3.5"
                        />

                        {/* Eyebrows (Dynamic Angle & Height) */}
                        <motion.path
                          d={leftEyebrowD}
                          stroke="#163832"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.path
                          d={rightEyebrowD}
                          stroke="#163832"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        {/* Normal / Squinted Ellipse Eyes (0.0 to 0.66) */}
                        <motion.ellipse
                          cx={55}
                          cy={62}
                          rx={6.2}
                          ry={eyeRy}
                          fill="#163832"
                          opacity={circleEyeOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.ellipse
                          cx={105}
                          cy={62}
                          rx={6.2}
                          ry={eyeRy}
                          fill="#163832"
                          opacity={circleEyeOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        {/* Eye Shine Dots (Good: 0.33 to 0.66) */}
                        <motion.circle
                          cx={57.2}
                          cy={59.5}
                          r={1.8}
                          fill="#FFFFFF"
                          opacity={shineOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.circle
                          cx={107.2}
                          cy={59.5}
                          r={1.8}
                          fill="#FFFFFF"
                          opacity={shineOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        {/* Happy Squint Arc Eyes (Excellent: 0.66 to 1.0) */}
                        <motion.path
                          d={leftHappyEyeD}
                          stroke="#163832"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          opacity={arcEyeOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                        <motion.path
                          d={rightHappyEyeD}
                          stroke="#163832"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          opacity={arcEyeOpacity}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        {/* Animated Looping Tear Drop on Left Eye (Not Good: 0.0 to 0.33) */}
                        <AnimatePresence>
                          {activeSliderValue <= 0.33 && (
                            <motion.g
                              key="teardrop-anim"
                              initial={{ opacity: 0, y: 0, scale: 0.7 }}
                              animate={{
                                opacity: [0, 1, 1, 0],
                                y: [0, 5, 12, 18],
                                scale: [0.7, 1, 1, 0.75],
                              }}
                              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                              transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <path
                                d="M 55 67 C 52 71 50 74 50 77 C 50 79.8 52.2 82 55 82 C 57.8 82 60 79.8 60 77 C 60 74 58 71 55 67 Z"
                                fill="#60A5FA"
                                stroke="#2563EB"
                                strokeWidth="0.8"
                              />
                              <circle cx="53.5" cy="76" r="1.2" fill="#FFFFFF" opacity="0.8" />
                            </motion.g>
                          )}
                        </AnimatePresence>

                        {/* Closed Mouth Stroke (Smooth morph from Frown to Smile) */}
                        <motion.path
                          d={mouthStrokeD}
                          fill="none"
                          stroke="#163832"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity={activeSliderValue <= 0.66 ? 1 : Math.max(0, 1 - (activeSliderValue - 0.66) / 0.12)}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />

                        {/* Big Open Smile with Teeth (Excellent: 0.66 to 1.0) */}
                        {activeSliderValue > 0.66 && (
                          <g opacity={openSmileT}>
                            <defs>
                              <clipPath id="open-mouth-clip">
                                <path d={openMouthD} />
                              </clipPath>
                            </defs>

                            {/* Open Mouth Cavity */}
                            <motion.path
                              d={openMouthD}
                              fill="#163832"
                              stroke="#163832"
                              strokeWidth="3.5"
                              strokeLinejoin="round"
                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            />

                            {/* Teeth & Tongue inside Mouth Cavity */}
                            <g clipPath="url(#open-mouth-clip)">
                              {/* White Teeth Rectangle */}
                              <rect
                                x="68"
                                y={mouthStartY - 1}
                                width="24"
                                height={7 * openSmileT}
                                rx="2"
                                fill="#FFFFFF"
                              />
                              {/* Tongue */}
                              <path
                                d={`M 70 ${114 + openSmileT * 4} Q 80 ${106 + openSmileT * 4} 90 ${114 + openSmileT * 4} Q 80 ${126 + openSmileT * 4} 70 ${114 + openSmileT * 4} Z`}
                                fill="#F87171"
                                opacity={0.9}
                              />
                            </g>
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Dynamic Status Text Badge with AnimatePresence */}
                    <div className="h-6 flex items-center justify-center mt-1">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={statusText}
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="px-3 py-0.5 rounded-full text-xs font-black tracking-wider uppercase shadow-2xs border select-none"
                          style={{
                            backgroundColor:
                              statusText === "Not Good"
                                ? "rgba(239, 68, 68, 0.18)"
                                : statusText === "Good"
                                ? "rgba(37, 99, 235, 0.16)"
                                : "rgba(22, 101, 52, 0.18)",
                            color:
                              statusText === "Not Good"
                                ? "#B91C1C"
                                : statusText === "Good"
                                ? "#1D4ED8"
                                : "#166534",
                            borderColor:
                              statusText === "Not Good"
                                ? "rgba(239, 68, 68, 0.3)"
                                : statusText === "Good"
                                ? "rgba(37, 99, 235, 0.3)"
                                : "rgba(22, 101, 52, 0.3)",
                          }}
                        >
                          {statusText}
                        </motion.div>
                      </AnimatePresence>
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
                    <div className="space-y-2 pt-1 pb-2">
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

                      {/* Row with "Not Good", "Good", "Excellent" labels */}
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-[#163832]/80 px-1 pt-0.5 select-none">
                        <button
                          type="button"
                          onClick={() => setSliderValue(0.0)}
                          className={`cursor-pointer transition-all duration-150 ${
                            statusText === "Not Good" ? "text-[#B91C1C] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Not Good
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderValue(0.5)}
                          className={`cursor-pointer transition-all duration-150 ${
                            statusText === "Good" ? "text-[#1D4ED8] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Good
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderValue(1.0)}
                          className={`cursor-pointer transition-all duration-150 ${
                            statusText === "Excellent" ? "text-[#166534] font-black scale-105" : "hover:text-[#163832]"
                          }`}
                        >
                          Excellent
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Form Fields (Investment status, Identity, Mandatory Note, Details) ─── */}
                  {!isSuccess && (
                    <div className="space-y-3 pt-1 pb-1">
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
                    <div className="pt-2">
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
