"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Loader2, CheckCircle2, ArrowRight, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

export type RatingState = "bad" | "neutral" | "good";

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

const STATE_CONFIG: Record<
  RatingState,
  {
    rating: number;
    bg: string;
    actionBg: string;
    sliderPct: number;
    mouthD: string;
    isCapsuleEye: boolean;
  }
> = {
  bad: {
    rating: 0.0,
    bg: "#FE643F",
    actionBg: "rgba(255, 255, 255, 0.22)",
    sliderPct: 0,
    mouthD: "M 8 28 Q 28 8 48 28",
    isCapsuleEye: false,
  },
  neutral: {
    rating: 0.5,
    bg: "#CEB166",
    actionBg: "rgba(255, 255, 255, 0.22)",
    sliderPct: 50,
    mouthD: "M 8 16 Q 28 22 48 16",
    isCapsuleEye: true,
  },
  good: {
    rating: 1.0,
    bg: "#A1CB34",
    actionBg: "rgba(255, 255, 255, 0.25)",
    sliderPct: 100,
    mouthD: "M 8 10 Q 28 34 48 10",
    isCapsuleEye: false,
  },
};

export function ReviewRatingModal({
  isOpen,
  onClose,
  onSubmit,
  targetType,
  targetId,
}: ReviewRatingModalProps) {
  const { user, profile, loading: authLoading } = useAuth();

  const [ratingState, setRatingState] = React.useState<RatingState>("good");
  const [note, setNote] = React.useState<string>("");
  const [hasInvested, setHasInvested] = React.useState<boolean>(true);
  const [userIdentity, setUserIdentity] = React.useState<string>("");
  const [showNoteDrawer, setShowNoteDrawer] = React.useState<boolean>(false);
  const [showInfoOverlay, setShowInfoOverlay] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const sliderTrackRef = React.useRef<HTMLDivElement | null>(null);
  const isDraggingRef = React.useRef<boolean>(false);
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset states on open
  React.useEffect(() => {
    if (isOpen) {
      setRatingState("good");
      setNote("");
      setHasInvested(true);
      setUserIdentity(profile?.occupation || "বিনিয়োগকারী");
      setShowNoteDrawer(false);
      setShowInfoOverlay(false);
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(null);
    } else {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    }
  }, [isOpen, profile]);

  React.useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const currentConfig = STATE_CONFIG[ratingState];

  // Drag / Click slider logic
  const handleSliderPosition = React.useCallback((clientX: number) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = relativeX / rect.width;

    if (ratio < 0.28) {
      setRatingState("bad");
    } else if (ratio > 0.72) {
      setRatingState("good");
    } else {
      setRatingState("neutral");
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    handleSliderPosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    handleSliderPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleRatingSubmit = async () => {
    if (isSubmitting || isSuccess) return;

    if (!user) {
      setShowInfoOverlay(true);
      return;
    }

    const defaultNotes: Record<RatingState, string> = {
      good: "খুব ভালো অভিজ্ঞতা, প্ল্যাটফর্মের স্বচ্ছতা ও সেবা প্রশংসনীয়।",
      neutral: "মোটামুটি অভিজ্ঞতা, কিছু ক্ষেত্রে আরও উন্নয়নের সুযোগ রয়েছে।",
      bad: "অভিজ্ঞতা আশানুরূপ ছিল না, সেবা ও প্রক্রিয়ায় উন্নতি প্রয়োজন।",
    };

    const finalNote = note.trim() || defaultNotes[ratingState];
    const finalIdentity =
      userIdentity.trim() || profile?.occupation || "সম্মানিত বিনিয়োগকারী";

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await onSubmit({
        rating: currentConfig.rating,
        note: finalNote,
        has_invested: hasInvested,
        user_identity: finalIdentity,
      });

      setIsSuccess(true);
      setShowNoteDrawer(false);

      autoCloseTimerRef.current = setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1800);
    } catch (err: any) {
      console.error("Review submission error:", err);
      setErrorMessage(err?.message || "মতামত জমা দিতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DialogPrimitive.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          />
        </DialogPrimitive.Overlay>

        {/* Dialog Content */}
        <DialogPrimitive.Content asChild>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                backgroundColor: currentConfig.bg,
              }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{
                backgroundColor: { duration: 0.32, ease: "easeInOut" },
                scale: { duration: 0.22, ease: "easeOut" },
                opacity: { duration: 0.2 },
              }}
              className="pointer-events-auto relative w-full max-w-[325px] sm:max-w-[340px] h-[580px] sm:h-[600px] rounded-[36px] overflow-hidden select-none shadow-2xl flex flex-col justify-between"
            >
              {/* Accessibility Description */}
              <DialogPrimitive.Description className="sr-only">
                How was your shopping experience rating interface with Bad, Not Bad, and Good states.
              </DialogPrimitive.Description>

              {/* ────────────────── TOP ZONE: Header Controls (5–16%) & Heading (18–27%) ────────────────── */}
              <div className="pt-6 px-6 relative z-10">
                {/* Header buttons: Close (left), Info (right) */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Close review modal"
                    className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/18 active:scale-95 transition-all flex items-center justify-center text-black cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.4]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInfoOverlay((prev) => !prev)}
                    aria-label="Info about reviews"
                    className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/18 active:scale-95 transition-all flex items-center justify-center text-black cursor-pointer"
                  >
                    <Info className="w-4 h-4 stroke-[2.4]" />
                  </button>
                </div>

                {/* Heading: Two lines, center aligned, compact line-height, medium/semibold weight */}
                <div className="text-center">
                  <DialogPrimitive.Title className="text-[19px] sm:text-[20px] font-semibold text-black leading-[1.22] tracking-tight font-sans">
                    How was your shopping
                    <br />
                    experience
                  </DialogPrimitive.Title>
                </div>
              </div>

              {/* ────────────────── CENTER ZONE: Face Expression (34–52%) & State Label (60–72%) ────────────────── */}
              <div className="relative flex-1 flex flex-col items-center justify-center my-auto -mt-2">
                {/* Face: Eyes + Mouth */}
                <div className="flex flex-col items-center justify-center">
                  {/* Eyes */}
                  <div className="flex items-center justify-center gap-11 mb-4 h-4">
                    {/* Left Eye */}
                    <motion.div
                      animate={{
                        width: currentConfig.isCapsuleEye ? 28 : 13,
                        height: currentConfig.isCapsuleEye ? 9 : 13,
                        borderRadius: 9999,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="bg-black shrink-0"
                    />
                    {/* Right Eye */}
                    <motion.div
                      animate={{
                        width: currentConfig.isCapsuleEye ? 28 : 13,
                        height: currentConfig.isCapsuleEye ? 9 : 13,
                        borderRadius: 9999,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="bg-black shrink-0"
                    />
                  </div>

                  {/* Mouth: SVG Smooth stroke */}
                  <div className="h-10 flex items-center justify-center">
                    <svg
                      width="56"
                      height="38"
                      viewBox="0 0 56 38"
                      className="overflow-visible"
                      aria-hidden="true"
                    >
                      <motion.path
                        animate={{ d: currentConfig.mouthD }}
                        transition={{ type: "spring", stiffness: 350, damping: 26 }}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* State Label Watermark Track (60–72%) */}
                {/* Fixed height, overflow-hidden: BAD centered in bad state, GOOD centered in good state, BAD clipped left & GOOD clipped right in neutral state */}
                <div className="relative w-full h-[62px] overflow-hidden flex items-center justify-center mt-3 pointer-events-none">
                  {/* "BAD" Label */}
                  <motion.span
                    animate={{
                      x: ratingState === "bad" ? 0 : ratingState === "neutral" ? -110 : -250,
                      opacity: ratingState === "good" ? 0 : 0.16,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute text-[52px] sm:text-[56px] font-black uppercase text-black tracking-tight leading-none whitespace-nowrap"
                  >
                    BAD
                  </motion.span>

                  {/* "GOOD" Label */}
                  <motion.span
                    animate={{
                      x: ratingState === "good" ? 0 : ratingState === "neutral" ? 110 : 250,
                      opacity: ratingState === "bad" ? 0 : 0.16,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute text-[52px] sm:text-[56px] font-black uppercase text-black tracking-tight leading-none whitespace-nowrap"
                  >
                    GOOD
                  </motion.span>
                </div>
              </div>

              {/* ────────────────── BOTTOM ZONE: Rating Slider (75–88%) & Action Area (91–98%) ────────────────── */}
              <div className="pb-6 px-6 relative z-10">
                {/* Rating Slider */}
                <div className="w-[88%] mx-auto mb-6">
                  {/* Slider Line & Thumb Track */}
                  <div
                    ref={sliderTrackRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="relative h-7 flex items-center cursor-pointer touch-none"
                  >
                    {/* Thin Horizontal Black Line */}
                    <div className="w-full h-[2px] bg-black rounded-full" />

                    {/* 3 Fixed Small Black Circular Markers */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setRatingState("bad");
                      }}
                      className="absolute left-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black cursor-pointer"
                    />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setRatingState("neutral");
                      }}
                      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black cursor-pointer"
                    />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setRatingState("good");
                      }}
                      className="absolute right-0 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black cursor-pointer"
                    />

                    {/* Active Marker Thumb with visible white indicator detail */}
                    <motion.div
                      animate={{
                        left: `${currentConfig.sliderPct}%`,
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute -translate-x-1/2 w-[22px] h-[22px] rounded-full bg-black shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                    >
                      {/* White indicator dot inside active thumb */}
                      <div className="w-[6px] h-[6px] rounded-full bg-white" />
                    </motion.div>
                  </div>

                  {/* Slider Labels directly beneath corresponding markers */}
                  <div className="relative flex justify-between items-center text-[12px] font-medium text-black pt-1">
                    <button
                      type="button"
                      onClick={() => setRatingState("bad")}
                      className={`cursor-pointer transition-opacity ${
                        ratingState === "bad" ? "font-bold opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      Bad
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingState("neutral")}
                      className={`cursor-pointer transition-opacity ${
                        ratingState === "neutral" ? "font-bold opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      Not Bad
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingState("good")}
                      className={`cursor-pointer transition-opacity ${
                        ratingState === "good" ? "font-bold opacity-100" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      Good
                    </button>
                  </div>
                </div>

                {/* Bottom Action Area (Visible in GOOD state, translated below crop in BAD & NEUTRAL) */}
                <div className="h-[54px] relative overflow-hidden flex items-center justify-center">
                  <motion.div
                    animate={{
                      y: ratingState === "good" ? 0 : 80,
                      opacity: ratingState === "good" ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    style={{ backgroundColor: currentConfig.actionBg }}
                    className="w-full h-full rounded-full flex items-center justify-between pl-5 pr-1.5 shadow-xs"
                  >
                    {/* Left text: Add Note */}
                    <button
                      type="button"
                      onClick={() => setShowNoteDrawer(true)}
                      className="text-black font-semibold text-[13px] hover:opacity-75 transition-opacity cursor-pointer text-left"
                    >
                      {note.trim() ? "Edit Note" : "Add Note"}
                    </button>

                    {/* Right rounded light button: Submit  → */}
                    <button
                      type="button"
                      onClick={handleRatingSubmit}
                      disabled={isSubmitting || isSuccess}
                      className="bg-white hover:bg-white/90 active:scale-95 text-black font-bold text-[13px] px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* ────────────────── SUCCESS STATE OVERLAY ────────────────── */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white"
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#A1CB34] mb-3" />
                    <h3 className="text-xl font-bold mb-1">ধন্যবাদ!</h3>
                    <p className="text-sm text-white/80 max-w-xs">
                      আপনার মূল্যবান মতামত সফলভাবে জমা হয়েছে।
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ────────────────── NOTE DRAWER OVERLAY (Opened via "Add Note") ────────────────── */}
              <AnimatePresence>
                {showNoteDrawer && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    className="absolute inset-0 z-40 bg-white text-[#111827] flex flex-col justify-between p-6 rounded-[36px]"
                  >
                    <div>
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">
                          মতামত ও বিস্তারিত
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowNoteDrawer(false)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Drawer Form Fields */}
                      <div className="space-y-3 pt-3">
                        {/* Has Invested Toggle */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            আপনি কি বিনিয়োগ করেছেন?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setHasInvested(true)}
                              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                hasInvested
                                  ? "bg-black text-white border-black"
                                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              হ্যাঁ
                            </button>
                            <button
                              type="button"
                              onClick={() => setHasInvested(false)}
                              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                !hasInvested
                                  ? "bg-black text-white border-black"
                                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              না
                            </button>
                          </div>
                        </div>

                        {/* Identity Field */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            আপনার পেশা / পরিচয়
                          </label>
                          <input
                            type="text"
                            value={userIdentity}
                            onChange={(e) => setUserIdentity(e.target.value)}
                            placeholder="যেমন: ব্যবসায়ী, ব্যাংকার"
                            className="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:bg-white focus:border-black focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Note Textarea */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            আপনার মন্তব্য
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="প্ল্যাটফর্মে আপনার অভিজ্ঞতা ও পরামর্শ লিখুন..."
                            rows={3}
                            className="w-full text-xs rounded-lg border border-gray-200 p-2.5 bg-gray-50 focus:bg-white focus:border-black focus:outline-none resize-none transition-colors"
                          />
                        </div>

                        {errorMessage && (
                          <p className="text-[11px] text-rose-600">
                            {errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="pt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNoteDrawer(false)}
                        className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        সংরক্ষণ করুন
                      </button>
                      <button
                        type="button"
                        onClick={handleRatingSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>জমা দিন</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ────────────────── INFO / AUTH OVERLAY (Opened via info ⓘ) ────────────────── */}
              <AnimatePresence>
                {showInfoOverlay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md text-[#111827] flex flex-col justify-between p-6 rounded-[36px]"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-[#A1CB34]" />
                          রিভিউ ও রেটিং নির্দেশিকা
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowInfoOverlay(false)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="py-4 space-y-3 text-xs text-gray-600 leading-relaxed">
                        <p>
                          বিনিয়োগ প্ল্যাটফর্মের স্বচ্ছতা এবং গুণমান বৃদ্ধির লক্ষ্যে আপনার অভিজ্ঞতা রেটিং সরাসরি পর্যবেক্ষণ করা হয়।
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700">
                          <li>স্লাইডারটি বামে টেনে <strong>Bad</strong> নির্বাচন করুন</li>
                          <li>মাঝখানে রেখে <strong>Not Bad</strong> নির্বাচন করুন</li>
                          <li>ডানে টেনে <strong>Good</strong> নির্বাচন করুন</li>
                        </ul>

                        {!user && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-900">
                            <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                              <Lock className="w-3.5 h-3.5" />
                              লগইন প্রয়োজন
                            </div>
                            <p className="text-[11px] text-amber-800">
                              রিভিউ জমা দিতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {!user ? (
                        <div className="space-y-2">
                          <Link
                            to="/login"
                            onClick={onClose}
                            className="w-full py-2.5 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>লগইন করুন</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setShowInfoOverlay(false)}
                            className="w-full py-2 text-center text-xs text-gray-500 font-medium hover:text-gray-800"
                          >
                            পরে করব
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowInfoOverlay(false)}
                          className="w-full py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          বুঝেছি
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default ReviewRatingModal;
