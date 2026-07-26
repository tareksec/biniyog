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
import { useOpportunities, uniqueCategories, fetchOpportunitySubsections } from "@/lib/projects";

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

interface RiskRow {
  risk_name: string;
  risk_level: string;
  description: string;
}

interface PayoutRow {
  cycle_name: string;
  target_profit: string;
  actual_profit: string;
  status: string;
}

interface LegalCheckRow {
  check_text: string;
}

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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    image_urls: [] as string[],
  });

  const [risks, setRisks] = useState<RiskRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [legalChecks, setLegalChecks] = useState<LegalCheckRow[]>([]);

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
        image_urls: opportunity.image_urls || [],
      });
      setImagePreviews(opportunity.image_urls || []);

      async function loadSubsections() {
        if (!opportunity?.id) return;
        const { risks: rData, payouts: pData, legalChecks: lData } = await fetchOpportunitySubsections(opportunity.id);
        setRisks(rData.map(r => ({ risk_name: r.risk_name, risk_level: r.risk_level, description: r.description || "" })));
        setPayouts(pData.map(p => ({ cycle_name: p.cycle_name, target_profit: p.target_profit || "", actual_profit: p.actual_profit || "", status: p.status })));
        setLegalChecks(lData.map(l => ({ check_text: l.check_text })));
      }
      loadSubsections();
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
        image_urls: [],
      });
      setImagePreviews([]);
      setRisks([]);
      setPayouts([]);
      setLegalChecks([]);
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (form.image_urls.length + files.length > 3) {
      toast.error("সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে");
      return;
    }

    setUploading(true);

    try {
      const newUrls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করুন");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("ফাইল সাইজ ৫MB এর বেশি হতে পারবে না");
          continue;
        }

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

        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        setForm(prev => {
          const updatedUrls = [...prev.image_urls, ...newUrls].slice(0, 3);
          const updated = { ...prev, image_urls: updatedUrls };
          setImagePreviews(updatedUrls);
          return updated;
        });
        toast.success("ইমেজ আপলোড হয়েছে");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("ইমেজ আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const updatedUrls = [...prev.image_urls];
      updatedUrls.splice(index, 1);
      const updated = { ...prev, image_urls: updatedUrls };
      setImagePreviews(updatedUrls);
      return updated;
    });
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setForm(prev => {
      const newUrls = [...prev.image_urls];
      if (direction === "left" && index > 0) {
        [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
      } else if (direction === "right" && index < newUrls.length - 1) {
        [newUrls[index + 1], newUrls[index]] = [newUrls[index], newUrls[index + 1]];
      }
      setImagePreviews(newUrls);
      return { ...prev, image_urls: newUrls };
    });
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
      let opportunityId = opportunity?.id;

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
          image_urls: form.image_urls.length > 0 ? form.image_urls : null,
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
          image_urls: form.image_urls.length > 0 ? form.image_urls : null,
        };

        const { data: inserted, error } = await supabase
          .from("opportunities")
          .insert(insertData)
          .select("id")
          .single();

        if (error) throw error;
        if (!inserted?.id) throw new Error("Failed to get ID of new opportunity");
        opportunityId = inserted.id;
        toast.success("নতুন সুযোগ যোগ করা হয়েছে");
      }

      if (opportunityId) {
        await Promise.all([
          supabase.from("opportunity_risks").delete().eq("opportunity_id", opportunityId),
          supabase.from("opportunity_payouts").delete().eq("opportunity_id", opportunityId),
          supabase.from("opportunity_legal_checks").delete().eq("opportunity_id", opportunityId),
        ]);

        const validRisks = risks.filter(r => r.risk_name.trim() !== "");
        if (validRisks.length > 0) {
          await supabase.from("opportunity_risks").insert(
            validRisks.map((r, i) => ({
              opportunity_id: opportunityId!,
              risk_name: r.risk_name.trim(),
              risk_level: r.risk_level || "মধ্যম",
              description: r.description || null,
              sort_order: i,
            }))
          );
        }

        const validPayouts = payouts.filter(p => p.cycle_name.trim() !== "");
        if (validPayouts.length > 0) {
          await supabase.from("opportunity_payouts").insert(
            validPayouts.map((p, i) => ({
              opportunity_id: opportunityId!,
              cycle_name: p.cycle_name.trim(),
              target_profit: p.target_profit || null,
              actual_profit: p.actual_profit || null,
              status: p.status || "পেইড",
              sort_order: i,
            }))
          );
        }

        const validLegal = legalChecks.filter(l => l.check_text.trim() !== "");
        if (validLegal.length > 0) {
          await supabase.from("opportunity_legal_checks").insert(
            validLegal.map((l, i) => ({
              opportunity_id: opportunityId!,
              check_text: l.check_text.trim(),
              sort_order: i,
            }))
          );
        }
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
              <Label>প্রজেক্টের ছবি (সর্বোচ্চ ৩টি)</Label>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative inline-block">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-auto rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); moveImage(index, "left"); }}
                            className="bg-black/50 text-white rounded p-1 hover:bg-black"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                          </button>
                        )}
                        {index < imagePreviews.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); moveImage(index, "right"); }}
                            className="bg-black/50 text-white rounded p-1 hover:bg-black"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length < 3 && (
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
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* SUB-SECTIONS DIVIDER */}
            <div className="pt-6 border-t border-border mt-6">
              <h3 className="font-display text-lg font-bold text-foreground">ডাইনামিক সেকশনসমূহ</h3>
              <p className="text-xs text-muted-foreground mt-0.5">নিচের তালিকাগুলো পূরণ করলে ডিটেইল পেজে প্রদর্শিত হবে। খালি থাকলে সেকশনটি লুকানো থাকবে।</p>
            </div>

            {/* 1. ঝুঁকি বিশ্লেষণ */}
            <div className="space-y-3 p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold text-foreground">ঝুঁকি বিশ্লেষণ (Risk Analysis)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRisks([...risks, { risk_name: "", risk_level: "মধ্যম", description: "" }])}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                >
                  + নতুন ঝুঁকি যোগ করুন
                </Button>
              </div>
              {risks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">কোনো ঝুঁকি যোগ করা হয়নি।</p>
              ) : (
                <div className="space-y-3 mt-2">
                  {risks.map((r, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-surface/50 space-y-2.5 relative">
                      <button
                        type="button"
                        onClick={() => setRisks(risks.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                        title="মুছে ফেলুন"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">ঝুঁকির নাম</Label>
                          <Input
                            placeholder="যেমন: মার্কেট রিস্ক"
                            value={r.risk_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRisks(risks.map((item, i) => i === index ? { ...item, risk_name: val } : item));
                            }}
                            className="h-8 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">মাত্রা (Level)</Label>
                          <Select
                            value={r.risk_level}
                            onValueChange={(val) => {
                              setRisks(risks.map((item, i) => i === index ? { ...item, risk_level: val } : item));
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm mt-0.5">
                              <SelectValue placeholder="মাত্রা নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="নিম্ন">নিম্ন</SelectItem>
                              <SelectItem value="মধ্যম">মধ্যম</SelectItem>
                              <SelectItem value="উচ্চ">উচ্চ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">বিবরণ</Label>
                        <Textarea
                          placeholder="ঝুঁকির বিবরণ লিখুন..."
                          value={r.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRisks(risks.map((item, i) => i === index ? { ...item, description: val } : item));
                          }}
                          className="text-sm min-h-[50px] mt-0.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. অতীত পেআউট পারফরম্যান্স */}
            <div className="space-y-3 p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold text-foreground">অতীত পেআউট পারফরম্যান্স (Payouts)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayouts([...payouts, { cycle_name: "", target_profit: "", actual_profit: "", status: "পেইড" }])}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                >
                  + নতুন সাইকেল যোগ করুন
                </Button>
              </div>
              {payouts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">কোনো পেআউট সাইকেল যোগ করা হয়নি।</p>
              ) : (
                <div className="space-y-3 mt-2">
                  {payouts.map((p, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-surface/50 space-y-2.5 relative">
                      <button
                        type="button"
                        onClick={() => setPayouts(payouts.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                        title="মুছে ফেলুন"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-6">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">সাইকেল নাম</Label>
                          <Input
                            placeholder="যেমন: অক্টোবর ২০২৫"
                            value={p.cycle_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPayouts(payouts.map((item, i) => i === index ? { ...item, cycle_name: val } : item));
                            }}
                            className="h-8 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">টার্গেট মুনাফা</Label>
                          <Input
                            placeholder="যেমন: ১৮.৫%"
                            value={p.target_profit}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPayouts(payouts.map((item, i) => i === index ? { ...item, target_profit: val } : item));
                            }}
                            className="h-8 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">প্রকৃত মুনাফা</Label>
                          <Input
                            placeholder="যেমন: ১৯.২%"
                            value={p.actual_profit}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPayouts(payouts.map((item, i) => i === index ? { ...item, actual_profit: val } : item));
                            }}
                            className="h-8 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">স্ট্যাটাস</Label>
                          <Select
                            value={p.status}
                            onValueChange={(val) => {
                              setPayouts(payouts.map((item, i) => i === index ? { ...item, status: val } : item));
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm mt-0.5">
                              <SelectValue placeholder="স্ট্যাটাস" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="পেইড">পেইড</SelectItem>
                              <SelectItem value="চলমান">চলমান</SelectItem>
                              <SelectItem value="বাকি">বাকি</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. আইনি নিরাপত্তা */}
            <div className="space-y-3 p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold text-foreground">আইনি নিরাপত্তা (Legal Checks)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLegalChecks([...legalChecks, { check_text: "" }])}
                  className="text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                >
                  + নতুন যোগ করুন
                </Button>
              </div>
              {legalChecks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">কোনো আইনি নিরাপত্তা শর্ত যোগ করা হয়নি।</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {legalChecks.map((l, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="যেমন: নোটারাইজড চুক্তিনামা ও লিগ্যাল রিভিউ সম্পন্ন"
                        value={l.check_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLegalChecks(legalChecks.map((item, i) => i === index ? { ...item, check_text: val } : item));
                        }}
                        className="h-9 text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setLegalChecks(legalChecks.filter((_, i) => i !== index))}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                        title="মুছে ফেলুন"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
