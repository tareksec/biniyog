import { createFileRoute, redirect } from "@tanstack/react-router";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { getAuthSnapshot } from "@/hooks/useAuth";
import { useBlogPost } from "@/lib/blog";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard_/blog/$postId/edit")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading && !user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: BlogEditRoute,
});

function BlogEditRoute() {
  const { postId } = Route.useParams();
  const { data: post, isLoading } = useBlogPost(postId);

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
      <BlogPostForm post={post} />
    </div>
  );
}
