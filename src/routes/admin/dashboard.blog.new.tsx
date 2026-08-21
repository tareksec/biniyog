import { createFileRoute, redirect } from "@tanstack/react-router";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { getAuthSnapshot } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/dashboard/blog/new")({
  beforeLoad: () => {
    const { user, loading } = getAuthSnapshot();
    if (!loading && !user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: BlogNewRoute,
});

function BlogNewRoute() {
  return (
    <div className="p-6">
      <BlogPostForm />
    </div>
  );
}
