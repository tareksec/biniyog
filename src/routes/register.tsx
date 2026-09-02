import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, Loader2, User, ArrowLeft, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";

interface CountryItem {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

function getFlagEmoji(countryCode: string): string {
  try {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
  } catch {
    return "🌐";
  }
}

const ALL_COUNTRIES: CountryItem[] = (() => {
  const rawCodes = getCountries();
  const list: CountryItem[] = [];
  for (const code of rawCodes) {
    try {
      const callingCode = getCountryCallingCode(code);
      if (callingCode) {
        list.push({
          code,
          name: (en as Record<string, string>)[code] || code,
          dialCode: `+${callingCode}`,
          flag: getFlagEmoji(code),
        });
      }
    } catch {
      // skip
    }
  }
  // Sorted: Bangladesh first, then alphabetical
  const bd = list.find((c) => c.code === "BD") || {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    flag: "🇧🇩",
  };
  const others = list
    .filter((c) => c.code !== "BD")
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return [bd, ...others];
})();

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "রেজিস্ট্রেশন করুন · বিনিয়োগ বৃদ্ধি" },
      { name: "description", content: "বিনিয়োগ বৃদ্ধি প্ল্যাটফর্মে নতুন অ্যাকাউন্ট তৈরি করুন।" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const search = useSearch({ from: "/register" });
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(ALL_COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

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

    const cleanedPhone = phone.trim().replace(/\D/g, "");

    // Phone field required, min 6 digits, max 12 digits (local part only)
    if (!cleanedPhone || cleanedPhone.length < 6 || cleanedPhone.length > 12) {
      setError("সঠিক ফোন নম্বর দিন");
      return;
    }

    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      setError("উভয় পাসওয়ার্ড একই হতে হবে।");
      return;
    }

    setLoading(true);

    // Combined value: dial code + phone number (strip leading 0: "+880" + "01712345678" -> "+8801712345678")
    const localPart = cleanedPhone.replace(/^0+/, "");
    const fullPhoneNumber = `${selectedCountry.dialCode}${localPart || cleanedPhone}`;

    try {
      const data = await signUp(email, password, {
        full_name: fullName.trim(),
        phone: fullPhoneNumber,
      });

      toast.success("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");

      if (data.session) {
        navigate({ to: redirectTo as any });
      } else {
        // If email confirmation is required by Supabase project settings
        toast.info("অনুগ্রহ করে আপনার ইমেইল চেক করুন অথবা সরাসরি লগইন করুন।");
        navigate({
          to: "/login",
          search: search.redirect ? { redirect: search.redirect } : {},
        });
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg = err?.message || "";
      if (msg.includes("already registered") || msg.includes("User already registered")) {
        setError("এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন।");
      } else if (
        msg.includes("Signups not allowed") ||
        msg.includes("signup_disabled") ||
        msg.includes("Signups not allowed for this instance")
      ) {
        setError(
          "নতুন রেজিস্ট্রেশন বর্তমানে বন্ধ রয়েছে (Signups not allowed for this instance)। Supabase ড্যাশবোর্ড থেকে Signup সক্রিয় করুন অথবা লগইন করুন।",
        );
      } else if (msg.includes("weak")) {
        setError("পাসওয়ার্ডটি খুব সহজ। একটি শক্তিশালী পাসওয়ার্ড দিন।");
      } else {
        setError(msg || "রেজিস্ট্রেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            বিনিয়োগ সুযোগ এবং ব্যাংক অ্যাকাউন্টের তথ্যাদি দেখতে যুক্ত হোন
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

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold text-foreground">
                আপনার পুরো নাম <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-background/50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                মোবাইল নম্বর <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {/* Left: Country dropdown (flag + country name + dial code) */}
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      disabled={loading}
                      className="h-11 rounded-xl bg-background/50 border-input px-2.5 sm:px-3 gap-1.5 shrink-0 hover:bg-background/80 focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    >
                      <span className="text-base leading-none shrink-0">{selectedCountry.flag}</span>
                      <span className="text-xs font-semibold text-foreground">{selectedCountry.dialCode}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[290px] sm:w-[320px] p-0 rounded-2xl shadow-xl border border-border bg-popover text-popover-foreground z-50"
                    align="start"
                    sideOffset={6}
                  >
                    <div className="p-2.5 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="দেশ বা কোড খুঁজুন (যেমন: +1, UK)..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="h-8 pl-8 pr-2.5 text-xs rounded-lg bg-background/60"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin">
                      {filteredCountries.map((c) => {
                        const isSelected = selectedCountry.code === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setCountryOpen(false);
                              setCountrySearch("");
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer hover:bg-muted ${
                              isSelected ? "bg-primary/10 font-semibold text-primary" : "text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-base leading-none shrink-0">{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </div>
                            <span className="text-muted-foreground font-mono text-[11px] shrink-0 font-medium">
                              {c.dialCode}
                            </span>
                          </button>
                        );
                      })}
                      {filteredCountries.length === 0 && (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          কোনো দেশ পাওয়া যায়নি
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Right: Phone number input (without country code) */}
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => {
                    // Numbers only
                    const val = e.target.value.replace(/\D/g, "");
                    setPhone(val);
                  }}
                  maxLength={12}
                  className="h-11 rounded-xl bg-background/50 font-medium flex-1 text-sm"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                ইমেইল অ্যাড্রেস
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
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
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl bg-background/50"
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-xs font-semibold text-foreground">
                পাসওয়ার্ড নিশ্চিত করুন
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl bg-background/50"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
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
                  রেজিস্ট্রেশন হচ্ছে...
                </>
              ) : (
                "অ্যাকাউন্ট তৈরি করুন"
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm">
            <span className="text-muted-foreground">ইতিমধ্যে একটি অ্যাকাউন্ট আছে? </span>
            <Link
              to="/login"
              search={search.redirect ? { redirect: search.redirect } : {}}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              লগইন করুন
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span>আপনার সমস্ত তথ্য সম্পূর্ণ সুরক্ষিত ও এনক্রিপ্টেড থাকে</span>
        </div>
      </div>
    </div>
  );
}
