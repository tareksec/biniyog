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
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronLeft,
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
  Users,
  Mail,
  Phone,
  Copy,
  ShieldAlert,
  Clock,
  Check,
  Undo2,
  UserCheck,
  Database,
  HardDrive,
  Server,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Globe,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { isAdminEmail } from "@/lib/admin";

export interface DashboardUser {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  status: "pending" | "approved";
  created_at: string;
}

export interface StorageBucketStat {
  bucket_id: string;
  total_bytes: number;
  total_pretty: string;
}

export interface StorageStats {
  db_size_bytes: number;
  db_size_pretty: string;
  buckets: StorageBucketStat[];
  total_storage_bytes: number;
  total_storage_pretty: string;
}

const getUsageStatus = (percentage: number) => {
  if (percentage >= 80) {
    return {
      bar: "bg-red-500",
      text: "text-red-600",
    };
  }
  if (percentage >= 60) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-600",
    };
  }
  return {
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  };
};

const formatStorageBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01) {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  }
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }
  return `${mb.toFixed(mb < 1 ? 2 : 1)} MB`;
};

function parseAmountNumber(amt: string | null): number {
  if (!amt) return 0;
  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  const normalized = amt.replace(/[০-৯]/g, (m) => bnToEnMap[m] || m);
  const match = normalized.match(/[\d.]+/);
  let val = match ? parseFloat(match[0]) : 0;
  if (amt.includes("কোটি") || amt.toLowerCase().includes("crore")) val *= 10000000;
  else if (amt.includes("লক্ষ") || amt.includes("লাখ") || amt.toLowerCase().includes("lakh")) val *= 100000;
  return val;
}

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading) {
      if (!user) {
        throw redirect({ to: "/admin/login" });
      }
      if (!isAdminEmail(user.email)) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: AdminDashboard,
});

// ─── Status badge styling ───────────────────────────────────────────
function statusBadge(status: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("আর কাজ করছি না") || s.includes("করছি না"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
        {status}
      </span>
    );
  if (s.includes("সম্ভাবনা নেই"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
        {status}
      </span>
    );
  if (s.includes("শেষ-সামনে") || s.includes("শেষ"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  if (s.includes("শেষের দিকে"))
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
      {status || "চলমান"}
    </span>
  );
}

const ITEMS_PER_PAGE = 10;

function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "opportunities" | "blog" | "testimonials" | "homepage_reviews" | "users"
  >("opportunities");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Opportunities state ──────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppFormOpen, setOppFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<Opportunity | null>(null);
  const [deletingOppLoading, setDeletingOppLoading] = useState(false);

  // Opportunities List Filters & Sorting & Pagination
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState<"all" | "active" | "ending" | "funded">("all");
  const [oppCategoryFilter, setOppCategoryFilter] = useState("all");
  const [oppSortBy, setOppSortBy] = useState<"latest" | "name" | "amount">("latest");
  const [oppPage, setOppPage] = useState(1);
  const [selectedOppIds, setSelectedOppIds] = useState<Set<string>>(new Set());

  // ─── Testimonials state ───────────────────────────────────────────
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

  // ─── Users state ──────────────────────────────────────────────────
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [userSearch, setUserSearch] = useState("");
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null);

  // ─── Storage stats state ─────────────────────────────────────────
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);

  // ─── Blog state ───────────────────────────────────────────────
  const { data: blogPosts = [], isLoading: blogLoading, refetch: refetchBlogPosts } = useBlogPosts();
  const { data: blogCategories = [], refetch: refetchCategories } = useBlogCategories();

  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deletingPostLoading, setDeletingPostLoading] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [addingCatLoading, setAddingCatLoading] = useState(false);

  // Blog Filters & Pagination
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("all");
  const [blogPage, setBlogPage] = useState(1);
  const [selectedBlogIds, setSelectedBlogIds] = useState<Set<string>>(new Set());

  // Bulk action loader
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  const fetchDashboardUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_all_users" as any);
      if (error) {
        console.warn("get_all_users RPC failed, trying profiles table directly:", error.message);
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profileErr) throw profileErr;
        setDashboardUsers(
          (profileData || []).map((p: any) => ({
            id: p.id,
            email: "—",
            full_name: p.full_name,
            phone: p.phone,
            status: p.status || "pending",
            created_at: p.created_at,
          }))
        );
      } else {
        setDashboardUsers(
          ((data as any[]) || []).map((u: any) => ({
            id: u.id,
            email: u.email || null,
            full_name: u.full_name || null,
            phone: u.phone || null,
            status: u.status || "pending",
            created_at: u.created_at,
          }))
        );
      }
    } catch (err: any) {
      console.error("Error fetching dashboard users:", err);
      toast.error("ব্যবহারকারীদের তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchStorageStats = useCallback(async () => {
    setStorageLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_storage_stats" as any);
      if (error) {
        console.warn("get_storage_stats RPC failed:", error.message);
      } else if (data) {
        setStorageStats(data as StorageStats);
      }
    } catch (err: any) {
      console.error("Error fetching storage stats:", err);
    } finally {
      setStorageLoading(false);
    }
  }, []);

  // ─── User Status Approval Handler ──────────────────────────────────
  const handleUpdateUserStatus = async (userId: string, newStatus: "pending" | "approved") => {
    setApprovingUserId(userId);
    try {
      const { error: rpcError } = await supabase.rpc("admin_update_user_status" as any, {
        target_user_id: userId,
        new_status: newStatus,
      });

      if (rpcError) {
        console.warn("admin_update_user_status RPC failed, updating profiles directly:", rpcError.message);
        const { error: directErr } = await supabase
          .from("profiles")
          .update({ status: newStatus })
          .eq("id", userId);

        if (directErr) throw directErr;
      }

      toast.success(
        newStatus === "approved"
          ? "ব্যবহারকারী সফলভাবে অনুমোদিত হয়েছে"
          : "ব্যবহারকারীকে অপেক্ষমান তালিকায় রাখা হয়েছে"
      );

      setDashboardUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err: any) {
      console.error("Error updating user status:", err);
      toast.error(err?.message || "ব্যবহারকারীর স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    } finally {
      setApprovingUserId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOpportunities();
      fetchTestimonials();
      fetchHomepageReviews();
      fetchDashboardUsers();
      fetchStorageStats();

      const timer = setInterval(() => {
        fetchStorageStats();
      }, 60000);

      return () => clearInterval(timer);
    }
  }, [user, fetchOpportunities, fetchTestimonials, fetchHomepageReviews, fetchDashboardUsers, fetchStorageStats]);

  // ─── Opportunities Filter & Sort Logic ──────────────────────────────
  const uniqueOppCategories = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return Array.from(set).sort();
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search
        if (oppSearch) {
          const q = oppSearch.toLowerCase();
          const matchName = (opp.name || "").toLowerCase().includes(q);
          const matchCategory = (opp.category || "").toLowerCase().includes(q);
          const matchSlug = (opp.slug || "").toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchSlug) return false;
        }

        // Status Filter
        if (oppStatusFilter !== "all") {
          const s = (opp.status || "").toLowerCase();
          if (oppStatusFilter === "active" && !s.includes("চলমান")) return false;
          if (oppStatusFilter === "ending" && !s.includes("শেষের দিকে")) return false;
          if (oppStatusFilter === "funded" && !(s.includes("শেষ") && !s.includes("শেষের দিকে"))) return false;
        }

        // Category Filter
        if (oppCategoryFilter !== "all" && opp.category !== oppCategoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (oppSortBy === "name") {
          return (a.name || "").localeCompare(b.name || "", "bn");
        }
        if (oppSortBy === "amount") {
          return parseAmountNumber(b.investment_amount) - parseAmountNumber(a.investment_amount);
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [opportunities, oppSearch, oppStatusFilter, oppCategoryFilter, oppSortBy]);

  const totalOppPages = Math.max(1, Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE));
  const paginatedOpportunities = useMemo(() => {
    const start = (oppPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOpportunities, oppPage]);

  // ─── Blog Filter & Pagination Logic ─────────────────────────────────
  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      if (blogSearch) {
        const q = blogSearch.toLowerCase();
        const matchTitle = (post.title || "").toLowerCase().includes(q);
        const matchAuthor = (post.author_name || "").toLowerCase().includes(q);
        const matchCategory = (post.category?.name || "").toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchCategory) return false;
      }
      if (blogStatusFilter !== "all" && post.status !== blogStatusFilter) {
        return false;
      }
      if (blogCategoryFilter !== "all" && post.category_id !== blogCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [blogPosts, blogSearch, blogStatusFilter, blogCategoryFilter]);

  const totalBlogPages = Math.max(1, Math.ceil(filteredBlogPosts.length / ITEMS_PER_PAGE));
  const paginatedBlogPosts = useMemo(() => {
    const start = (blogPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogPosts, blogPage]);

  // ─── Users Filter Logic ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return dashboardUsers.filter((u) => {
      if (userSearch) {
        const q = userSearch.toLowerCase();
        const matchName = (u.full_name || "").toLowerCase().includes(q);
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchPhone = (u.phone || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      if (userStatusFilter !== "all" && (u.status || "pending") !== userStatusFilter) {
        return false;
      }
      return true;
    });
  }, [dashboardUsers, userSearch, userStatusFilter]);

  // ─── Bulk Action Handlers ───────────────────────────────────────────
  const toggleSelectAllOpps = () => {
    if (selectedOppIds.size === paginatedOpportunities.length) {
      setSelectedOppIds(new Set());
    } else {
      setSelectedOppIds(new Set(paginatedOpportunities.map((o) => o.id)));
    }
  };

  const toggleSelectOpp = (id: string) => {
    setSelectedOppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteOpps = async () => {
    if (selectedOppIds.size === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selectedOppIds.size} টি সুযোগ মুছে ফেলতে চান?`))
      return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedOppIds);
      const { error } = await supabase.from("opportunities").delete().in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি সুযোগ সফলভাবে মুছে ফেলা হয়েছে`);
      setSelectedOppIds(new Set());
      fetchOpportunities();
    } catch (err: any) {
      toast.error("মুছে ফেলতে সমস্যা: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUpdateOppStatus = async (newStatus: string) => {
    if (selectedOppIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedOppIds);
      const { error } = await supabase
        .from("opportunities")
        .update({ status: newStatus })
        .in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি সুযোগের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে`);
      setSelectedOppIds(new Set());
      fetchOpportunities();
    } catch (err: any) {
      toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectAllBlogs = () => {
    if (selectedBlogIds.size === paginatedBlogPosts.length) {
      setSelectedBlogIds(new Set());
    } else {
      setSelectedBlogIds(new Set(paginatedBlogPosts.map((b) => b.id)));
    }
  };

  const toggleSelectBlog = (id: string) => {
    setSelectedBlogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteBlogs = async () => {
    if (selectedBlogIds.size === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selectedBlogIds.size} টি ব্লগ মুছে ফেলতে চান?`))
      return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedBlogIds);
      const { error } = await supabase.from("blog_posts").delete().in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি ব্লগ পোস্ট সফলভাবে মুছে ফেলা হয়েছে`);
      setSelectedBlogIds(new Set());
      refetchBlogPosts();
    } catch (err: any) {
      toast.error("মুছে ফেলতে সমস্যা: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUpdateBlogStatus = async (newStatus: "published" | "draft") => {
    if (selectedBlogIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedBlogIds);
      const payload: any = { status: newStatus };
      if (newStatus === "published") {
        payload.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from("blog_posts").update(payload).in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি ব্লগের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে`);
      setSelectedBlogIds(new Set());
      refetchBlogPosts();
    } catch (err: any) {
      toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleToggleBlogStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      const payload: any = { status: nextStatus };
      if (nextStatus === "published" && !post.published_at) {
        payload.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
      if (error) throw error;
      toast.success(nextStatus === "published" ? "পোস্ট পাবলিশ হয়েছে" : "পোস্ট ড্রাফট করা হয়েছে");
      refetchBlogPosts();
    } catch (err: any) {
      toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message);
    }
  };

  // ─── Category Inline Management ────────────────────────────────────
  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCatLoading(true);
    try {
      const slug = newCatName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}\-]+/gu, "");
      const { error } = await supabase.from("blog_categories").insert({ name: newCatName.trim(), slug });
      if (error) throw error;
      toast.success("নতুন ক্যাটাগরি যুক্ত হয়েছে");
      setNewCatName("");
      refetchCategories();
    } catch (err: any) {
      toast.error("ক্যাটাগরি যুক্ত করতে সমস্যা: " + err.message);
    } finally {
      setAddingCatLoading(false);
    }
  };

  const handleSaveRenameCategory = async (catId: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const { error } = await supabase
        .from("blog_categories")
        .update({ name: editingCategoryName.trim() })
        .eq("id", catId);
      if (error) throw error;
      toast.success("ক্যাটাগরির নাম সফলভাবে পরিবর্তিত হয়েছে");
      setEditingCategoryId(null);
      refetchCategories();
    } catch (err: any) {
      toast.error("ক্যাটাগরি রিনেম করতে সমস্যা: " + err.message);
    }
  };

  // ─── Single Delete handlers ─────────────────────────────────────────
  const handleDeleteOpp = async () => {
    if (!deletingOpp) return;
    setDeletingOppLoading(true);
    try {
      const { error } = await supabase.from("opportunities").delete().eq("id", deletingOpp.id);
      if (error) throw error;
      toast.success("সুযোগ সফলভাবে মুছে ফেলা হয়েছে");
      setDeletingOpp(null);
      fetchOpportunities();
    } catch (err: any) {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setDeletingOppLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    setDeletingPostLoading(true);
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", deletingPost.id);
      if (error) throw error;
      toast.success("পোস্ট সফলভাবে মুছে ফেলা হয়েছে");
      setDeletingPost(null);
      refetchBlogPosts();
    } catch (err: any) {
      toast.error("পোস্ট মুছতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setDeletingPostLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeletingCategoryLoading(true);
    try {
      const { error } = await supabase.from("blog_categories").delete().eq("id", deletingCategory.id);
      if (error) throw error;
      toast.success("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে");
      setDeletingCategory(null);
      refetchCategories();
    } catch (err: any) {
      toast.error("ক্যাটাগরি মুছতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const { error } = await supabase.rpc("admin_delete_user" as any, {
        target_user_id: deletingUser.id,
      });
      if (error) {
        const { error: directErr } = await supabase.from("profiles").delete().eq("id", deletingUser.id);
        if (directErr) throw directErr;
      }
      toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে");
      setDeletingUser(null);
      fetchDashboardUsers();
    } catch (err: any) {
      toast.error("মুছতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleRefreshCurrent = () => {
    fetchStorageStats();
    if (activeTab === "opportunities") fetchOpportunities();
    else if (activeTab === "blog") {
      refetchBlogPosts();
      refetchCategories();
    } else if (activeTab === "testimonials") fetchTestimonials();
    else if (activeTab === "homepage_reviews") fetchHomepageReviews();
    else if (activeTab === "users") fetchDashboardUsers();
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
    <div className="min-h-screen bg-[#F0F5F1] text-foreground p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
      {/* ─── Layout Region 1: Header / Top Bar ──────────────────────── */}
      <header className="bg-white rounded-[2rem] px-5 py-3.5 sm:px-6 sm:py-4 shadow-sm border border-emerald-900/5 flex items-center justify-between gap-4">
        {/* Left: Brand + Badge */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#0B2B26] text-[#DAF1DE] flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              বি
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-[#051F20] tracking-tight block leading-tight">
                বিনিয়োগ বৃদ্ধি
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                অ্যাডমিন কনসোল
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DAF1DE] text-[#0B2B26]">
            Super Admin
          </span>
        </div>

        {/* Right: User Pill + Logout */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2ED] text-xs font-semibold text-[#0B2B26]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[160px]">{user.email}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="rounded-full h-9 px-3.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 gap-1.5 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-full h-9 w-9 border-slate-200"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* ─── Main 2-Column Split: Left Sidebar & Right Content ─────── */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 items-stretch">
        {/* ─── Layout Region 2: Left Panel (Sidebar) ────────────────── */}
        <div
          className={`w-full lg:w-[310px] xl:w-[330px] shrink-0 bg-[#FAFCFA] rounded-[2.2rem] p-5 border border-emerald-900/5 flex flex-col justify-between gap-5 transition-all duration-300 ${
            mobileMenuOpen ? "block" : "hidden lg:flex"
          }`}
        >
          <div className="space-y-4">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#051F20] tracking-tight">ড্যাশবোর্ড হাব</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#DAF1DE] px-2 py-0.5 rounded-full">
                Nav
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {/* Opportunities Tab */}
              <button
                onClick={() => {
                  setActiveTab("opportunities");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                  activeTab === "opportunities"
                    ? "bg-[#DAF1DE]/90 border-[#235347]/40 shadow-xs scale-[1.01]"
                    : "bg-white border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase
                    className={`h-4 w-4 ${activeTab === "opportunities" ? "text-[#0B2B26]" : "text-slate-500"}`}
                  />
                  <span className="font-bold text-xs text-[#051F20]">বিনিয়োগ সুযোগসমূহ</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {opportunities.length}
                </span>
              </button>

              {/* Blog Tab */}
              <button
                onClick={() => {
                  setActiveTab("blog");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                  activeTab === "blog"
                    ? "bg-[#DAF1DE]/90 border-[#235347]/40 shadow-xs scale-[1.01]"
                    : "bg-white border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen
                    className={`h-4 w-4 ${activeTab === "blog" ? "text-[#0B2B26]" : "text-slate-500"}`}
                  />
                  <span className="font-bold text-xs text-[#051F20]">ব্লগ আর্টিকেল</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {blogPosts.length}
                </span>
              </button>

              {/* Users Tab */}
              <button
                onClick={() => {
                  setActiveTab("users");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                  activeTab === "users"
                    ? "bg-[#DAF1DE]/90 border-[#235347]/40 shadow-xs scale-[1.01]"
                    : "bg-white border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users
                    className={`h-4 w-4 ${activeTab === "users" ? "text-[#0B2B26]" : "text-slate-500"}`}
                  />
                  <span className="font-bold text-xs text-[#051F20]">ব্যবহারকারী তালিকা</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {dashboardUsers.length}
                </span>
              </button>

              {/* Category Manager */}
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="p-3 rounded-2xl text-left bg-white border border-slate-200/70 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-xs text-[#051F20]">ক্যাটাগরি ম্যানেজার</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {blogCategories.length}
                </span>
              </button>

              {/* Homepage Reviews Tab */}
              <button
                onClick={() => {
                  setActiveTab("homepage_reviews");
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                  activeTab === "homepage_reviews"
                    ? "bg-[#DAF1DE]/90 border-[#235347]/40 shadow-xs scale-[1.01]"
                    : "bg-white border-slate-200/70 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star
                    className={`h-4 w-4 ${activeTab === "homepage_reviews" ? "text-[#0B2B26]" : "text-slate-500"}`}
                  />
                  <span className="font-bold text-xs text-[#051F20]">হোম রিভিউ</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#0B2B26] border border-slate-200 shadow-2xs">
                  {homepageReviews.length}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Summary Metric Pill / Live Storage Status */}
          <div className="bg-white rounded-3xl p-4 border border-emerald-900/5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-[#0B2B26]" />
                <span className="text-xs font-bold text-[#051F20]">সিস্টেম স্ট্যাটাস</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchStorageStats()}
                  disabled={storageLoading}
                  className="p-1 rounded-md text-muted-foreground hover:text-[#0B2B26] hover:bg-slate-100 transition-colors cursor-pointer"
                  title="স্টোরেজ রিফ্রেশ করুন (প্রতি ৬০ সেকেন্ডে স্বয়ংক্রিয় রিফ্রেশ)"
                >
                  <RefreshCw className={`h-3 w-3 ${storageLoading ? "animate-spin text-[#235347]" : ""}`} />
                </button>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  লাইভ
                </span>
              </div>
            </div>

            {/* Database Usage */}
            {(() => {
              const dbBytes = storageStats?.db_size_bytes || 0;
              const dbMaxBytes = 500 * 1024 * 1024;
              const dbPercent = Math.min(100, Math.max(0, (dbBytes / dbMaxBytes) * 100));
              const dbStatus = getUsageStatus(dbPercent);
              const dbFormatted = storageStats?.db_size_pretty || formatStorageBytes(dbBytes);

              return (
                <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Server className="h-3 w-3 text-slate-500" />
                      <span>ডেটাবেজ</span>
                    </span>
                    <span className="font-mono text-[10.5px] font-bold text-slate-800">
                      {dbFormatted} <span className="text-slate-400 font-normal">/ 500 MB</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dbStatus.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(dbPercent > 0 ? 2 : 0, dbPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Storage Buckets & Total Storage */}
            {(() => {
              const totalStorageBytes = storageStats?.total_storage_bytes || 0;
              const maxStorageBytes = 1024 * 1024 * 1024;
              const storagePercent = Math.min(100, Math.max(0, (totalStorageBytes / maxStorageBytes) * 100));
              const storageStatus = getUsageStatus(storagePercent);
              const storageFormatted = storageStats?.total_storage_pretty || formatStorageBytes(totalStorageBytes);

              const oppBucket = storageStats?.buckets?.find((b) => b.bucket_id === "opportunity-images");
              const blogBucket = storageStats?.buckets?.find((b) => b.bucket_id === "blog-images");
              const otherBuckets =
                storageStats?.buckets?.filter(
                  (b) => b.bucket_id !== "opportunity-images" && b.bucket_id !== "blog-images"
                ) || [];

              const oppSize = oppBucket ? oppBucket.total_pretty || formatStorageBytes(oppBucket.total_bytes) : "0 MB";
              const blogSize = blogBucket ? blogBucket.total_pretty || formatStorageBytes(blogBucket.total_bytes) : "0 MB";

              return (
                <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-slate-500" />
                      <span>মোট Storage</span>
                    </span>
                    <span className="font-mono text-[10.5px] font-bold text-slate-800">
                      {storageFormatted} <span className="text-slate-400 font-normal">/ 1 GB</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${storageStatus.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(storagePercent > 0 ? 2 : 0, storagePercent)}%` }}
                    />
                  </div>

                  <div className="pt-1.5 space-y-1 border-t border-slate-200/60 text-[10.5px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="truncate pr-1 text-slate-500 font-medium">opportunity-images:</span>
                      <span className="font-mono font-bold text-slate-700 shrink-0">{oppSize}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="truncate pr-1 text-slate-500 font-medium">blog-images:</span>
                      <span className="font-mono font-bold text-slate-700 shrink-0">{blogSize}</span>
                    </div>

                    {otherBuckets.map((b) => (
                      <div key={b.bucket_id} className="flex items-center justify-between text-slate-600">
                        <span className="truncate pr-1 text-slate-500 font-medium">{b.bucket_id}:</span>
                        <span className="font-mono font-bold text-slate-700 shrink-0">
                          {b.total_pretty || formatStorageBytes(b.total_bytes)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Counts Grid */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center">
              <div>
                <div className="text-sm font-bold text-[#051F20]">{opportunities.length}</div>
                <div className="text-[9px] text-muted-foreground">প্রজেক্ট</div>
              </div>
              <div>
                <div className="text-sm font-bold text-[#051F20]">{blogPosts.length}</div>
                <div className="text-[9px] text-muted-foreground">ব্লগ</div>
              </div>
              <div>
                <div className="text-sm font-bold text-[#051F20]">{testimonials.length + homepageReviews.length}</div>
                <div className="text-[9px] text-muted-foreground">রিভিউ</div>
              </div>
              <div>
                <div className="text-sm font-bold text-[#051F20]">{dashboardUsers.length}</div>
                <div className="text-[9px] text-muted-foreground">ইউজার</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Layout Region 3: Right Panel (Main Content) ──────────── */}
        <main className="flex-1 min-w-0 bg-[#F4F8F5] rounded-[2.2rem] p-4 sm:p-6 lg:p-7 flex flex-col gap-5 overflow-hidden border border-emerald-900/5">
          {/* Breadcrumb Navigation */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => setActiveTab("opportunities")}
                  className="cursor-pointer text-muted-foreground hover:text-[#0B2B26]"
                >
                  ড্যাশবোর্ড
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold text-[#0B2B26]">
                  {activeTab === "opportunities" && "বিনিয়োগ সুযোগসমূহ"}
                  {activeTab === "blog" && "ব্লগ আর্টিকেল"}
                  {activeTab === "users" && "ব্যবহারকারী তালিকা"}
                  {activeTab === "testimonials" && "প্রশংসাপত্র"}
                  {activeTab === "homepage_reviews" && "হোম রিভিউ"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-[#051F20] tracking-tight">
                  {activeTab === "opportunities" && "বিনিয়োগ সুযোগসমূহ"}
                  {activeTab === "blog" && "ব্লগ আর্টিকেল"}
                  {activeTab === "testimonials" && "প্রশংসাপত্র ব্যবস্থাপনা"}
                  {activeTab === "homepage_reviews" && "হোমপেজ রিভিউ"}
                  {activeTab === "users" && "ব্যবহারকারী তালিকা"}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-[#DAF1DE] text-[#0B2B26] font-bold text-xs px-2.5 py-0.5 rounded-full border-none"
                >
                  {activeTab === "opportunities" && `${filteredOpportunities.length} টি`}
                  {activeTab === "blog" && `${filteredBlogPosts.length} টি`}
                  {activeTab === "users" && `${filteredUsers.length} জন`}
                  {activeTab === "testimonials" && `${testimonials.length} টি`}
                  {activeTab === "homepage_reviews" && `${homepageReviews.length} টি`}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {activeTab === "opportunities" && "সকল সক্রিয় ও সমাপ্ত বিনিয়োগ সুযোগ পরিচালনা করুন"}
                {activeTab === "blog" && "ব্লগ আর্টিকেল প্রকাশ, এডিট ও ক্যাটাগরি কনফিগারেশন"}
                {activeTab === "testimonials" && "গ্রাহক ও অংশীদারদের রিভিউ ও কোটস"}
                {activeTab === "homepage_reviews" && "হোমপেজের মূল রিভিউ সেকশনের কার্ডসমূহ"}
                {activeTab === "users" && "নিবন্ধিত সকল গ্রাহক ও বিনিয়োগকারীদের প্রোফাইল ও অনুমোদন"}
              </p>
            </div>

            {/* Top Primary Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshCurrent}
                disabled={oppLoading || blogLoading || usersLoading}
                className="h-9 px-3.5 rounded-full bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                title="রিফ্রেশ"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${oppLoading || blogLoading || usersLoading ? "animate-spin text-[#235347]" : ""}`}
                />
                <span className="hidden sm:inline">রিফ্রেশ</span>
              </Button>

              {activeTab === "opportunities" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingOpp(null);
                    setOppFormOpen(true);
                  }}
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>নতুন সুযোগ</span>
                </Button>
              )}

              {activeTab === "blog" && (
                <Button
                  size="sm"
                  asChild
                  className="h-9 px-4 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Link to="/admin/dashboard/blog/new">
                    <Plus className="h-4 w-4" />
                    <span>নতুন পোস্ট</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* ═══════════ OPPORTUNITIES LIST VIEW ═══════════ */}
          {activeTab === "opportunities" && (
            <div className="space-y-4">
              {/* Opportunities Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="সুযোগ খুঁজুন..."
                      value={oppSearch}
                      onChange={(e) => {
                        setOppSearch(e.target.value);
                        setOppPage(1);
                      }}
                      className="pl-9 pr-7 rounded-full bg-slate-50 text-xs h-9"
                    />
                    {oppSearch && (
                      <button
                        onClick={() => setOppSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: "all", label: "সব" },
                      { id: "active", label: "চলমান" },
                      { id: "ending", label: "শেষের দিকে" },
                      { id: "funded", label: "Fully Funded" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setOppStatusFilter(st.id as any);
                          setOppPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          oppStatusFilter === st.id
                            ? "bg-[#0B2B26] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Category Dropdown */}
                  <Select
                    value={oppCategoryFilter}
                    onValueChange={(v) => {
                      setOppCategoryFilter(v);
                      setOppPage(1);
                    }}
                  >
                    <SelectTrigger className="rounded-full bg-slate-50 text-xs h-9 w-[150px]">
                      <SelectValue placeholder="ক্যাটাগরি" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl text-xs">
                      <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                      {uniqueOppCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Dropdown */}
                  <Select
                    value={oppSortBy}
                    onValueChange={(v) => {
                      setOppSortBy(v as any);
                      setOppPage(1);
                    }}
                  >
                    <SelectTrigger className="rounded-full bg-slate-50 text-xs h-9 w-[130px]">
                      <SelectValue placeholder="সর্ট করুন" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl text-xs">
                      <SelectItem value="latest">সর্বশেষ</SelectItem>
                      <SelectItem value="name">নাম (A-Z)</SelectItem>
                      <SelectItem value="amount">বিনিয়োগ পরিমাণ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions Dock */}
              {selectedOppIds.size > 0 && (
                <div className="bg-[#0B2B26] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                    <span>{selectedOppIds.size} টি সুযোগ নির্বাচিত হয়েছে</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select onValueChange={(val) => handleBulkUpdateOppStatus(val)}>
                      <SelectTrigger className="rounded-full bg-white/10 text-white border-white/20 text-xs h-8 w-[160px]">
                        <SelectValue placeholder="স্ট্যাটাস পরিবর্তন" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl text-xs">
                        <SelectItem value="বিনিয়োগ নেওয়া চলমান-সুযোগ আছে">চলমান করুন</SelectItem>
                        <SelectItem value="বিনিয়োগ নেওয়া শেষের দিকে">শেষের দিকে</SelectItem>
                        <SelectItem value="বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ">
                          সমাপ্ত (সামনে শুরু)
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDeleteOpps}
                      disabled={bulkActionLoading}
                      className="rounded-full h-8 px-3 text-xs font-bold gap-1"
                    >
                      {bulkActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      <span>মুছে ফেলুন</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Opportunities Table */}
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
                {oppLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : paginatedOpportunities.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground space-y-2">
                    <Briefcase className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-sm">কোনো বিনিয়োগ সুযোগ পাওয়া যায়নি</p>
                    <p className="text-xs">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#EBF2ED]/70 border-b border-emerald-900/5 text-[#0B2B26] font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-10">
                            <Checkbox
                              checked={
                                paginatedOpportunities.length > 0 &&
                                selectedOppIds.size === paginatedOpportunities.length
                              }
                              onCheckedChange={toggleSelectAllOpps}
                            />
                          </th>
                          <th className="px-4 py-3.5">সুযোগ ও প্রজেক্ট</th>
                          <th className="px-4 py-3.5">ক্যাটাগরি</th>
                          <th className="px-4 py-3.5">বিনিয়োগ পরিমাণ</th>
                          <th className="px-4 py-3.5">প্রত্যাশিত মুনাফা</th>
                          <th className="px-4 py-3.5">স্ট্যাটাস</th>
                          <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedOpportunities.map((opp) => {
                          const isSelected = selectedOppIds.has(opp.id);
                          const coverImg = opp.image_urls?.[0];
                          return (
                            <tr
                              key={opp.id}
                              className={`transition-colors hover:bg-slate-50/80 ${
                                isSelected ? "bg-emerald-50/40" : ""
                              }`}
                            >
                              <td className="px-4 py-3.5">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelectOpp(opp.id)}
                                />
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
                                    {coverImg ? (
                                      <img
                                        src={coverImg}
                                        alt={opp.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="font-bold text-sm text-[#0B2B26]">
                                        {opp.name?.charAt(0) || "ব"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#051F20] text-sm truncate max-w-[200px] sm:max-w-[240px]">
                                      {opp.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]">
                                      /{opp.slug}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                  {opp.category || "সাধারণ"}
                                </span>
                              </td>

                              <td className="px-4 py-3.5 font-bold text-slate-800 text-xs">
                                {opp.investment_amount || "—"}
                              </td>

                              <td className="px-4 py-3.5 font-semibold text-emerald-700 text-xs">
                                {opp.expected_profit || "—"}
                              </td>

                              <td className="px-4 py-3.5">{statusBadge(opp.status)}</td>

                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0B2B26] hover:text-white text-slate-700 transition-colors"
                                    title="লাইভ প্রিভিউ দেখুন"
                                  >
                                    <Link to={`/opportunities/${opp.slug}`} target="_blank">
                                      <Eye className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingOpp(opp);
                                      setOppFormOpen(true);
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0B2B26] hover:text-white text-slate-700 transition-colors"
                                    title="সম্পাদনা"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingOpp(opp)}
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalOppPages > 1 && (
                  <div className="p-4 border-t border-slate-100 bg-[#FAFCFA] flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      পৃষ্ঠা {oppPage} এর {totalOppPages} ({filteredOpportunities.length} টি সুযোগ)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={oppPage <= 1}
                        onClick={() => setOppPage((p) => Math.max(1, p - 1))}
                        className="h-8 rounded-full text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> আগের
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={oppPage >= totalOppPages}
                        onClick={() => setOppPage((p) => Math.min(totalOppPages, p + 1))}
                        className="h-8 rounded-full text-xs"
                      >
                        পরের <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ BLOG MANAGEMENT LIST VIEW ═══════════ */}
          {activeTab === "blog" && (
            <div className="space-y-4">
              {/* Blog Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="ব্লগ খুঁজুন..."
                      value={blogSearch}
                      onChange={(e) => {
                        setBlogSearch(e.target.value);
                        setBlogPage(1);
                      }}
                      className="pl-9 pr-7 rounded-full bg-slate-50 text-xs h-9"
                    />
                    {blogSearch && (
                      <button
                        onClick={() => setBlogSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1">
                    {[
                      { id: "all", label: "সব" },
                      { id: "published", label: "প্রকাশিত" },
                      { id: "draft", label: "ড্রাফট" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setBlogStatusFilter(st.id as any);
                          setBlogPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          blogStatusFilter === st.id
                            ? "bg-[#0B2B26] text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Category Dropdown */}
                  <Select
                    value={blogCategoryFilter}
                    onValueChange={(v) => {
                      setBlogCategoryFilter(v);
                      setBlogPage(1);
                    }}
                  >
                    <SelectTrigger className="rounded-full bg-slate-50 text-xs h-9 w-[160px]">
                      <SelectValue placeholder="ক্যাটাগরি ফিল্টার" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl text-xs">
                      <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                      {blogCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryManagerOpen(true)}
                    className="rounded-full h-9 text-xs font-semibold border-slate-200 gap-1.5"
                  >
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>ক্যাটাগরি</span>
                  </Button>
                </div>
              </div>

              {/* Bulk Actions Bar for Blog */}
              {selectedBlogIds.size > 0 && (
                <div className="bg-[#0B2B26] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                    <span>{selectedBlogIds.size} টি পোস্ট নির্বাচিত</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdateBlogStatus("published")}
                      className="rounded-full h-8 px-3 text-xs font-bold bg-emerald-700 text-white border-emerald-600 hover:bg-emerald-800"
                    >
                      সব পাবলিশ করুন
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdateBlogStatus("draft")}
                      className="rounded-full h-8 px-3 text-xs font-bold bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      ড্রাফট করুন
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDeleteBlogs}
                      disabled={bulkActionLoading}
                      className="rounded-full h-8 px-3 text-xs font-bold gap-1"
                    >
                      {bulkActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      <span>মুছে ফেলুন</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Blog Posts Table */}
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
                {blogLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-16 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : paginatedBlogPosts.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground space-y-2">
                    <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-sm">কোনো ব্লগ আর্টিকেল পাওয়া যায়নি</p>
                    <p className="text-xs">নতুন পোস্ট যুক্ত করতে ওপরের বাটনে ক্লিক করুন</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#EBF2ED]/70 border-b border-emerald-900/5 text-[#0B2B26] font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-10">
                            <Checkbox
                              checked={
                                paginatedBlogPosts.length > 0 &&
                                selectedBlogIds.size === paginatedBlogPosts.length
                              }
                              onCheckedChange={toggleSelectAllBlogs}
                            />
                          </th>
                          <th className="px-4 py-3.5">আর্টিকেল ও কভার</th>
                          <th className="px-4 py-3.5">ক্যাটাগরি</th>
                          <th className="px-4 py-3.5">লেখক</th>
                          <th className="px-4 py-3.5">স্ট্যাটাস</th>
                          <th className="px-4 py-3.5">প্রকাশের তারিখ</th>
                          <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedBlogPosts.map((post) => {
                          const isSelected = selectedBlogIds.has(post.id);
                          return (
                            <tr
                              key={post.id}
                              className={`transition-colors hover:bg-slate-50/80 ${
                                isSelected ? "bg-purple-50/40" : ""
                              }`}
                            >
                              <td className="px-4 py-3.5">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelectBlog(post.id)}
                                />
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                    {post.cover_image_url ? (
                                      <img
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-purple-700 bg-purple-50">
                                        <BookOpen className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#051F20] text-sm truncate max-w-[240px] sm:max-w-[280px]">
                                      {post.title}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                                      /blog/{post.slug}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                                  {post.category?.name || "সাধারণ"}
                                </span>
                              </td>

                              <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                                {post.author_name || "—"}
                              </td>

                              <td className="px-4 py-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlogStatus(post)}
                                  className="group inline-flex items-center gap-1.5 cursor-pointer"
                                  title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                                >
                                  {post.status === "published" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 group-hover:bg-emerald-200 transition-colors">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                                      <span>Published</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors">
                                      <Clock className="h-3 w-3 text-slate-500" />
                                      <span>Draft</span>
                                    </span>
                                  )}
                                </button>
                              </td>

                              <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                                {post.published_at
                                  ? new Date(post.published_at).toLocaleDateString("bn-BD", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "ড্রাফট"}
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0B2B26] hover:text-white text-slate-700 transition-colors"
                                    title="লাইভ দেখুন"
                                  >
                                    <Link to={`/blog/${post.slug}`} target="_blank">
                                      <Eye className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0B2B26] hover:text-white text-slate-700 transition-colors"
                                    title="সম্পাদনা"
                                  >
                                    <Link to="/admin/dashboard_/blog/$postId/edit" params={{ postId: post.id }}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingPost(post)}
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Blog Pagination */}
                {totalBlogPages > 1 && (
                  <div className="p-4 border-t border-slate-100 bg-[#FAFCFA] flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      পৃষ্ঠা {blogPage} এর {totalBlogPages} ({filteredBlogPosts.length} টি পোস্ট)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={blogPage <= 1}
                        onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                        className="h-8 rounded-full text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> আগের
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={blogPage >= totalBlogPages}
                        onClick={() => setBlogPage((p) => Math.min(totalBlogPages, p + 1))}
                        className="h-8 rounded-full text-xs"
                      >
                        পরের <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ USERS MANAGEMENT LIST VIEW ═══════════ */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* User Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative min-w-[200px] flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-7 rounded-full bg-slate-50 text-xs h-9"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUserStatusFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === "all"
                        ? "bg-[#0B2B26] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    সকল ({dashboardUsers.length})
                  </button>

                  <button
                    onClick={() => setUserStatusFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      userStatusFilter === "pending"
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>অপেক্ষমান ({dashboardUsers.filter((u) => (u.status || "pending") === "pending").length})</span>
                  </button>

                  <button
                    onClick={() => setUserStatusFilter("approved")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === "approved"
                        ? "bg-emerald-700 text-white shadow-2xs"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    অনুমোদিত ({dashboardUsers.filter((u) => u.status === "approved").length})
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#EBF2ED]/70 border-b border-emerald-900/5 text-[#0B2B26] font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-4">ব্যবহারকারী</th>
                        <th className="px-5 py-4">ইমেইল</th>
                        <th className="px-5 py-4">মোবাইল নম্বর</th>
                        <th className="px-5 py-4">স্ট্যাটাস</th>
                        <th className="px-5 py-4">ইউজার আইডি</th>
                        <th className="px-5 py-4">নিবন্ধনের তারিখ</th>
                        <th className="px-5 py-4 text-right">অ্যাকশন ও অনুমোদন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                            কোনো ব্যবহারকারী পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isPending = (u.status || "pending") === "pending";
                          const isUserAdmin = isAdminEmail(u.email);
                          return (
                            <tr
                              key={u.id}
                              className={`transition-colors ${
                                isPending
                                  ? "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500"
                                  : isUserAdmin
                                  ? "bg-emerald-50/30 hover:bg-emerald-50/50 border-l-4 border-l-emerald-600"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                                      isUserAdmin
                                        ? "bg-[#0B2B26] text-white border-[#0B2B26]"
                                        : isPending
                                        ? "bg-amber-100 text-amber-900 border-amber-300"
                                        : "bg-emerald-100 text-[#0B2B26] border-emerald-200"
                                    }`}
                                  >
                                    {u.full_name
                                      ? u.full_name.charAt(0).toUpperCase()
                                      : u.email
                                      ? u.email.charAt(0).toUpperCase()
                                      : "U"}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#051F20] text-sm flex items-center gap-2 flex-wrap">
                                      <span>{u.full_name || "নাম অপ্রদানকৃত"}</span>
                                      {isUserAdmin && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0B2B26] text-emerald-100 shadow-2xs">
                                          এডমিন
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span>{u.email || "—"}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span>{u.phone || "—"}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                {isUserAdmin ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0B2B26] text-emerald-200 border border-emerald-900 shadow-2xs">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    <span>অ্যাডমিনিস্ট্রেটর</span>
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                    <Clock className="h-3 w-3 text-amber-700 animate-pulse" />
                                    <span>অপেক্ষমান</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                                    <span>অনুমোদিত</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.id);
                                    toast.success("User ID কপি হয়েছে");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-600 transition-colors cursor-pointer"
                                  title="ক্লিক করে আইডি কপি করুন"
                                >
                                  <span>
                                    {u.id.slice(0, 8)}...{u.id.slice(-4)}
                                  </span>
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </td>

                              <td
                                className="px-5 py-4 text-slate-600 text-xs font-medium"
                                title={u.created_at ? new Date(u.created_at).toISOString() : undefined}
                              >
                                {u.created_at
                                  ? new Date(u.created_at).toLocaleString("bn-BD", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : "—"}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isUserAdmin && isPending && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateUserStatus(u.id, "approved")}
                                      disabled={approvingUserId === u.id}
                                      className="h-8 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
                                      title="অনুমোদন দিন"
                                    >
                                      {approvingUserId === u.id ? (
                                        <>
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          <span>অনুমোদন হচ্ছে...</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          <span>অনুমোদন করুন</span>
                                        </>
                                      )}
                                    </Button>
                                  )}

                                  {!isUserAdmin && !isPending && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateUserStatus(u.id, "pending")}
                                      disabled={approvingUserId === u.id}
                                      className="h-8 px-2.5 rounded-full border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 text-xs font-medium gap-1 cursor-pointer"
                                      title="পুনরায় অপেক্ষমান তালিকায় নিন"
                                    >
                                      <Undo2 className="h-3 w-3 text-amber-700" />
                                      <span>রিভোক</span>
                                    </Button>
                                  )}

                                  {!isUserAdmin && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeletingUser(u)}
                                      className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                      title="ব্যবহারকারী মুছে ফেলুন"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ HOMEPAGE REVIEWS & TESTIMONIALS ═══════════ */}
          {activeTab === "homepage_reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {homepageReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-[1.8rem] p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 flex items-center justify-center font-bold text-base">
                          {r.name?.charAt(0) || "র"}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#051F20]">{r.name}</h3>
                          <div className="text-xs text-muted-foreground">{r.location || "বাংলাদেশ"}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Order: {r.sort_order}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic bg-rose-50/40 p-3 rounded-2xl border border-rose-100/60 leading-relaxed">
                      "{r.quote}"
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingHomeRev(r);
                        setHomeRevFormOpen(true);
                      }}
                      className="w-8 h-8 rounded-full bg-[#0B2B26] text-white hover:bg-[#163832]"
                      title="সম্পাদনা"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingHomeRev(r)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* ─── Delete Opportunity Alert Dialog ──────────────────────── */}
      <AlertDialog open={!!deletingOpp} onOpenChange={(open) => !open && setDeletingOpp(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">সুযোগটি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingOpp?.name}"</strong> সম্পূর্ণভাবে মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOpp}
              disabled={deletingOppLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {deletingOppLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Blog Alert Dialog ─────────────────────────────── */}
      <AlertDialog open={!!deletingPost} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">পোস্টটি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingPost?.title}"</strong> মুছে ফেলা হলে তা আর পুনরুদ্ধার করা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">বাতিল</AlertDialogCancel>
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

      {/* ─── Delete User Alert Dialog ─────────────────────────────── */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">ব্যবহারকারী মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingUser?.full_name || deletingUser?.email}"</strong>-এর অ্যাকাউন্ট মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Enhanced Category Manager Dialog ────────────────────── */}
      <Dialog open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#051F20]">ব্লগ ক্যাটাগরি ম্যানেজার</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ক্যাটাগরি তৈরি, রিনেম এবং পোস্ট সংখ্যা অনুযায়ী ব্যবস্থাপনা করুন।
            </DialogDescription>
          </DialogHeader>

          {/* Quick Add New Category Bar */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="নতুন ক্যাটাগরির নাম..."
              className="rounded-xl text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddNewCategory();
              }}
            />
            <Button
              type="button"
              onClick={handleAddNewCategory}
              disabled={addingCatLoading || !newCatName.trim()}
              className="rounded-xl h-9 px-4 text-xs font-bold bg-[#0B2B26] hover:bg-[#163832] text-white shrink-0"
            >
              {addingCatLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>যোগ করুন</span>
            </Button>
          </div>

          {/* Categories List with Post Count & Inline Edit */}
          <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2 pt-2">
            {blogCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
            ) : (
              blogCategories.map((cat) => {
                const postCount = blogPosts.filter((p) => p.category_id === cat.id).length;
                const isEditing = editingCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl gap-3 transition-all hover:border-slate-300"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="h-8 rounded-lg text-xs bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRenameCategory(cat.id);
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveRenameCategory(cat.id)}
                          className="h-8 px-3 rounded-lg text-xs bg-[#0B2B26] text-white"
                        >
                          সেভ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategoryId(null)}
                          className="h-8 px-2 rounded-lg text-xs"
                        >
                          বাতিল
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                          <span className="font-bold text-xs text-[#051F20] truncate">{cat.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 shrink-0">
                            {postCount} টি পোস্ট
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-200"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryName(cat.name);
                            }}
                            title="রিনেম করুন"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-rose-600 hover:bg-rose-50"
                            onClick={() => setDeletingCategory(cat)}
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCategoryManagerOpen(false)}
              className="rounded-full text-xs"
            >
              বন্ধ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Category Confirmation ──────────────────────── */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">ক্যাটাগরি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingCategory?.name}"</strong> মুছে ফেললে এই ক্যাটাগরির পোস্টগুলো ক্যাটাগরিহীন হয়ে পড়বে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">বাতিল</AlertDialogCancel>
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
