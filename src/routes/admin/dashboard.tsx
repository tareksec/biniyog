import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth, getAuthSnapshot } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Opportunity, Testimonial, HomepageReview } from "@/lib/database.types";
import { useBlogPosts, useBlogCategories } from "@/lib/blog";
import type { BlogPost, BlogCategory } from "@/lib/database.types";
import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { HomepageReviewForm } from "@/components/admin/HomepageReviewForm";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Loader2,
  RefreshCw,
  MessageSquareQuote,
  Briefcase,
  Home,
  ChevronRight,
  BookOpen,
  Settings2,
  Eye,
  ExternalLink,
  Star,
  Sparkles,
  Search,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
  Coins,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Menu,
  FileText,
  User,
  Quote,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading && !user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

// ─── Pastel Palette for Category Filter Chips ───────────────────────────
const PASTEL_CHIP_STYLES = [
  {
    bg: "bg-[#FFF9E6]",
    text: "text-[#875A00]",
    border: "border-[#FBE599]",
    active: "bg-[#F7DC79] text-[#543800] ring-2 ring-[#E0B82A]",
    badgeBg: "bg-[#FCEBA8] text-[#704B00]",
  },
  {
    bg: "bg-[#FDF0F3]",
    text: "text-[#9E2A49]",
    border: "border-[#F9C3D0]",
    active: "bg-[#F8A8BD] text-[#69162C] ring-2 ring-[#E6708E]",
    badgeBg: "bg-[#FCD3DC] text-[#821E38]",
  },
  {
    bg: "bg-[#F4F0FA]",
    text: "text-[#5C458A]",
    border: "border-[#D8CDEC]",
    active: "bg-[#CFC1EB] text-[#3D2963] ring-2 ring-[#9F80D4]",
    badgeBg: "bg-[#E5DCF5] text-[#4F3879]",
  },
  {
    bg: "bg-[#EDF7F1]",
    text: "text-[#1B663E]",
    border: "border-[#BDE5CE]",
    active: "bg-[#A7DFBE] text-[#0F4729] ring-2 ring-[#52B77B]",
    badgeBg: "bg-[#CDEEDC] text-[#165533]",
  },
  {
    bg: "bg-[#EFF6FB]",
    text: "text-[#1B5E87]",
    border: "border-[#BFDEF2]",
    active: "bg-[#A7D4F2] text-[#103E5A] ring-2 ring-[#529ECF]",
    badgeBg: "bg-[#CEE6F7] text-[#164E71]",
  },
  {
    bg: "bg-[#FAF3ED]",
    text: "text-[#8E4B1C]",
    border: "border-[#ECCFB9]",
    active: "bg-[#E6BE9C] text-[#5E2F0E] ring-2 ring-[#CF7D44]",
    badgeBg: "bg-[#F3DEC9] text-[#783D14]",
  },
];

// ─── Status badge styling ───────────────────────────────────────────
function statusBadge(status: string | null) {
  const s = (status || "").toLowerCase();
  // "আমরা তাদের নিয়ে এখন আর কাজ করছি না" — red (discontinued)
  if (s.includes("আর কাজ করছি না") || s.includes("করছি না"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        {status}
      </span>
    );
  // "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।" — red/gray (ended, unlikely)
  if (s.includes("সম্ভাবনা নেই"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  // "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ" — green (completed, restarting)
  if (s.includes("আবার শুরু হবে"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        {status}
      </span>
    );
  // "বিনিয়োগ নেওয়া শেষের দিকে" — amber (ending soon)
  if (s.includes("শেষের দিকে"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        {status}
      </span>
    );
  // "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে" — blue (active/running)
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
      {status || "চলমান"}
    </span>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────
function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/admin/login" });
    }
  }, [authLoading, user, navigate]);

  // ─── Active Tab State ───────────────────────────────────────────
  const search = Route.useSearch() as any;
  const [activeTab, setActiveTab] = useState<"opportunities" | "blog" | "testimonials" | "homepage_reviews">(
    search?.tab || "opportunities"
  );

  useEffect(() => {
    if (search?.tab && ["opportunities", "blog", "testimonials", "homepage_reviews"].includes(search.tab)) {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);

  // ─── Filter & Search State ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOppCategory, setSelectedOppCategory] = useState<string>("all");
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Opportunities state ────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppFormOpen, setOppFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Testimonials state ─────────────────────────────────────────
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testLoading, setTestLoading] = useState(true);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Testimonial | null>(null);
  const [deletingTest, setDeletingTest] = useState<Testimonial | null>(null);
  const [deletingTestLoading, setDeletingTestLoading] = useState(false);

  // ─── Homepage Reviews state ───────────────────────────────────────
  const [homepageReviews, setHomepageReviews] = useState<HomepageReview[]>([]);
  const [homeRevLoading, setHomeRevLoading] = useState(true);
  const [homeRevFormOpen, setHomeRevFormOpen] = useState(false);
  const [editingHomeRev, setEditingHomeRev] = useState<HomepageReview | null>(null);
  const [deletingHomeRev, setDeletingHomeRev] = useState<HomepageReview | null>(null);
  const [deletingHomeRevLoading, setDeletingHomeRevLoading] = useState(false);

  // ─── Blog state ───────────────────────────────────────────────
  const { data: blogPosts = [], isLoading: blogLoading, refetch: refetchBlogPosts } = useBlogPosts();
  const { data: blogCategories = [], refetch: refetchCategories } = useBlogCategories();
  
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deletingPostLoading, setDeletingPostLoading] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);

  // ─── Fetch functions ────────────────────────────────────────────
  const fetchOpportunities = useCallback(async () => {
    setOppLoading(true);
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("সুযোগ লোড করতে সমস্যা হয়েছে");
    } else {
      setOpportunities(data || []);
    }
    setOppLoading(false);
  }, []);

  const fetchTestimonials = useCallback(async () => {
    setTestLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("প্রশংসাপত্র লোড করতে সমস্যা হয়েছে");
    } else {
      setTestimonials(data || []);
    }
    setTestLoading(false);
  }, []);

  const fetchHomepageReviews = useCallback(async () => {
    setHomeRevLoading(true);
    const { data, error } = await supabase
      .from("homepage_reviews")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching homepage reviews:", error);
      toast.error("হোমপেজ রিভিউ লোড করতে সমস্যা হয়েছে");
    } else {
      setHomepageReviews(data || []);
    }
    setHomeRevLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchOpportunities();
      fetchTestimonials();
      fetchHomepageReviews();
    }
  }, [user, fetchOpportunities, fetchTestimonials, fetchHomepageReviews]);

  // ─── Delete handlers ────────────────────────────────────────────
  const handleDeleteOpp = async () => {
    if (!deletingOpp) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", deletingOpp.id);
      if (error) throw error;
      toast.success("সুযোগ মুছে ফেলা হয়েছে");
      setDeletingOpp(null);
      fetchOpportunities();
    } catch (err: any) {
      toast.error(err?.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!deletingTest) return;
    setDeletingTestLoading(true);
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", deletingTest.id);
      if (error) throw error;
      toast.success("প্রশংসাপত্র মুছে ফেলা হয়েছে");
      setDeletingTest(null);
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err?.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeletingTestLoading(false);
    }
  };

  const handleDeleteHomeRev = async () => {
    if (!deletingHomeRev) return;
    setDeletingHomeRevLoading(true);
    try {
      const { error } = await supabase
        .from("homepage_reviews")
        .delete()
        .eq("id", deletingHomeRev.id);
      if (error) throw error;
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
      setDeletingHomeRev(null);
      fetchHomepageReviews();
    } catch (err: any) {
      toast.error(err?.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeletingHomeRevLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    setDeletingPostLoading(true);
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", deletingPost.id);
      if (error) throw error;
      toast.success("পোস্ট মুছে ফেলা হয়েছে");
      setDeletingPost(null);
      refetchBlogPosts();
    } catch (err: any) {
      toast.error(err?.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeletingPostLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeletingCategoryLoading(true);
    try {
      const { error } = await supabase.from("blog_categories").delete().eq("id", deletingCategory.id);
      if (error) {
        if (error.code === '23503') {
          throw new Error("এই ক্যাটাগরিতে পোস্ট আছে, তাই মোছা যাবে না");
        }
        throw error;
      }
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
      setDeletingCategory(null);
      refetchCategories();
    } catch (err: any) {
      toast.error(err?.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  // ─── Real Dynamic Categories from Supabase ───────────────────────
  const opportunityCategories = useMemo(() => {
    const cats = new Set<string>();
    opportunities.forEach((opp) => {
      if (opp.category && opp.category.trim()) {
        cats.add(opp.category.trim());
      }
    });
    return Array.from(cats);
  }, [opportunities]);

  const uniqueBlogCategoryNames = useMemo(() => {
    const cats = new Set<string>();
    blogCategories.forEach((c) => {
      if (c.name && c.name.trim()) cats.add(c.name.trim());
    });
    blogPosts.forEach((p) => {
      if (p.category?.name && p.category.name.trim()) cats.add(p.category.name.trim());
    });
    return Array.from(cats);
  }, [blogCategories, blogPosts]);

  // ─── Filtered Data ───────────────────────────────────────────────
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch = searchQuery
        ? (opp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           opp.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           opp.category?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesCat = selectedOppCategory === "all" || opp.category === selectedOppCategory;
      return matchesSearch && matchesCat;
    });
  }, [opportunities, searchQuery, selectedOppCategory]);

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch = searchQuery
        ? (post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      const matchesCat = selectedBlogCategory === "all" || post.category?.name === selectedBlogCategory;
      return matchesSearch && matchesCat;
    });
  }, [blogPosts, searchQuery, selectedBlogCategory]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (!searchQuery) return true;
      return (
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quote?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [testimonials, searchQuery]);

  const filteredHomepageReviews = useMemo(() => {
    return homepageReviews.filter((r) => {
      if (!searchQuery) return true;
      return (
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.quote?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [homepageReviews, searchQuery]);

  // Highlight Featured Item (Latest / Top Opportunity or Blog Post)
  const featuredOpportunity = opportunities[0] || null;
  const featuredBlogPost = blogPosts[0] || null;

  // Active Tab Metadata
  const currentCount = 
    activeTab === "opportunities" ? filteredOpportunities.length :
    activeTab === "blog" ? filteredBlogPosts.length :
    activeTab === "testimonials" ? filteredTestimonials.length :
    filteredHomepageReviews.length;

  const currentLoading = 
    activeTab === "opportunities" ? oppLoading :
    activeTab === "blog" ? blogLoading :
    activeTab === "testimonials" ? testLoading :
    homeRevLoading;

  const handleRefreshCurrent = () => {
    if (activeTab === "opportunities") fetchOpportunities();
    else if (activeTab === "blog") { refetchBlogPosts(); refetchCategories(); }
    else if (activeTab === "testimonials") fetchTestimonials();
    else if (activeTab === "homepage_reviews") fetchHomepageReviews();
  };

  // ─── Loading / Auth guard ──────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f7f3]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#235347]" />
          <p className="text-sm font-medium text-[#235347]">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBF2ED] py-2 px-2 sm:py-4 sm:px-4 lg:py-6 lg:px-6 font-sans antialiased text-[#051F20]">
      {/* ─── Outer Rounded Container Frame ─────────────────────────── */}
      <div className="mx-auto max-w-[1720px] min-h-[92vh] bg-white rounded-3xl lg:rounded-[2.8rem] shadow-[0_25px_70px_-15px_rgba(11,43,38,0.12)] border border-emerald-900/5 p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:gap-6 relative overflow-hidden">
        
        {/* ─── Mobile Header Bar (Visible on small screens) ─────────── */}
        <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#0B2B26] text-white rounded-2xl">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-sm text-[#DAF1DE]">
              <span className="w-8 h-8 rounded-full bg-[#DAF1DE] text-[#0B2B26] flex items-center justify-center font-black">
                স
              </span>
              <span>সমৃদ্ধি অ্যাডমিন</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/10 h-8 px-2.5 rounded-xl text-xs gap-1.5"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>মেনু</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-red-300 hover:text-red-100 hover:bg-red-500/20 h-8 w-8 rounded-xl"
              title="লগআউট"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ─── Layout Region 1: Far-Left Slim Floating Dark Navy Rail ── */}
        <aside className="hidden lg:flex flex-col items-center justify-between w-[76px] bg-[#0B2B26] text-white rounded-[2.5rem] py-7 px-2 shadow-xl shadow-emerald-950/25 shrink-0 select-none">
          {/* Top: Logo / Live Site Link */}
          <div className="flex flex-col items-center gap-6">
            <Link
              to="/"
              className="group relative w-12 h-12 rounded-full bg-white/10 hover:bg-[#DAF1DE] hover:text-[#0B2B26] flex items-center justify-center text-[#DAF1DE] transition-all duration-300 hover:scale-105 shadow-inner"
              title="ওয়েবসাইট হোমপেজ"
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">হোম</span>
            </Link>

            <div className="w-8 h-[1px] bg-white/10 rounded-full" />

            {/* Nav Rail Tab Switchers */}
            <div className="flex flex-col items-center gap-3">
              {/* Opportunities Tab */}
              <button
                onClick={() => setActiveTab("opportunities")}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeTab === "opportunities"
                    ? "bg-[#DAF1DE] text-[#0B2B26] font-bold shadow-lg shadow-[#DAF1DE]/20 ring-4 ring-[#DAF1DE]/25 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title="বিনিয়োগ সুযোগসমূহ"
              >
                <Briefcase className="h-5 w-5" />
                {activeTab === "opportunities" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B2B26]" />
                )}
              </button>

              {/* Blog Tab */}
              <button
                onClick={() => setActiveTab("blog")}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeTab === "blog"
                    ? "bg-[#DAF1DE] text-[#0B2B26] font-bold shadow-lg shadow-[#DAF1DE]/20 ring-4 ring-[#DAF1DE]/25 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title="ব্লগ পোস্টসমূহ"
              >
                <BookOpen className="h-5 w-5" />
                {activeTab === "blog" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B2B26]" />
                )}
              </button>

              {/* Testimonials Tab */}
              <button
                onClick={() => setActiveTab("testimonials")}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeTab === "testimonials"
                    ? "bg-[#DAF1DE] text-[#0B2B26] font-bold shadow-lg shadow-[#DAF1DE]/20 ring-4 ring-[#DAF1DE]/25 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title="প্রশংসাপত্র"
              >
                <MessageSquareQuote className="h-5 w-5" />
                {activeTab === "testimonials" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B2B26]" />
                )}
              </button>

              {/* Homepage Reviews Tab */}
              <button
                onClick={() => setActiveTab("homepage_reviews")}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeTab === "homepage_reviews"
                    ? "bg-[#DAF1DE] text-[#0B2B26] font-bold shadow-lg shadow-[#DAF1DE]/20 ring-4 ring-[#DAF1DE]/25 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title="হোমপেজ রিভিউ"
              >
                <Star className="h-5 w-5" />
                {activeTab === "homepage_reviews" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B2B26]" />
                )}
              </button>

              {/* Category Manager Quick Action */}
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="w-12 h-12 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-300"
                title="ক্যাটাগরি ম্যানেজমেন্ট"
              >
                <Settings2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom: Profile & Logout */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" title={user.email || "অ্যাডমিন"}>
              <div className="w-11 h-11 rounded-full bg-emerald-900/80 border-2 border-[#DAF1DE]/40 text-[#DAF1DE] flex items-center justify-center font-bold text-sm shadow-inner">
                {user.email ? user.email.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0B2B26] rounded-full" />
            </div>

            <button
              onClick={handleSignOut}
              className="w-11 h-11 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors duration-200"
              title="লগআউট"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* ─── Layout Region 2: Left Panel — "কী করতে চান?" Quick Actions ─── */}
        <div className={`w-full lg:w-[310px] xl:w-[330px] shrink-0 bg-[#FAFCFA] rounded-[2.2rem] p-5 sm:p-6 border border-emerald-900/5 flex flex-col justify-between gap-6 transition-all duration-300 ${
          mobileMenuOpen ? "block" : "hidden lg:flex"
        }`}>
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#051F20] tracking-tight">কী করতে চান?</h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-[#DAF1DE] px-2.5 py-0.5 rounded-full">
                  Quick Hub
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                দ্রুত অ্যাডমিন অ্যাকশন ও সেকশন নেভিগেশন
              </p>
            </div>

            {/* 2-Column Action Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: New Opportunity (Highlighted primary style) */}
              <button
                onClick={() => {
                  setEditingOpp(null);
                  setOppFormOpen(true);
                }}
                className="group p-3.5 rounded-2xl bg-white border-2 border-[#235347] text-left hover:shadow-md transition-all duration-200 ring-4 ring-[#235347]/5 flex flex-col justify-between min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0B2B26] text-[#DAF1DE] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#051F20] group-hover:text-[#235347] transition-colors leading-tight">
                    নতুন প্রজেক্ট
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">সুযোগ যোগ করুন</p>
                </div>
              </button>

              {/* Card 2: New Blog Post */}
              <Link
                to="/admin/dashboard/blog/new"
                className="group p-3.5 rounded-2xl bg-white border border-slate-200/80 text-left hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#051F20] group-hover:text-purple-800 transition-colors leading-tight">
                    নতুন ব্লগ
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">আর্টিকেল প্রকাশ</p>
                </div>
              </Link>

              {/* Card 3: New Testimonial */}
              <button
                onClick={() => {
                  setEditingTest(null);
                  setTestFormOpen(true);
                }}
                className="group p-3.5 rounded-2xl bg-white border border-slate-200/80 text-left hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <MessageSquareQuote className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#051F20] group-hover:text-amber-800 transition-colors leading-tight">
                    প্রশংসাপত্র
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">নতুন রিভিউ যোগ</p>
                </div>
              </button>

              {/* Card 4: New Homepage Review */}
              <button
                onClick={() => {
                  setEditingHomeRev(null);
                  setHomeRevFormOpen(true);
                }}
                className="group p-3.5 rounded-2xl bg-white border border-slate-200/80 text-left hover:border-rose-300 hover:bg-rose-50/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#051F20] group-hover:text-rose-800 transition-colors leading-tight">
                    হোম রিভিউ
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">ফিচার্ড রিভিউ</p>
                </div>
              </button>

              {/* Card 5: Opportunities Deck Selector */}
              <button
                onClick={() => {
                  setActiveTab("opportunities");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border ${
                  activeTab === "opportunities"
                    ? "bg-[#DAF1DE]/80 border-[#235347]/30 shadow-sm"
                    : "bg-white border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className={`h-4 w-4 ${activeTab === "opportunities" ? "text-[#0B2B26]" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-xs text-[#051F20]">সুযোগ ডেক</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {opportunities.length}
                </span>
              </button>

              {/* Card 6: Blog Posts Deck Selector */}
              <button
                onClick={() => {
                  setActiveTab("blog");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border ${
                  activeTab === "blog"
                    ? "bg-[#DAF1DE]/80 border-[#235347]/30 shadow-sm"
                    : "bg-white border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className={`h-4 w-4 ${activeTab === "blog" ? "text-[#0B2B26]" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-xs text-[#051F20]">ব্লগ ডেক</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {blogPosts.length}
                </span>
              </button>

              {/* Card 7: Category Manager */}
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="p-3 rounded-2xl text-left bg-white border border-slate-200/60 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-xs text-[#051F20]">ক্যাটাগরি</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {blogCategories.length}
                </span>
              </button>

              {/* Card 8: View Live Site */}
              <Link
                to="/"
                target="_blank"
                className="p-3 rounded-2xl text-left bg-white border border-slate-200/60 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-xs text-[#051F20]">লাইভ সাইট</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Bottom Summary Metric Pill */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">সিস্টেম স্ট্যাটাস</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                সক্রিয়
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
              <div>
                <div className="text-base font-bold text-[#051F20]">{opportunities.length}</div>
                <div className="text-[10px] text-muted-foreground">প্রজেক্ট</div>
              </div>
              <div>
                <div className="text-base font-bold text-[#051F20]">{blogPosts.length}</div>
                <div className="text-[10px] text-muted-foreground">ব্লগ</div>
              </div>
              <div>
                <div className="text-base font-bold text-[#051F20]">{testimonials.length + homepageReviews.length}</div>
                <div className="text-[10px] text-muted-foreground">রিভিউ</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Layout Region 3: Right Panel — Main Content Area ──────── */}
        <main className="flex-1 min-w-0 bg-[#F4F8F5] rounded-[2.2rem] p-4 sm:p-6 lg:p-7 flex flex-col gap-6 overflow-hidden border border-emerald-900/5">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-[#051F20] tracking-tight">
                  {activeTab === "opportunities" && "বিনিয়োগ সুযোগসমূহ"}
                  {activeTab === "blog" && "ব্লগ পোস্ট ও আর্টিকেল"}
                  {activeTab === "testimonials" && "প্রশংসাপত্র ব্যবস্থাপনা"}
                  {activeTab === "homepage_reviews" && "হোমপেজ রিভিউ সমূহ"}
                </h1>
                <Badge variant="secondary" className="bg-[#DAF1DE] text-[#0B2B26] font-bold text-xs px-2.5 py-0.5 rounded-full border-none">
                  {currentCount} টি
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {activeTab === "opportunities" && "সকল সক্রিয় ও সমাপ্ত বিনিয়োগ সুযোগ পরিচালনা করুন"}
                {activeTab === "blog" && "ওয়েবসাইটের প্রকাশনা, ড্রাফট ও ক্যাটাগরি কনফিগারেশন"}
                {activeTab === "testimonials" && "গ্রাহক ও অংশীদারদের রিভিউ ও কোটস"}
                {activeTab === "homepage_reviews" && "হোমপেজের মূল রিভিউ সেকশনের কার্ডসমূহ"}
              </p>
            </div>

            {/* Actions: Search + Refresh + Add Primary CTA */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 sm:w-48 pl-9 pr-7 py-2 bg-white rounded-full text-xs sm:text-sm border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#235347]/20 transition-all placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshCurrent}
                disabled={currentLoading}
                className="h-9 px-3 rounded-full bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold gap-1.5 shadow-2xs"
                title="রিফ্রেশ"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${currentLoading ? "animate-spin text-[#235347]" : ""}`} />
                <span className="hidden sm:inline">রিফ্রেশ</span>
              </Button>

              {/* Primary Action Button */}
              {activeTab === "opportunities" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingOpp(null);
                    setOppFormOpen(true);
                  }}
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>নতুন সুযোগ</span>
                </Button>
              )}

              {activeTab === "blog" && (
                <Button
                  size="sm"
                  asChild
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Link to="/admin/dashboard/blog/new">
                    <Plus className="h-4 w-4" />
                    <span>নতুন পোস্ট</span>
                  </Link>
                </Button>
              )}

              {activeTab === "testimonials" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTest(null);
                    setTestFormOpen(true);
                  }}
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>নতুন প্রশংসাপত্র</span>
                </Button>
              )}

              {activeTab === "homepage_reviews" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingHomeRev(null);
                    setHomeRevFormOpen(true);
                  }}
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>নতুন রিভিউ</span>
                </Button>
              )}
            </div>
          </div>

          {/* ─── Filter Chips Row (Real Dynamic Categories in Soft Pastels) ─── */}
          {(activeTab === "opportunities" || activeTab === "blog") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>ক্যাটাগরি ফিল্টার</span>
                <span>
                  {activeTab === "opportunities" ? opportunityCategories.length : uniqueBlogCategoryNames.length} টি ক্যাটাগরি
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
                {/* "সবগুলো" (All) Chip */}
                <button
                  onClick={() => {
                    if (activeTab === "opportunities") setSelectedOppCategory("all");
                    else setSelectedBlogCategory("all");
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all duration-200 border ${
                    (activeTab === "opportunities" && selectedOppCategory === "all") ||
                    (activeTab === "blog" && selectedBlogCategory === "all")
                      ? "bg-[#0B2B26] text-white border-[#0B2B26] shadow-sm scale-102"
                      : "bg-white text-[#051F20] border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  সবগুলো ({activeTab === "opportunities" ? opportunities.length : blogPosts.length})
                </button>

                {/* Dynamic Category Chips with Rotated Pastel Colors */}
                {(activeTab === "opportunities" ? opportunityCategories : uniqueBlogCategoryNames).map((catName, index) => {
                  const style = PASTEL_CHIP_STYLES[index % PASTEL_CHIP_STYLES.length];
                  const isSelected = 
                    activeTab === "opportunities" 
                      ? selectedOppCategory === catName 
                      : selectedBlogCategory === catName;

                  const count = activeTab === "opportunities"
                    ? opportunities.filter(o => o.category === catName).length
                    : blogPosts.filter(p => p.category?.name === catName).length;

                  return (
                    <button
                      key={catName}
                      onClick={() => {
                        if (activeTab === "opportunities") {
                          setSelectedOppCategory(selectedOppCategory === catName ? "all" : catName);
                        } else {
                          setSelectedBlogCategory(selectedBlogCategory === catName ? "all" : catName);
                        }
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all duration-200 border flex items-center gap-2 ${style.bg} ${style.text} ${style.border} ${
                        isSelected ? style.active : "hover:shadow-2xs hover:scale-102"
                      }`}
                    >
                      <span>{catName}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${style.badgeBg}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Featured Highlight Hero Card (Reference "Featured Doctor" Style) ─── */}
          {activeTab === "opportunities" && featuredOpportunity && selectedOppCategory === "all" && !searchQuery && (
            <div className="bg-gradient-to-br from-[#EAF5EE] via-[#F4F9F5] to-[#FCF8EE] rounded-[2.2rem] p-5 sm:p-6 border border-emerald-800/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
              <div className="flex items-start gap-4 z-10 max-w-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#0B2B26] text-[#DAF1DE] flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      ফিচার্ড প্রজেক্ট
                    </span>
                    {statusBadge(featuredOpportunity.status)}
                    {featuredOpportunity.category && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        • {featuredOpportunity.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#051F20] tracking-tight line-clamp-1">
                    {featuredOpportunity.name}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {featuredOpportunity.description || "এই প্রজেক্টের বিস্তারিত তথ্য ও বিনিয়োগ সুযোগ উপলব্ধ রয়েছে।"}
                  </p>
                </div>
              </div>

              {/* Data & Actions on Right */}
              <div className="flex items-center gap-6 z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-emerald-800/10">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-emerald-900/5 shadow-2xs">
                    <div className="text-[10px] text-muted-foreground font-semibold">বিনিয়োগ লক্ষ্য</div>
                    <div className="text-sm font-bold text-[#0B2B26]">{featuredOpportunity.investment_amount || "—"}</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-emerald-900/5 shadow-2xs">
                    <div className="text-[10px] text-muted-foreground font-semibold">প্রত্যাশিত লাভ</div>
                    <div className="text-sm font-bold text-emerald-700">{featuredOpportunity.expected_profit || "—"}</div>
                  </div>
                </div>

                {/* Dark Circular Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingOpp(featuredOpportunity);
                      setOppFormOpen(true);
                    }}
                    className="w-10 h-10 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:scale-105 shadow-sm transition-all"
                    title="সম্পাদনা"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Decorative Subtle Background Bloom */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />
            </div>
          )}

          {/* ─── Card-List Section (Replacing Traditional Tables) ─────── */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#051F20] tracking-tight">
                {activeTab === "opportunities" && "সকল সুযোগ তালিকা"}
                {activeTab === "blog" && "সকল ব্লগ পোস্ট"}
                {activeTab === "testimonials" && "প্রশংসাপত্র তালিকা"}
                {activeTab === "homepage_reviews" && "হোমপেজ রিভিউ তালিকা"}
              </h2>
              <span className="text-xs text-muted-foreground">
                ফিল্টারকৃত রেকর্ড: {currentCount} টি
              </span>
            </div>

            {/* Loading State */}
            {currentLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-2xs">
                <Loader2 className="h-8 w-8 animate-spin text-[#235347] mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">তথ্য লোড করা হচ্ছে...</p>
              </div>
            ) : currentCount === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[#051F20]">কোনো রেকর্ড পাওয়া যায়নি</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  বর্তমান ফিল্টার বা সার্চ কোয়েরিতে কোনো আইটেম মেলেনি। নতুন যোগ করতে ওপরের বাটনে ক্লিক করুন।
                </p>
              </div>
            ) : (
              /* Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                
                {/* ═══════════ OPPORTUNITIES CARDS ═══════════ */}
                {activeTab === "opportunities" &&
                  filteredOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-[1.8rem] p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      {/* Card Top: Thumbnail + Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0B2B26] border border-emerald-100 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                            {opp.name ? opp.name.charAt(0) : "ব"}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-[#051F20] line-clamp-1 group-hover:text-[#235347] transition-colors">
                              {opp.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <span>/{opp.slug}</span>
                              {opp.category && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-emerald-800">{opp.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>{statusBadge(opp.status)}</div>

                      {/* 2-Column Key Metrics Sub-card */}
                      <div className="bg-[#F8FAF9] rounded-2xl p-3 border border-emerald-900/5 grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">বিনিয়োগ লক্ষ্য</span>
                          <span className="text-xs font-bold text-[#051F20]">{opp.investment_amount || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">প্রত্যাশিত লাভ</span>
                          <span className="text-xs font-bold text-emerald-700">{opp.expected_profit || "—"}</span>
                        </div>
                      </div>

                      {/* Bottom Action Dock: Small Dark Circular Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-muted-foreground">
                          {opp.profit_period ? `মেয়াদ: ${opp.profit_period}` : "মেয়াদ: সাধারণ"}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Live view button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="লাইভ দেখুন"
                          >
                            <Link to={`/opportunities/${opp.slug}`} target="_blank">
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingOpp(opp);
                              setOppFormOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="সম্পাদনা"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingOpp(opp)}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-red-700 hover:text-white shadow-2xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* ═══════════ BLOG POSTS CARDS ═══════════ */}
                {activeTab === "blog" &&
                  filteredBlogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-[1.8rem] p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3">
                        {/* Cover Image */}
                        <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-emerald-50/50">
                              <BookOpen className="h-8 w-8 text-emerald-800/40" />
                            </div>
                          )}
                          <div className="absolute top-2.5 right-2.5">
                            {post.status === "published" ? (
                              <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                Published
                              </span>
                            ) : (
                              <span className="bg-slate-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                            {post.category?.name || "সাধারণ"}
                          </div>
                          <h3 className="font-bold text-base text-[#051F20] line-clamp-2 mt-1 group-hover:text-purple-800 transition-colors">
                            {post.title}
                          </h3>
                        </div>
                      </div>

                      {/* 2-Column Key Metrics Sub-card */}
                      <div className="bg-[#F9F7FC] rounded-2xl p-3 border border-purple-900/5 grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">প্রকাশের তারিখ</span>
                          <span className="text-xs font-bold text-[#051F20]">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString("bn-BD") : "ড্রাফট"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">ভিউ সংখ্যা</span>
                          <span className="text-xs font-bold text-purple-800">
                            {post.views_count ? `${post.views_count} বার` : "০"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Dock */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          /{post.slug || "post"}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Live post link */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="পোস্ট দেখুন"
                          >
                            <Link to={`/blog/${post.slug}`} target="_blank">
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="সম্পাদনা"
                          >
                            <Link to={`/admin/dashboard/blog/${post.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingPost(post)}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-red-700 hover:text-white shadow-2xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* ═══════════ TESTIMONIALS CARDS ═══════════ */}
                {activeTab === "testimonials" &&
                  filteredTestimonials.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-[1.8rem] p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-100 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                            {t.name ? t.name.charAt(0) : "ক"}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-[#051F20] line-clamp-1">{t.name}</h3>
                            <div className="text-xs text-muted-foreground">
                              {t.role_title || "বিনিয়োগকারী"} {t.brand_name && `• ${t.brand_name}`}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 italic bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60 line-clamp-3 leading-relaxed">
                          "{t.quote}"
                        </p>
                      </div>

                      {/* 2-Column Key Metrics Sub-card */}
                      <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-amber-900/5 grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">লোকেশন</span>
                          <span className="text-xs font-bold text-[#051F20]">{t.location || "ঢাকা, বাংলাদেশ"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">ব্র্যান্ড / কোম্পানি</span>
                          <span className="text-xs font-bold text-amber-800">{t.brand_name || "ব্যক্তিগত"}</span>
                        </div>
                      </div>

                      {/* Bottom Action Dock */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-muted-foreground">প্রশংসাপত্র</span>
                        
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTest(t);
                              setTestFormOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="সম্পাদনা"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingTest(t)}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-red-700 hover:text-white shadow-2xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* ═══════════ HOMEPAGE REVIEWS CARDS ═══════════ */}
                {activeTab === "homepage_reviews" &&
                  filteredHomepageReviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white rounded-[1.8rem] p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-900 border border-rose-100 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                              {r.name ? r.name.charAt(0) : "র"}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-[#051F20] line-clamp-1">{r.name}</h3>
                              <div className="text-xs text-muted-foreground">{r.location || "বাংলাদেশ"}</div>
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Order: {r.sort_order}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 italic bg-rose-50/40 p-3 rounded-2xl border border-rose-100/60 line-clamp-3 leading-relaxed">
                          "{r.quote}"
                        </p>
                      </div>

                      {/* Bottom Action Dock */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-muted-foreground">হোম রিভিউ</span>
                        
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingHomeRev(r);
                              setHomeRevFormOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832] hover:text-white shadow-2xs"
                            title="সম্পাদনা"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingHomeRev(r)}
                            className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-red-700 hover:text-white shadow-2xs"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

              </div>
            )}
          </div>

        </main>
      </div>

      {/* ─── Opportunity Form Dialog ──────────────────────────────── */}
      <OpportunityForm
        open={oppFormOpen}
        onOpenChange={setOppFormOpen}
        opportunity={editingOpp}
        onSuccess={fetchOpportunities}
      />

      {/* ─── Testimonial Form Dialog ──────────────────────────────── */}
      <TestimonialForm
        open={testFormOpen}
        onOpenChange={setTestFormOpen}
        testimonial={editingTest}
        onSuccess={fetchTestimonials}
        opportunities={opportunities}
      />

      {/* ─── Homepage Review Form Dialog ──────────────────────────── */}
      <HomepageReviewForm
        open={homeRevFormOpen}
        onOpenChange={setHomeRevFormOpen}
        review={editingHomeRev}
        onSuccess={fetchHomepageReviews}
      />

      {/* ─── Delete Opportunity Confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deletingOpp}
        onOpenChange={(open) => !open && setDeletingOpp(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">সুযোগ মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingOpp?.name}"</strong> মুছে ফেললে ফেরানো যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deleting} className="rounded-full">
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOpp}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Testimonial Confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deletingTest}
        onOpenChange={(open) => !open && setDeletingTest(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">প্রশংসাপত্র মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>{deletingTest?.name}</strong>-এর প্রশংসাপত্র মুছে ফেললে ফেরানো যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deletingTestLoading} className="rounded-full">
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              disabled={deletingTestLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deletingTestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Homepage Review Confirmation ──────────────────── */}
      <AlertDialog
        open={!!deletingHomeRev}
        onOpenChange={(open) => !open && setDeletingHomeRev(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">রিভিউ মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>{deletingHomeRev?.name}</strong>-এর রিভিউ মুছে ফেললে ফেরানো যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deletingHomeRevLoading} className="rounded-full">
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHomeRev}
              disabled={deletingHomeRevLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deletingHomeRevLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Blog Post Confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deletingPost}
        onOpenChange={(open) => !open && setDeletingPost(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">পোস্ট মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingPost?.title}"</strong> মুছে ফেললে ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deletingPostLoading} className="rounded-full">
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={deletingPostLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deletingPostLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Category Manager ──────────────────────────────────────── */}
      <AlertDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
      >
        <AlertDialogContent className="sm:max-w-md rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">ক্যাটাগরি ম্যানেজমেন্ট</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              বিদ্যমান ব্লগ ক্যাটাগরিগুলো দেখুন এবং প্রয়োজন অনুযায়ী মুছুন।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 mt-4">
            {blogCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">কোনো ক্যাটাগরি নেই</p>
            ) : (
              blogCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="font-semibold text-sm text-[#051F20]">{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingCategory(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-full">বন্ধ করুন</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Category Confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">ক্যাটাগরি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingCategory?.name}"</strong> মুছে ফেললে ফেরানো যাবে না।
              (এই ক্যাটাগরিতে কোনো পোস্ট থাকলে মোছা যাবে না)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={deletingCategoryLoading} className="rounded-full">
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deletingCategoryLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deletingCategoryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
