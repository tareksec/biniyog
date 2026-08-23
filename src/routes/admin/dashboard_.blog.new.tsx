import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { useAuth, getAuthSnapshot } from "@/hooks/useAuth";
import { isAdminEmail } from "@/lib/admin";
import { toast } from "sonner";

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
      <BlogPostForm />
    </div>
  );
}
