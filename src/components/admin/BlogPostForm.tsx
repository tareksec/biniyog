import { useState, useEffect, lazy, Suspense } from "react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Upload, X, ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const RichTextEditor = lazy(() => import("./RichTextEditor").then(m => ({ default: m.RichTextEditor })));

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
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `post-${Math.random().toString(36).substring(2, 9)}`;
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
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      category_id: post?.category_id || undefined,
      cover_image_url: post?.cover_image_url || "",
      excerpt: post?.excerpt || "",
      content_html: post?.content_html || "",
      author_name: post?.author_name || "",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
    },
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form;
  const titleValue = watch("title");
  const coverImageUrl = watch("cover_image_url");

  // Auto-generate slug from title if not editing
  useEffect(() => {
    if (!post && titleValue && !form.formState.dirtyFields.slug) {
      setValue("slug", slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, post, setValue, form.formState.dirtyFields.slug]);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setValue("cover_image_url", urlData.publicUrl, { shouldValidate: true });
      toast.success("কভার ইমেজ আপলোড সফল হয়েছে");
    } catch (err: any) {
      toast.error("কভার ইমেজ আপলোড ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCoverImage = () => {
    setValue("cover_image_url", "");
  };

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
        if (error.code === '23505') {
          toast.error("এই নামের ক্যাটাগরি ইতিমধ্যে আছে");
        } else {
          throw error;
        }
      } else {
        toast.success("ক্যাটাগরি তৈরি হয়েছে");
        await refetchCategories();
        setValue("category_id", data.id);
        setNewCategoryOpen(false);
        setNewCategoryName("");
      }
    } catch (err: any) {
      toast.error("ক্যাটাগরি তৈরি ব্যর্থ: " + err.message);
    } finally {
      setCreatingCategory(false);
    }
  };

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
        toast.error("এই স্লাগটি ইতিমধ্যে ব্যবহৃত হচ্ছে। অন্য স্লাগ দিন।");
        setSavingAs(null);
        return;
      }

      const payload = {
        ...values,
        category_id: values.category_id || null, // convert empty to null
        status,
        ...(status === "published" && (!post || !post.published_at) ? { published_at: new Date().toISOString() } : {})
      };

      if (post) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
        if (error) throw error;
        toast.success(status === "published" ? "পোস্ট পাবলিশ হয়েছে" : "ড্রাফট আপডেট হয়েছে");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast.success(status === "published" ? "নতুন পোস্ট পাবলিশ হয়েছে" : "নতুন পোস্ট ড্রাফট হিসেবে সেভ হয়েছে");
      }

      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      navigate({ to: "/admin/dashboard", search: { tab: "blog" } as any });
      
    } catch (err: any) {
      toast.error("সংরক্ষণে সমস্যা হয়েছে: " + err.message);
      setSavingAs(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate({ to: "/admin/dashboard", search: { tab: "blog" } as any })}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{post ? "পোস্ট এডিট করুন" : "নতুন ব্লগ পোস্ট"}</h1>
          <p className="text-sm text-muted-foreground">আপনার ব্লগের কনটেন্ট এবং এসইও ঠিক করুন</p>
        </div>
      </div>

      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">শিরোনাম <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="পোস্টের শিরোনাম..."
                {...register("title")}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_html">কন্টেন্ট <span className="text-destructive">*</span></Label>
              <Suspense fallback={<div className="h-[300px] border rounded-md flex items-center justify-center bg-muted/50"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
                <Controller
                  name="content_html"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </Suspense>
              {errors.content_html && <p className="text-sm text-destructive">{errors.content_html.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">সারাংশ (Excerpt)</Label>
              <Textarea
                id="excerpt"
                placeholder="পোস্টের ছোট একটি সারাংশ যা প্রিভিউতে দেখাবে..."
                className="h-20"
                {...register("excerpt")}
              />
            </div>
            
            <Accordion type="single" collapsible className="w-full border rounded-lg px-4 bg-card">
              <AccordionItem value="seo" className="border-none">
                <AccordionTrigger className="hover:no-underline text-base font-semibold">
                  SEO সেটিংস
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">মেটা টাইটেল</Label>
                    <Input id="meta_title" placeholder="সার্চ ইঞ্জিনের জন্য টাইটেল" {...register("meta_title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">মেটা ডেসক্রিপশন</Label>
                    <Textarea id="meta_description" placeholder="সার্চ ইঞ্জিনের জন্য ডেসক্রিপশন" {...register("meta_description")} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-5 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="slug">স্লাগ (URL) <span className="text-destructive">*</span></Label>
                <Input
                  id="slug"
                  placeholder="post-slug-here"
                  {...register("slug")}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>ক্যাটাগরি</Label>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setNewCategoryOpen(true)}>
                    + নতুন ক্যাটাগরি
                  </Button>
                </div>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_name">লেখকের নাম</Label>
                <Input
                  id="author_name"
                  placeholder="যেমন: মোহাইমিন পাটোয়ারী"
                  {...register("author_name")}
                />
              </div>

              <div className="space-y-2">
                <Label>কভার ইমেজ</Label>
                {coverImageUrl ? (
                  <div className="relative aspect-video rounded-md border overflow-hidden group">
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" variant="destructive" size="sm" onClick={removeCoverImage}>
                        রিমুভ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-md border border-dashed flex flex-col items-center justify-center gap-2 bg-muted/20 overflow-hidden hover:bg-muted/30 transition-colors">
                    {uploadingCover ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">ইমেজ আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleUploadCover}
                          disabled={uploadingCover}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-5 space-y-3 sticky top-24">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                disabled={!!savingAs}
                onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              >
                {savingAs === "draft" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Draft হিসেবে সেভ করুন
              </Button>
              <Button 
                type="button" 
                className="w-full"
                disabled={!!savingAs}
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
              >
                {savingAs === "published" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish করুন
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
            <DialogDescription>
              ব্লগের জন্য একটি নতুন ক্যাটাগরি তৈরি করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ক্যাটাগরির নাম</Label>
              <Input 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="যেমন: হালাল বিনিয়োগ"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewCategoryOpen(false)} disabled={creatingCategory}>
              বাতিল
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || creatingCategory}>
              {creatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              সেভ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
