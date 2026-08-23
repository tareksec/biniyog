import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "লগইন করুন · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "আপনার অ্যাকাউন্টে লগইন করুন।" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, loading: authLoading } = useAuth();
  const search = useSearch({ from: "/login" });
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = search.redirect || "/opportunities";

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: redirectTo as any });
    }
  }, [authLoading, user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      toast.success("সফলভাবে লগইন করেছেন!");
      navigate({ to: redirectTo as any });
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
        setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। দয়া করে সঠিক তথ্য দিন।");
      } else if (msg.includes("Email not confirmed")) {
        setError("আপনার ইমেইল ভেরিফাই করা হয়নি। আপনার ইনবক্স চেক করুন।");
      } else {
        setError(msg || "লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-background px-4 py-12 relative">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={(redirectTo.startsWith("/") ? redirectTo : "/") as any}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ফিরে যান</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-sm border border-border">
            <img src="/logo.png" alt="বিনিয়োগ বৃদ্ধি" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            অ্যাকাউন্টে লগইন করুন
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                ইমেইল অ্যাড্রেস
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-background/50"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl bg-background/50"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold mt-2 shadow-md cursor-pointer"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  লগইন হচ্ছে...
                </>
              ) : (
                "লগইন করুন"
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm">
            <span className="text-muted-foreground">নতুন ব্যবহারকারী? </span>
            <Link
              to="/register"
              search={search.redirect ? { redirect: search.redirect } : {}}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>নিরাপদ ও এনক্রিপ্টেড সংযোগ</span>
        </div>
      </div>
    </div>
  );
}
