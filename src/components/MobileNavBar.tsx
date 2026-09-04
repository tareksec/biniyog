import { useLocation, Link, useNavigate } from "@tanstack/react-router";
import { Home, Search, TrendingUp, BookOpen, User } from "lucide-react";
import { gsap } from "gsap";
import { useRef, useEffect, useState, useLayoutEffect } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "হোম", icon: Home, route: "/" },
  { id: "search", label: "খুঁজুন", icon: Search, route: "/opportunities" },
  { id: "opportunities", label: "সুযোগ", icon: TrendingUp, route: "/opportunities" },
  { id: "blog", label: "ব্লগ", icon: BookOpen, route: "/blog" },
  { id: "profile", label: "প্রোফাইল", icon: User, route: "/dashboard" },
];

const CIRCLE_SIZE = 46; // Active circle diameter (fits comfortably inside 60px pill)

export function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const hash = location.hash;
  const search = location.search as Record<string, any> | undefined;

  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const circleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Don't render on admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isSearchActive =
    pathname === "/opportunities" &&
    (Boolean(search?.search) || Boolean(search?.q));

  const isOpportunitiesActive =
    pathname.startsWith("/opportunities") && !isSearchActive;

  const isHomeActive = pathname === "/" && !hash;
  const isBlogActive = pathname.startsWith("/blog");
  const isProfileActive =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/profile");

  let activeIndex = 0;
  if (isHomeActive) activeIndex = 0;
  else if (isSearchActive) activeIndex = 1;
  else if (isOpportunitiesActive) activeIndex = 2;
  else if (isBlogActive) activeIndex = 3;
  else if (isProfileActive) activeIndex = 4;

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
      // Snappy, fast and silky smooth translation (0.28s with power2.out)
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
    if (!isMounted.current) {
      isMounted.current = true;
      // Slight delay for layout settling
      requestAnimationFrame(() => {
        updateCirclePosition(false);
      });
    } else {
      updateCirclePosition(true);
    }
  }, [activeIndex]);

  // Window resize handler to maintain accurate position
  useEffect(() => {
    const handleResize = () => {
      updateCirclePosition(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  const handleTabClick = (e: React.MouseEvent, index: number) => {
    if (index === 0) {
      if (pathname === "/" && !hash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (index === 1) {
      e.preventDefault();
      if (pathname === "/opportunities") {
        const input = document.querySelector<HTMLInputElement>(
          'input[placeholder*="সুযোগ"], input[type="text"]'
        );
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        navigate({
          to: "/opportunities",
          search: (prev: any) => ({ ...prev, search: "1" }),
        });
      } else {
        navigate({
          to: "/opportunities",
          search: { search: "1" },
        });
      }
    } else if (index === 2) {
      e.preventDefault();
      navigate({
        to: "/opportunities",
        search: (prev: any) => {
          const next = { ...prev };
          delete next.search;
          delete next.q;
          return next;
        },
      });
    }
  };

  const ActiveIcon = NAV_ITEMS[displayedIndex]?.icon || Home;

  return (
    <div
      className="fixed bottom-3 left-0 right-0 z-50 md:hidden pointer-events-none flex justify-center px-4"
      style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}
    >
      {/* Horizontal Pill Navigation Bar */}
      <nav
        ref={navRef}
        className="pointer-events-auto relative w-[356px] max-w-[calc(100%-16px)] h-[60px] rounded-full bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgba(35,83,71,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[#DAF1DE]/80 dark:border-white/[0.08] flex items-center justify-around px-2"
        aria-label="মোবাইল নেভিগেশন"
      >
        {/* Floating Active Circular Indicator with Brand Green Ring (#235347) */}
        <div
          ref={circleRef}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${CIRCLE_SIZE}px`,
            height: `${CIRCLE_SIZE}px`,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            border: "2.5px solid #235347",
            boxShadow:
              "0 4px 16px rgba(35, 83, 71, 0.3), 0 2px 6px rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            pointerEvents: "none",
            transform: "translateY(-50%)",
            willChange: "transform",
          }}
          className="dark:bg-zinc-900"
        >
          {/* Active Centered Brand Green Icon */}
          <div ref={iconRef} className="flex items-center justify-center">
            <ActiveIcon className="h-5 w-5 text-[#235347] dark:text-emerald-400 stroke-[2.2]" />
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
              {/* Inactive Icon: Muted gray, thin stroke */}
              <Icon
                className={`h-5 w-5 transition-colors duration-200 ${
                  isActive
                    ? "opacity-0" // Covered cleanly by active circular indicator
                    : "text-zinc-400 dark:text-zinc-500 hover:text-[#235347] stroke-[1.8]"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
