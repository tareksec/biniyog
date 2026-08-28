"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteUserReviewAdmin,
  type UserReview,
} from "@/lib/user_reviews";
import type { Opportunity } from "@/lib/database.types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  MessageSquare,
  Search,
  Building2,
  Sparkles,
  ExternalLink,
  Edit3,
  Check,
  X,
  Smile,
  Meh,
  Frown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface UserReviewManagerProps {
  opportunities?: Opportunity[];
}

export function UserReviewManager({ opportunities = [] }: UserReviewManagerProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [adminNoteModalReview, setAdminNoteModalReview] = React.useState<UserReview | null>(null);
  const [adminNoteInput, setAdminNoteInput] = React.useState<string>("");
  const [deletingReviewId, setDeletingReviewId] = React.useState<string | null>(null);

  // Fetch all reviews using TanStack Query
  const {
    data: allReviews = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin_user_reviews"],
    queryFn: async () => {
      console.log("[UserReviewManager] Querying all user reviews from Supabase...");
      const data = await getAllReviewsAdmin("all");
      console.log(`[UserReviewManager] Successfully fetched ${data?.length ?? 0} reviews:`, data);
      return data;
    },
    staleTime: 1000 * 15, // 15 seconds
  });

  const reviewsList = React.useMemo(() => {
    return Array.isArray(allReviews) ? allReviews : [];
  }, [allReviews]);

  // Opportunity lookup map
  const oppMap = React.useMemo(() => {
    const map = new Map<string, Opportunity>();
    opportunities.forEach((o) => {
      if (o.id) map.set(o.id, o);
    });
    return map;
  }, [opportunities]);

  // Tab counts
  const counts = React.useMemo(() => {
    return {
      all: reviewsList.length,
      pending: reviewsList.filter((r) => r.status === "pending").length,
      approved: reviewsList.filter((r) => r.status === "approved").length,
      rejected: reviewsList.filter((r) => r.status === "rejected").length,
    };
  }, [reviewsList]);

  // Status filtered list
  const reviewsByStatus = React.useMemo(() => {
    if (statusFilter === "all") return reviewsList;
    return reviewsList.filter((r) => r.status === statusFilter);
  }, [reviewsList, statusFilter]);

  // Mutation for updating status
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNote,
    }: {
      id: string;
      status: "approved" | "rejected" | "pending";
      adminNote?: string;
    }) => updateReviewStatus(id, status, adminNote),
    onMutate: async ({ id, status, adminNote }) => {
      await queryClient.cancelQueries({ queryKey: ["admin_user_reviews"] });
      const previousReviews = queryClient.getQueryData<UserReview[]>(["admin_user_reviews"]);

      if (previousReviews) {
        queryClient.setQueryData<UserReview[]>(
          ["admin_user_reviews"],
          previousReviews.map((r) =>
            r.id === id ? { ...r, status, admin_note: adminNote !== undefined ? adminNote : r.admin_note } : r
          )
        );
      }

      return { previousReviews };
    },
    onError: (err, variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(["admin_user_reviews"], context.previousReviews);
      }
      console.error("Failed to update review status:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_user_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["approved_user_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-reviews-all"] });
    },
  });

  // Mutation for deleting review
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserReviewAdmin(id),
    onSuccess: () => {
      setDeletingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["admin_user_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["approved_user_reviews"] });
    },
    onError: (err) => {
      console.error("Failed to delete review:", err);
      setDeletingReviewId(null);
    },
  });

  // Search filtered reviews
  const filteredReviews = React.useMemo(() => {
    return reviewsByStatus.filter((r) => {
      if (!r) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const opp = r.target_id ? oppMap.get(r.target_id) : null;
      const oppName = opp?.name || "";

      return (
        r.reviewer_name?.toLowerCase().includes(q) ||
        r.reviewer_email?.toLowerCase().includes(q) ||
        r.user_identity?.toLowerCase().includes(q) ||
        r.investment_details?.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q) ||
        r.admin_note?.toLowerCase().includes(q) ||
        oppName.toLowerCase().includes(q)
      );
    });
  }, [reviewsByStatus, searchQuery, oppMap]);

  const handleOpenAdminNoteModal = (review: UserReview) => {
    setAdminNoteModalReview(review);
    setAdminNoteInput(review.admin_note || "");
  };

  const handleSaveAdminNote = () => {
    if (!adminNoteModalReview) return;
    statusMutation.mutate({
      id: adminNoteModalReview.id,
      status: adminNoteModalReview.status,
      adminNote: adminNoteInput,
    });
    setAdminNoteModalReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-[#111827]">
              ইউজার রিভিউ অনুমোদন
            </h2>
            {counts.pending > 0 && (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold px-2.5 py-0.5">
                {counts.pending} টি অপেক্ষমান
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#6b7280] mt-1">
            ব্যবহারকারীদের পাঠানো মতামত পর্যালোচনা করে অনুমোদন বা বাতিল করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl text-xs font-semibold gap-1.5 h-9 cursor-pointer"
          >
            <Loader2 className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all" as const, label: `সকল (${counts.all})` },
            { id: "pending" as const, label: `অপেক্ষমান (${counts.pending})` },
            { id: "approved" as const, label: `অনুমোদিত (${counts.approved})` },
            { id: "rejected" as const, label: `প্রত্যাখ্যাত (${counts.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#1a6b4a] text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="নাম, পেশা, মতামত বা প্রজেক্ট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-[#6b7280] font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">রিভিউয়ার ও পরিচয়</th>
                <th className="px-5 py-3.5">রেটিং</th>
                <th className="px-5 py-3.5">মতামত ও বিনিয়োগ বিবরণ</th>
                <th className="px-5 py-3.5">টার্গেট</th>
                <th className="px-5 py-3.5">তারিখ</th>
                <th className="px-5 py-3.5">স্ট্যাটাস</th>
                <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1a6b4a]" />
                    <span>রিভিউ লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : reviewsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold">কোনো ইউজার রিভিউ জমা হয়নি</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      ব্যবহারকারীরা রিভিউ সাবমিট করলে এখানে প্রদর্শিত হবে।
                    </p>
                  </td>
                </tr>
              ) : reviewsByStatus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold">
                      {statusFilter === "pending"
                        ? "কোনো অপেক্ষমান ইউজার রিভিউ নেই"
                        : statusFilter === "approved"
                        ? "কোনো অনুমোদিত ইউজার রিভিউ নেই"
                        : "কোনো প্রত্যাখ্যাত ইউজার রিভিউ নেই"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      অন্য ফিল্টার ট্যাবে ক্লিক করে চেক করুন।
                    </p>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold">অনুসন্ধানের সাথে মিল রয়েছে এমন কোনো রিভিউ নেই</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => {
                  const rating = typeof r.rating === "number" ? r.rating : 0.5;
                  const percent = Math.round(rating * 100);
                  const opp = r.target_id ? oppMap.get(r.target_id) : null;
                  const isPending = r.status === "pending";
                  const isApproved = r.status === "approved";
                  const isRejected = r.status === "rejected";

                  // Sentiment styling
                  let ratingColor = "bg-emerald-500";
                  let RatingIcon = Smile;
                  if (rating < 0.33) {
                    ratingColor = "bg-rose-500";
                    RatingIcon = Frown;
                  } else if (rating <= 0.66) {
                    ratingColor = "bg-amber-500";
                    RatingIcon = Meh;
                  }

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors ${
                        isPending
                          ? "bg-amber-50/30 hover:bg-amber-50/60"
                          : "hover:bg-gray-50/60"
                      }`}
                    >
                      {/* Reviewer & Identity */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#111827] text-sm">
                              {r.reviewer_name || "বিনিয়োগকারী"}
                            </span>
                            {r.has_invested ? (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ বিনিয়োগকারী
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                বিনিয়োগ করেননি
                              </span>
                            )}
                          </div>

                          {r.user_identity && (
                            <span className="text-[11px] font-semibold text-[#1a6b4a]">
                              {r.user_identity}
                            </span>
                          )}

                          {r.reviewer_email && (
                            <span className="text-[11px] text-gray-500">
                              {r.reviewer_email}
                            </span>
                          )}
                          {r.user_id && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              User ID: {r.user_id.slice(0, 8)}...
                            </span>
                          )}
                          {r.ip_address && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              IP: {r.ip_address}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating Bar */}
                      <td className="px-5 py-4 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <RatingIcon className="w-4 h-4 shrink-0 text-gray-700" />
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${ratingColor} rounded-full`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 text-xs">
                            {percent}%
                          </span>
                        </div>
                      </td>

                      {/* Note & Investment details */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="space-y-1.5">
                          {r.note ? (
                            <p className="text-gray-800 text-xs leading-relaxed line-clamp-2">
                              "{r.note}"
                            </p>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              মন্তব্য নেই
                            </span>
                          )}

                          {r.investment_details && (
                            <div className="text-[11px] text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-200/80">
                              <span className="font-bold text-[#1a6b4a] block mb-0.5">বিনিয়োগের অভিজ্ঞতা:</span>
                              <span className="italic">{r.investment_details}</span>
                            </div>
                          )}

                          {r.admin_note && (
                            <div className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              <span>অ্যাডমিন নোট:</span> {r.admin_note}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Target */}
                      <td className="px-5 py-4">
                        {r.target_type === "opportunity" && opp ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{opp.name}</span>
                          </div>
                        ) : r.target_type === "homepage" ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-100">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            হোমপেজ
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">সাধারণ</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString("bn-BD", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            অপেক্ষমান
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            অনুমোদিত
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            প্রত্যাখ্যাত
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve button */}
                          {!isApproved && (
                            <Button
                              size="sm"
                              onClick={() =>
                                statusMutation.mutate({ id: r.id, status: "approved" })
                              }
                              disabled={statusMutation.isPending}
                              className="rounded-lg h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> অনুমোদন
                            </Button>
                          )}

                          {/* Reject button */}
                          {!isRejected && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                statusMutation.mutate({ id: r.id, status: "rejected" })
                              }
                              disabled={statusMutation.isPending}
                              className="rounded-lg h-7 px-2.5 text-[11px] font-bold border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> প্রত্যাখ্যান
                            </Button>
                          )}

                          {/* Admin Note button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenAdminNoteModal(r)}
                            title="অ্যাডমিন নোট যোগ করুন"
                            className="w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingReviewId(r.id)}
                            title="মুছে ফেলুন"
                            className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Admin Note Dialog */}
      <Dialog
        open={adminNoteModalReview !== null}
        onOpenChange={(open) => !open && setAdminNoteModalReview(null)}
      >
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              অ্যাডমিন নোট সংরক্ষণ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              এই নোটটি শুধুমাত্র অ্যাডমিন প্যানেলে সংরক্ষিত থাকবে।
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-gray-800">
                রিভিউয়ার: {adminNoteModalReview?.reviewer_name}
              </p>
              {adminNoteModalReview?.note && (
                <p className="text-gray-600 italic">
                  "{adminNoteModalReview.note}"
                </p>
              )}
            </div>

            <textarea
              value={adminNoteInput}
              onChange={(e) => setAdminNoteInput(e.target.value)}
              placeholder="অ্যাডমিন মন্তব্য লিখুন..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1a6b4a]/20 focus:border-[#1a6b4a]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminNoteModalReview(null)}
              className="rounded-xl text-xs"
            >
              বাতিল
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAdminNote}
              disabled={statusMutation.isPending}
              className="rounded-xl bg-[#1a6b4a] hover:bg-[#145a3d] text-white text-xs font-bold"
            >
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingReviewId !== null}
        onOpenChange={(open) => !open && setDeletingReviewId(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600">
              রিভিউ মুছে ফেলবেন?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              এই রিভিউটি স্থায়ীভাবে মুছে যাবে এবং পুনরুদ্ধার করা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingReviewId(null)}
              className="rounded-xl text-xs"
            >
              বাতিল
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deletingReviewId && deleteMutation.mutate(deletingReviewId)}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs font-bold"
            >
              {deleteMutation.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserReviewManager;
