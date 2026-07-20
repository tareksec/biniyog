import cfaImage from "../hero/cfa.jpg";

const STATS = [
  { value: "১০টি", label: "বেস্টসেলার বই" },
  { value: "CFA", label: "চার্টারহোল্ডার" },
  { value: "৩টি", label: "বিশ্ববিদ্যালয়" },
  { value: "২০+", label: "দেশ ভ্রমণ" },
];

const TAGS = [
  "Managerial Finance",
  "Business Strategy",
  "Valuation",
  "Financial Analysis",
  "Corporate Finance",
  "Financial Reporting",
];

export const CONSULTANCY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeylFDvEddVWDTgO9l6PqBqz0hSk0izOtr0IzRo_eyg-4QIZw/viewform";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/mohaimin-patwary-cfa-a8416aab/";

export function InstructorSection() {
  return (
    <section id="expert" className="border-t border-border bg-background" aria-label="এক্সপার্টের কথা">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="relative">
            <div className="pill">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">এক্সপার্টের কথা</span>
            </div>
            <div className="mt-6 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <div className="h-24 w-24 overflow-hidden rounded-2xl shadow-sm border border-border">
                <img 
                  src={cfaImage} 
                  alt="মোহাইমিন পাটোয়ারী" 
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-6 text-2xl font-bold leading-tight text-foreground">
                মোহাইমিন পাটোয়ারী, CFA
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                লেখক · ফাইন্যান্স বিশেষজ্ঞ · কনসালট্যান্ট — বিশ্ব অর্থব্যবস্থার
                অজানা সত্য উন্মোচন করছেন কলমে ও শ্রেণিকক্ষে।
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="num text-lg font-bold text-primary">
                      {s.value}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-[2.5rem]">
              আর্থিকভাবে ক্ষমতায়িত করার{" "}
              <span className="gradient-text">এক দশকের পথচলা</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[1.9] text-foreground/85">
              আমি একজন লেখক এবং ফাইন্যান্স বিশেষজ্ঞ। বিশ্ব অর্থব্যবস্থার কালো
              জগৎ নিয়ে আমার ১০টি বই প্রকাশিত হয়েছে — সবগুলোই নিজ নিজ ক্যাটাগরিতে
              বেস্টসেলার। আমার পড়াশোনা ঢাকা বিশ্ববিদ্যালয়ের IBA, জার্মানির
              Mannheim বিশ্ববিদ্যালয় এবং নরওয়ের Norwegian School of Economics
              থেকে। আমেরিকার CFA পরীক্ষার সকল ধাপ উত্তীর্ণ হয়েছি। প্রায় দশ
              বছরের ফাইন্যান্স অভিজ্ঞতা এবং ২০টিরও বেশি দেশ ভ্রমণের অভিজ্ঞতা
              নিয়ে এখন কাজ করছি মানুষকে আর্থিকভাবে ক্ষমতায়িত করতে।
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={CONSULTANCY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                📋 কনসালট্যান্সি বুক করুন
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.16c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.26V22H7.72V8z" />
                </svg>
                LinkedIn-এ যুক্ত হোন
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
