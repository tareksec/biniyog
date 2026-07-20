import { useState } from "react";
import { motion } from "framer-motion";

export function InvestmentCalculator() {
  const [amount, setAmount] = useState(100000);
  const [roi, setRoi] = useState(20); // 20% annual return

  const monthlyReturn = Math.round((amount * (roi / 100)) / 12);
  const yearlyReturn = Math.round(amount * (roi / 100));

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
              আপনার সম্ভাব্য মুনাফা হিসাব করুন
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              বিনিয়োগের পরিমাণ এবং প্রত্যাশিত রিটার্ন নির্বাচন করে আপনার সম্ভাব্য আয় সম্পর্কে ধারণা নিন।
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
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-4 w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>১০ হাজার</span>
                  <span>১০ লাখ+</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="invest-roi" className="text-sm font-semibold text-foreground">
                    প্রত্যাশিত বার্ষিক মুনাফা (%)
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
                  className="mt-4 w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>১০%</span>
                  <span>৩৫%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="flex flex-col justify-center bg-primary p-8 text-primary-foreground sm:p-10 relative overflow-hidden">
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            
            <div className="relative z-10">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/80">
                সম্ভাব্য ফলাফল
              </h4>
              
              <div className="mt-8 space-y-6">
                <div>
                  <div className="text-sm text-white/90">প্রত্যাশিত মাসিক মুনাফা</div>
                  <div className="num mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">৳ {monthlyReturn.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/20" />

                <div>
                  <div className="text-sm text-white/90">প্রত্যাশিত বার্ষিক মুনাফা</div>
                  <div className="num mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-white/90">৳ {yearlyReturn.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <a
                  href="#opportunities"
                  className="block w-full rounded-full bg-white px-6 py-3.5 text-center text-sm font-bold text-primary shadow-lg transition hover:scale-[1.02] hover:bg-white/95 hover:shadow-xl"
                >
                  বিনিয়োগ শুরু করুন
                </a>
                <p className="mt-4 text-center text-[11px] text-white/60">
                  * এটি একটি আনুমানিক হিসাব। প্রকৃত মুনাফা ব্যবসার ফলাফলের উপর নির্ভরশীল।
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
