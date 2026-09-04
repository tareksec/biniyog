import { useLocation, Link, useNavigate } from "@tanstack/react-router";
import { Home, Info, TrendingUp, BookOpen, LayoutDashboard } from "lucide-react";
import { gsap } from "gsap/dist/gsap";
import { useRef, useEffect, useState, useLayoutEffect } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "হোম", icon: Home, route: "/" },
  { id: "about", label: "সম্পর্কে", icon: Info, route: "/about" },
  { id: "opportunities", label: "সুযোগ", icon: TrendingUp, route: "/opportunities" },
  { id: "blog", label: "ব্লগ", icon: BookOpen, route: "/blog" },
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard, route: "/dashboard" },
];

const CIRCLE_SIZE = 48; // Active circle diameter (fits comfortably inside 62px pill)

export function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const hash = location.hash;

  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const circleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Determine active tab index in order:
  // 0: Home (/), 1: About (/about), 2: Opportunities (/opportunities), 3: Blog (/blog), 4: Dashboard (/dashboard)
  let activeIndex = 0;
  if (pathname === "/" && !hash) {
    activeIndex = 0;
  } else if (pathname === "/about" || pathname.startsWith("/about")) {
    activeIndex = 1;
  } else if (pathname.startsWith("/opportunities")) {
    activeIndex = 2;
  } else if (pathname.startsWith("/blog")) {
    activeIndex = 3;
  } else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/profile")
  ) {
    activeIndex = 4;
  }

  const [displayedIndex, setDisplayedIndex] = useState(activeIndex);

  // Measure and position the active circle
  const updateCirclePosition = (animate = true) => {
    const circle = circleRef.current;
    const nav = navRef.current;
    const activeEl = itemRefs.current[activeIndex];
    if (!circle || !nav || !activeEl) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    const targetX =
      itemRect.left - navRect.left + (itemRect.width - CIRCLE_SIZE) / 2;

    setDisplayedIndex(activeIndex);

    if (!animate) {
      gsap.set(circle, {
        x: targetX,
        yPercent: -50,
        opacity: 1,
        force3D: true,
      });
    } else {
      // Fast, snappy, silky smooth translation (0.28s with power2.out)
      gsap.to(circle, {
        x: targetX,
        yPercent: -50,
        opacity: 1,
        duration: 0.28,
        ease: "power2.out",
        force3D: true,
        overwrite: "auto",
      });

      // Subtle spring pop for the newly active icon
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { scale: 0.65, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.24,
            ease: "back.out(2)",
            overwrite: "auto",
          }
        );
      }
    }
  };

  // On mount and when activeIndex changes
  useLayoutEffect(() => {
    if (pathname.startsWith("/admin")) return; // skip animation on admin pages
    if (!isMounted.current) {
      isMounted.current = true;
      requestAnimationFrame(() => {
        updateCirclePosition(false);
      });
    } else {
      updateCirclePosition(true);
    }
  }, [activeIndex, pathname]);

  // Window resize handler to maintain accurate position
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const handleResize = () => {
      updateCirclePosition(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, pathname]);

  const handleTabClick = (e: React.MouseEvent, index: number) => {
    if (index === 0 && pathname === "/" && !hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (index === 1 && pathname === "/about") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (index === 2 && pathname === "/opportunities") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (index === 3 && pathname === "/blog") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (index === 4 && pathname === "/dashboard") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Don't render on admin pages — AFTER all hooks to satisfy Rules of Hooks
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const ActiveIcon = NAV_ITEMS[displayedIndex]?.icon || Home;

  return (
    <div
      className="fixed bottom-3 left-0 right-0 z-50 md:hidden pointer-events-none flex justify-center px-4"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      {/* Horizontal Pill Navigation Bar */}
      <nav
        ref={navRef}
        className="pointer-events-auto relative w-[360px] max-w-[calc(100%-16px)] h-[62px] rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-[0_10px_35px_rgba(5,31,32,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] border-2 border-[#DAF1DE] dark:border-white/[0.15] flex items-center justify-around px-2.5"
        aria-label="মোবাইল নেভিগেশন"
      >
        {/* Floating Active Circular Indicator with Brand Green Fill & Glow */}
        <div
          ref={circleRef}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${CIRCLE_SIZE}px`,
            height: `${CIRCLE_SIZE}px`,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #235347 0%, #163832 100%)",
            border: "2.5px solid #DAF1DE",
            boxShadow:
              "0 6px 20px rgba(35, 83, 71, 0.45), 0 2px 8px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            pointerEvents: "none",
            transform: "translateY(-50%)",
            willChange: "transform",
          }}
          className="dark:border-emerald-400/40"
        >
          {/* Active Label Badge floating above indicator */}
          <div
            className="absolute -top-7.5 px-2.5 py-0.5 rounded-full bg-[#163832] dark:bg-emerald-950 text-white text-[11px] font-bold tracking-wide shadow-md border border-[#DAF1DE]/40 whitespace-nowrap pointer-events-none transition-all"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
          >
            {NAV_ITEMS[displayedIndex]?.label}
          </div>

          {/* Active Centered Bright White Icon */}
          <div ref={iconRef} className="flex items-center justify-center">
            <ActiveIcon className="h-6 w-6 text-white stroke-[2.4]" />
          </div>
        </div>

        {/* 5 Tabs evenly spaced across the pill */}
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          return (
            <Link
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              to={item.route}
              onClick={(e) => handleTabClick(e, index)}
              className="flex-1 flex items-center justify-center h-full relative z-10 cursor-pointer active:scale-95"
              aria-label={item.label}
              title={item.label}
            >
              {/* Inactive Icon: High-contrast brand green/slate, thicker stroke, clear touch target */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:bg-[#DAF1DE]/50">
                <Icon
                  className={`h-[22px] w-[22px] transition-colors duration-200 ${
                    isActive
                      ? "opacity-0" // Covered cleanly by active circular indicator
                      : "text-[#163832] dark:text-zinc-200 hover:text-[#235347] stroke-[2.2]"
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
