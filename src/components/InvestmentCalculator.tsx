import { useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

export function InvestmentCalculator() {
  const [amount, setAmount] = useState(100000);
  const [roi, setRoi] = useState(20); // 20% annual return
  const [durationUnit, setDurationUnit] = useState<"year" | "month">("year");
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(12);

  const annual_rate = roi / 100;
  
  let yearlyReturn = 0;
  let monthlyReturn = 0;
  let totalReturn = 0;

  if (durationUnit === "year") {
    yearlyReturn = Math.round(amount * annual_rate);
    monthlyReturn = Math.round(yearlyReturn / 12);
    const totalValue = amount * Math.pow(1 + annual_rate, years);
    totalReturn = Math.round(totalValue - amount);
  } else {
    const monthlyRate = annual_rate / 12;
    const effectiveAnnualProfit = amount * (Math.pow(1 + monthlyRate, 12) - 1);
    yearlyReturn = Math.round(effectiveAnnualProfit);
    monthlyReturn = Math.round(yearlyReturn / 12);
    const totalValue = amount * Math.pow(1 + monthlyRate, months);
    totalReturn = Math.round(totalValue - amount);
  }
  
  // Calculate percentages for slider tracks
  const amountPercent = ((amount - 100000) / (1000000 - 100000)) * 100;
  const roiPercent = ((roi - 10) / (35 - 10)) * 100;
  const yearsPercent = ((years - 1) / (40 - 1)) * 100;
  const monthsPercent = ((months - 1) / (480 - 1)) * 100;

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      >
        <div className="grid md:grid-cols-2">
          {/* Input Section */}
          <div className="bg-surface p-8 sm:p-10">
            <h3 className="font-display text-2xl font-bold text-foreground">
              আপনার সম্ভাব্য লাভ হিসাব করুন
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              বিনিয়োগের পরিমাণ, প্রত্যাশিত রিটার্ন এবং মেয়াদ নির্বাচন করে আপনার সম্ভাব্য আয় সম্পর্কে ধারণা নিন।
            </p>

            <div className="mt-8 space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="invest-amount" className="text-sm font-semibold text-foreground">
                    বিনিয়োগের পরিমাণ (৳)
                  </label>
                  <span className="num rounded-lg bg-background px-3 py-1 font-bold text-primary shadow-sm border border-border">
                    {amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  id="invest-amount"
                  type="range"
                  min="100000"
                  max="1000000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="custom-slider mt-4 w-full"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${amountPercent}%, #e5e7eb ${amountPercent}%)`
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>১ লক্ষ</span>
                  <span>১০ লাখ+</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="invest-roi" className="text-sm font-semibold text-foreground">
                    প্রত্যাশিত বার্ষিক লাভ (%)
                  </label>
                  <span className="num rounded-lg bg-background px-3 py-1 font-bold text-primary shadow-sm border border-border">
                    {roi}%
                  </span>
                </div>
                <input
                  id="invest-roi"
                  type="range"
                  min="10"
                  max="35"
                  step="1"
                  value={roi}
                  onChange={(e) => setRoi(Number(e.target.value))}
                  className="custom-slider mt-4 w-full"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${roiPercent}%, #e5e7eb ${roiPercent}%)`
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>১০%</span>
                  <span>৩৫%</span>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <label htmlFor="invest-duration" className="text-sm font-semibold text-foreground">
                      বিনিয়োগের মেয়াদ
                    </label>
                    <div className="inline-flex rounded-md border border-border bg-card p-0.5 shadow-sm">
                      <button
                        onClick={() => setDurationUnit("year")}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                          durationUnit === "year"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        বছর
                      </button>
                      <button
                        onClick={() => setDurationUnit("month")}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                          durationUnit === "month"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        মাস
                      </button>
                    </div>
                  </div>
                  <span className="num rounded-lg bg-background px-3 py-1 font-bold text-primary shadow-sm border border-border">
                    {durationUnit === "year" ? `${years} বছর` : `${months} মাস`}
                  </span>
                </div>
                {durationUnit === "year" ? (
                  <>
                    <input
                      id="invest-duration"
                      type="range"
                      min="1"
                      max="40"
                      step="1"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="custom-slider mt-4 w-full"
                      style={{
                        background: `linear-gradient(to right, var(--primary) ${yearsPercent}%, #e5e7eb ${yearsPercent}%)`
                      }}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>১ বছর</span>
                      <span>৪০ বছর</span>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      id="invest-duration"
                      type="range"
                      min="1"
                      max="480"
                      step="1"
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                      className="custom-slider mt-4 w-full"
                      style={{
                        background: `linear-gradient(to right, var(--primary) ${monthsPercent}%, #e5e7eb ${monthsPercent}%)`
                      }}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>১ মাস</span>
                      <span>৪৮০ মাস</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#051F20] to-[#235347] p-8 text-primary-foreground sm:p-10 relative overflow-hidden">
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay" />
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay" />
            
            <div className="relative z-10">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/80">
                সম্ভাব্য ফলাফল
              </h4>
              
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm font-medium uppercase tracking-wide text-white/90">প্রত্যাশিত বার্ষিক লাভ</div>
                      <div className="num mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">৳<CountUp to={yearlyReturn} duration={0.8} /></span>
                      </div>
                    </div>
                    {/* Mini Sparkline Chart */}
                    <svg className="h-10 w-20 text-white/40 mb-1 shrink-0" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 35 Q 20 30, 40 20 T 80 5 L 100 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M90 0 L 100 0 L 100 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="h-px w-full bg-white/20" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/80">প্রত্যাশিত মাসিক লাভ</div>
                    <div className="num mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight text-white/90">৳<CountUp to={monthlyReturn} duration={0.8} /></span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
                    <div className="text-sm font-medium text-white">সকল লাভ পুনরায় বিনিয়োগ করলে প্রত্যাশিত মোট লাভ ({durationUnit === "year" ? `${years} বছরে` : `${months} মাসে`})</div>
                    <div className="num mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">৳<CountUp to={totalReturn} duration={0.8} /></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <a
                  href="#opportunities"
                  className="block w-full rounded-full bg-white px-6 py-3.5 text-center text-sm font-bold text-primary shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/95 hover:shadow-xl hover:shadow-black/20"
                >
                  বিনিয়োগ শুরু করুন
                </a>
                <p className="mt-4 text-center text-xs font-medium text-white/80 leading-relaxed">
                  * এটি একটি আনুমানিক হিসাব। {durationUnit === "year" ? "একাধিক বছরের সম্ভাব্য লাভ চক্রবৃদ্ধি হারে (প্রতি বছর পুনঃবিনিয়োগ ধরে) হিসাব করা হয়েছে" : "একাধিক মাসের সম্ভাব্য লাভ চক্রবৃদ্ধি হারে (প্রতি মাসে পুনঃবিনিয়োগ ধরে) হিসাব করা হয়েছে"}; প্রকৃত লাভ ব্যবসার বাস্তব ফলাফলের উপর নির্ভরশীল এবং এটি কোনো নিশ্চিত গ্যারান্টি নয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

