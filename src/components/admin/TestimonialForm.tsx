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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  onSuccess: () => void;
}

export function TestimonialForm({
  open,
  onOpenChange,
  testimonial,
  onSuccess,
}: TestimonialFormProps) {
  const isEditing = !!testimonial;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    quote: "",
  });

  useEffect(() => {
    if (testimonial) {
      setForm({
        name: testimonial.name || "",
        location: testimonial.location || "",
        quote: testimonial.quote || "",
      });
    } else {
      setForm({ name: "", location: "", quote: "" });
    }
  }, [testimonial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("নাম এবং উক্তি অবশ্যই দিতে হবে");
      return;
    }

    setSaving(true);

    try {
      if (isEditing && testimonial) {
        const updateData: TestimonialUpdate = {
          name: form.name,
          location: form.location || null,
          quote: form.quote,
        };

        const { error } = await supabase
          .from("testimonials")
          .update(updateData)
          .eq("id", testimonial.id);

        if (error) throw error;
        toast.success("সফলভাবে আপডেট হয়েছে");
      } else {
        const insertData: TestimonialInsert = {
          name: form.name,
          location: form.location || null,
          quote: form.quote,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "প্রশংসা সম্পাদনা" : "নতুন প্রশংসা যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "তথ্য পরিবর্তন করে সেভ করুন"
              : "বিনিয়োগকারীর প্রশংসাপত্র যোগ করুন"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="test-location">অবস্থান</Label>
            <Input
              id="test-location"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="ঢাকা"
            />
          </div>

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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
