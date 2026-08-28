import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchBlogPostBySlug, useBlogPostBySlug, useRelatedBlogPosts, sanitizeBlogHtml } from "@/lib/blog";
import { Loader2, ChevronLeft, ArrowRight, Calendar, User, Clock, Share2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { usePrefersReducedMotion, revealVariants, staggerContainer } from "@/lib/animations";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const post = await fetchBlogPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [
          { title: "Not found · বিনিয়োগ বৃদ্ধি" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const post = loaderData.post;
    const title = `${post.title} | বিনিয়োগ বৃদ্ধি`;
    const description = post.meta_description || post.excerpt || `${post.title} সম্পর্কে বিস্তারিত পড়ুন।`;
    const ogImage = post.cover_image_url ?? "/og-image.jpg";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      author: {
        "@type": "Person",
        name: post.author_name || "বিনিয়োগ বৃদ্ধি টিম",
      },
      publisher: {
        "@type": "Organization",
        name: "বিনিয়োগ বৃদ্ধি",
        url: "https://biniyogbriddhi.com",
      },
      datePublished: post.published_at,
      dateModified: post.updated_at,
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: BlogDetailPage,
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

function BlogDetailPage() {
  const prefersReduced = usePrefersReducedMotion();
  const { slug } = Route.useParams();
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug);
  const { data: relatedPosts = [] } = useRelatedBlogPosts(post?.category_id, post?.id);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: post?.title || document.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("লিংক কপি করা হয়েছে!");
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-9 w-9 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">ব্লগ পোস্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Not Found / 404 State (also applies if post is draft or deleted)
  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/70 bg-background/85 backdrop-blur px-5 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4" />
              ব্লগে ফিরে যান
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-5 bg-card/60 border border-border/80 rounded-3xl p-8 sm:p-10 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">পোস্টটি পাওয়া যায়নি</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              আপনি যে পোস্টটি খুঁজছেন তা প্রকাশিত হয়নি অথবা ডিলিট করা হয়েছে।
            </p>
            <div className="pt-2">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
              >
                সব ব্লগ পোস্ট দেখুন
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content_html);
  const formattedDate = formatDateBengali(post.published_at || post.created_at);
  const sanitizedContent = sanitizeBlogHtml(post.content_html);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Sticky Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>ব্লগে ফিরে যান</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full transition-colors active:scale-95"
              title="লিংক শেয়ার করুন"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
            >
              সুযোগসমূহ
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Article Header & Body ───────────────────────────────── */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 sm:py-14">
        <article className="space-y-8 sm:space-y-10">
          
          {/* Metadata & Title */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground font-medium">
              {post.category && (
                <span className="pill bg-primary/10 text-primary font-bold border-none px-3.5 py-1 text-xs">
                  {post.category.name}
                </span>
              )}
              {formattedDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              )}
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} পড়া
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-[2.65rem] font-extrabold text-foreground leading-[1.25] tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-base sm:text-xl leading-relaxed text-muted-foreground font-normal border-l-2 border-primary/40 pl-4 py-1 italic bg-muted/20 rounded-r-lg">
                {post.excerpt}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-3 border-t border-border/60 pt-5">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-inner">
                {post.author_name ? post.author_name.slice(0, 2) : "বব"}
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground">
                  {post.author_name || "বিনিয়োগ বৃদ্ধি টিম"}
                </p>
                <p className="text-xs text-muted-foreground">বিনিয়োগ বৃদ্ধি ইনসাইটস ও রিসার্চ</p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-md bg-muted">
              <img
                src={post.cover_image_url}
                alt={post.title}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sanitized Tiptap Rich Text HTML Content */}
          <div
            className="prose prose-neutral dark:prose-invert prose-base sm:prose-lg max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-[1.85] prose-p:text-muted-foreground prose-p:text-[15px] sm:prose-p:text-[17px]
              prose-a:text-primary prose-a:font-semibold prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-muted-foreground
              prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-border/80 prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

        </article>

        {/* ─── Related Posts Section ──────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-border/60 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                সম্পর্কিত ব্লগ পোস্ট
              </h2>
              <Link to="/blog" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
                সব পোস্ট দেখুন →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.id}
                  to="/blog/$slug"
                  params={{ slug: relPost.slug }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
                    <img
                      src={relPost.cover_image_url || "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop"}
                      alt={relPost.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {relPost.title}
                  </h3>
                  <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatDateBengali(relPost.published_at || relPost.created_at)}</span>
                    <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                      পড়ুন →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Call to Action Card ─────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-[var(--shadow-card)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            স্বচ্ছ ও লাভজনক ব্যবসায় বিনিয়োগে অংশ নিন
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            যাচাইকৃত সম্ভাবনাময় এসএমই প্রকল্পগুলোতে সরাসরি ও নিরাপদে বিনিয়োগ করতে যুক্ত থাকুন।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-elevated)] transition-all hover:scale-105"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ─── Bottom Nav Links ───────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            সব ব্লগ পোস্ট
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            হোমে ফিরে যান
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
