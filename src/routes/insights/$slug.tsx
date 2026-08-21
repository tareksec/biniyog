import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useBlogPostBySlug } from "@/lib/blog";
import { Loader2, ChevronLeft, ArrowRight, Calendar, User, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

export const Route = createFileRoute("/insights/$slug")({
  head: () => ({
    meta: [
      { title: "ইনসাইটস ও ব্লগ · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে বিস্তারিত জানুন।" },
    ],
  }),
  component: DynamicBlogPostPage,
});

function toBanglaDigits(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function calculateReadingTime(html: string): string {
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

function DynamicBlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || document.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("লিংক কপি করা হয়েছে!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">পোস্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/70 bg-background/85 backdrop-blur px-5 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Link to="/insights" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
              <ChevronLeft className="h-4 w-4" />
              সব ইনসাইটস
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-4">
            <h1 className="text-2xl font-bold">পোস্টটি পাওয়া যায়নি</h1>
            <p className="text-muted-foreground text-sm">
              আপনি যে পোস্টটি খুঁজছেন তা প্রকাশিত হয়নি অথবা সরিয়ে ফেলা হয়েছে।
            </p>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              ইনসাইটসে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = post.content_html ? calculateReadingTime(post.content_html) : "২ মিনিট";
  const formattedDate = formatDateBengali(post.published_at || post.created_at);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Top Sticky Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            ইনসাইটস
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full transition-colors"
              title="শেয়ার করুন"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>
            <span className="text-sm font-bold text-primary">ব্লগ আর্টিকেল</span>
          </div>
        </div>
      </header>

      {/* ─── Article Main Content ──────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <article className="space-y-10">
          
          {/* Post Header */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground font-medium">
              {post.category && (
                <span className="pill bg-primary/10 text-primary font-semibold border-none px-3 py-1 text-xs">
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

            <h1 className="font-display text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-[1.25] tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground font-normal">
                {post.excerpt}
              </p>
            )}

            {/* Author box */}
            <div className="flex items-center gap-3 border-t border-border/60 pt-5 mt-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {post.author_name ? post.author_name.slice(0, 2) : "বব"}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {post.author_name || "বিনিয়োগ বৃদ্ধি টিম"}
                </p>
                <p className="text-xs text-muted-foreground">বিনিয়োগ বৃদ্ধি ইনসাইটস</p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-sm bg-muted">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Post Rich HTML Content */}
          <div
            className="prose prose-neutral dark:prose-invert prose-base sm:prose-lg max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-[1.85] prose-p:text-muted-foreground
              prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-border"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

        </article>

        {/* ─── Call to Action Card ─────────────────────────────────── */}
        <div className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-[var(--shadow-card)]">
          <h3 className="text-xl sm:text-2xl font-bold">
            স্বচ্ছ ও হালাল ব্যবসায় বিনিয়োগ করুন
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
            যাচাইকৃত সম্ভাবনাময় এসএমই প্রকল্পগুলোতে সরাসরি ও নিরাপদে বিনিয়োগ করতে যুক্ত থাকুন।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/opportunities"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] btn-hover"
              style={{ background: "var(--gradient-primary)" }}
            >
              বিনিয়োগের সুযোগ দেখুন
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* ─── Footer Navigation ──────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            সব আর্টিকেল
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            হোমে ফিরে যান
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
