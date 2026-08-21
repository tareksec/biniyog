import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Component, useEffect, useLayoutEffect, useState, useRef, Suspense, type ReactNode, type ErrorInfo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion, pageTransition } from "@/lib/animations";

import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "sonner";
import { LumaSpin } from "@/components/ui/luma-spin";

function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-[9999]">
      <LumaSpin size="lg" />
    </div>
  );
}

// Disable the browser's native scroll restoration as early as possible —
// as soon as this module evaluates (before any navigation can occur). This
// hands full control of scroll position to our JS below. Note: even with
// 'manual', Chromium still performs native restoration during SPA navigation
// commits, which is why the scroll-to-top below uses useLayoutEffect.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

/* ────────────────────────────────────────────────────────────
   Hydration helpers — prevent blank screen from SSR mismatch
   ──────────────────────────────────────────────────────────── */

/** Returns false during SSR and the very first client render,
 *  then true after hydration completes. This lets us defer
 *  AnimatePresence (which wraps Outlet in a motion.div with a
 *  key) until after hydration so the server HTML and the first
 *  client render produce identical DOM. */
function useIsHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/* ────────────────────────────────────────────────────────────
   Class-based error boundary — catches any uncaught render
   error in the entire tree and shows a graceful fallback
   instead of a blank white screen.
   ──────────────────────────────────────────────────────────── */
interface AppErrorBoundaryState { hasError: boolean; error: Error | null }

class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, errorInfo);
    reportLovableError(error, { boundary: "app_class_error_boundary", componentStack: errorInfo.componentStack ?? "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              পেজটি লোড হয়নি
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              আমাদের পক্ষ থেকে কিছু ভুল হয়েছে। রিফ্রেশ করুন অথবা হোমে ফিরে যান।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                আবার চেষ্টা করুন
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                হোমে ফিরে যান
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পেজটি পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          পেজটি লোড হয়নি
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          আমাদের পক্ষ থেকে কিছু ভুল হয়েছে। রিফ্রেশ করুন অথবা হোমে ফিরে যান।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            আবার চেষ্টা করুন
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            হোমে ফিরে যান
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "বিনিয়োগ বৃদ্ধি — স্বচ্ছ বিনিয়োগ প্ল্যাটফর্ম" },
      {
        name: "description",
        content:
          "যাচাইকৃত SME এবং যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে বিনিয়োগ করুন — আকর্ষণীয় লাভ।",
      },
      { property: "og:title", content: "বিনিয়োগ বৃদ্ধি — স্বচ্ছ বিনিয়োগ প্ল্যাটফর্ম" },
      {
        property: "og:description",
        content: "যাচাইকৃত SME এবং যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে বিনিয়োগ করুন — আকর্ষণীয় লাভ।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "বিনিয়োগ বৃদ্ধি — স্বচ্ছ বিনিয়োগ প্ল্যাটফর্ম" },
      { name: "twitter:description", content: "যাচাইকৃত SME এবং যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে বিনিয়োগ করুন — আকর্ষণীয় লাভ।" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/logo.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wdth,wght@100,100..900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: FullPageLoader,
  pendingMs: 200,
  pendingMinMs: 300,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalScrollRestoration() {
  const router = useRouter();
  const location = router.state.location;
  const isInitialLoad = useRef(true);

  // Disable the browser's native scroll restoration so it can't fight our
  // JS-driven scroll handling. With scrollRestoration = 'auto' (the default),
  // the browser restores a saved scroll position on navigation AFTER our
  // scrollTo() runs, causing a visible "flash to footer" before we scroll to
  // top. Setting it to 'manual' hands full control to the code below.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll to top IMMEDIATELY when navigation starts (before the async loader
  // runs). This is the only way to prevent the browser's native scroll
  // restoration flash — useLayoutEffect runs too late because it waits for the
  // route component to finish loading and render. onBeforeLoad fires
  // synchronously as soon as the navigation is committed.
  useEffect(() => {
    const unsub = router.subscribe("onBeforeLoad", (event) => {
      if (isInitialLoad.current) return;
      const toPath = event.toLocation?.pathname ?? event.pathname ?? "";
      if (toPath.startsWith("/admin")) return;
      if (toPath.includes("#")) return;
      // Always scroll to top for new navigations. If this was a POP
      // (back/forward), the useLayoutEffect below will restore the saved
      // position after the route renders.
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    return unsub;
  }, [router]);

  // Restore scroll position on pathname change (client-side only).
  // Uses useLayoutEffect so the scroll happens synchronously BEFORE the
  // browser paints. The browser's native scroll restoration (even with
  // scrollRestoration = 'manual', Chromium still restores on SPA nav) fires
  // during the navigation commit — a useEffect would run AFTER paint and let
  // that native restore flash on screen for a frame. useLayoutEffect runs
  // before paint and overrides it.
  useLayoutEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      // On the very first render, the browser handles native scroll restoration (e.g. F5 refresh).
      // We skip our custom logic so we don't flash to a stale sessionStorage position.
      return;
    }

    // Use router history action to determine navigation type
    const isPop = router.history.action === 'POP';

    if (isPop) {
      // Only restore on back/forward navigations (POP)
      const key = `scroll:${location.pathname}`;
      const savedScroll = sessionStorage.getItem(key);
      if (savedScroll !== null) {
        const targetScroll = parseInt(savedScroll, 10);
        if (!isNaN(targetScroll)) {
          // Defer to allow AnimatePresence page transitions to settle
          const t1 = setTimeout(() => {
            window.scrollTo({ top: targetScroll, behavior: "instant" });
          }, 100);
          const t2 = setTimeout(() => {
            window.scrollTo({ top: targetScroll, behavior: "instant" });
          }, 300);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      }
    } else {
      // For PUSH/REPLACE (fresh navigations, clicking Home, etc.), scroll to top
      if (!location.hash) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [location.pathname, location.hash, router.history.action]);

  // Save scroll position on scroll
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const currentPath = router.state.location.pathname;
      if (currentPath.startsWith("/admin")) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem(`scroll:${currentPath}`, window.scrollY.toString());
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [router]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const prefersReduced = usePrefersReducedMotion();
  const hydrated = useIsHydrated();
  const locationKey = router.state.location.pathname + (router.state.location.searchStr || "");

  // During SSR and the very first client render, render <Outlet /> directly
  // (no AnimatePresence / motion.div wrapper) so the server HTML and client
  // initial render produce identical DOM — preventing React error #418.
  // After hydration completes, enable page-transition animations.
  const outletContent = <Outlet />;

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <GlobalScrollRestoration />
        <div className="flex flex-col min-h-screen">
          {hydrated ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={locationKey}
                initial={prefersReduced ? "animate" : "initial"}
                animate="animate"
                exit={prefersReduced ? "animate" : "exit"}
                variants={pageTransition}
                className="flex-grow"
                suppressHydrationWarning
              >
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                {outletContent}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-grow" style={{ opacity: 1 }}>
              {outletContent}
            </div>
          )}
          <Footer />
        </div>
        
        {/* Global floating elements */}
        <GlobalNav />
        <FloatingWhatsAppButton />
        <Toaster position="top-center" richColors />
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/8801316110209"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[140px] md:bottom-28 right-4 md:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path
          fillRule="evenodd"
          d="M12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.42 1.25 4.89L2 22l5.35-1.21A9.976 9.976 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.83 14.18c-.26.74-1.51 1.4-2.09 1.47-.53.06-1.15.11-3.23-.74-2.5-1.03-4.09-3.61-4.22-3.78-.13-.17-1.01-1.34-1.01-2.55s.63-1.8.85-2.04c.22-.24.48-.3.64-.3.16 0 .32.01.46.01.16 0 .38-.06.59.45.22.52.71 1.73.77 1.86.06.13.1.28.02.45-.09.17-.13.28-.26.43-.13.15-.27.32-.39.45-.14.14-.29.29-.13.57.16.27.71 1.17 1.54 1.9 1.07.95 1.95 1.24 2.21 1.37.26.13.42.11.58-.08.16-.19.68-.8.87-1.07.18-.28.37-.23.61-.14.24.09 1.51.71 1.77.84.26.13.43.19.49.3.07.11.07.63-.19 1.37z"
          clipRule="evenodd"
        />
      </svg>
    </a>
  );
}
