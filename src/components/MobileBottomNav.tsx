import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Heart, MessageSquare, Bell, User } from "lucide-react";
import { toast } from "sonner";

export function MobileBottomNav() {
  const router = useRouterState();
  const navigate = useNavigate();
  const pathname = router.location.pathname;

  const isHome = pathname === "/";
  const isOpportunities = pathname.startsWith("/opportunities");
  const isDashboard = pathname.startsWith("/dashboard");
  const isSavedActive = isOpportunities && router.location.searchStr?.includes("saved=true");

  const handleSavedClick = () => {
    if (isSavedActive) {
      navigate({ to: "/opportunities" });
    } else {
      navigate({ to: "/opportunities", search: { saved: true } });
    }
  };

  const handleChatClick = () => {
    window.open("https://wa.me/8801316110209", "_blank", "noopener,noreferrer");
  };

  const handleNotificationClick = () => {
    toast.info("নতুন সুযোগের নোটিফিকেশন", {
      description: "বর্তমানে একাধিক যাচাইকৃত SME বিনিয়োগের সুযোগ চলমান রয়েছে।",
    });
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#11151b]/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 py-2 px-6 flex items-center justify-around md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      aria-label="মোবাইল নেভিগেশন"
    >
      {/* 1. Home */}
      <Link
        to="/"
        className={`flex items-center justify-center transition-all ${
          isHome
            ? "h-10 w-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-400 dark:text-zinc-500 hover:text-foreground h-10 w-10 flex items-center justify-center"
        }`}
        aria-label="হোম"
      >
        <Home className="h-5 w-5" />
      </Link>

      {/* 2. Heart (Saved) */}
      <button
        type="button"
        onClick={handleSavedClick}
        className={`flex items-center justify-center transition-all cursor-pointer h-10 w-10 ${
          isSavedActive
            ? "h-10 w-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-400 dark:text-zinc-500 hover:text-foreground"
        }`}
        aria-label="সংরক্ষিত"
      >
        <Heart className={`h-5 w-5 ${isSavedActive ? "fill-current" : ""}`} />
      </button>

      {/* 3. Chat bubble */}
      <button
        type="button"
        onClick={handleChatClick}
        className="flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-foreground h-10 w-10 transition-colors cursor-pointer"
        aria-label="চ্যাট করুন"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* 4. Notification */}
      <button
        type="button"
        onClick={handleNotificationClick}
        className="flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-foreground h-10 w-10 transition-colors cursor-pointer relative"
        aria-label="নোটিফিকেশন"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-amber-500" />
      </button>

      {/* 5. Profile */}
      <Link
        to="/dashboard"
        className={`flex items-center justify-center transition-all ${
          isDashboard
            ? "h-10 w-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-400 dark:text-zinc-500 hover:text-foreground h-10 w-10 flex items-center justify-center"
        }`}
        aria-label="প্রোফাইল"
      >
        <User className="h-5 w-5" />
      </Link>
    </nav>
  );
}
