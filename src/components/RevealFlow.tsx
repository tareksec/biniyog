import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";

// Public reCAPTCHA v2 site key (safe to ship in the client bundle).
const SITE_KEY = "6LeN2lgtAAAAAGkypoqi19d66hgsIH2YTxDOBpSM";

export type RevealedData = {
  phone_number: string;
  contact_person: string;
  bank_details: string;
};

type Props = {
  projectId: string;
  onRevealed: (data: RevealedData) => void;
};

type Step = "idle" | "captcha" | "confirm" | "loading" | "error";

export function RevealFlow({ projectId, onRevealed }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  async function submitReveal(recaptchaToken: string) {
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/public/reveal-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, recaptchaToken, confirmed: true }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as RevealedData;
      onRevealed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setStep("error");
      captchaRef.current?.reset();
      setToken(null);
    }
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("captcha")}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary hover:text-primary"
      >
        <LockIcon />
        যোগাযোগ ও ব্যাংক তথ্য দেখুন
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="নিরাপত্তা যাচাই"
        onClick={() => step !== "loading" && setStep("idle")}
        onKeyDown={(e) => e.key === "Escape" && step !== "loading" && setStep("idle")}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl bg-background p-6 shadow-[var(--shadow-elevated)]"
          onClick={(e) => e.stopPropagation()}
        >
          {step === "captcha" && (
            <>
              <h3 className="font-display text-xl">নিরাপত্তা যাচাই</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                সংবেদনশীল যোগাযোগ ও ব্যাংক তথ্য দেখতে অনুগ্রহ করে নিচের বক্সটি
                চেক করুন।
              </p>
              <div className="mt-5 flex justify-center">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={SITE_KEY}
                  onChange={(t) => {
                    setToken(t);
                    if (t) setStep("confirm");
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="mt-5 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted"
              >
                বাতিল
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <h3 className="font-display text-xl">আপনি কি নিশ্চিত?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                আপনি এই প্রজেক্টের ফোন নম্বর ও ব্যাংক তথ্য দেখতে চলেছেন। এই
                তথ্য শুধু বিনিয়োগের জন্য যোগাযোগের উদ্দেশ্যে ব্যবহার করুন।
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("idle")}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted"
                >
                  না, বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => token && submitReveal(token)}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  হ্যাঁ, দেখান
                </button>
              </div>
            </>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">যাচাই করা হচ্ছে…</p>
            </div>
          )}

          {step === "error" && (
            <>
              <h3 className="font-display text-xl text-destructive">
                যাচাইকরণ ব্যর্থ
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {error === "recaptcha_failed"
                  ? "reCAPTCHA যাচাই করা যায়নি। আবার চেষ্টা করুন।"
                  : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।"}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("idle")}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setStep("captcha")}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
                >
                  পুনরায় চেষ্টা
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function maskPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "+880 1X**-*** ***";
  const local = digits.startsWith("880") ? digits.slice(3) : digits;
  const prefix = local.length >= 3 ? local.slice(1, 3) : "X";
  return `+880 1${prefix}**-*** ***`;
}
