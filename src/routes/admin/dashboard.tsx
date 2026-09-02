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
import { UserReviewManager } from "@/components/admin/UserReviewManager";
import { CountUp } from "@/components/CountUp";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Loader2,
  RefreshCw,
  Briefcase,
  Building2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Settings2,
  Eye,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  X,
  Menu,
  Users,
  Mail,
  Phone,
  Copy,
  Clock,
  Check,
  Undo2,
  Database,
  HardDrive,
  Server,
  CheckSquare,
  Tag,
  Bell,
  BarChart3,
  Upload,
  Zap,
  Shield,
  Wifi,
  Globe,
  ArrowUpRight,
  Image as ImageIcon,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { isAdminEmail } from "@/lib/admin";

// ─── Types ──────────────────────────────────────────────────────────
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
  file_count?: number;
  total_pretty?: string;
}

export interface StorageStats {
  db_size_bytes: number;
  db_size_pretty: string;
  buckets: StorageBucketStat[];
  total_storage_bytes?: number;
  total_storage_pretty?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────
const getUsageStatus = (percentage: number) => {
  if (percentage >= 80)
    return { bar: "bg-red-500", text: "text-red-600", track: "bg-red-100" };
  if (percentage >= 60)
    return { bar: "bg-amber-500", text: "text-amber-600", track: "bg-amber-100" };
  return { bar: "bg-emerald-500", text: "text-emerald-600", track: "bg-emerald-100" };
};

const formatStorageBytes = (bytes: number | null | undefined): string => {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return "০ MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01) return `${(bytes / 1024).toFixed(1)} KB`;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
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
  else if (amt.includes("লক্ষ") || amt.includes("লাখ") || amt.toLowerCase().includes("lakh"))
    val *= 100000;
  return val;
}

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
  if (s.includes("শেষ-সামনে") || (s.includes("শেষ") && !s.includes("শেষের দিকে")))
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

function riskBadge(riskLevel: string | null) {
  const r = (riskLevel || "").trim();
  if (r === "নিম্ন") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        নিম্ন ঝুঁকি
      </span>
    );
  }
  if (r === "উচ্চ") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        উচ্চ ঝুঁকি
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
      {r ? `${r} ঝুঁকি` : "মধ্যম ঝুঁকি"}
    </span>
  );
}

// ─── Animation variants ─────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘন্টা আগে`;
  const days = Math.floor(hours / 24);
  return `${days} দিন আগে`;
}

// ─── Route ──────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading) {
      if (!user) throw redirect({ to: "/admin/login" });
      if (!isAdminEmail(user.email)) throw redirect({ to: "/" });
    }
  },
  component: AdminDashboard,
});

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // ─── Tab ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    "overview" | "opportunities" | "blog" | "users" | "reviews"
  >("overview");
  const [reviewSubTab, setReviewSubTab] = useState<"user_reviews" | "homepage" | "company">("user_reviews");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Opportunities state ─────────────────────────────────────
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppFormOpen, setOppFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<Opportunity | null>(null);
  const [deletingOppLoading, setDeletingOppLoading] = useState(false);
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState<"all" | "active" | "ending" | "funded">("all");
  const [oppCategoryFilter, setOppCategoryFilter] = useState("all");
  const [oppSortBy, setOppSortBy] = useState<"latest" | "name" | "amount">("latest");
  const [oppPage, setOppPage] = useState(1);
  const [selectedOppIds, setSelectedOppIds] = useState<Set<string>>(new Set());

  // ─── Testimonials state ──────────────────────────────────────
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testLoading, setTestLoading] = useState(true);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Testimonial | null>(null);
  const [deletingTest, setDeletingTest] = useState<Testimonial | null>(null);
  const [deletingTestLoading, setDeletingTestLoading] = useState(false);

  // ─── Homepage Reviews state ──────────────────────────────────
  const [homepageReviews, setHomepageReviews] = useState<HomepageReview[]>([]);
  const [homeRevLoading, setHomeRevLoading] = useState(true);
  const [homeRevFormOpen, setHomeRevFormOpen] = useState(false);
  const [editingHomeRev, setEditingHomeRev] = useState<HomepageReview | null>(null);
  const [deletingHomeRev, setDeletingHomeRev] = useState<HomepageReview | null>(null);
  const [deletingHomeRevLoading, setDeletingHomeRevLoading] = useState(false);

  // ─── Users state ─────────────────────────────────────────────
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [userSearch, setUserSearch] = useState("");
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null);

  // ─── Storage stats state ─────────────────────────────────────
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);

  // ─── Blog state ──────────────────────────────────────────────
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
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("all");
  const [blogPage, setBlogPage] = useState(1);
  const [selectedBlogIds, setSelectedBlogIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ════════════════════════════════════════════════════════════════
  // ALL FETCH, HANDLER, AND EFFECT LOGIC — UNCHANGED
  // ════════════════════════════════════════════════════════════════
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
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select(`
          *,
          opportunities (
            id,
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Joined testimonials fetch failed, trying standard select:", error.message);
        const { data: standardData, error: standardErr } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        if (standardErr) throw standardErr;
        setTestimonials((standardData as any) ?? []);
      } else {
        setTestimonials((data as any) ?? []);
      }
    } catch (err: any) {
      console.error("Error fetching testimonials:", err);
      setTestimonials([]);
      toast.error("টেস্টিমোনিয়াল লোড হয়নি");
    } finally {
      setTestLoading(false);
    }
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
            id: p.id, email: "—", full_name: p.full_name,
            phone: p.phone, status: p.status || "pending", created_at: p.created_at,
          }))
        );
      } else {
        setDashboardUsers(
          ((data as any[]) || []).map((u: any) => ({
            id: u.id, email: u.email || null, full_name: u.full_name || null,
            phone: u.phone || null, status: u.status || "pending", created_at: u.created_at,
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
      if (error) console.warn("get_storage_stats RPC failed:", error.message);
      else if (data) setStorageStats(data as StorageStats);
    } catch (err: any) {
      console.error("Error fetching storage stats:", err);
    } finally {
      setStorageLoading(false);
    }
  }, []);

  const handleUpdateUserStatus = async (userId: string, newStatus: "pending" | "approved") => {
    setApprovingUserId(userId);
    try {
      const { error: rpcError } = await supabase.rpc("admin_update_user_status" as any, {
        target_user_id: userId, new_status: newStatus,
      });
      if (rpcError) {
        console.warn("admin_update_user_status RPC failed, updating profiles directly:", rpcError.message);
        const { error: directErr } = await supabase
          .from("profiles").update({ status: newStatus }).eq("id", userId);
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
      const timer = setInterval(() => fetchStorageStats(), 60000);
      return () => clearInterval(timer);
    }
  }, [user, fetchOpportunities, fetchTestimonials, fetchHomepageReviews, fetchDashboardUsers, fetchStorageStats]);

  // ─── Filters & Sort ──────────────────────────────────────────
  const uniqueOppCategories = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => { if (o.category) set.add(o.category); });
    return Array.from(set).sort();
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        if (oppSearch) {
          const q = oppSearch.toLowerCase();
          if (!(opp.name || "").toLowerCase().includes(q) &&
              !(opp.category || "").toLowerCase().includes(q) &&
              !(opp.slug || "").toLowerCase().includes(q)) return false;
        }
        if (oppStatusFilter !== "all") {
          const s = (opp.status || "").toLowerCase();
          if (oppStatusFilter === "active" && !s.includes("চলমান")) return false;
          if (oppStatusFilter === "ending" && !s.includes("শেষের দিকে")) return false;
          if (oppStatusFilter === "funded" && !(s.includes("শেষ") && !s.includes("শেষের দিকে"))) return false;
        }
        if (oppCategoryFilter !== "all" && opp.category !== oppCategoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (oppSortBy === "name") return (a.name || "").localeCompare(b.name || "", "bn");
        if (oppSortBy === "amount") return parseAmountNumber(b.investment_amount) - parseAmountNumber(a.investment_amount);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [opportunities, oppSearch, oppStatusFilter, oppCategoryFilter, oppSortBy]);

  const totalOppPages = Math.max(1, Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE));
  const paginatedOpportunities = useMemo(() => {
    const s = (oppPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(s, s + ITEMS_PER_PAGE);
  }, [filteredOpportunities, oppPage]);

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      if (blogSearch) {
        const q = blogSearch.toLowerCase();
        if (!(post.title || "").toLowerCase().includes(q) &&
            !(post.author_name || "").toLowerCase().includes(q) &&
            !(post.category?.name || "").toLowerCase().includes(q)) return false;
      }
      if (blogStatusFilter !== "all" && post.status !== blogStatusFilter) return false;
      if (blogCategoryFilter !== "all" && post.category_id !== blogCategoryFilter) return false;
      return true;
    });
  }, [blogPosts, blogSearch, blogStatusFilter, blogCategoryFilter]);

  const totalBlogPages = Math.max(1, Math.ceil(filteredBlogPosts.length / ITEMS_PER_PAGE));
  const paginatedBlogPosts = useMemo(() => {
    const s = (blogPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogPosts.slice(s, s + ITEMS_PER_PAGE);
  }, [filteredBlogPosts, blogPage]);

  const filteredUsers = useMemo(() => {
    return dashboardUsers.filter((u) => {
      if (userSearch) {
        const q = userSearch.toLowerCase();
        if (!(u.full_name || "").toLowerCase().includes(q) &&
            !(u.email || "").toLowerCase().includes(q) &&
            !(u.phone || "").toLowerCase().includes(q)) return false;
      }
      if (userStatusFilter !== "all" && (u.status || "pending") !== userStatusFilter) return false;
      return true;
    });
  }, [dashboardUsers, userSearch, userStatusFilter]);

  // ─── Bulk Actions ────────────────────────────────────────────
  const toggleSelectAllOpps = () => {
    setSelectedOppIds(selectedOppIds.size === paginatedOpportunities.length ? new Set() : new Set(paginatedOpportunities.map((o) => o.id)));
  };
  const toggleSelectOpp = (id: string) => {
    setSelectedOppIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBulkDeleteOpps = async () => {
    if (selectedOppIds.size === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selectedOppIds.size} টি সুযোগ মুছে ফেলতে চান?`)) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedOppIds);
      const { error } = await supabase.from("opportunities").delete().in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি সুযোগ সফলভাবে মুছে ফেলা হয়েছে`);
      setSelectedOppIds(new Set()); fetchOpportunities();
    } catch (err: any) { toast.error("মুছে ফেলতে সমস্যা: " + err.message); }
    finally { setBulkActionLoading(false); }
  };
  const handleBulkUpdateOppStatus = async (newStatus: string) => {
    if (selectedOppIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedOppIds);
      const { error } = await supabase.from("opportunities").update({ status: newStatus }).in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি সুযোগের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে`);
      setSelectedOppIds(new Set()); fetchOpportunities();
    } catch (err: any) { toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message); }
    finally { setBulkActionLoading(false); }
  };
  const toggleSelectAllBlogs = () => {
    setSelectedBlogIds(selectedBlogIds.size === paginatedBlogPosts.length ? new Set() : new Set(paginatedBlogPosts.map((b) => b.id)));
  };
  const toggleSelectBlog = (id: string) => {
    setSelectedBlogIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBulkDeleteBlogs = async () => {
    if (selectedBlogIds.size === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selectedBlogIds.size} টি ব্লগ মুছে ফেলতে চান?`)) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedBlogIds);
      const { error } = await supabase.from("blog_posts").delete().in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি ব্লগ পোস্ট সফলভাবে মুছে ফেলা হয়েছে`);
      setSelectedBlogIds(new Set()); refetchBlogPosts();
    } catch (err: any) { toast.error("মুছে ফেলতে সমস্যা: " + err.message); }
    finally { setBulkActionLoading(false); }
  };
  const handleBulkUpdateBlogStatus = async (newStatus: "published" | "draft") => {
    if (selectedBlogIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedBlogIds);
      const payload: any = { status: newStatus };
      if (newStatus === "published") payload.published_at = new Date().toISOString();
      const { error } = await supabase.from("blog_posts").update(payload).in("id", ids);
      if (error) throw error;
      toast.success(`${ids.length} টি ব্লগের স্ট্যাটাস সফলভাবে পরিবর্তন হয়েছে`);
      setSelectedBlogIds(new Set()); refetchBlogPosts();
    } catch (err: any) { toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message); }
    finally { setBulkActionLoading(false); }
  };
  const handleToggleBlogStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      const payload: any = { status: nextStatus };
      if (nextStatus === "published" && !post.published_at) payload.published_at = new Date().toISOString();
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
      if (error) throw error;
      toast.success(nextStatus === "published" ? "পোস্ট পাবলিশ হয়েছে" : "পোস্ট ড্রাফট করা হয়েছে");
      refetchBlogPosts();
    } catch (err: any) { toast.error("স্ট্যাটাস পরিবর্তনে সমস্যা: " + err.message); }
  };

  // ─── Category Management ─────────────────────────────────────
  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCatLoading(true);
    try {
      const slug = newCatName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}\-]+/gu, "");
      const { error } = await supabase.from("blog_categories").insert({ name: newCatName.trim(), slug });
      if (error) throw error;
      toast.success("নতুন ক্যাটাগরি যুক্ত হয়েছে"); setNewCatName(""); refetchCategories();
    } catch (err: any) { toast.error("ক্যাটাগরি যুক্ত করতে সমস্যা: " + err.message); }
    finally { setAddingCatLoading(false); }
  };
  const handleSaveRenameCategory = async (catId: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const { error } = await supabase.from("blog_categories").update({ name: editingCategoryName.trim() }).eq("id", catId);
      if (error) throw error;
      toast.success("ক্যাটাগরির নাম সফলভাবে পরিবর্তিত হয়েছে"); setEditingCategoryId(null); refetchCategories();
    } catch (err: any) { toast.error("ক্যাটাগরি রিনেম করতে সমস্যা: " + err.message); }
  };

  // ─── Single Delete handlers ──────────────────────────────────
  const handleDeleteOpp = async () => {
    if (!deletingOpp) return; setDeletingOppLoading(true);
    try {
      const { error } = await supabase.from("opportunities").delete().eq("id", deletingOpp.id);
      if (error) throw error;
      toast.success("সুযোগ সফলভাবে মুছে ফেলা হয়েছে"); setDeletingOpp(null); fetchOpportunities();
    } catch (err: any) { toast.error("মুছে ফেলতে সমস্যা হয়েছে: " + err.message); }
    finally { setDeletingOppLoading(false); }
  };
  const handleDeletePost = async () => {
    if (!deletingPost) return; setDeletingPostLoading(true);
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", deletingPost.id);
      if (error) throw error;
      toast.success("পোস্ট সফলভাবে মুছে ফেলা হয়েছে"); setDeletingPost(null); refetchBlogPosts();
    } catch (err: any) { toast.error("পোস্ট মুছতে সমস্যা হয়েছে: " + err.message); }
    finally { setDeletingPostLoading(false); }
  };
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return; setDeletingCategoryLoading(true);
    try {
      const { error } = await supabase.from("blog_categories").delete().eq("id", deletingCategory.id);
      if (error) throw error;
      toast.success("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে"); setDeletingCategory(null); refetchCategories();
    } catch (err: any) { toast.error("ক্যাটাগরি মুছতে সমস্যা হয়েছে: " + err.message); }
    finally { setDeletingCategoryLoading(false); }
  };
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const { error } = await supabase.rpc("admin_delete_user" as any, { target_user_id: deletingUser.id });
      if (error) {
        const { error: directErr } = await supabase.from("profiles").delete().eq("id", deletingUser.id);
        if (directErr) throw directErr;
      }
      toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে"); setDeletingUser(null); fetchDashboardUsers();
    } catch (err: any) { toast.error("মুছতে সমস্যা হয়েছে: " + err.message); }
  };

  const handleReorderHomepageReview = async (review: HomepageReview, direction: "up" | "down") => {
    const currentOrder = review.sort_order ?? 0;
    const newOrder = direction === "up" ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    try {
      const { error } = await supabase
        .from("homepage_reviews")
        .update({ sort_order: newOrder })
        .eq("id", review.id);
      if (error) throw error;
      toast.success("সর্ট অর্ডার আপডেট হয়েছে");
      fetchHomepageReviews();
    } catch (err: any) {
      toast.error("সর্ট অর্ডার পরিবর্তনে সমস্যা: " + err.message);
    }
  };

  const handleDeleteTest = async () => {
    if (!deletingTest) return;
    setDeletingTestLoading(true);
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", deletingTest.id);
      if (error) throw error;
      toast.success("প্রশংসাপত্র সফলভাবে মুছে ফেলা হয়েছে");
      setDeletingTest(null);
      fetchTestimonials();
    } catch (err: any) {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setDeletingTestLoading(false);
    }
  };

  const handleDeleteHomeRev = async () => {
    if (!deletingHomeRev) return;
    setDeletingHomeRevLoading(true);
    try {
      const { error } = await supabase.from("homepage_reviews").delete().eq("id", deletingHomeRev.id);
      if (error) throw error;
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
      setDeletingHomeRev(null);
      fetchHomepageReviews();
    } catch (err: any) {
      toast.error("মুছতে সমস্যা: " + err.message);
    } finally {
      setDeletingHomeRevLoading(false);
    }
  };

  const handleRefreshCurrent = () => {
    fetchStorageStats();
    if (activeTab === "opportunities" || activeTab === "overview") fetchOpportunities();
    if (activeTab === "blog" || activeTab === "overview") { refetchBlogPosts(); refetchCategories(); }
    if (activeTab === "reviews" || activeTab === "overview") { fetchHomepageReviews(); fetchTestimonials(); }
    if (activeTab === "users" || activeTab === "overview") fetchDashboardUsers();
  };

  // ─── Derived data for overview charts ─────────────────────────
  const pendingUsersCount = useMemo(() => dashboardUsers.filter((u) => (u.status || "pending") === "pending").length, [dashboardUsers]);

  const oppStatusBreakdown = useMemo(() => {
    let active = 0, ending = 0, funded = 0, other = 0;
    opportunities.forEach((o) => {
      const s = (o.status || "").toLowerCase();
      if (s.includes("চলমান")) active++;
      else if (s.includes("শেষের দিকে")) ending++;
      else if (s.includes("শেষ")) funded++;
      else other++;
    });
    return { active, ending, funded, other };
  }, [opportunities]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    opportunities.forEach((o) => {
      const cat = o.category || "অন্যান্য";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 12) + "…" : name, count, fullName: name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [opportunities]);

  // mini sparkline data (fake months from existing data)
  const oppSparkline = useMemo(() => {
    const months: Record<string, number> = {};
    opportunities.forEach((o) => {
      if (o.created_at) {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = (months[key] || 0) + 1;
      }
    });
    return Object.entries(months).sort().slice(-6).map(([m, v]) => ({ m, v }));
  }, [opportunities]);

  const userSparkline = useMemo(() => {
    const now = Date.now();
    const days: number[] = Array(7).fill(0);
    dashboardUsers.forEach((u) => {
      if (u.created_at) {
        const diff = Math.floor((now - new Date(u.created_at).getTime()) / 86400000);
        if (diff >= 0 && diff < 7) days[6 - diff]++;
      }
    });
    return days.map((v, i) => ({ d: i, v }));
  }, [dashboardUsers]);

  const recentUsers = useMemo(() => {
    return [...dashboardUsers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [dashboardUsers]);

  const publishedBlogCount = useMemo(() => blogPosts.filter((p) => p.status === "published").length, [blogPosts]);
  const draftBlogCount = useMemo(() => blogPosts.filter((p) => p.status === "draft").length, [blogPosts]);

  // ─── Loading guard ───────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f2]">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white shadow-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a6b4a]" />
          <p className="text-sm font-semibold text-[#1a6b4a]">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SIDEBAR NAV ITEMS
  // ═══════════════════════════════════════════════════════════════
  const navItems = [
    { id: "overview" as const, icon: BarChart3, label: "ওভারভিউ" },
    { id: "opportunities" as const, icon: Briefcase, label: "সুযোগসমূহ" },
    { id: "blog" as const, icon: BookOpen, label: "ব্লগ" },
    { id: "users" as const, icon: Users, label: "ব্যবহারকারী" },
    { id: "reviews" as const, icon: Star, label: "রিভিউ" },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex min-h-screen bg-[#f0f4f2]">
        {/* ═══════════ ICON SIDEBAR (72px) ═══════════ */}
        <aside className="hidden lg:flex flex-col items-center w-[72px] bg-[#0f3d2e] py-6 px-0 shrink-0 fixed top-0 left-0 h-screen z-40">
          {/* Logo */}
          <Link to="/" className="mb-8 group">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-lg group-hover:bg-white/20 transition-colors">
              বি
            </div>
          </Link>

          {/* Nav Icons */}
          <nav className="flex-1 flex flex-col items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white text-[#0f3d2e] shadow-lg shadow-black/10"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#0f3d2e] text-white border-none text-xs font-bold px-3 py-1.5">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Bottom Admin Avatar */}
          <div className="mt-auto flex flex-col items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#0f3d2e] text-white border-none text-xs font-bold">
                লগআউট
              </TooltipContent>
            </Tooltip>

            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs border-2 border-emerald-300">
              {(user.email || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </aside>

        {/* ═══════════ MAIN WRAPPER (offset for sidebar) ═══════════ */}
        <div className="flex-1 lg:ml-[72px] flex flex-col min-h-screen">
          {/* ═══════════ TOP BAR ═══════════ */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200/60 px-5 sm:px-7 py-3.5 flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-full h-9 w-9"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="খুঁজুন বা কমান্ড টাইপ করুন..."
                className="pl-10 pr-4 h-10 rounded-xl bg-gray-50 border-gray-200/80 text-sm focus:bg-white"
                value={activeTab === "opportunities" ? oppSearch : activeTab === "blog" ? blogSearch : activeTab === "users" ? userSearch : ""}
                onChange={(e) => {
                  if (activeTab === "opportunities") { setOppSearch(e.target.value); setOppPage(1); }
                  else if (activeTab === "blog") { setBlogSearch(e.target.value); setBlogPage(1); }
                  else if (activeTab === "users") setUserSearch(e.target.value);
                }}
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshCurrent}
                className="rounded-full h-9 w-9 text-gray-500 hover:text-[#1a6b4a] hover:bg-emerald-50"
              >
                <RefreshCw className={`h-4 w-4 ${oppLoading || blogLoading || usersLoading ? "animate-spin" : ""}`} />
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Bell className="h-4 w-4 text-gray-500" />
                    {pendingUsersCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#f59e0b] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {pendingUsersCount}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  {pendingUsersCount > 0 ? `${pendingUsersCount} জন অপেক্ষমান` : "কোনো মুলতুবি নেই"}
                </TooltipContent>
              </Tooltip>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
                <span className="text-xs font-semibold text-[#111827] truncate max-w-[140px]">
                  {user.email?.split("@")[0] || "Admin"}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#1a6b4a] text-white flex items-center justify-center text-xs font-bold">
                  {(user.email || "A").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Mobile nav dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === item.id
                        ? "bg-[#1a6b4a] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ═══════════ CONTENT AREA ═══════════ */}
          <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-x-hidden">

            {/* ═══════════ OVERVIEW BENTO GRID ═══════════ */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">ড্যাশবোর্ড</h1>
                    <p className="text-sm text-[#6b7280] mt-0.5">বিনিয়োগ প্ল্যাটফর্মের সামগ্রিক অবস্থা</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {/* ─── Card 1: সুযোগ সমূহ (col-span-2) ─────────── */}
                  <motion.div
                    custom={0} variants={cardVariant} initial="hidden" animate="visible"
                    className="md:col-span-2 bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-[#6b7280] mb-1">সুযোগ সমূহ</p>
                        <div className="text-4xl font-bold text-[#111827]">
                          <CountUp to={opportunities.length} bengali={false} duration={0.8} />
                        </div>
                      </div>
                      <div className="w-28 h-14">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={oppSparkline}>
                            <Line type="monotone" dataKey="v" stroke="#1a6b4a" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <Button
                        size="sm"
                        onClick={() => { setEditingOpp(null); setOppFormOpen(true); }}
                        className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold gap-1.5 h-9 px-4 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> নতুন সুযোগ
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setActiveTab("opportunities")}
                        className="rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 border-gray-200 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" /> স্ট্যাটাস পরিবর্তন
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => { setEditingOpp(null); setOppFormOpen(true); }}
                        className="rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 border-gray-200 cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" /> ছবি আপলোড
                      </Button>
                    </div>

                    {/* Status Breakdown Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-[11px] font-semibold text-[#6b7280]">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> চলমান ({oppStatusBreakdown.active})</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> শেষের দিকে ({oppStatusBreakdown.ending})</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Funded ({oppStatusBreakdown.funded})</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 flex overflow-hidden">
                        {opportunities.length > 0 && (
                          <>
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(oppStatusBreakdown.active / opportunities.length) * 100}%` }} />
                            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(oppStatusBreakdown.ending / opportunities.length) * 100}%` }} />
                            <div className="bg-slate-400 h-full transition-all duration-500" style={{ width: `${(oppStatusBreakdown.funded / opportunities.length) * 100}%` }} />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── Card 2: মুলতুবি ব্যবহারকারী ─────────────── */}
                  <motion.div
                    custom={1} variants={cardVariant} initial="hidden" animate="visible"
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-transform duration-200"
                  >
                    <p className="text-sm font-semibold text-[#6b7280] mb-3">মুলতুবি ব্যবহারকারী</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl font-bold text-[#f59e0b]">
                        <CountUp to={pendingUsersCount} bengali={false} duration={0.8} />
                      </div>
                      {pendingUsersCount > 0 && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f59e0b]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b7280] mb-4">অনুমোদনের অপেক্ষায়</p>
                    <Button
                      size="sm"
                      onClick={() => { setActiveTab("users"); setUserStatusFilter("pending"); }}
                      className="rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold h-9 px-4 gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> এখনই দেখুন
                    </Button>
                  </motion.div>

                  {/* ─── Card 3: নিবন্ধন (sparkline) ──────────────── */}
                  <motion.div
                    custom={2} variants={cardVariant} initial="hidden" animate="visible"
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[#6b7280] mb-1">নিবন্ধন</p>
                        <div className="text-4xl font-bold text-[#1a6b4a]">
                          <CountUp to={dashboardUsers.length} bengali={false} duration={0.8} />
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span>মোট ব্যবহারকারী</span>
                        </p>
                      </div>
                      <div className="w-20 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userSparkline}>
                            <Line type="monotone" dataKey="v" stroke="#1a6b4a" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── Card 4: ব্লগ পোস্ট ─────────────────────── */}
                  <motion.div
                    custom={3} variants={cardVariant} initial="hidden" animate="visible"
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-transform duration-200"
                  >
                    <p className="text-sm font-semibold text-[#6b7280] mb-1">ব্লগ পোস্ট</p>
                    <div className="text-4xl font-bold text-[#111827] mb-2">
                      <CountUp to={blogPosts.length} bengali={false} duration={0.8} />
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> {publishedBlogCount} প্রকাশিত
                      </span>
                      <span className="flex items-center gap-1.5 text-[#6b7280] font-medium">
                        <Clock className="h-3 w-3" /> {draftBlogCount} ড্রাফট
                      </span>
                    </div>
                  </motion.div>

                  {/* ─── Card 5: রিভিউ ────────────────────────────── */}
                  <motion.div
                    custom={4} variants={cardVariant} initial="hidden" animate="visible"
                    onClick={() => setActiveTab("reviews")}
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-[#6b7280] mb-1">রিভিউ ও প্রশংসাপত্র</p>
                    <div className="text-4xl font-bold text-[#111827] mb-2">
                      <CountUp to={testimonials.length + homepageReviews.length} bengali={false} duration={0.8} />
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-[#6b7280]">5.0 গড়</span>
                    </div>
                  </motion.div>

                  {/* ─── Card 6: ক্যাটাগরি বিতরণ (col-span-2) ──── */}
                  <motion.div
                    custom={5} variants={cardVariant} initial="hidden" animate="visible"
                    className="md:col-span-2 bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-base font-semibold text-[#111827]">সুযোগ ক্যাটাগরি বিতরণ</p>
                        <p className="text-xs text-[#6b7280]">ক্যাটাগরি অনুযায়ী সুযোগের সংখ্যা</p>
                      </div>
                    </div>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryDistribution} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                            formatter={(value: number, _name: string, props: any) => [`${value} টি সুযোগ`, props.payload.fullName]}
                          />
                          <Bar dataKey="count" fill="#1a6b4a" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* ─── Card 7: Storage ব্যবহার ─────────────────── */}
                  <motion.div
                    custom={6} variants={cardVariant} initial="hidden" animate="visible"
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-base font-semibold text-[#111827]">Storage ব্যবহার</p>
                      <button onClick={() => fetchStorageStats()} disabled={storageLoading} className="text-[#6b7280] hover:text-[#1a6b4a] cursor-pointer">
                        <RefreshCw className={`h-3.5 w-3.5 ${storageLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    {/* Database */}
                    {(() => {
                      const dbB = storageStats?.db_size_bytes || 0;
                      const dbMax = 500 * 1024 * 1024;
                      const dbPct = Math.min(100, Math.max(0, (dbB / dbMax) * 100));
                      const dbS = getUsageStatus(dbPct);
                      const dbFormatted = dbB > 0 ? (storageStats?.db_size_pretty || formatStorageBytes(dbB)) : "০ MB";
                      return (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-[#111827] flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-[#6b7280]" /> ডেটাবেজ</span>
                            <span className="font-mono text-[11px] text-[#6b7280]">{dbFormatted} / 500 MB</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${dbS.bar} rounded-full transition-all duration-500`} style={{ width: `${Math.max(dbPct > 0 ? 2 : 0, dbPct)}%` }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Buckets */}
                    {(() => {
                      const buckets = Array.isArray(storageStats?.buckets) ? storageStats.buckets : [];
                      const oppBucket = buckets.find((b) => b.bucket_id === "opportunity-images");
                      const blogBucket = buckets.find((b) => b.bucket_id === "blog-images");
                      const otherBuckets = buckets.filter(
                        (b) => b.bucket_id !== "opportunity-images" && b.bucket_id !== "blog-images"
                      );

                      const oppSize = oppBucket && oppBucket.total_bytes > 0
                        ? (oppBucket.total_pretty || formatStorageBytes(oppBucket.total_bytes))
                        : "০ MB";
                      const blogSize = blogBucket && blogBucket.total_bytes > 0
                        ? (blogBucket.total_pretty || formatStorageBytes(blogBucket.total_bytes))
                        : "০ MB";

                      const totalB = storageStats?.total_storage_bytes ?? buckets.reduce((acc, b) => acc + (b.total_bytes || 0), 0);
                      const maxB = 1024 * 1024 * 1024;
                      const pct = Math.min(100, Math.max(0, (totalB / maxB) * 100));
                      const s = getUsageStatus(pct);
                      const totalFormatted = totalB > 0 ? (storageStats?.total_storage_pretty || formatStorageBytes(totalB)) : "০ MB";

                      return (
                        <>
                          <div className="space-y-2.5 mb-4 text-xs">
                            <div className="flex justify-between text-[#6b7280]">
                              <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> opportunity-images</span>
                              <span className="font-mono font-semibold text-[#111827]">{oppSize}</span>
                            </div>
                            <div className="flex justify-between text-[#6b7280]">
                              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> blog-images</span>
                              <span className="font-mono font-semibold text-[#111827]">{blogSize}</span>
                            </div>
                            {otherBuckets.map((b) => (
                              <div key={b.bucket_id} className="flex justify-between text-[#6b7280]">
                                <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> {b.bucket_id}</span>
                                <span className="font-mono font-semibold text-[#111827]">
                                  {b.total_bytes > 0 ? (b.total_pretty || formatStorageBytes(b.total_bytes)) : "০ MB"}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-[#111827]">মোট Storage</span>
                              <span className="font-mono text-[11px] text-[#6b7280]">{totalFormatted} / 1 GB</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${s.bar} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct > 0 ? 2 : 0, pct)}%` }} />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>

                  {/* ─── Card 8: সাম্প্রতিক নিবন্ধন (col-span-2) ─ */}
                  <motion.div
                    custom={7} variants={cardVariant} initial="hidden" animate="visible"
                    className="md:col-span-2 bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-base font-semibold text-[#111827]">সাম্প্রতিক নিবন্ধন</p>
                      <Button variant="link" size="sm" onClick={() => setActiveTab("users")} className="text-xs font-bold text-[#1a6b4a] cursor-pointer gap-1">
                        সব দেখুন <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {recentUsers.map((u) => {
                        const isPending = (u.status || "pending") === "pending";
                        return (
                          <div key={u.id} className="flex items-center justify-between py-3.5 gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#111827] truncate">{u.full_name || "নামহীন"}</p>
                                <p className="text-[11px] text-[#6b7280] truncate">{u.email || "—"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] text-[#6b7280] hidden sm:inline">{timeAgo(u.created_at)}</span>
                              {isPending ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateUserStatus(u.id, "approved")}
                                  disabled={approvingUserId === u.id}
                                  className="rounded-lg h-7 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                                >
                                  {approvingUserId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                  অনুমোদন
                                </Button>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> অনুমোদিত
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {recentUsers.length === 0 && (
                        <p className="py-8 text-center text-sm text-[#6b7280]">কোনো ব্যবহারকারী নেই</p>
                      )}
                    </div>
                  </motion.div>

                  {/* ─── Card 9: সিস্টেম স্ট্যাটাস ─────────────── */}
                  <motion.div
                    custom={8} variants={cardVariant} initial="hidden" animate="visible"
                    className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    <p className="text-base font-semibold text-[#111827] mb-5">সিস্টেম স্ট্যাটাস</p>
                    <div className="space-y-4">
                      {[
                        { name: "Database", icon: Database },
                        { name: "Auth", icon: Shield },
                        { name: "Storage", icon: HardDrive },
                        { name: "Vercel", icon: Globe },
                      ].map((svc) => (
                        <div key={svc.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-sm text-[#111827] font-medium">
                            <svc.icon className="h-4 w-4 text-[#6b7280]" />
                            <span>{svc.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>সক্রিয়</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-[#6b7280]">
                      শেষ আপডেট: {new Date().toLocaleTimeString("bn-BD")}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* ═══════════ OPPORTUNITIES TAB (full list) ═══════════ */}
            {activeTab === "opportunities" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h1 className="text-2xl font-bold text-[#111827]">সুযোগসমূহ <Badge className="ml-2 bg-emerald-100 text-emerald-800 text-xs font-bold border-none">{filteredOpportunities.length}</Badge></h1>
                  <Button size="sm" onClick={() => { setEditingOpp(null); setOppFormOpen(true); }} className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold gap-1.5 h-9 px-4 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> নতুন সুযোগ
                  </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {[{ id: "all", l: "সব" }, { id: "active", l: "চলমান" }, { id: "ending", l: "শেষের দিকে" }, { id: "funded", l: "Funded" }].map((st) => (
                      <button key={st.id} onClick={() => { setOppStatusFilter(st.id as any); setOppPage(1); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${oppStatusFilter === st.id ? "bg-[#1a6b4a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {st.l}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={oppCategoryFilter} onValueChange={(v) => { setOppCategoryFilter(v); setOppPage(1); }}>
                      <SelectTrigger className="rounded-lg bg-gray-50 text-xs h-9 w-[140px]"><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
                      <SelectContent className="rounded-xl text-xs">
                        <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                        {uniqueOppCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={oppSortBy} onValueChange={(v) => { setOppSortBy(v as any); setOppPage(1); }}>
                      <SelectTrigger className="rounded-lg bg-gray-50 text-xs h-9 w-[120px]"><SelectValue placeholder="সর্ট" /></SelectTrigger>
                      <SelectContent className="rounded-xl text-xs">
                        <SelectItem value="latest">সর্বশেষ</SelectItem>
                        <SelectItem value="name">নাম</SelectItem>
                        <SelectItem value="amount">পরিমাণ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk bar */}
                {selectedOppIds.size > 0 && (
                  <div className="bg-[#0f3d2e] text-white p-3 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in-50">
                    <span className="text-xs font-bold flex items-center gap-2"><CheckSquare className="h-4 w-4 text-emerald-400" /> {selectedOppIds.size} নির্বাচিত</span>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(val) => handleBulkUpdateOppStatus(val)}>
                        <SelectTrigger className="rounded-lg bg-white/10 text-white border-white/20 text-xs h-8 w-[160px]"><SelectValue placeholder="স্ট্যাটাস পরিবর্তন" /></SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="বিনিয়োগ নেওয়া চলমান-সুযোগ আছে">চলমান</SelectItem>
                          <SelectItem value="বিনিয়োগ নেওয়া শেষের দিকে">শেষের দিকে</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={handleBulkDeleteOpps} disabled={bulkActionLoading} className="rounded-lg h-8 px-3 text-xs font-bold gap-1">
                        {bulkActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} মুছুন
                      </Button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  {oppLoading ? (
                    <div className="p-6 space-y-4">{[1,2,3,4,5].map((i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-11 w-11 rounded-xl" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-8 w-20 rounded-lg" /></div>)}</div>
                  ) : paginatedOpportunities.length === 0 ? (
                    <div className="py-16 text-center text-[#6b7280]"><Briefcase className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="font-semibold text-sm">কোনো সুযোগ পাওয়া যায়নি</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3.5 w-10"><Checkbox checked={paginatedOpportunities.length > 0 && selectedOppIds.size === paginatedOpportunities.length} onCheckedChange={toggleSelectAllOpps} /></th>
                            <th className="px-4 py-3.5">সুযোগ</th>
                            <th className="px-4 py-3.5">ক্যাটাগরি</th>
                            <th className="px-4 py-3.5">ঝুঁকির মাত্রা</th>
                            <th className="px-4 py-3.5">বিনিয়োগ</th>
                            <th className="px-4 py-3.5">মুনাফা</th>
                            <th className="px-4 py-3.5">স্ট্যাটাস</th>
                            <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedOpportunities.map((opp) => (
                            <tr key={opp.id} className={`hover:bg-gray-50/60 transition-colors ${selectedOppIds.has(opp.id) ? "bg-emerald-50/40" : ""}`}>
                              <td className="px-4 py-3.5"><Checkbox checked={selectedOppIds.has(opp.id)} onCheckedChange={() => toggleSelectOpp(opp.id)} /></td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                    {opp.image_urls?.[0] ? <img src={opp.image_urls[0]} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-[#1a6b4a]">{opp.name?.charAt(0)}</span>}
                                  </div>
                                  <div className="min-w-0"><p className="font-bold text-[#111827] text-sm truncate max-w-[220px]">{opp.name}</p><p className="text-[11px] text-[#6b7280] font-mono truncate">/{opp.slug}</p></div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5"><span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700">{opp.category || "—"}</span></td>
                              <td className="px-4 py-3.5">{riskBadge(opp.risk_level)}</td>
                              <td className="px-4 py-3.5 font-bold text-[#111827]">{opp.investment_amount || "—"}</td>
                              <td className="px-4 py-3.5 font-semibold text-emerald-700">{opp.expected_profit || "—"}</td>
                              <td className="px-4 py-3.5">{statusBadge(opp.status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" asChild className="w-8 h-8 rounded-lg hover:bg-gray-100"><Link to={`/opportunities/${opp.slug}`} target="_blank"><Eye className="h-3.5 w-3.5 text-[#6b7280]" /></Link></Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setEditingOpp(opp); setOppFormOpen(true); }} className="w-8 h-8 rounded-lg hover:bg-gray-100"><Pencil className="h-3.5 w-3.5 text-[#6b7280]" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => setDeletingOpp(opp)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {totalOppPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#6b7280]">
                      <span>পৃষ্ঠা {oppPage} / {totalOppPages}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={oppPage <= 1} onClick={() => setOppPage((p) => Math.max(1, p-1))} className="h-8 rounded-lg text-xs"><ChevronLeft className="h-3.5 w-3.5 mr-1" />আগের</Button>
                        <Button variant="outline" size="sm" disabled={oppPage >= totalOppPages} onClick={() => setOppPage((p) => Math.min(totalOppPages, p+1))} className="h-8 rounded-lg text-xs">পরের<ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════ BLOG TAB ═══════════ */}
            {activeTab === "blog" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h1 className="text-2xl font-bold text-[#111827]">ব্লগ আর্টিকেল <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs font-bold border-none">{filteredBlogPosts.length}</Badge></h1>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCategoryManagerOpen(true)} className="rounded-xl text-xs font-semibold h-9 gap-1.5 border-gray-200 cursor-pointer"><Settings2 className="h-3.5 w-3.5" /> ক্যাটাগরি</Button>
                    <Button size="sm" asChild className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold gap-1.5 h-9 px-4 cursor-pointer"><Link to="/admin/dashboard/blog/new"><Plus className="h-3.5 w-3.5" /> নতুন পোস্ট</Link></Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {[{ id: "all", l: "সব" }, { id: "published", l: "প্রকাশিত" }, { id: "draft", l: "ড্রাফট" }].map((st) => (
                      <button key={st.id} onClick={() => { setBlogStatusFilter(st.id as any); setBlogPage(1); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${blogStatusFilter === st.id ? "bg-[#1a6b4a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {st.l}
                      </button>
                    ))}
                  </div>
                  <Select value={blogCategoryFilter} onValueChange={(v) => { setBlogCategoryFilter(v); setBlogPage(1); }}>
                    <SelectTrigger className="rounded-lg bg-gray-50 text-xs h-9 w-[160px]"><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                      {blogCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBlogIds.size > 0 && (
                  <div className="bg-[#0f3d2e] text-white p-3 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in-50">
                    <span className="text-xs font-bold">{selectedBlogIds.size} নির্বাচিত</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleBulkUpdateBlogStatus("published")} className="rounded-lg h-8 px-3 text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800">পাবলিশ</Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkUpdateBlogStatus("draft")} className="rounded-lg h-8 px-3 text-xs font-bold bg-white/10 text-white border-white/20 hover:bg-white/20">ড্রাফট</Button>
                      <Button size="sm" variant="destructive" onClick={handleBulkDeleteBlogs} disabled={bulkActionLoading} className="rounded-lg h-8 px-3 text-xs font-bold gap-1">
                        {bulkActionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} মুছুন
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  {blogLoading ? (
                    <div className="p-6 space-y-4">{[1,2,3,4,5].map((i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-14 rounded-xl" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div></div>)}</div>
                  ) : paginatedBlogPosts.length === 0 ? (
                    <div className="py-16 text-center text-[#6b7280]"><BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="font-semibold text-sm">কোনো পোস্ট নেই</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3.5 w-10"><Checkbox checked={paginatedBlogPosts.length > 0 && selectedBlogIds.size === paginatedBlogPosts.length} onCheckedChange={toggleSelectAllBlogs} /></th>
                            <th className="px-4 py-3.5">আর্টিকেল</th>
                            <th className="px-4 py-3.5">ক্যাটাগরি</th>
                            <th className="px-4 py-3.5">লেখক</th>
                            <th className="px-4 py-3.5">স্ট্যাটাস</th>
                            <th className="px-4 py-3.5">তারিখ</th>
                            <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedBlogPosts.map((post) => (
                            <tr key={post.id} className={`hover:bg-gray-50/60 transition-colors ${selectedBlogIds.has(post.id) ? "bg-purple-50/40" : ""}`}>
                              <td className="px-4 py-3.5"><Checkbox checked={selectedBlogIds.has(post.id)} onCheckedChange={() => toggleSelectBlog(post.id)} /></td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    {post.cover_image_url ? <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-purple-700 bg-purple-50"><BookOpen className="h-4 w-4" /></div>}
                                  </div>
                                  <div className="min-w-0"><p className="font-bold text-[#111827] text-sm truncate max-w-[240px]">{post.title}</p><p className="text-[11px] text-[#6b7280] font-mono truncate">/blog/{post.slug}</p></div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5"><span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-800">{post.category?.name || "—"}</span></td>
                              <td className="px-4 py-3.5 text-[#6b7280] font-medium">{post.author_name || "—"}</td>
                              <td className="px-4 py-3.5">
                                <button onClick={() => handleToggleBlogStatus(post)} className="cursor-pointer">
                                  {post.status === "published" ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"><CheckCircle2 className="h-3 w-3" />Published</span>
                                    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><Clock className="h-3 w-3" />Draft</span>}
                                </button>
                              </td>
                              <td className="px-4 py-3.5 text-[#6b7280] font-medium">{post.published_at ? new Date(post.published_at).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" asChild className="w-8 h-8 rounded-lg hover:bg-gray-100"><Link to={`/blog/${post.slug}`} target="_blank"><Eye className="h-3.5 w-3.5 text-[#6b7280]" /></Link></Button>
                                  <Button variant="ghost" size="icon" asChild className="w-8 h-8 rounded-lg hover:bg-gray-100"><Link to="/admin/dashboard/blog/$postId/edit" params={{ postId: post.id }}><Pencil className="h-3.5 w-3.5 text-[#6b7280]" /></Link></Button>
                                  <Button variant="ghost" size="icon" onClick={() => setDeletingPost(post)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {totalBlogPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#6b7280]">
                      <span>পৃষ্ঠা {blogPage} / {totalBlogPages}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={blogPage <= 1} onClick={() => setBlogPage((p) => Math.max(1, p-1))} className="h-8 rounded-lg text-xs"><ChevronLeft className="h-3.5 w-3.5 mr-1" />আগের</Button>
                        <Button variant="outline" size="sm" disabled={blogPage >= totalBlogPages} onClick={() => setBlogPage((p) => Math.min(totalBlogPages, p+1))} className="h-8 rounded-lg text-xs">পরের<ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════ USERS TAB ═══════════ */}
            {activeTab === "users" && (
              <div className="space-y-5">
                <h1 className="text-2xl font-bold text-[#111827]">ব্যবহারকারী তালিকা <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs font-bold border-none">{filteredUsers.length}</Badge></h1>

                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-wrap items-center gap-2">
                  {[
                    { id: "all" as const, l: `সকল (${dashboardUsers.length})` },
                    { id: "pending" as const, l: `অপেক্ষমান (${dashboardUsers.filter(u => (u.status||"pending") === "pending").length})` },
                    { id: "approved" as const, l: `অনুমোদিত (${dashboardUsers.filter(u => u.status === "approved").length})` },
                  ].map((st) => (
                    <button key={st.id} onClick={() => setUserStatusFilter(st.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${userStatusFilter === st.id ? "bg-[#1a6b4a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {st.l}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3.5">ব্যবহারকারী</th>
                          <th className="px-5 py-3.5">ইমেইল</th>
                          <th className="px-5 py-3.5">ফোন</th>
                          <th className="px-5 py-3.5">স্ট্যাটাস</th>
                          <th className="px-5 py-3.5">নিবন্ধনের তারিখ</th>
                          <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={6} className="px-5 py-12 text-center text-[#6b7280]">কোনো ব্যবহারকারী নেই</td></tr>
                        ) : filteredUsers.map((u) => {
                          const isPending = (u.status || "pending") === "pending";
                          const isAdmin = isAdminEmail(u.email);
                          return (
                            <tr key={u.id} className={`transition-colors ${isPending ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-gray-50/60"}`}>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${isAdmin ? "bg-[#1a6b4a] text-white" : isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                    {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="font-semibold text-[#111827] text-sm flex items-center gap-2">{u.full_name || "নামহীন"}{isAdmin && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#1a6b4a] text-white">Admin</span>}</div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-[#6b7280] flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" />{u.email || "—"}</td>
                              <td className="px-5 py-3.5 text-[#6b7280]"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{u.phone || "—"}</span></td>
                              <td className="px-5 py-3.5">
                                {isPending ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />অপেক্ষমান</span>
                                  : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="h-3 w-3" />অনুমোদিত</span>}
                              </td>
                              <td className="px-5 py-3.5 text-[#6b7280]" title={u.created_at ? new Date(u.created_at).toISOString() : undefined}>
                                {u.created_at ? new Date(u.created_at).toLocaleString("bn-BD", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isAdmin && isPending && (
                                    <Button size="sm" onClick={() => handleUpdateUserStatus(u.id, "approved")} disabled={approvingUserId === u.id}
                                      className="rounded-lg h-7 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer">
                                      {approvingUserId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} অনুমোদন
                                    </Button>
                                  )}
                                  {!isAdmin && !isPending && (
                                    <Button variant="outline" size="sm" onClick={() => handleUpdateUserStatus(u.id, "pending")} disabled={approvingUserId === u.id}
                                      className="rounded-lg h-7 px-2.5 text-[11px] border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 gap-1 cursor-pointer">
                                      <Undo2 className="h-3 w-3" /> রিভোক
                                    </Button>
                                  )}
                                  {!isAdmin && <Button variant="ghost" size="icon" onClick={() => setDeletingUser(u)} className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ REVIEWS & TESTIMONIALS SECTION ═══════════ */}
            {activeTab === "reviews" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111827]">
                      রিভিউ ও প্রশংসাপত্র ব্যবস্থাপনা{" "}
                      <Badge className="ml-2 bg-rose-100 text-rose-800 text-xs font-bold border-none">
                        {homepageReviews.length + testimonials.length} টি
                      </Badge>
                    </h1>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      হোমপেজ ও কোম্পানিভিত্তিক বিনিয়োগকারী রিভিউ ও টেস্টিমোনিয়াল পরিচালনা করুন
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {reviewSubTab === "homepage" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingHomeRev(null);
                          setHomeRevFormOpen(true);
                        }}
                        className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold gap-1.5 h-9 px-4 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> নতুন হোম রিভিউ
                      </Button>
                    )}
                    {reviewSubTab === "company" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingTest(null);
                          setTestFormOpen(true);
                        }}
                        className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold gap-1.5 h-9 px-4 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> নতুন টেস্টিমোনিয়াল
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="bg-white rounded-2xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setReviewSubTab("user_reviews")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewSubTab === "user_reviews"
                        ? "bg-[#1a6b4a] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>ইউজার রিভিউ (অনুমোদন)</span>
                  </button>

                  <button
                    onClick={() => setReviewSubTab("homepage")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewSubTab === "homepage"
                        ? "bg-[#1a6b4a] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>হোম রিভিউ</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        reviewSubTab === "homepage"
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {homepageReviews.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setReviewSubTab("company")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewSubTab === "company"
                        ? "bg-[#1a6b4a] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>কোম্পানি টেস্টিমোনিয়াল</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        reviewSubTab === "company"
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {testimonials.length}
                    </span>
                  </button>
                </div>

                {/* Sub-tab 0: ইউজার রিভিউ অনুমোদন */}
                {reviewSubTab === "user_reviews" && (
                  <UserReviewManager opportunities={opportunities} />
                )}

                {/* Sub-tab 1: হোম রিভিউ Table */}
                {reviewSubTab === "homepage" && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    {homeRevLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : homepageReviews.length === 0 ? (
                      <div className="py-16 text-center text-[#6b7280]">
                        <Star className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="font-semibold text-sm">কোনো হোম রিভিউ পাওয়া যায়নি</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                            <tr>
                              <th className="px-5 py-3.5">রিভিউকারী</th>
                              <th className="px-5 py-3.5">অবস্থান</th>
                              <th className="px-5 py-3.5">রেটিং</th>
                              <th className="px-5 py-3.5">সর্ট অর্ডার</th>
                              <th className="px-5 py-3.5">উক্তি প্রিভিউ</th>
                              <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {homepageReviews.map((r) => (
                              <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                                      {r.avatar_url ? (
                                        <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        r.name?.charAt(0) || "ব"
                                      )}
                                    </div>
                                    <div className="font-semibold text-[#111827] text-sm truncate max-w-[160px]">
                                      {r.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-[#6b7280]">
                                  {r.location || "বাংলাদেশ"}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span>{r.rating || 5}.০</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                                      #{r.sort_order ?? 0}
                                    </span>
                                    <button
                                      onClick={() => handleReorderHomepageReview(r, "up")}
                                      className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors cursor-pointer"
                                      title="উপরে নিন (মান হ্রাস)"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => handleReorderHomepageReview(r, "down")}
                                      className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors cursor-pointer"
                                      title="নিচে নিন (মান বৃদ্ধি)"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-[#6b7280] max-w-[280px] truncate" title={r.quote}>
                                  "{r.quote}"
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingHomeRev(r);
                                        setHomeRevFormOpen(true);
                                      }}
                                      className="w-8 h-8 rounded-lg hover:bg-gray-100"
                                      title="সম্পাদনা"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-[#6b7280]" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeletingHomeRev(r)}
                                      className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 2: কোম্পানি টেস্টিমোনিয়াল Table */}
                {reviewSubTab === "company" && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    {testLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (testimonials ?? []).length === 0 ? (
                      <div className="py-16 text-center text-[#6b7280]">
                        <Briefcase className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="font-semibold text-sm">কোনো কোম্পানি টেস্টিমোনিয়াল নেই</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                            <tr>
                              <th className="px-5 py-3.5">বিনিয়োগকারী</th>
                              <th className="px-5 py-3.5">সম্পর্কিত ব্যবসা / ব্র্যান্ড</th>
                              <th className="px-5 py-3.5">রেটিং</th>
                              <th className="px-5 py-3.5">বিনিয়োগের পরিমাণ</th>
                              <th className="px-5 py-3.5">উক্তি প্রিভিউ</th>
                              <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(testimonials ?? []).map((t: any) => {
                              if (!t) return null;
                              const opp =
                                (t.opportunities as { id?: string; name?: string; slug?: string } | undefined) ||
                                (Array.isArray(opportunities)
                                  ? opportunities.find((o) => o?.id === t.related_opportunity_id)
                                  : null);
                              const brandDisplay = opp?.name ?? t.brand_name ?? null;
                              const ratingVal = typeof t.rating === "number" && t.rating > 0 ? t.rating : 5;
                              const initial =
                                t.name && String(t.name).trim().length > 0
                                  ? String(t.name).trim().charAt(0)
                                  : "ব";
                              const nameDisplay = t.name || "বিনিয়োগকারী";
                              const roleLocation =
                                [t.role_title, t.location].filter(Boolean).join(" • ") || "বিনিয়োগকারী";

                              return (
                                <tr key={t.id || Math.random()} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {t.avatar_url ? (
                                          <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          initial
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-semibold text-[#111827] text-sm truncate max-w-[160px]">
                                          {nameDisplay}
                                        </div>
                                        <div className="text-[11px] text-[#6b7280] truncate">
                                          {roleLocation}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {brandDisplay ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-semibold text-[11px]">
                                        <Building2 className="h-3 w-3 text-emerald-700 shrink-0" />
                                        <span className="truncate max-w-[160px]">{brandDisplay}</span>
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">সংযুক্ত নেই</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                      <Star className="h-3.5 w-3.5 fill-current" />
                                      <span>{ratingVal}.০</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {t.investment_amount ? (
                                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                        {t.investment_amount}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-[#6b7280] max-w-[280px] truncate" title={t.quote || ""}>
                                    "{t.quote || ""}"
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingTest(t);
                                          setTestFormOpen(true);
                                        }}
                                        className="w-8 h-8 rounded-lg hover:bg-gray-100"
                                        title="সম্পাদনা"
                                      >
                                        <Pencil className="h-3.5 w-3.5 text-[#6b7280]" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingTest(t)}
                                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500"
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
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ═══════════ ALL DIALOGS ═══════════ */}
      <OpportunityForm open={oppFormOpen} onOpenChange={setOppFormOpen} opportunity={editingOpp} onSuccess={fetchOpportunities} />
      <TestimonialForm open={testFormOpen} onOpenChange={setTestFormOpen} testimonial={editingTest} onSuccess={fetchTestimonials} opportunities={opportunities} />
      <HomepageReviewForm open={homeRevFormOpen} onOpenChange={setHomeRevFormOpen} review={editingHomeRev} onSuccess={fetchHomepageReviews} />

      <AlertDialog open={!!deletingOpp} onOpenChange={(o) => !o && setDeletingOpp(null)}>
        <AlertDialogContent className="rounded-2xl p-6"><AlertDialogHeader><AlertDialogTitle className="text-xl font-bold">সুযোগটি মুছতে চান?</AlertDialogTitle><AlertDialogDescription className="text-sm"><strong>"{deletingOpp?.name}"</strong> মুছে ফেলা হবে।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel><AlertDialogAction onClick={handleDeleteOpp} disabled={deletingOppLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">{deletingOppLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}মুছে ফেলুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingPost} onOpenChange={(o) => !o && setDeletingPost(null)}>
        <AlertDialogContent className="rounded-2xl p-6"><AlertDialogHeader><AlertDialogTitle className="text-xl font-bold">পোস্টটি মুছতে চান?</AlertDialogTitle><AlertDialogDescription className="text-sm"><strong>"{deletingPost?.title}"</strong> মুছলে পুনরুদ্ধার সম্ভব নয়।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel><AlertDialogAction onClick={handleDeletePost} disabled={deletingPostLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">{deletingPostLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}মুছে ফেলুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingUser} onOpenChange={(o) => !o && setDeletingUser(null)}>
        <AlertDialogContent className="rounded-2xl p-6"><AlertDialogHeader><AlertDialogTitle className="text-xl font-bold">ব্যবহারকারী মুছতে চান?</AlertDialogTitle><AlertDialogDescription className="text-sm"><strong>"{deletingUser?.full_name || deletingUser?.email}"</strong> এর অ্যাকাউন্ট মুছে যাবে।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">মুছে ফেলুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingTest} onOpenChange={(o) => !o && setDeletingTest(null)}>
        <AlertDialogContent className="rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">প্রশংসাপত্রটি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingTest?.name}"</strong> এর প্রশংসাপত্র মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              disabled={deletingTestLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deletingTestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingHomeRev} onOpenChange={(o) => !o && setDeletingHomeRev(null)}>
        <AlertDialogContent className="rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">রিভিউটি মুছতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              <strong>"{deletingHomeRev?.name}"</strong> এর রিভিউ মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHomeRev}
              disabled={deletingHomeRevLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deletingHomeRevLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Manager Dialog */}
      <Dialog open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#111827]">ব্লগ ক্যাটাগরি ম্যানেজার</DialogTitle>
            <DialogDescription className="text-xs text-[#6b7280]">ক্যাটাগরি তৈরি, রিনেম ও মুছুন।</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 pt-2">
            <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="নতুন ক্যাটাগরি..." className="rounded-xl text-xs h-9" onKeyDown={(e) => { if (e.key === "Enter") handleAddNewCategory(); }} />
            <Button onClick={handleAddNewCategory} disabled={addingCatLoading || !newCatName.trim()} className="rounded-xl h-9 px-4 text-xs font-bold bg-[#1a6b4a] text-white shrink-0">
              {addingCatLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} যোগ
            </Button>
          </div>
          <div className="max-h-[340px] overflow-y-auto space-y-2 pt-2">
            {blogCategories.length === 0 ? <p className="text-sm text-[#6b7280] text-center py-6">কোনো ক্যাটাগরি নেই</p> : blogCategories.map((cat) => {
              const postCount = blogPosts.filter((p) => p.category_id === cat.id).length;
              const isEditing = editingCategoryId === cat.id;
              return (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3 hover:bg-gray-100 transition-colors">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} className="h-8 rounded-lg text-xs" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSaveRenameCategory(cat.id); }} />
                      <Button size="sm" onClick={() => handleSaveRenameCategory(cat.id)} className="h-8 px-3 rounded-lg text-xs bg-[#1a6b4a] text-white">সেভ</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)} className="h-8 px-2 rounded-lg text-xs">বাতিল</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0"><Tag className="h-3.5 w-3.5 text-purple-700 shrink-0" /><span className="font-bold text-xs text-[#111827] truncate">{cat.name}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 shrink-0">{postCount}</span></div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#6b7280] hover:bg-gray-200" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50" onClick={() => setDeletingCategory(cat)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter className="pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setCategoryManagerOpen(false)} className="rounded-xl text-xs">বন্ধ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategory} onOpenChange={(o) => !o && setDeletingCategory(null)}>
        <AlertDialogContent className="rounded-2xl p-6"><AlertDialogHeader><AlertDialogTitle className="text-xl font-bold">ক্যাটাগরি মুছতে চান?</AlertDialogTitle><AlertDialogDescription className="text-sm"><strong>"{deletingCategory?.name}"</strong> মুছলে পোস্টগুলো ক্যাটাগরিহীন হবে।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">বাতিল</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory} disabled={deletingCategoryLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">{deletingCategoryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}মুছে ফেলুন</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
