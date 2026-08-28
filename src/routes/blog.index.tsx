import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePublishedBlogPosts } from "@/lib/blog";
import { format } from "date-fns";
import { Loader2, ArrowRight, BookOpen, Search, Sparkles, Calendar, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "বিনিয়োগ ব্লগ | SME ব্যবসা বিনিয়োগ গাইড | বিনিয়োগ বৃদ্ধি" },
      {
        name: "description",
        content:
          "SME ব্যবসায় বিনিয়োগ, লাভজনক বিনিয়োগ কৌশল ও co-investment সম্পর্কে বিশেষজ্ঞ গাইড পড়ুন।",
      },
      {
        property: "og:title",
        content: "বিনিয়োগ ব্লগ | SME ব্যবসা বিনিয়োগ গাইড | বিনিয়োগ বৃদ্ধি",
      },
      {
        property: "og:description",
        content:
          "SME ব্যবসায় বিনিয়োগ, লাভজনক বিনিয়োগ কৌশল ও co-investment সম্পর্কে বিশেষজ্ঞ গাইড পড়ুন।",
      },
      { property: "og:url", content: "https://biniyogbriddhi.com/blog" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "বিনিয়োগ ব্লগ | SME ব্যবসা বিনিয়োগ গাইড | বিনিয়োগ বৃদ্ধি",
      },
      {
        name: "twitter:description",
        content:
          "SME ব্যবসায় বিনিয়োগ, লাভজনক বিনিয়োগ কৌশল ও co-investment সম্পর্কে বিশেষজ্ঞ গাইড পড়ুন।",
      },
    ],
  }),
  component: BlogListingPage,
});

function toBanglaDigits(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function calculateReadingTime(html?: string): string {
  if (!html) return "২ মিনিট";
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${toBanglaDigits(minutes)} মিনিট`;
}

function formatDateBengali(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    const day = toBanglaDigits(format(d, "d"));
    const year = toBanglaDigits(format(d, "yyyy"));
    const monthsBn = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ];
    const month = monthsBn[d.getMonth()];
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

function BlogListingPage() {
  const prefersReduced = usePrefersReducedMotion();
  const { data: posts = [], isLoading } = usePublishedBlogPosts();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories with count of published posts
  const categoriesWithPosts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; count: number }>();
    
    posts.forEach((post) => {
      if (post.category) {
        const existing = map.get(post.category.id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(post.category.id, {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug,
            count: 1,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [posts]);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategoryId === "all" || post.category_id === selectedCategoryId;
      
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.category?.name && post.category.name.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Top Sticky Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-lg sm:text-xl font-black text-primary">
              <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-8 sm:h-9 w-auto rounded-lg" />
              <span>বিনিয়োগ বৃদ্ধি</span>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-border/60" />
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
              <Link to="/opportunities" className="hover:text-primary transition-colors">সুযোগসমূহ</Link>
              <span className="text-foreground font-semibold">ব্লগ</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 text-xs sm:text-sm font-semibold transition-all"
            >
              বিনিয়োগের সুযোগ
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-muted/30 via-background to-background py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>জ্ঞানের অংশীদারিত্ব ও ব্লগ</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
            SME ব্যবসায় বিনিয়োগ ও ফাইন্যান্স ব্লগ
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            ব্যবসা পরিচালনা, লাভজনক আর্থিক মডেল, বাজার বিশ্লেষণ এবং সফল উদ্যোক্তাদের অভিজ্ঞতা নিয়ে নিয়মিত তথ্য ও গাইডলাইন।
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পোস্ট বা বিষয় অনুসন্ধান করুন..."
                className="w-full h-11 pl-10 pr-4 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-xs text-muted-foreground hover:text-foreground bg-muted px-1.5 py-0.5 rounded-full"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Pills */}
        {categoriesWithPosts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-10 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              সকল পোস্ট ({toBanglaDigits(posts.length)})
            </button>
            {categoriesWithPosts.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.name} ({toBanglaDigits(cat.count)})
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-border/60 bg-card p-4 space-y-4 animate-pulse">
                <div className="aspect-video w-full rounded-xl bg-muted/70" />
                <div className="space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/70" />
                  <div className="h-6 w-5/6 rounded bg-muted/70" />
                  <div className="h-4 w-full rounded bg-muted/50" />
                  <div className="h-4 w-4/5 rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-card/40 rounded-3xl border border-dashed border-border max-w-lg mx-auto p-8 space-y-4 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">কোনো পোস্ট পাওয়া যায়নি</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {searchQuery
                ? `"${searchQuery}" এর সাথে সম্পর্কিত কোনো পোস্ট খুঁজে পাওয়া যায়নি।`
                : "এই মুহূর্তে কোনো ব্লগ পোস্ট প্রকাশিত নেই। খুব শীঘ্রই নতুন কন্টেন্ট যুক্ত করা হবে।"}
            </p>
            {(searchQuery || selectedCategoryId !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("all");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                সব পোস্ট দেখুন
              </button>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && filteredPosts.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial={prefersReduced ? "show" : "hidden"}
            animate="show"
            className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => {
              const formattedDate = formatDateBengali(post.published_at || post.created_at);
              const readTime = calculateReadingTime(post.content_html);

              return (
                <motion.article
                  key={post.id}
                  variants={revealVariants}
                  className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-[1.25rem] border border-border/80 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elevated)] hover:border-primary/40"
                >
                  {/* Cover image container */}
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="relative aspect-video overflow-hidden bg-muted block">
                    <img
                      src={post.cover_image_url || "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop"}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {post.category && (
                      <div className="absolute top-3.5 left-3.5">
                        <span className="pill bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md text-primary font-bold shadow-sm border-none text-xs px-3 py-1">
                          {post.category.name}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium mb-3">
                      {formattedDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      )}
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2.5">
                      <Link to="/blog/$slug" params={{ slug: post.slug }} className="focus:outline-none">
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-border/50">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {post.author_name ? post.author_name.slice(0, 2) : "বব"}
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                          {post.author_name || "বিনিয়োগ বৃদ্ধি"}
                        </span>
                      </div>

                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        পড়ুন
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* ─── Bottom CTA Strip ────────────────────────────────────── */}
      <section className="border-t border-border/60 bg-muted/20 py-12 sm:py-16 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            আপনার পছন্দের ব্যবসায় সরাসরি বিনিয়োগ করুন
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            স্বচ্ছ চুক্তি ও আইনি সুরক্ষার মাধ্যমে বিশ্বস্ত উদ্যোক্তাদের সাথে অংশীদার হতে আজই আমাদের চলমান সুযোগগুলো দেখুন।
          </p>
          <div className="pt-2">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-elevated)] transition-all hover:scale-105"
              style={{ background: "var(--gradient-primary)" }}
            >
              চলমান সুযোগগুলো এক্সপ্লোর করুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
