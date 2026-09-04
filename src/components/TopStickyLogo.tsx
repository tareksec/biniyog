import { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function TopStickyLogo() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const router = useRouterState();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (router.location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleClick = () => {
    if (router.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/" });
    }
  };

  const isOpportunities = router.location.pathname.startsWith("/opportunities");

  return (
    <header className={`fixed top-2.5 sm:top-3.5 left-0 right-0 z-40 flex justify-center pointer-events-none px-4 transition-all duration-300 ${isOpportunities ? "hidden md:flex" : ""}`}>
      <button
        onClick={handleClick}
        className={`pointer-events-auto inline-flex items-center gap-2.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full transition-all duration-300 active:scale-95 cursor-pointer ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border border-emerald-900/10"
            : "bg-white/85 backdrop-blur-sm shadow-xs border border-gray-200/70"
        }`}
        aria-label="হোম পেজে যান"
      >
        <img
          src="/logo.png"
          alt="BiniyogBriddhi Logo"
          width={32}
          height={32}
          className="h-7 sm:h-8 w-auto rounded-md shadow-2xs"
          loading="eager"
          fetchPriority="high"
        />
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-[15px] sm:text-[16px] leading-tight text-[#0f3e26] tracking-tight">
            BiniyogBriddhi
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-[#6b7280]">
            biniyogbriddhi.com
          </span>
        </div>
      </button>
    </header>
  );
}
