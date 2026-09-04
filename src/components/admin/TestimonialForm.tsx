import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Testimonial, TestimonialInsert, TestimonialUpdate } from "@/lib/database.types";
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
import { Loader2, Star, X, User } from "lucide-react";
import { toast } from "sonner";

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  onSuccess: () => void;
  opportunities?: { id: string; name: string }[];
}

export function TestimonialForm({
  open,
  onOpenChange,
  testimonial,
  onSuccess,
  opportunities = [],
}: TestimonialFormProps) {
  const isEditing = !!testimonial;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    quote: "",
    brand_name: "",
    related_opportunity_id: "",
    role_title: "",
    rating: 5 as number | null,
    avatar_url: "",
    investment_amount: "",
  });

  useEffect(() => {
    if (testimonial) {
      setForm({
        name: testimonial.name || "",
        location: testimonial.location || "",
        quote: testimonial.quote || "",
        brand_name: testimonial.brand_name || "",
        related_opportunity_id: testimonial.related_opportunity_id || "",
        role_title: testimonial.role_title || "",
        rating:
          testimonial.rating !== null && testimonial.rating !== undefined
            ? parseInt(String(testimonial.rating), 10) || 5
            : 5,
        avatar_url: testimonial.avatar_url || "",
        investment_amount: testimonial.investment_amount || "",
      });
    } else {
      setForm({
        name: "",
        location: "",
        quote: "",
        brand_name: "",
        related_opportunity_id: "",
        role_title: "",
        rating: 5,
        avatar_url: "",
        investment_amount: "",
      });
    }
  }, [testimonial, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করুন");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ৫MB এর বেশি হতে পারবে না");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `testimonials/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("opportunity-images")
        .upload(fileName, file, { upsert: true });

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

  const handleOppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const oppId = e.target.value;
    const opp = (opportunities ?? []).find((o) => o.id === oppId);
    setForm((prev) => ({
      ...prev,
      related_opportunity_id: oppId,
      brand_name: opp ? opp.name : prev.brand_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("নাম এবং উক্তি অবশ্যই দিতে হবে");
      return;
    }

    setSaving(true);

    try {
      const ratingParsed =
        form.rating !== null && form.rating !== undefined
          ? parseInt(String(form.rating), 10) || 5
          : 5;
      const relatedOppId = form.related_opportunity_id?.trim() || null;

      if (isEditing && testimonial) {
        const updateData: TestimonialUpdate = {
          name: form.name.trim(),
          location: form.location.trim() || null,
          quote: form.quote.trim(),
          brand_name: form.brand_name.trim() || null,
          related_opportunity_id: relatedOppId,
          role_title: form.role_title.trim() || null,
          rating: ratingParsed,
          avatar_url: form.avatar_url || null,
          investment_amount: form.investment_amount.trim() || null,
        };

        const { error } = await supabase
          .from("testimonials")
          .update(updateData)
          .eq("id", testimonial.id);

        if (error) throw error;
        toast.success("সফলভাবে আপডেট হয়েছে");
      } else {
        const insertData: TestimonialInsert = {
          name: form.name.trim(),
          location: form.location.trim() || null,
          quote: form.quote.trim(),
          brand_name: form.brand_name.trim() || null,
          related_opportunity_id: relatedOppId,
          role_title: form.role_title.trim() || null,
          rating: ratingParsed,
          avatar_url: form.avatar_url || null,
          investment_amount: form.investment_amount.trim() || null,
        };

        const { error } = await supabase
          .from("testimonials")
          .insert(insertData);

        if (error) throw error;
        toast.success("নতুন প্রশংসা যোগ করা হয়েছে");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "প্রশংসা সম্পাদনা" : "নতুন প্রশংসা যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "তথ্য পরিবর্তন করে সেভ করুন"
              : "বিনিয়োগকারীর প্রশংসাপত্র ও বিস্তারিত তথ্য যোগ করুন"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. প্রোফাইল ছবি ও নাম */}
          <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-background flex items-center justify-center">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Avatar"
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground/50" />
              )}
              {form.avatar_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatar_url: "" }))}
                  className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                  title="ছবি মুছুন"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <Label htmlFor="avatar-upload" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                প্রোফাইল ছবি (ঐচ্ছিক)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs h-9 cursor-pointer"
                />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
            </div>
          </div>

          {/* 2. নাম ও পদবী */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="test-name">নাম *</Label>
              <Input
                id="test-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="আব্দুল করিম"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-role">পদবী/ভূমিকা (ঐচ্ছিক)</Label>
              <Input
                id="test-role"
                value={form.role_title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role_title: e.target.value }))
                }
                placeholder="যেমন: বিনিয়োগকারী, প্রতিষ্ঠাতা"
              />
            </div>
          </div>

          {/* 3. অবস্থান ও বিনিয়োগের পরিমাণ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="test-location">অবস্থান (ঐচ্ছিক)</Label>
              <Input
                id="test-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="যেমন: ঢাকা, চট্টগ্রাম"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-amount">বিনিয়োগের পরিমাণ (ঐচ্ছিক)</Label>
              <Input
                id="test-amount"
                value={form.investment_amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, investment_amount: e.target.value }))
                }
                placeholder="যেমন: ৫০,০০০ টাকা বিনিয়োগ করেছেন"
              />
            </div>
          </div>

          {/* 4. ব্র্যান্ড/ব্যবসার নাম ও সম্পর্কিত সুযোগ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="test-brand">ব্র্যান্ড/ব্যবসার নাম (ঐচ্ছিক)</Label>
              <Input
                id="test-brand"
                list="opp-suggestions"
                value={form.brand_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, brand_name: e.target.value }))
                }
                placeholder="যেমন: তাসনিম নিটিং"
              />
              <datalist id="opp-suggestions">
                {(opportunities ?? []).map((opp) => (
                  <option key={opp.id} value={opp.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-related-opp">সম্পর্কিত সুযোগ (ঐচ্ছিক)</Label>
              <select
                id="test-related-opp"
                value={form.related_opportunity_id}
                onChange={handleOppChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">কোনোটি নির্বাচন করা হয়নি</option>
                {(opportunities ?? []).map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. রেটিং */}
          <div className="space-y-1.5">
            <Label className="block">রেটিং (১-৫ স্টার)</Label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      rating: prev.rating === star ? null : star,
                    }))
                  }
                  className="p-1 rounded hover:bg-muted transition-colors focus:outline-none cursor-pointer"
                  title={`${star} স্টার`}
                >
                  <Star
                    className={`h-6 w-6 transition-transform hover:scale-110 ${
                      (form.rating || 0) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                {form.rating ? `${form.rating} স্টার` : "কোনো রেটিং নেই"}
              </span>
            </div>
          </div>

          {/* 6. উক্তি * */}
          <div className="space-y-1.5">
            <Label htmlFor="test-quote">উক্তি *</Label>
            <Textarea
              id="test-quote"
              value={form.quote}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, quote: e.target.value }))
              }
              placeholder="বিনিয়োগ বৃদ্ধি আমার জন্য খুবই উপকারী হয়েছে..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || uploading}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  সেভ হচ্ছে...
                </>
              ) : isEditing ? (
                "আপডেট করুন"
              ) : (
                "যোগ করুন"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
