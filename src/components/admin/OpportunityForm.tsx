import { useState, useEffect, useCallback } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  Building2,
  ShieldAlert,
  Coins,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  Check,
  MoveLeft,
  MoveRight,
} from "lucide-react";
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

const RISK_LEVELS = [
  { value: "নিম্ন", label: "নিম্ন (Low)" },
  { value: "মধ্যম", label: "মধ্যম (Medium)" },
  { value: "উচ্চ", label: "উচ্চ (High)" },
];

const PAYOUT_STATUSES = [
  { value: "পরিশোধিত", label: "পরিশোধিত (Paid)" },
  { value: "প্রক্রিয়াধীন", label: "প্রক্রিয়াধীন (Processing)" },
  { value: "অপেক্ষমান", label: "অপেক্ষমান (Pending)" },
];

export interface RiskRow {
  risk_name: string;
  risk_level: string;
  description: string;
}

export interface PayoutRow {
  cycle_name: string;
  target_profit: string;
  actual_profit: string;
  status: string;
}

export interface LegalCheckRow {
  check_text: string;
}

interface OpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  onSuccess: () => void;
}

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}\-]+/gu, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `project-${Math.random().toString(36).substring(2, 9)}`
  );
}

export function OpportunityForm({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: OpportunityFormProps) {
  const isEditing = !!opportunity;

  const [activeTab, setActiveTab] = useState<string>("basic");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Populate form when editing or resetting
  useEffect(() => {
    if (open) {
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

        async function loadSubsections() {
          if (!opportunity?.id) return;
          const { risks: rData, payouts: pData, legalChecks: lData } = await fetchOpportunitySubsections(opportunity.id);
          setRisks(
            rData.map((r) => ({
              risk_name: r.risk_name,
              risk_level: r.risk_level || "মধ্যম",
              description: r.description || "",
            }))
          );
          setPayouts(
            pData.map((p) => ({
              cycle_name: p.cycle_name,
              target_profit: p.target_profit || "",
              actual_profit: p.actual_profit || "",
              status: p.status || "পরিশোধিত",
            }))
          );
          setLegalChecks(lData.map((l) => ({ check_text: l.check_text })));
        }
        loadSubsections();
      } else {
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
        setRisks([]);
        setPayouts([]);
        setLegalChecks([]);
      }
      setActiveTab("basic");
      setIsDirty(false);
    }
  }, [opportunity, open]);

  const updateField = (field: string, value: string) => {
    setIsDirty(true);
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && (!prev.slug || prev.slug === slugify(prev.name))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  // Image Upload helper
  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    if (form.image_urls.length + files.length > 6) {
      toast.error("সর্বোচ্চ ৬টি ছবি আপলোড করা যাবে");
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
        setForm((prev) => {
          const updatedUrls = [...prev.image_urls, ...newUrls].slice(0, 6);
          return { ...prev, image_urls: updatedUrls };
        });
        setIsDirty(true);
        toast.success(`${newUrls.length} টি ছবি আপলোড সম্পন্ন হয়েছে`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    await processFiles(files);
  };

  const removeImage = (index: number) => {
    setIsDirty(true);
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= form.image_urls.length) return;
    setIsDirty(true);
    setForm((prev) => {
      const copy = [...prev.image_urls];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, image_urls: copy };
    });
  };

  // Risk helpers
  const addRisk = () => {
    setIsDirty(true);
    setRisks((prev) => [...prev, { risk_name: "", risk_level: "মধ্যম", description: "" }]);
  };
  const updateRisk = (index: number, field: keyof RiskRow, val: string) => {
    setIsDirty(true);
    setRisks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removeRisk = (index: number) => {
    setIsDirty(true);
    setRisks((prev) => prev.filter((_, i) => i !== index));
  };
  const moveRisk = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= risks.length) return;
    setIsDirty(true);
    setRisks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  // Payout helpers
  const addPayout = () => {
    setIsDirty(true);
    setPayouts((prev) => [...prev, { cycle_name: "", target_profit: "", actual_profit: "", status: "পরিশোধিত" }]);
  };
  const updatePayout = (index: number, field: keyof PayoutRow, val: string) => {
    setIsDirty(true);
    setPayouts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removePayout = (index: number) => {
    setIsDirty(true);
    setPayouts((prev) => prev.filter((_, i) => i !== index));
  };

  // Legal check helpers
  const addLegalCheck = () => {
    setIsDirty(true);
    setLegalChecks((prev) => [...prev, { check_text: "" }]);
  };
  const updateLegalCheck = (index: number, val: string) => {
    setIsDirty(true);
    setLegalChecks((prev) => {
      const copy = [...prev];
      copy[index] = { check_text: val };
      return copy;
    });
  };
  const removeLegalCheck = (index: number) => {
    setIsDirty(true);
    setLegalChecks((prev) => prev.filter((_, i) => i !== index));
  };
  const moveLegalCheck = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= legalChecks.length) return;
    setIsDirty(true);
    setLegalChecks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.name.trim()) {
      setActiveTab("basic");
      toast.error("প্রজেক্টের নাম আবশ্যক");
      return;
    }
    if (!form.slug.trim()) {
      setActiveTab("basic");
      toast.error("প্রজেক্টের Slug আবশ্যক");
      return;
    }

    setSaving(true);

    try {
      let opportunityId = opportunity?.id;

      if (isEditing && opportunity) {
        const updateData: OpportunityUpdate = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          owner_name: form.owner_name.trim() || null,
          owner_phone: form.owner_phone.trim() || null,
          cfa_comment: form.cfa_comment.trim() || null,
          guarantee: form.guarantee.trim() || null,
          category: form.category.trim() || null,
          investment_type: form.investment_type.trim() || null,
          bank_details: form.bank_details.trim() || null,
          investment_amount: form.investment_amount.trim() || null,
          expected_profit: form.expected_profit.trim() || null,
          profit_period: form.profit_period.trim() || null,
          status: form.status || null,
          description: form.description.trim() || null,
          address: form.address.trim() || null,
          organization_type: form.organization_type.trim() || null,
          estimated_capital: form.estimated_capital.trim() || null,
          website_url: form.website_url.trim() || null,
          image_urls: form.image_urls.length > 0 ? form.image_urls : null,
        };

        const { error } = await supabase
          .from("opportunities")
          .update(updateData)
          .eq("id", opportunity.id);

        if (error) throw error;
        toast.success("সুযোগ সফলভাবে আপডেট হয়েছে");
      } else {
        const insertData: OpportunityInsert = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          owner_name: form.owner_name.trim() || null,
          owner_phone: form.owner_phone.trim() || null,
          cfa_comment: form.cfa_comment.trim() || null,
          guarantee: form.guarantee.trim() || null,
          category: form.category.trim() || null,
          investment_type: form.investment_type.trim() || null,
          bank_details: form.bank_details.trim() || null,
          investment_amount: form.investment_amount.trim() || null,
          expected_profit: form.expected_profit.trim() || null,
          profit_period: form.profit_period.trim() || null,
          status: form.status || null,
          description: form.description.trim() || null,
          address: form.address.trim() || null,
          organization_type: form.organization_type.trim() || null,
          estimated_capital: form.estimated_capital.trim() || null,
          website_url: form.website_url.trim() || null,
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
        toast.success("নতুন সুযোগ সফলভাবে যুক্ত হয়েছে");
      }

      if (opportunityId) {
        await Promise.all([
          supabase.from("opportunity_risks").delete().eq("opportunity_id", opportunityId),
          supabase.from("opportunity_payouts").delete().eq("opportunity_id", opportunityId),
          supabase.from("opportunity_legal_checks").delete().eq("opportunity_id", opportunityId),
        ]);

        const validRisks = risks.filter((r) => r.risk_name.trim() !== "");
        if (validRisks.length > 0) {
          await supabase.from("opportunity_risks").insert(
            validRisks.map((r, i) => ({
              opportunity_id: opportunityId!,
              risk_name: r.risk_name.trim(),
              risk_level: r.risk_level || "মধ্যম",
              description: r.description.trim() || null,
              sort_order: i,
            }))
          );
        }

        const validPayouts = payouts.filter((p) => p.cycle_name.trim() !== "");
        if (validPayouts.length > 0) {
          await supabase.from("opportunity_payouts").insert(
            validPayouts.map((p, i) => ({
              opportunity_id: opportunityId!,
              cycle_name: p.cycle_name.trim(),
              target_profit: p.target_profit.trim() || null,
              actual_profit: p.actual_profit.trim() || null,
              status: p.status || "পরিশোধিত",
              sort_order: i,
            }))
          );
        }

        const validLegal = legalChecks.filter((l) => l.check_text.trim() !== "");
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

      setIsDirty(false);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Save error:", err);
      if (err?.message?.includes("duplicate key") && err?.message?.includes("slug")) {
        toast.error("এই slug ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য slug দিন।");
      } else {
        toast.error(err?.message || "তথ্য সংরক্ষণ করতে সমস্যা হয়েছে");
      }
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (open) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, form, risks, payouts, legalChecks]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isDirty) {
          if (window.confirm("আপনার কিছু অসংরক্ষিত পরিবর্তন রয়েছে। আপনি কি নিশ্চিত যে ফর্মটি বন্ধ করতে চান?")) {
            onOpenChange(false);
          }
        } else {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-slate-200 shadow-2xl">
        {/* Dialog Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-[#FAFCFA] shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-[#051F20] tracking-tight">
                  {isEditing ? "বিনিয়োগ সুযোগ সম্পাদনা" : "নতুন বিনিয়োগ সুযোগ তৈরি"}
                </DialogTitle>
                {isDirty && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    অসংরক্ষিত পরিবর্তন
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                ট্যাব অনুযায়ী তথ্য পূরণ করুন। দ্রুত সেভ করতে <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded font-mono">Ctrl+S</kbd> চাপুন।
              </DialogDescription>
            </div>
          </div>

          {/* 6 Tabs Bar */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-3">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-slate-100/90 rounded-2xl gap-1">
              <TabsTrigger
                value="basic"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <Info className="h-3.5 w-3.5" />
                <span className="truncate">১. মূল তথ্য</span>
              </TabsTrigger>

              <TabsTrigger
                value="business"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">২. ব্যবসা</span>
              </TabsTrigger>

              <TabsTrigger
                value="risks"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="truncate">৩. ঝুঁকি ({risks.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="payouts"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <Coins className="h-3.5 w-3.5" />
                <span className="truncate">৪. পেআউট ({payouts.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="legal"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="truncate">৫. আইনি ({legalChecks.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="gallery"
                className="rounded-xl text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-[#0B2B26] data-[state=active]:shadow-2xs font-semibold gap-1.5"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="truncate">৬. ছবি ({form.image_urls.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <ScrollArea className="flex-1 overflow-y-auto max-h-[calc(92vh-180px)] px-6 py-5 bg-white">
          <form id="opportunity-form" onSubmit={handleSubmit} className="space-y-5 pb-6">
            {/* ═══════════ TAB 1: মূল তথ্য ═══════════ */}
            {activeTab === "basic" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-name" className="text-xs font-bold text-slate-700">
                      প্রজেক্টের নাম <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="opp-name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="যেমন: তাসনীম নিটিং মিলস"
                      className="rounded-xl bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-slug" className="text-xs font-bold text-slate-700">
                      Slug (URL Identifier) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="opp-slug"
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="tasneem-knitting"
                      className="rounded-xl bg-slate-50/50 font-mono text-xs"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">লিংক: /opportunities/{form.slug || "..."}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-category" className="text-xs font-bold text-slate-700">
                      ক্যাটাগরি
                    </Label>
                    <Input
                      id="opp-category"
                      list="category-suggestions"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      placeholder="ক্যাটাগরি বাছুন বা লিখুন..."
                      className="rounded-xl bg-slate-50/50"
                      autoComplete="off"
                    />
                    <datalist id="category-suggestions">
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">স্ট্যাটাস</Label>
                    <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                      <SelectTrigger className="rounded-xl bg-slate-50/50">
                        <SelectValue placeholder="স্ট্যাটাস বাছুন" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-inv-type" className="text-xs font-bold text-slate-700">
                      বিনিয়োগের ধরন
                    </Label>
                    <Input
                      id="opp-inv-type"
                      value={form.investment_type}
                      onChange={(e) => updateField("investment_type", e.target.value)}
                      placeholder="মুশারাকা / মুদারাবা / ট্রেডিং পার্টনারশিপ"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-amount" className="text-xs font-bold text-slate-700">
                      বিনিয়োগের পরিমাণ (লক্ষ/কোটি)
                    </Label>
                    <Input
                      id="opp-amount"
                      value={form.investment_amount}
                      onChange={(e) => updateField("investment_amount", e.target.value)}
                      placeholder="যেমন: ১০ লক্ষ টাকা / ২০ লক্ষ +"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-profit" className="text-xs font-bold text-slate-700">
                      প্রত্যাশিত মুনাফা (ROI)
                    </Label>
                    <Input
                      id="opp-profit"
                      value={form.expected_profit}
                      onChange={(e) => updateField("expected_profit", e.target.value)}
                      placeholder="যেমন: ১৮-২২% বার্ষিক / প্রতি মাসে ২%"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-period" className="text-xs font-bold text-slate-700">
                      মুনাফা প্রদানের সময়সীমা / মেয়াদ
                    </Label>
                    <Input
                      id="opp-period"
                      value={form.profit_period}
                      onChange={(e) => updateField("profit_period", e.target.value)}
                      placeholder="যেমন: প্রতি মাসে / প্রতি ৩ মাস অন্তর"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opp-desc" className="text-xs font-bold text-slate-700">
                    সংক্ষিপ্ত প্রজেক্ট বিবরণ
                  </Label>
                  <Textarea
                    id="opp-desc"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="প্রজেক্ট ও ব্যবসার সংক্ষিপ্ত রূপরেখা..."
                    rows={4}
                    className="rounded-2xl bg-slate-50/50 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ═══════════ TAB 2: ব্যবসার বিবরণ ═══════════ */}
            {activeTab === "business" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-owner" className="text-xs font-bold text-slate-700">
                      উদ্যোক্তা / মালিকের নাম
                    </Label>
                    <Input
                      id="opp-owner"
                      value={form.owner_name}
                      onChange={(e) => updateField("owner_name", e.target.value)}
                      placeholder="মোঃ তাসনীম আহমেদ"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-phone" className="text-xs font-bold text-slate-700">
                      মালিকের ফোন নম্বর
                    </Label>
                    <Input
                      id="opp-phone"
                      value={form.owner_phone}
                      onChange={(e) => updateField("owner_phone", e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="rounded-xl bg-slate-50/50 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-org-type" className="text-xs font-bold text-slate-700">
                      প্রতিষ্ঠানের ধরন
                    </Label>
                    <Input
                      id="opp-org-type"
                      value={form.organization_type}
                      onChange={(e) => updateField("organization_type", e.target.value)}
                      placeholder="যেমন: সোল প্রোপ্রাইটরশিপ / প্রাইভেট লিমিটেড"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-capital" className="text-xs font-bold text-slate-700">
                      আনুমানিক নিজস্ব পুঁজি
                    </Label>
                    <Input
                      id="opp-capital"
                      value={form.estimated_capital}
                      onChange={(e) => updateField("estimated_capital", e.target.value)}
                      placeholder="যেমন: ৩০ লক্ষ টাকা"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="opp-address" className="text-xs font-bold text-slate-700">
                      ব্যবসায়ের ঠিকানা / অবস্থান
                    </Label>
                    <Input
                      id="opp-address"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="যেমন: মেহেরপুর সদর, মেহেরপুর"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="opp-web" className="text-xs font-bold text-slate-700">
                      ওয়েবসাইট / ফেসবুক পেজ URL
                    </Label>
                    <Input
                      id="opp-web"
                      value={form.website_url}
                      onChange={(e) => updateField("website_url", e.target.value)}
                      placeholder="https://example.com"
                      className="rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opp-bank" className="text-xs font-bold text-slate-700">
                    ব্যাংক হিসাব ও আর্থিক তথ্য
                  </Label>
                  <Textarea
                    id="opp-bank"
                    value={form.bank_details}
                    onChange={(e) => updateField("bank_details", e.target.value)}
                    placeholder="ব্যাংকের নাম, একাউন্ট টাইপ বা লেনদেনের বিবরণ..."
                    rows={2}
                    className="rounded-2xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opp-guar" className="text-xs font-bold text-slate-700">
                    নিরাপত্তা ও গ্যারান্টি
                  </Label>
                  <Textarea
                    id="opp-guar"
                    value={form.guarantee}
                    onChange={(e) => updateField("guarantee", e.target.value)}
                    placeholder="যেমন: সিকিউরিটি চেক, স্ট্যাম্পে চুক্তিপত্র ইত্যাদি..."
                    rows={2}
                    className="rounded-2xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="opp-cfa" className="text-xs font-bold text-slate-700">
                    CFA / অডিট বিশ্লেষণ মন্তব্য
                  </Label>
                  <Textarea
                    id="opp-cfa"
                    value={form.cfa_comment}
                    onChange={(e) => updateField("cfa_comment", e.target.value)}
                    placeholder="বিনিয়োগ বিশ্লেষণ সংক্রান্ত পেশাদার মন্তব্য..."
                    rows={2}
                    className="rounded-2xl bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {/* ═══════════ TAB 3: ঝুঁকি বিশ্লেষণ ═══════════ */}
            {activeTab === "risks" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-[#051F20]">ঝুঁকি বিশ্লেষণের তালিকাসমূহ</h3>
                    <p className="text-xs text-muted-foreground">ঝুঁকি ও সম্ভাব্য প্রতিকার বিস্তারিত লিখুন</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addRisk}
                    className="rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs gap-1.5 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ঝুঁকি যোগ করুন</span>
                  </Button>
                </div>

                {risks.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                    <ShieldAlert className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-muted-foreground">এখনো কোনো ঝুঁকি বিশ্লেষণ যুক্ত করা হয়নি।</p>
                    <Button type="button" variant="outline" size="sm" onClick={addRisk} className="rounded-full text-xs">
                      প্রথম ঝুঁকি যোগ করুন
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {risks.map((r, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-full bg-[#0B2B26] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {i + 1}
                            </span>
                            <Input
                              value={r.risk_name}
                              onChange={(e) => updateRisk(i, "risk_name", e.target.value)}
                              placeholder="ঝুঁকির শিরোনাম (যেমন: কাঁচামালের মূল্য বৃদ্ধি)"
                              className="rounded-xl bg-white text-xs font-semibold"
                            />
                          </div>

                          <div className="w-36 shrink-0">
                            <Select
                              value={r.risk_level}
                              onValueChange={(val) => updateRisk(i, "risk_level", val)}
                            >
                              <SelectTrigger className="rounded-xl bg-white text-xs h-9">
                                <SelectValue placeholder="মাত্রা" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {RISK_LEVELS.map((lvl) => (
                                  <SelectItem key={lvl.value} value={lvl.value} className="text-xs">
                                    {lvl.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={i === 0}
                              onClick={() => moveRisk(i, "up")}
                              className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={i === risks.length - 1}
                              onClick={() => moveRisk(i, "down")}
                              className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRisk(i)}
                              className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <Textarea
                          value={r.description}
                          onChange={(e) => updateRisk(i, "description", e.target.value)}
                          placeholder="ঝুঁকির বিস্তারিত বিবরণ ও প্রতিরোধমূলক ব্যবস্থা..."
                          rows={2}
                          className="rounded-xl bg-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ TAB 4: পেআউট ইতিহাস ═══════════ */}
            {activeTab === "payouts" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-[#051F20]">পেআউট সাইকেল ও লাভ বন্টন</h3>
                    <p className="text-xs text-muted-foreground">বিনিয়োগকারীদের মুনাফা প্রদানের চক্র ও স্ট্যাটাস</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addPayout}
                    className="rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs gap-1.5 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>পেআউট যোগ করুন</span>
                  </Button>
                </div>

                {payouts.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                    <Coins className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-muted-foreground">এখনো কোনো পেআউট সাইকেল যুক্ত করা হয়নি।</p>
                    <Button type="button" variant="outline" size="sm" onClick={addPayout} className="rounded-full text-xs">
                      প্রথম পেআউট যোগ করুন
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((p, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                      >
                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-[11px] text-muted-foreground">চক্রের নাম</Label>
                          <Input
                            value={p.cycle_name}
                            onChange={(e) => updatePayout(i, "cycle_name", e.target.value)}
                            placeholder="যেমন: ১ম প্রান্তিক ২০২৬"
                            className="rounded-xl bg-white text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">লক্ষ্য মুনাফা</Label>
                          <Input
                            value={p.target_profit}
                            onChange={(e) => updatePayout(i, "target_profit", e.target.value)}
                            placeholder="যেমন: ২.৫%"
                            className="rounded-xl bg-white text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">প্রকৃত মুনাফা</Label>
                          <Input
                            value={p.actual_profit}
                            onChange={(e) => updatePayout(i, "actual_profit", e.target.value)}
                            placeholder="যেমন: ২.৭%"
                            className="rounded-xl bg-white text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-4 sm:pt-0">
                          <div className="flex-1">
                            <Select
                              value={p.status}
                              onValueChange={(val) => updatePayout(i, "status", val)}
                            >
                              <SelectTrigger className="rounded-xl bg-white text-xs h-9">
                                <SelectValue placeholder="স্ট্যাটাস" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {PAYOUT_STATUSES.map((st) => (
                                  <SelectItem key={st.value} value={st.value} className="text-xs">
                                    {st.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePayout(i)}
                            className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ TAB 5: আইনি যাচাই ═══════════ */}
            {activeTab === "legal" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-[#051F20]">আইনি যাচাই চেকলিস্ট</h3>
                    <p className="text-xs text-muted-foreground">বিনিয়োগের আইনি বৈধতা ও সিকিউরিটি চেকলিস্ট আইটেম</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addLegalCheck}
                    className="rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs gap-1.5 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>চেক আইটেম যোগ করুন</span>
                  </Button>
                </div>

                {legalChecks.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-muted-foreground">এখনো কোনো আইনি যাচাই আইটেম যুক্ত করা হয়নি।</p>
                    <Button type="button" variant="outline" size="sm" onClick={addLegalCheck} className="rounded-full text-xs">
                      প্রথম চেক আইটেম যোগ করুন
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {legalChecks.map((l, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                          <Input
                            value={l.check_text}
                            onChange={(e) => updateLegalCheck(i, e.target.value)}
                            placeholder="যেমন: ট্রেড লাইসেন্স ও ট্যাক্স রিটার্ন ভেরিফাইড"
                            className="rounded-xl bg-white text-xs font-medium"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={i === 0}
                            onClick={() => moveLegalCheck(i, "up")}
                            className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200"
                            title="উপরে নিন"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={i === legalChecks.length - 1}
                            onClick={() => moveLegalCheck(i, "down")}
                            className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-200"
                            title="নিচে নিন"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLegalCheck(i)}
                            className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════ TAB 6: ছবি ও গ্যালারি ═══════════ */}
            {activeTab === "gallery" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-[#051F20]">প্রজেক্ট ছবি গ্যালারি (সর্বোচ্চ ৬টি)</h3>
                  <p className="text-xs text-muted-foreground">ড্র্যাগ ও ড্রপ করে অথবা ফাইল সিলেক্ট করে ছবি আপলোড করুন</p>
                </div>

                {/* Drag and drop upload zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                    isDragOver
                      ? "border-emerald-600 bg-emerald-50/50 scale-[1.01]"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#051F20]">
                        {uploading ? "ছবি আপলোড হচ্ছে..." : "ছবি টেনে এখানে ফেলুন অথবা ব্রাউজ করুন"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">JPG, PNG, WEBP (প্রতিটি সর্বোচ্চ ৫MB)</p>
                    </div>

                    <label
                      htmlFor="opp-image-files"
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>ফাইল নির্বাচন করুন</span>
                      <input
                        id="opp-image-files"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading || form.image_urls.length >= 6}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Image Thumbnails Grid */}
                {form.image_urls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-slate-700">আপলোডকৃত ছবিসমূহ ({form.image_urls.length}/৬)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.image_urls.map((url, i) => (
                        <div
                          key={i}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-2xs"
                        >
                          <img src={url} alt={`Opportunity ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-[#0B2B26]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            #{i + 1} {i === 0 && "(কভার)"}
                          </div>

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={i === 0}
                              onClick={() => moveImage(i, "left")}
                              className="w-7 h-7 rounded-full bg-white/20 text-white hover:bg-white/40"
                              title="বামে সরান"
                            >
                              <MoveLeft className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={i === form.image_urls.length - 1}
                              onClick={() => moveImage(i, "right")}
                              className="w-7 h-7 rounded-full bg-white/20 text-white hover:bg-white/40"
                              title="ডানে সরান"
                            >
                              <MoveRight className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeImage(i)}
                              className="w-7 h-7 rounded-full bg-red-600/80 text-white hover:bg-red-700"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </ScrollArea>

        {/* Sticky Action Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-[#FAFCFA] flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{isEditing ? "সম্পাদনা মোড" : "নতুন এন্ট্রি"}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isDirty) {
                  if (window.confirm("আপনার অসংরক্ষিত পরিবর্তন বাতিল করতে চান?")) {
                    onOpenChange(false);
                  }
                } else {
                  onOpenChange(false);
                }
              }}
              disabled={saving}
              className="rounded-full text-xs px-4"
            >
              বাতিল
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className="rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold px-6 gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{isEditing ? "পরিবর্তন সংরক্ষণ করুন" : "সুযোগ প্রকাশ করুন"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
