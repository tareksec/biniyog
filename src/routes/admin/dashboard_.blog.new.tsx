import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { useAuth, getAuthSnapshot } from "@/hooks/useAuth";
import { isAdminEmail } from "@/lib/admin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BlogPostForm = lazy(() => import("@/components/admin/BlogPostForm").then(m => ({ default: m.BlogPostForm })));

export const Route = createFileRoute("/admin/dashboard_/blog/new")({
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
  component: BlogNewRoute,
});

function BlogNewRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/admin/login" });
      } else if (!isAdminEmail(user.email)) {
        toast.error("শুধুমাত্র অনুমোদিত অ্যাডমিন এই পেজটি অ্যাক্সেস করতে পারেন।");
        navigate({ to: "/" });
      }
    }
  }, [loading, user, navigate]);

  return (
    <div className="p-6">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <BlogPostForm />
      </Suspense>
    </div>
  );
}
