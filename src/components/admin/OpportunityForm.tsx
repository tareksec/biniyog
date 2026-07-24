import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Opportunity, OpportunityInsert, OpportunityUpdate } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useOpportunities, uniqueCategories } from "@/lib/projects";

// Default suggestions if the DB doesn't have many yet
const DEFAULT_CATEGORIES = [
  "এগ্রো/কৃষি",
  "গার্মেন্টস/ফ্যাশন",
  "আইটি/টেক",
  "ফার্মেসী/মেডিকেল",
  "খাবার/রেস্টুরেন্ট",
  "ই-কমার্স/রিটেইল",
  "ম্যানুফ্যাকচারিং",
  "ট্রান্সপোর্ট/লজিস্টিকস",
  "এডুকেশন/ট্রেনিং",
  "রিয়েল এস্টেট",
  "ট্রেডিং/বাণিজ্য",
];

const STATUS_OPTIONS = [
  { value: "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে", label: "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে" },
  { value: "বিনিয়োগ নেওয়া শেষের দিকে", label: "বিনিয়োগ নেওয়া শেষের দিকে" },
  { value: "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ", label: "বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ" },
  { value: "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।", label: "বিনিয়োগ নেওয়া শেষ-সহসা শুরু হবার সম্ভাবনা নেই।" },
  { value: "আমরা তাদের নিয়ে এখন আর কাজ করছি না", label: "আমরা তাদের নিয়ে এখন আর কাজ করছি না" },
];

interface OpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  onSuccess: () => void;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `project-${Math.random().toString(36).substring(2, 9)}`;
}

export function OpportunityForm({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: OpportunityFormProps) {
  const isEditing = !!opportunity;

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch existing opportunities for dynamic category datalist
  const { data: opportunities } = useOpportunities();
  const existingCategories = uniqueCategories(opportunities || []);
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    owner_name: "",
    owner_phone: "",
    cfa_comment: "",
    guarantee: "",
    category: "",
    investment_type: "",
    bank_details: "",
    investment_amount: "",
    expected_profit: "",
    profit_period: "",
    status: STATUS_OPTIONS[0].value,
    description: "",
    address: "",
    organization_type: "",
    estimated_capital: "",
    website_url: "",
    image_url: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (opportunity) {
      setForm({
        name: opportunity.name || "",
        slug: opportunity.slug || "",
        owner_name: opportunity.owner_name || "",
        owner_phone: opportunity.owner_phone || "",
        cfa_comment: opportunity.cfa_comment || "",
        guarantee: opportunity.guarantee || "",
        category: opportunity.category || "",
        investment_type: opportunity.investment_type || "",
        bank_details: opportunity.bank_details || "",
        investment_amount: opportunity.investment_amount || "",
        expected_profit: opportunity.expected_profit || "",
        profit_period: opportunity.profit_period || "",
        status: opportunity.status || STATUS_OPTIONS[0].value,
        description: opportunity.description || "",
        address: opportunity.address || "",
        organization_type: opportunity.organization_type || "",
        estimated_capital: opportunity.estimated_capital || "",
        website_url: opportunity.website_url || "",
        image_url: opportunity.image_url || "",
      });
      setImagePreview(opportunity.image_url || null);
    } else {
      // Reset form for new entry
      setForm({
        name: "",
        slug: "",
        owner_name: "",
        owner_phone: "",
        cfa_comment: "",
        guarantee: "",
        category: "",
        investment_type: "",
        bank_details: "",
        investment_amount: "",
        expected_profit: "",
        profit_period: "",
        status: STATUS_OPTIONS[0].value,
        description: "",
        address: "",
        organization_type: "",
        estimated_capital: "",
        website_url: "",
        image_url: "",
      });
      setImagePreview(null);
    }
  }, [opportunity, open]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from name if slug is empty or matches previous auto-slug
      if (field === "name" && (!prev.slug || prev.slug === slugify(prev.name))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `opportunities/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("opportunity-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("opportunity-images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      updateField("image_url", publicUrl);
      setImagePreview(publicUrl);
      toast.success("ইমেজ আপলোড হয়েছে");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("ইমেজ আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    updateField("image_url", "");
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("প্রজেক্টের নাম দিন");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug ফাঁকা হতে পারবে না");
      return;
    }

    setSaving(true);

    try {
      if (isEditing && opportunity) {
        const updateData: OpportunityUpdate = {
          name: form.name,
          slug: form.slug,
          owner_name: form.owner_name || null,
          owner_phone: form.owner_phone || null,
          cfa_comment: form.cfa_comment || null,
          guarantee: form.guarantee || null,
          category: form.category || null,
          investment_type: form.investment_type || null,
          bank_details: form.bank_details || null,
          investment_amount: form.investment_amount || null,
          expected_profit: form.expected_profit || null,
          profit_period: form.profit_period || null,
          status: form.status || null,
          description: form.description || null,
          address: form.address || null,
          organization_type: form.organization_type || null,
          estimated_capital: form.estimated_capital || null,
          website_url: form.website_url || null,
          image_url: form.image_url || null,
        };

        const { error } = await supabase
          .from("opportunities")
          .update(updateData)
          .eq("id", opportunity.id);

        if (error) throw error;
        toast.success("সফলভাবে আপডেট হয়েছে");
      } else {
        const insertData: OpportunityInsert = {
          name: form.name,
          slug: form.slug,
          owner_name: form.owner_name || null,
          owner_phone: form.owner_phone || null,
          cfa_comment: form.cfa_comment || null,
          guarantee: form.guarantee || null,
          category: form.category || null,
          investment_type: form.investment_type || null,
          bank_details: form.bank_details || null,
          investment_amount: form.investment_amount || null,
          expected_profit: form.expected_profit || null,
          profit_period: form.profit_period || null,
          status: form.status || null,
          description: form.description || null,
          address: form.address || null,
          organization_type: form.organization_type || null,
          estimated_capital: form.estimated_capital || null,
          website_url: form.website_url || null,
          image_url: form.image_url || null,
        };

        const { error } = await supabase
          .from("opportunities")
          .insert(insertData);

        if (error) throw error;
        toast.success("নতুন সুযোগ যোগ করা হয়েছে");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Save error:", err);
      if (err?.message?.includes("duplicate key") && err?.message?.includes("slug")) {
        toast.error("এই slug ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য slug দিন।");
      } else {
        toast.error(err?.message || "সেভ করতে সমস্যা হয়েছে");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {isEditing ? "সুযোগ সম্পাদনা" : "নতুন সুযোগ যোগ করুন"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "তথ্য পরিবর্তন করে সেভ করুন"
              : "নতুন বিনিয়োগ সুযোগের সকল তথ্য পূরণ করুন"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 pr-2">
            {/* Row 1: Name + Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-name">প্রজেক্টের নাম *</Label>
                <Input
                  id="opp-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="তাসনীম নিটিং"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-slug">Slug *</Label>
                <Input
                  id="opp-slug"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="tasneem-knitting"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier
                </p>
              </div>
            </div>

            {/* Row 2: Owner + Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-owner">মালিকের নাম</Label>
                <Input
                  id="opp-owner"
                  value={form.owner_name}
                  onChange={(e) => updateField("owner_name", e.target.value)}
                  placeholder="মোঃ তাসনীম আহমেদ"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-phone">মালিকের ফোন</Label>
                <Input
                  id="opp-phone"
                  value={form.owner_phone}
                  onChange={(e) => updateField("owner_phone", e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            {/* Row 3: Category + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-category">ক্যাটাগরি</Label>
                <Input
                  id="opp-category"
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="নির্বাচন করুন বা নতুন লিখুন..."
                  autoComplete="off"
                />
                <datalist id="category-suggestions">
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  তালিকা থেকে বেছে নিন অথবা নতুন কিছু টাইপ করুন।
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>স্ট্যাটাস</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v)}
                >
                  <SelectTrigger id="opp-status">
                    <SelectValue placeholder="স্ট্যাটাস বাছুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Investment Type + Organization Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-inv-type">বিনিয়োগের ধরন</Label>
                <Input
                  id="opp-inv-type"
                  value={form.investment_type}
                  onChange={(e) =>
                    updateField("investment_type", e.target.value)
                  }
                  placeholder="মুশারাকা / মুদারাবা"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-org-type">প্রতিষ্ঠানের ধরন</Label>
                <Input
                  id="opp-org-type"
                  value={form.organization_type}
                  onChange={(e) =>
                    updateField("organization_type", e.target.value)
                  }
                  placeholder="সোল প্রোপ্রাইটরশিপ"
                />
              </div>
            </div>

            {/* Row 5: Investment Amount + Expected Profit */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-amount">বিনিয়োগের পরিমাণ</Label>
                <Input
                  id="opp-amount"
                  value={form.investment_amount}
                  onChange={(e) =>
                    updateField("investment_amount", e.target.value)
                  }
                  placeholder="৫ লাখ — ২০ লাখ"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-profit">প্রত্যাশিত মুনাফা</Label>
                <Input
                  id="opp-profit"
                  value={form.expected_profit}
                  onChange={(e) =>
                    updateField("expected_profit", e.target.value)
                  }
                  placeholder="১৮-২৫%"
                />
              </div>
            </div>

            {/* Row 6: Profit Period + Estimated Capital */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="opp-period">মুনাফা প্রদানের সময়সীমা</Label>
                <Input
                  id="opp-period"
                  value={form.profit_period}
                  onChange={(e) => updateField("profit_period", e.target.value)}
                  placeholder="প্রতি ৩ মাসে"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="opp-capital">আনুমানিক পুঁজি</Label>
                <Input
                  id="opp-capital"
                  value={form.estimated_capital}
                  onChange={(e) =>
                    updateField("estimated_capital", e.target.value)
                  }
                  placeholder="১ কোটি"
                />
              </div>
            </div>

            {/* Guarantee */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-guarantee">গ্যারান্টি / যাচাই</Label>
              <Input
                id="opp-guarantee"
                value={form.guarantee}
                onChange={(e) => updateField("guarantee", e.target.value)}
                placeholder="CFA দ্বারা যাচাইকৃত"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-address">ঠিকানা</Label>
              <Input
                id="opp-address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="ঢাকা, বাংলাদেশ"
              />
            </div>

            {/* CFA Comment */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-cfa">CFA মন্তব্য</Label>
              <Textarea
                id="opp-cfa"
                value={form.cfa_comment}
                onChange={(e) => updateField("cfa_comment", e.target.value)}
                placeholder="বিশ্লেষকের মন্তব্য..."
                rows={3}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-desc">বিস্তারিত বিবরণ</Label>
              <Textarea
                id="opp-desc"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="প্রজেক্টের বিস্তারিত বিবরণ..."
                rows={4}
              />
            </div>

            {/* Bank Details */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-bank">ব্যাংক বিবরণ</Label>
              <Textarea
                id="opp-bank"
                value={form.bank_details}
                onChange={(e) => updateField("bank_details", e.target.value)}
                placeholder="অ্যাকাউন্ট নম্বর, সুইফট কোড, রাউটিং নং, শাখা, ঠিকানা..."
                rows={3}
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label htmlFor="opp-website">ওয়েবসাইট URL</Label>
              <Input
                id="opp-website"
                type="url"
                value={form.website_url}
                onChange={(e) => updateField("website_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label>প্রজেক্টের ছবি</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="opp-image-upload"
                  className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  <span>
                    {uploading
                      ? "আপলোড হচ্ছে..."
                      : "ছবি আপলোড করুন (সর্বোচ্চ ৫MB)"}
                  </span>
                  <input
                    id="opp-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                বাতিল
              </Button>
              <Button type="submit" disabled={saving || uploading}>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
