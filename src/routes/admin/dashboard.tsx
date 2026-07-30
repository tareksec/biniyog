import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth, getAuthSnapshot } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Opportunity, Testimonial, HomepageReview } from "@/lib/database.types";
import { OpportunityForm } from "@/components/admin/OpportunityForm";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { HomepageReviewForm } from "@/components/admin/HomepageReviewForm";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  LayoutDashboard,
  RefreshCw,
  MessageSquareQuote,
  Briefcase,
  Home,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    // Synchronous auth check using the singleton cache.
    // After initial app load, this reads from memory instantly (0ms).
    // On hard refresh while auth is still loading, we let the component
    // handle it (show spinner) rather than redirecting prematurely.
    const { user, loading } = getAuthSnapshot();
    if (!loading && !user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

// ─── Status badge styling ───────────────────────────────────────────
function statusBadge(status: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("fully funded") || s.includes("বিনিয়োগ হয়েছে"))
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {status}
      </Badge>
    );
  if (s.includes("শেষের দিকে"))
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
        {status}
      </Badge>
    );
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      {status || "—"}
    </Badge>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────
function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in (safety net — beforeLoad handles most cases)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/admin/login" });
    }
  }, [authLoading, user, navigate]);

  // ─── Active Tab State ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("opportunities");

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

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  // ─── Loading / Auth guard ──────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf8]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">হোম</span>
                </Link>
              </Button>
              <div className="hidden sm:block h-4 w-px bg-border"></div>
            </div>
            
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium text-muted-foreground whitespace-nowrap overflow-x-auto pb-1 sm:pb-0">
               <button onClick={() => { setOppFormOpen(false); setTestFormOpen(false); }} className="hover:text-foreground transition-colors">
                 Dashboard
               </button>
               <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
               <button 
                 onClick={() => {
                    if (activeTab === 'opportunities') setOppFormOpen(false);
                    if (activeTab === 'testimonials') setTestFormOpen(false);
                 }}
                 className={`${(!oppFormOpen && !testFormOpen) ? "text-foreground font-semibold" : "hover:text-foreground transition-colors"}`}
               >
                 {activeTab === 'opportunities' ? 'Opportunities' : 'Testimonials'}
               </button>
               
               {activeTab === 'opportunities' && oppFormOpen && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <span className="text-foreground font-semibold">
                      {editingOpp ? 'Edit' : 'Add New'}
                    </span>
                  </>
               )}

               {activeTab === 'testimonials' && testFormOpen && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <span className="text-foreground font-semibold">
                      {editingTest ? 'Edit' : 'Add New'}
                    </span>
                  </>
               )}

               {activeTab === 'homepage_reviews' && homeRevFormOpen && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                    <span className="text-foreground font-semibold">
                      {editingHomeRev ? 'Edit' : 'Add New'}
                    </span>
                  </>
               )}
            </nav>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-muted-foreground hover:text-destructive shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="h-10">
            <TabsTrigger value="opportunities" className="gap-2 px-4">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">সুযোগসমূহ</span>
              <span className="sm:hidden">সুযোগ</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
              >
                {opportunities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2 px-4">
              <MessageSquareQuote className="h-4 w-4" />
              <span className="hidden sm:inline">প্রশংসাপত্র</span>
              <span className="sm:hidden">প্রশংসা</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
              >
                {testimonials.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="homepage_reviews" className="gap-2 px-4">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">হোমপেজ রিভিউ</span>
              <span className="sm:hidden">রিভিউ</span>
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
              >
                {homepageReviews.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ OPPORTUNITIES TAB ═══════════ */}
          <TabsContent value="opportunities" className="space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                বিনিয়োগ সুযোগ
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOpportunities}
                  disabled={oppLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${oppLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingOpp(null);
                    setOppFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-white shadow-sm">
              {oppLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : opportunities.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  কোনো সুযোগ পাওয়া যায়নি। "নতুন যোগ করুন" বাটনে ক্লিক করুন।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-[200px]">নাম</TableHead>
                        <TableHead className="min-w-[130px]">
                          ক্যাটাগরি
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          বিনিয়োগ
                        </TableHead>
                        <TableHead className="min-w-[100px]">
                          লাভ
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          স্ট্যাটাস
                        </TableHead>
                        <TableHead className="w-[100px] text-right">
                          অ্যাকশন
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunities.map((opp) => (
                        <TableRow key={opp.id}>
                          <TableCell className="font-medium">
                            <div>
                              <span className="block">{opp.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                /{opp.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {opp.category || "—"}
                          </TableCell>
                          <TableCell className="text-sm tabular">
                            {opp.investment_amount || "—"}
                          </TableCell>
                          <TableCell className="text-sm tabular">
                            {opp.expected_profit || "—"}
                          </TableCell>
                          <TableCell>{statusBadge(opp.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingOpp(opp);
                                  setOppFormOpen(true);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingOpp(opp)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══════════ TESTIMONIALS TAB ═══════════ */}
          <TabsContent value="testimonials" className="space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                প্রশংসাপত্র
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTestimonials}
                  disabled={testLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${testLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTest(null);
                    setTestFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Button>
              </div>
            </div>

            {/* Cards list */}
            <div className="space-y-3">
              {testLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : testimonials.length === 0 ? (
                <div className="rounded-xl border border-border bg-white py-16 text-center text-sm text-muted-foreground shadow-sm">
                  কোনো প্রশংসাপত্র পাওয়া যায়নি।
                </div>
              ) : (
                testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between rounded-xl border border-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm leading-relaxed text-foreground">
                        "{t.quote}"
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {t.name}
                        </span>
                        {t.role_title && (
                          <>
                            <span>•</span>
                            <span>{t.role_title}</span>
                          </>
                        )}
                        {t.location && (
                          <>
                            <span>•</span>
                            <span>{t.location}</span>
                          </>
                        )}
                        {t.brand_name && (
                          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                            {t.brand_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTest(t);
                          setTestFormOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTest(t)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* ═══════════ HOMEPAGE REVIEWS TAB ═══════════ */}
          <TabsContent value="homepage_reviews" className="space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                হোমপেজ রিভিউ
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchHomepageReviews}
                  disabled={homeRevLoading}
                  className="h-10 w-10 shrink-0"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${homeRevLoading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  onClick={() => {
                    setEditingHomeRev(null);
                    setHomeRevFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  নতুন যোগ করুন
                </Button>
              </div>
            </div>

            {/* Cards list */}
            <div className="space-y-3">
              {homeRevLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : homepageReviews.length === 0 ? (
                <div className="rounded-xl border border-border bg-white py-16 text-center text-sm text-muted-foreground shadow-sm">
                  কোনো হোমপেজ রিভিউ পাওয়া যায়নি।
                </div>
              ) : (
                homepageReviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between rounded-xl border border-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm leading-relaxed text-foreground">
                        "{r.quote}"
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {r.name}
                        </span>
                        {r.location && (
                          <>
                            <span>•</span>
                            <span>{r.location}</span>
                          </>
                        )}
                        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                          Order: {r.sort_order}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingHomeRev(r);
                          setHomeRevFormOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingHomeRev(r)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

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

      {/* ─── Delete Opportunity Confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deletingOpp}
        onOpenChange={(open) => !open && setDeletingOpp(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>সুযোগ মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deletingOpp?.name}"</strong> মুছে ফেললে ফেরানো যাবে না।
              আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOpp}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>প্রশংসাপত্র মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingTest?.name}</strong>-এর প্রশংসাপত্র মুছে ফেললে
              ফেরানো যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTestLoading}>
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              disabled={deletingTestLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Homepage Review Form Dialog ──────────────────────────── */}
      <HomepageReviewForm
        open={homeRevFormOpen}
        onOpenChange={setHomeRevFormOpen}
        review={editingHomeRev}
        onSuccess={fetchHomepageReviews}
      />

      {/* ─── Delete Homepage Review Confirmation ──────────────────── */}
      <AlertDialog
        open={!!deletingHomeRev}
        onOpenChange={(open) => !open && setDeletingHomeRev(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>রিভিউ মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingHomeRev?.name}</strong>-এর রিভিউ মুছে ফেললে
              ফেরানো যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingHomeRevLoading}>
              বাতিল
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHomeRev}
              disabled={deletingHomeRevLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingHomeRevLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
