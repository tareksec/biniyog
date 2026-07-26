import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "ইনসাইটস ও ব্লগ · সমৃদ্ধি" },
      { name: "description", content: "হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত।" },
    ],
  }),
  component: InsightsPage,
});

const ARTICLES = [
  {
    title: "এসএমই ব্যবসায় হালাল বিনিয়োগের গুরুত্ব এবং পদ্ধতি",
    excerpt: "হালাল বিনিয়োগ শুধু একটি ধর্মীয় দায়িত্ব নয়, বরং এটি একটি টেকসই অর্থনৈতিক ব্যবস্থা গড়ে তুলতে সাহায্য করে। বিস্তারিত জানুন কীভাবে এসএমই খাতে শরীয়াহ সম্মত বিনিয়োগ করা যায়।",
    date: "২০ জুলাই ২০২৬",
    readTime: "৫ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "শরীয়াহ ফাইন্যান্স",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "বাংলাদেশের কৃষি খাতে বিনিয়োগের সম্ভাবনা ও ঝুঁকি",
    excerpt: "কৃষি খাত আমাদের অর্থনীতির মূল চালিকাশক্তি। কিন্তু এই খাতে বিনিয়োগের ক্ষেত্রে কী কী সম্ভাবনা ও ঝুঁকি রয়েছে? জানুন এক্সপার্ট অ্যানালাইসিস।",
    date: "১৫ জুলাই ২০২৬",
    readTime: "৪ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "মার্কেট অ্যানালাইসিস",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "ইনফ্লেশনের সময়ে নিজের পোর্টফোলিও কীভাবে সাজাবেন?",
    excerpt: "মুদ্রাস্ফীতির কারণে টাকার মান কমে যাচ্ছে। এই সময়ে শুধুমাত্র সঞ্চয় না করে কীভাবে একটি স্মার্ট ইনভেস্টমেন্ট পোর্টফোলিও তৈরি করবেন তা নিয়ে কিছু কার্যকরী টিপস।",
    date: "০৫ জুলাই ২০২৬",
    readTime: "৬ মিনিট",
    author: "মোহাইমিন পাটোয়ারী",
    category: "বিনিয়োগ গাইড",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop"
  }
];

function InsightsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            হোমে ফিরে যান
          </Link>
          <span className="text-sm font-bold">ইনসাইটস</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">ইনসাইটস ও ব্লগ</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            হালাল বিনিয়োগ, ব্যবসা ও ফাইন্যান্স নিয়ে এক্সপার্টদের মতামত এবং গাইডলাইন।
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article key={article.title} className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="pill bg-white/90 backdrop-blur-md text-primary font-bold shadow-sm border-none">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mb-3">
                  <span>{article.date}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{article.readTime} পড়া</span>
                </div>
                <h3 className="font-display text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      মপ
                    </div>
                    <span className="text-sm font-medium">{article.author}</span>
                  </div>
                  <button
                    onClick={() => toast.info("শীঘ্রই আসছে! পূর্ণ প্রবন্ধ শীঘ্রই পাবেন 👍")}
                    className="text-primary font-semibold text-sm hover:underline"
                  >
                    পড়ুন →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
