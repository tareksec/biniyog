import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/logout")({
  head: () => ({
    meta: [{ title: "লগআউট হচ্ছে... · বিনিয়োগ বৃদ্ধি" }],
  }),
  component: LogoutPage,
});

function LogoutPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const performSignOut = async () => {
      try {
        await signOut();
        if (mounted) {
          toast.info("সফলভাবে লগআউট হয়েছে");
          navigate({ to: "/" });
        }
      } catch (err) {
        console.error("Logout error:", err);
        if (mounted) {
          navigate({ to: "/" });
        }
      }
    };

    performSignOut();
    return () => {
      mounted = false;
    };
  }, [signOut, navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">লগআউট হচ্ছে...</p>
    </div>
  );
}
