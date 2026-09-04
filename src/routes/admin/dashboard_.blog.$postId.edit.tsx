import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { useAuth, getAuthSnapshot } from "@/hooks/useAuth";
import { isAdminEmail } from "@/lib/admin";
import { useBlogPost } from "@/lib/blog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BlogPostForm = lazy(() => import("@/components/admin/BlogPostForm").then(m => ({ default: m.BlogPostForm })));

export const Route = createFileRoute("/admin/dashboard_/blog/$postId/edit")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading) {
      if (!user) {
        throw redirect({ to: "/admin/login" });
      }
      if (!isAdminEmail(user.email)) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: BlogEditRoute,
});

function BlogEditRoute() {
  const { postId } = Route.useParams();
  const { data: post, isLoading } = useBlogPost(postId);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate({ to: "/admin/login" });
      } else if (!isAdminEmail(user.email)) {
        toast.error("শুধুমাত্র অনুমোদিত অ্যাডমিন এই পেজটি অ্যাক্সেস করতে পারেন।");
        navigate({ to: "/" });
      }
    }
  }, [authLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">পোস্ট পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <BlogPostForm post={post} />
      </Suspense>
    </div>
  );
}
