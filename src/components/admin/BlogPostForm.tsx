import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import type { BlogPost, BlogCategory } from "@/lib/database.types";
import { useBlogCategories } from "@/lib/blog";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Loader2,
  Upload,
  X,
  ChevronLeft,
  Plus,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Globe,
  Save,
  CheckCircle2,
  Eye,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const RichTextEditor = lazy(() =>
  import("./RichTextEditor").then((m) => ({ default: m.RichTextEditor }))
);

const blogPostSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক"),
  slug: z.string().min(1, "স্লাগ আবশ্যক"),
  category_id: z.string().optional(),
  cover_image_url: z.string().optional(),
  excerpt: z.string().optional(),
  content_html: z.string().min(1, "কন্টেন্ট আবশ্যক"),
  author_name: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}\-]+/gu, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `post-${Math.random().toString(36).substring(2, 9)}`
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

interface BlogPostFormProps {
  post?: BlogPost | null;
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, refetch: refetchCategories } = useBlogCategories();

  const [savingAs, setSavingAs] = useState<"draft" | "published" | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    post?.updated_at || post?.created_at || null
  );

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      category_id: post?.category_id || undefined,
      cover_image_url: post?.cover_image_url || "",
      excerpt: post?.excerpt || "",
      content_html: post?.content_html || "",
      author_name: post?.author_name || "অ্যাডমিন টিম",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const coverImageUrl = watch("cover_image_url");
  const contentHtml = watch("content_html");
  const metaTitle = watch("meta_title") || "";
  const metaDescription = watch("meta_description") || "";

  // Calculate live word and char counts
  const textContent = stripHtml(contentHtml || "");
  const wordCount = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0;
  const charCount = textContent.length;

  // Auto-generate slug from title if new post and user hasn't modified slug
  useEffect(() => {
    if (!post && titleValue && !form.formState.dirtyFields.slug) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, post, setValue, form.formState.dirtyFields.slug]);

  // Upload cover image
  const uploadCoverFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করুন");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ৫MB এর বেশি হতে পারবে না");
      return;
    }

    try {
      setUploadingCover(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setValue("cover_image_url", urlData.publicUrl, { shouldValidate: true, shouldDirty: true });
      toast.success("কভার ইমেজ আপলোড সফল হয়েছে");
    } catch (err: any) {
      toast.error("কভার ইমেজ আপলোড ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadCoverFile(file);
  };

  const handleCoverDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadCoverFile(file);
  };

  const removeCoverImage = () => {
    setValue("cover_image_url", "", { shouldDirty: true });
  };

  // Inline Category Creator
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setCreatingCategory(true);
      const slug = slugify(newCategoryName);

      const { data, error } = await supabase
        .from("blog_categories")
        .insert({ name: newCategoryName.trim(), slug })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("এই নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান");
        } else {
          throw error;
        }
      } else {
        toast.success("নতুন ক্যাটাগরি সফলভাবে তৈরি হয়েছে");
        await refetchCategories();
        setValue("category_id", data.id, { shouldDirty: true });
        setNewCategoryOpen(false);
        setNewCategoryName("");
      }
    } catch (err: any) {
      toast.error("ক্যাটাগরি তৈরি ব্যর্থ: " + err.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Submit
  const onSubmit = async (values: BlogPostFormValues, status: "draft" | "published") => {
    try {
      setSavingAs(status);

      // Check slug uniqueness
      let slugCheckQuery = supabase.from("blog_posts").select("id").eq("slug", values.slug);
      if (post) {
        slugCheckQuery = slugCheckQuery.neq("id", post.id);
      }
      const { data: existingSlugs } = await slugCheckQuery;

      if (existingSlugs && existingSlugs.length > 0) {
        toast.error("এই স্লাগটি ইতিমধ্যে ব্যবহৃত হচ্ছে। ভিন্ন স্লাগ দিন।");
        setSavingAs(null);
        return;
      }

      const payload = {
        ...values,
        category_id: values.category_id || null,
        status,
        ...(status === "published" && (!post || !post.published_at)
          ? { published_at: new Date().toISOString() }
          : {}),
      };

      if (post) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
        if (error) throw error;
        toast.success(status === "published" ? "পোস্ট সফলভাবে পাবলিশ হয়েছে" : "ড্রাফট সফলভাবে সংরক্ষিত হয়েছে");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast.success(
          status === "published"
            ? "নতুন পোস্ট সফলভাবে প্রকাশিত হয়েছে"
            : "নতুন পোস্ট ড্রাফট হিসেবে সংরক্ষিত হয়েছে"
        );
      }

      setLastSavedTime(new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      navigate({ to: "/admin/dashboard", search: { tab: "blog" } as any });
    } catch (err: any) {
      toast.error("সংরক্ষণে সমস্যা হয়েছে: " + err.message);
      setSavingAs(null);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit((data) => onSubmit(data, post?.status === "published" ? "published" : "draft"))();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, post]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/dashboard" className="text-muted-foreground hover:text-[#0B2B26]">
                ড্যাশবোর্ড
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/admin/dashboard"
                search={{ tab: "blog" } as any}
                className="text-muted-foreground hover:text-[#0B2B26]"
              >
                ব্লগ আর্টিকেল
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-[#0B2B26]">
              {post ? "সম্পাদনা" : "নতুন পোস্ট"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: "/admin/dashboard", search: { tab: "blog" } as any })}
            className="rounded-full h-9 w-9 border-slate-200 shadow-2xs hover:bg-slate-50"
            title="ফিরে যান"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#051F20] tracking-tight">
              {post ? "ব্লগ পোস্ট সম্পাদনা" : "নতুন ব্লগ পোস্ট তৈরি"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              বিষয়বস্তু, কভার ইমেজ ও এসইও কনফিগারেশন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full text-xs font-semibold gap-1.5 border-slate-200 shadow-2xs"
            >
              <Link to={`/blog/${post.slug}`} target="_blank">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span>লাইভ প্রিভিউ</span>
              </Link>
            </Button>
          )}

          {isDirty && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              অসংরক্ষিত পরিবর্তন
            </span>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* ═══════════ SECTION 1: মূল তথ্য ═══════════ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-2xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#051F20]">১. মূল তথ্য ও টাইটেল</h2>
              <p className="text-xs text-muted-foreground">পোস্টের শিরোনাম, স্লাগ এবং লেখক</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-slate-700">
                পোস্টের শিরোনাম <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="যেমন: হালাল বিনিয়োগের গুরুত্ব ও ইসলামিক অর্থব্যবস্থা..."
                {...register("title")}
                className="rounded-xl bg-slate-50/50 text-sm font-semibold h-11"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-bold text-slate-700">
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="halal-biniyog-er-gurutto"
                  {...register("slug")}
                  className="rounded-xl bg-slate-50/50 font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">লিংক: /blog/{slugValue || "..."}</p>
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">ক্যাটাগরি</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-bold text-purple-700"
                    onClick={() => setNewCategoryOpen(true)}
                  >
                    + নতুন ক্যাটাগরি
                  </Button>
                </div>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl bg-slate-50/50 text-xs">
                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="author_name" className="text-xs font-bold text-slate-700">
                  লেখকের নাম
                </Label>
                <Input
                  id="author_name"
                  placeholder="যেমন: বিনিয়োগ বিশ্লেষণ টিম / মোহাইমিন পাটোয়ারী"
                  {...register("author_name")}
                  className="rounded-xl bg-slate-50/50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="excerpt" className="text-xs font-bold text-slate-700">
                  সংক্ষেপ (Short Excerpt)
                </Label>
                <Textarea
                  id="excerpt"
                  placeholder="পাঠকদের জন্য আর্টিকেলের আকর্ষণীয় সারসংক্ষেপ..."
                  rows={2}
                  {...register("excerpt")}
                  className="rounded-2xl bg-slate-50/50 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ SECTION 2: কভার ছবি ═══════════ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#051F20]">২. কভার ছবি</h2>
              <p className="text-xs text-muted-foreground">ব্লগ আর্টিকেলের মূল ব্যানার ছবি (১৬:৯ অনুপাত কাম্য)</p>
            </div>
          </div>

          {coverImageUrl ? (
            <div className="relative aspect-video rounded-2xl border border-slate-200 overflow-hidden group bg-slate-100 max-h-[320px] shadow-sm">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label
                  htmlFor="change-cover-file"
                  className="px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-md transition-all"
                >
                  ছবি পরিবর্তন করুন
                  <input
                    id="change-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCover}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeCoverImage}
                  className="rounded-full text-xs font-bold shadow-md"
                >
                  রিমুভ করুন
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleCoverDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                isDragOver
                  ? "border-purple-600 bg-purple-50/50 scale-[1.01]"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-2xs">
                  {uploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#051F20]">
                    {uploadingCover ? "কভার আপলোড হচ্ছে..." : "ছবি টেনে এখানে ফেলুন অথবা ব্রাউজ করুন"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG, WEBP (সর্বোচ্চ ৫MB)</p>
                </div>

                <label
                  htmlFor="blog-cover-file"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>কভার ছবি আপলোড</span>
                  <input
                    id="blog-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCover}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ SECTION 3: বিষয়বস্তু ═══════════ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#051F20]">৩. আর্টিকেলের বিষয়বস্তু</h2>
                <p className="text-xs text-muted-foreground">হেডিং, ফরম্যাটিং, লিংক ও ইনলাইন ইমেজ সাপোর্ট</p>
              </div>
            </div>

            {/* Word & Char Counter */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
              <span>শব্দ: <strong className="text-[#0B2B26]">{wordCount}</strong></span>
              <span>•</span>
              <span>অক্ষর: <strong className="text-[#0B2B26]">{charCount}</strong></span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Controller
              name="content_html"
              control={control}
              render={({ field }) => (
                <Suspense
                  fallback={
                    <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="ব্লগের বিস্তারিত লেখা এখানে শুরু করুন..."
                  />
                </Suspense>
              )}
            />
            {errors.content_html && <p className="text-xs text-red-500">{errors.content_html.message}</p>}
          </div>
        </div>

        {/* ═══════════ SECTION 4: SEO ও মেটাডেটা ═══════════ */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#051F20]">৪. SEO ও মেটাডেটা</h2>
              <p className="text-xs text-muted-foreground">গুগল ও সার্চ ইঞ্জিনের অপটিমাইজেশন</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_title" className="text-xs font-bold text-slate-700">
                  SEO মেটা শিরোনাম
                </Label>
                <span className={`text-[10px] font-semibold ${metaTitle.length > 60 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>
                  {metaTitle.length}/৬০ অক্ষর (প্রস্তাবিত ৫০-৬০)
                </span>
              </div>
              <Input
                id="meta_title"
                placeholder={titleValue || "এসইও শিরোনাম..."}
                {...register("meta_title")}
                className="rounded-xl bg-slate-50/50 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_description" className="text-xs font-bold text-slate-700">
                  SEO মেটা বিবরণ
                </Label>
                <span className={`text-[10px] font-semibold ${metaDescription.length > 160 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>
                  {metaDescription.length}/১৬০ অক্ষর (প্রস্তাবিত ১২০-১৬০)
                </span>
              </div>
              <Textarea
                id="meta_description"
                placeholder="গুগল সার্চ ফলাফলে যে বিবরণ দেখা যাবে..."
                rows={2}
                {...register("meta_description")}
                className="rounded-2xl bg-slate-50/50 text-xs leading-relaxed"
              />
            </div>

            {/* Google SERP Snippet Preview Card */}
            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-emerald-900/5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Search className="h-3 w-3" />
                <span>Google সার্চ প্রিভিউ</span>
              </span>
              <div className="text-xs font-semibold text-blue-800 hover:underline cursor-pointer truncate">
                {metaTitle || titleValue || "ব্লগ শিরোনাম"} | Biniyog
              </div>
              <div className="text-[11px] font-mono text-emerald-800 truncate">
                https://biniyog.com.bd/blog/{slugValue || "example-post"}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDescription || "আপনার ব্লগের বিবরণ সার্চ রেজাল্টে এমনভাবে প্রদর্শিত হবে..."}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ═══════════ STICKY BOTTOM ACTION DOCK ═══════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground min-w-0">
            {lastSavedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Clock className="h-3 w-3" />
                <span>সর্বশেষ সেভ: {new Date(lastSavedTime).toLocaleTimeString("bn-BD")}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Ctrl+S দিয়ে দ্রুত সেভ করুন</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={!!savingAs}
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              className="rounded-full h-10 px-5 text-xs font-bold border-slate-200 hover:bg-slate-50"
            >
              {savingAs === "draft" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              <span>ড্রাফট সংরক্ষণ</span>
            </Button>

            <Button
              type="button"
              disabled={!!savingAs}
              onClick={handleSubmit((data) => onSubmit(data, "published"))}
              className="rounded-full h-10 px-6 bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              {savingAs === "published" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>পাবলিশ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>প্রকাশ করুন</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Add Category Modal ────────────────────────────────────────── */}
      <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">নতুন ক্যাটাগরি তৈরি করুন</DialogTitle>
            <DialogDescription className="text-xs">
              ব্লগের আর্টিকেলের জন্য একটি নতুন বিষয়ভিত্তিক ক্যাটাগরি যোগ করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">ক্যাটাগরির নাম</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="যেমন: ইসলামিক অর্থনীতি / কৃষি বিনিয়োগ"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setNewCategoryOpen(false)}
              disabled={creatingCategory}
              className="rounded-full text-xs"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || creatingCategory}
              className="rounded-full bg-[#0B2B26] hover:bg-[#163832] text-white text-xs font-bold"
            >
              {creatingCategory && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              সংরক্ষণ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
