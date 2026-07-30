import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { HomepageReview, HomepageReviewInsert, HomepageReviewUpdate } from "@/lib/database.types";
import { insertHomepageReview, updateHomepageReview } from "@/lib/homepage_reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Star, Upload, X, User } from "lucide-react";
import { toast } from "sonner";

interface HomepageReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: HomepageReview | null;
  onSuccess: () => void;
}

export function HomepageReviewForm({
  open,
  onOpenChange,
  review,
  onSuccess,
}: HomepageReviewFormProps) {
  const isEditing = !!review;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "বিনিয়োগকারী",
    location: "",
    quote: "",
    rating: 5 as number | null,
    avatar_url: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (review) {
      setForm({
        name: review.name || "বিনিয়োগকারী",
        location: review.location || "",
        quote: review.quote || "",
        rating: review.rating ?? 5,
        avatar_url: review.avatar_url || "",
        sort_order: review.sort_order ?? 0,
      });
    } else {
      setForm({
        name: "বিনিয়োগকারী",
        location: "",
        quote: "",
        rating: 5,
        avatar_url: "",
        sort_order: 0,
      });
    }
  }, [review, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("opportunity-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("opportunity-images")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, avatar_url: urlData.publicUrl }));
      toast.success("প্রোফাইল ছবি আপলোড হয়েছে");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("নাম এবং উক্তি অবশ্যই দিতে হবে");
      return;
    }

    setSaving(true);

    try {
      if (isEditing && review) {
        const updateData: HomepageReviewUpdate = {
          name: form.name.trim(),
          location: form.location.trim() || null,
          quote: form.quote.trim(),
          rating: form.rating ? Number(form.rating) : null,
          avatar_url: form.avatar_url || null,
          sort_order: Number(form.sort_order),
        };

        await updateHomepageReview(review.id, updateData);
        toast.success("রিভিউ আপডেট হয়েছে");
      } else {
        const insertData: HomepageReviewInsert = {
          name: form.name.trim(),
          location: form.location.trim() || null,
          quote: form.quote.trim(),
          rating: form.rating ? Number(form.rating) : null,
          avatar_url: form.avatar_url || null,
          sort_order: Number(form.sort_order),
        };

        await insertHomepageReview(insertData);
        toast.success("নতুন রিভিউ যোগ হয়েছে");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "রিভিউ এডিট করুন" : "নতুন রিভিউ যোগ করুন"}</DialogTitle>
          <DialogDescription>
            হোমপেজের স্লাইডারের জন্য রিভিউ তথ্য দিন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>নাম *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="বিনিয়োগকারী"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>অবস্থান (ঐচ্ছিক)</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="যেমন: ঢাকা"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>উক্তি *</Label>
            <Textarea
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="বিনিয়োগকারীর মতামত..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>রেটিং (১-৫)</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="rounded p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        form.rating && star <= form.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>সর্ট অর্ডার (Sort Order)</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>প্রোফাইল ছবি (ঐচ্ছিক)</Label>
            <div className="flex items-center gap-4">
              {form.avatar_url ? (
                <div className="relative h-16 w-16 shrink-0 rounded-full border border-border">
                  <img
                    src={form.avatar_url}
                    alt="Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, avatar_url: "" })}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-muted/50 text-muted-foreground">
                  <User className="h-8 w-8 opacity-50" />
                </div>
              )}

              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    uploading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
                </Label>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  বর্গাকার ছবি সবচেয়ে ভালো দেখাবে
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || uploading}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "আপডেট করুন" : "সেভ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
