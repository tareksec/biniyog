import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { usePublishedBlogPosts, useBlogCategories } from "@/lib/blog";
import { format } from "date-fns";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "ইনসাইটস ও ব্লগ · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত।" },
      { property: "og:title", content: "ইনসাইটস ও ব্লগ · বিনিয়োগ বৃদ্ধি" },
      { property: "og:description", content: "হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত।" },
      { property: "og:url", content: "https://biniyogbriddhi.com/insights" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:secure_url", content: "https://biniyogbriddhi.com/new-og-image.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ইনসাইটস ও ব্লগ · বিনিয়োগ বৃদ্ধি" },
      { name: "twitter:description", content: "হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত।" },
      { name: "twitter:image", content: "https://biniyogbriddhi.com/new-og-image.png" },
    ],
  }),
  component: InsightsPage,
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

const STATIC_ARTICLES = [
  {
    id: "static-1",
    title: "কেন 'বিনিয়োগ বৃদ্ধি'-তে বিনিয়োগ করবেন: একটি সম্পূর্ণ গাইড",
    slug: "keno-somriddhite-biniyog",
    excerpt: "ব্যবসায়ীর সাথে সরাসরি সংযোগ, সুদমুক্ত আয়, আইনি সুরক্ষা, স্বচ্ছ চুক্তি — জেনে নিন কেন বিনিয়োগ বৃদ্ধি বাংলাদেশের সবচেয়ে বিশ্বস্ত হালাল বিনিয়োগ প্ল্যাটফর্ম।",
    date: "৩১ জুলাই ২০২৬",
    readTime: "৮ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "বিনিয়োগ গাইড",
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop",
    to: "/insights/keno-somriddhite-biniyog",
  },
  {
    id: "static-2",
    title: "এসএমই ব্যবসায় হালাল বিনিয়োগের গুরুত্ব এবং পদ্ধতি",
    slug: "sme-halal-biniyog",
    excerpt: "হালাল বিনিয়োগ শুধু একটি ধর্মীয় দায়িত্ব নয়, বরং এটি একটি টেকসই অর্থনৈতিক ব্যবস্থা গড়ে তুলতে সাহায্য করে। বিস্তারিত জানুন কীভাবে এসএমই খাতে শরীয়াহ সম্মত বিনিয়োগ করা যায়।",
    date: "২০ জুলাই ২০২৬",
    readTime: "৫ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "শরীয়াহ ফাইন্যান্স",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
    to: "/insights/sme-halal-biniyog",
  },
  {
    id: "static-3",
    title: "বাংলাদেশের কৃষি খাতে বিনিয়োগের সম্ভাবনা ও ঝুঁকি",
    slug: "krishi-khate-biniyog",
    excerpt: "কৃষি খাত আমাদের অর্থনীতির মূল চালিকাশক্তি। কিন্তু এই খাতে বিনিয়োগের ক্ষেত্রে কী কী সম্ভাবনা ও ঝুঁকি রয়েছে? জানুন এক্সপার্ট অ্যানালাইসিস।",
    date: "১৫ জুলাই ২০২৬",
    readTime: "৪ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "মার্কেট অ্যানালাইসিস",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop",
    to: "/insights/krishi-khate-biniyog",
  },
  {
    id: "static-4",
    title: "ইনফ্লেশনের সময়ে নিজের পোর্টফোলিও কীভাবে সাজাবেন?",
    slug: "inflation-portfolio",
    excerpt: "মুদ্রাস্ফীতির কারণে টাকার মান কমে যাচ্ছে। এই সময়ে শুধুমাত্র সঞ্চয় না করে কীভাবে একটি স্মার্ট ইনভেস্টমেন্ট পোর্টফোলিও তৈরি করবেন তা নিয়ে কিছু কার্যকরী টিপস।",
    date: "০৫ জুলাই ২০২৬",
    readTime: "৬ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "বিনিয়োগ গাইড",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    to: "/insights/inflation-portfolio",
  }
];

function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: dbPosts = [], isLoading: postsLoading } = usePublishedBlogPosts();
  const { data: categories = [] } = useBlogCategories();

  // Combine database posts and static articles (preventing duplicate slugs)
  const allArticles = useMemo(() => {
    const dbSlugs = new Set(dbPosts.map(p => p.slug));
    
    const formattedDbPosts = dbPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      date: formatDateBengali(post.published_at || post.created_at),
      readTime: `${calculateReadingTime(post.content_html)} পড়া`,
      author: post.author_name || "বিনিয়োগ বৃদ্ধি টিম",
      category: post.category?.name || "সাধারণ",
      categoryId: post.category_id,
      image: post.cover_image_url || "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=800&auto=format&fit=crop",
      to: `/insights/${post.slug}`,
      isDb: true,
    }));

    // Filter static articles that might have been migrated to db
    const remainingStatic = STATIC_ARTICLES
      .filter(art => !dbSlugs.has(art.slug))
      .map(art => ({
        ...art,
        readTime: `${art.readTime} পড়া`,
        categoryId: null,
        isDb: false,
      }));

    return [...formattedDbPosts, ...remainingStatic];
  }, [dbPosts]);

  // Filter by category
  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return allArticles;
    return allArticles.filter(art => 
      art.category === selectedCategory || art.categoryId === selectedCategory
    );
  }, [allArticles, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            হোমে ফিরে যান
          </Link>
          <span className="text-sm font-bold text-primary">ইনসাইটস</span>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            ইনসাইটস ও ব্লগ
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
            হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত এবং গাইডলাইন।
          </p>
        </div>

        {/* ─── Category Filter Pills (if categories exist) ──────────── */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 justify-start sm:justify-center no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              সকল ({allArticles.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ─── Articles Grid ───────────────────────────────────────── */}
        {postsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">আর্টিকেল লোড হচ্ছে...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border max-w-md mx-auto">
            <p className="text-muted-foreground text-sm font-medium">
              এই ক্যাটাগরিতে কোনো পোস্ট পাওয়া যায়নি।
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              সব পোস্ট দেখুন
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    width={600}
                    height={350}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="pill bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md text-primary font-bold shadow-sm border-none text-xs px-3 py-1">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium mb-3">
                    <span>{article.date}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={article.to} className="focus:outline-none">
                      {article.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {article.author ? article.author.slice(0, 2) : "বব"}
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                        {article.author}
                      </span>
                    </div>

                    <Link
                      to={article.to}
                      className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                      পড়ুন
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
