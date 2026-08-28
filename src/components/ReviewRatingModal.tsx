"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";

export interface ReviewRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, note: string) => Promise<void>;
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
  const [sliderValue, setSliderValue] = React.useState<number>(0.5);
  const [note, setNote] = React.useState<string>("");
  const [isNoteOpen, setIsNoteOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset internal states when opened
  React.useEffect(() => {
    if (isOpen) {
      setSliderValue(0.5);
      setNote("");
      setIsNoteOpen(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    try {
      setIsSubmitting(true);
      await onSubmit(sliderValue, note.trim());
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
              style={{ backgroundColor }}
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl transition-colors duration-150 ease-out border border-white/40 text-[#051F20]"
            >
              {/* Accessibility Description */}
              <DialogPrimitive.Description className="sr-only">
                বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মে আপনার অভিজ্ঞতার রেটিং এবং মতামত জমা দিন।
              </DialogPrimitive.Description>

              {/* Top Row: Close IconButton (top-left) + Title "আপনার অভিজ্ঞতা কেমন ছিল?" (centered) */}
              <div className="relative flex items-center justify-between pb-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  aria-label="বন্ধ করুন"
                  className="p-2 rounded-full text-[#163832]/80 hover:text-[#051F20] hover:bg-black/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832] disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>

                <DialogPrimitive.Title className="text-lg sm:text-xl font-bold font-display text-[#163832] text-center flex-1 pr-9">
                  আপনার অভিজ্ঞতা কেমন ছিল?
                </DialogPrimitive.Title>
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
                      fill="rgba(255, 255, 255, 0.45)"
                      stroke="rgba(22, 56, 50, 0.12)"
                      strokeWidth="2"
                    />

                    {/* Left Eye */}
                    <circle cx="55" cy="55" r="7" fill="#163832" />

                    {/* Right Eye */}
                    <circle cx="105" cy="55" r="7" fill="#163832" />

                    {/* Animated Mouth Path */}
                    <motion.path
                      d={mouthPathD}
                      animate={{ d: mouthPathD }}
                      transition={{ type: "spring", damping: 20, stiffness: 280 }}
                      fill="none"
                      stroke="#163832"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>

                  {isSuccess && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Status Text with AnimatePresence mode="wait" */}
              <div className="h-11 flex items-center justify-center my-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSuccess ? "success" : statusText}
                    initial={{ opacity: 0, scale: 0.85, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -5 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="text-center"
                  >
                    {isSuccess ? (
                      <span className="text-base sm:text-lg font-bold text-emerald-950 font-display">
                        ধন্যবাদ! আপনার মতামত পাঠানো হয়েছে
                      </span>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black tracking-[0.1em] text-[#163832] uppercase font-sans">
                        {statusText}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Custom Slider & Labels */}
              {!isSuccess && (
                <div className="mt-3 mb-4 space-y-2">
                  {/* Range Input with custom appearance */}
                  <div className="relative flex items-center py-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(sliderValue * 100)}
                      onChange={(e) => setSliderValue(Number(e.target.value) / 100)}
                      disabled={isSubmitting || isSuccess}
                      aria-label="রেটিং নির্বাচন করুন"
                      className="review-rating-slider w-full h-3 bg-black/10 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832]/50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* 5 Tick Mark Dots Above Labels */}
                  <div className="flex justify-between items-center px-3">
                    {[0, 0.25, 0.5, 0.75, 1.0].map((step, idx) => {
                      const isActive = sliderValue >= step;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSliderValue(step)}
                          disabled={isSubmitting || isSuccess}
                          className="group p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832] rounded-full transition-transform hover:scale-125 disabled:cursor-not-allowed"
                          aria-label={`রেটিং ${step * 100}%`}
                        >
                          <span
                            className={`block w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              isActive
                                ? "bg-[#163832] scale-110 shadow-xs"
                                : "bg-black/20 group-hover:bg-black/40"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Row with "Bad", "Not Bad", "Good" labels justified space-between */}
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

              {/* Animated Note Textarea */}
              <AnimatePresence initial={false}>
                {isNoteOpen && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="আপনার মতামত লিখুন..."
                      rows={3}
                      disabled={isSubmitting || isSuccess}
                      className="w-full rounded-2xl border border-black/10 bg-white/75 backdrop-blur-xs p-3.5 text-sm text-[#051F20] placeholder:text-[#163832]/45 focus:bg-white focus:border-[#163832] focus:outline-none focus:ring-2 focus:ring-[#163832]/25 resize-none transition-all shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Row: "নোট যোগ করুন" TextButton + pill-shaped "জমা দিন →" submit button */}
              {!isSuccess && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => setIsNoteOpen((prev) => !prev)}
                    disabled={isSubmitting || isSuccess}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      borderColor: themeColor,
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm text-[#051F20] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163832] cursor-pointer shadow-xs ${
                      isNoteOpen
                        ? "bg-white/60 font-bold"
                        : "bg-white/20 hover:bg-white/40 font-semibold"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[19px] leading-none select-none text-[#163832]">
                      note_add
                    </span>
                    <span>{isNoteOpen ? "নোট লুকান" : "নোট যোগ করুন"}</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSuccess}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#163832] text-white font-semibold text-sm shadow-md hover:bg-[#0B2B26] hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <span>জমা দিন &rarr;</span>
                    )}
                  </button>
                </div>
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
                .review-rating-slider::-webkit-slider-thumb:hover {
                  transform: scale(1.15);
                  background: #0B2B26;
                }
                .review-rating-slider::-webkit-slider-thumb:active {
                  transform: scale(1.25);
                }
                .review-rating-slider::-moz-range-thumb {
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  background: #163832;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                  transition: transform 0.15s ease, background-color 0.15s ease;
                }
                .review-rating-slider::-moz-range-thumb:hover {
                  transform: scale(1.15);
                  background: #0B2B26;
                }
                .review-rating-slider::-moz-range-thumb:active {
                  transform: scale(1.25);
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
