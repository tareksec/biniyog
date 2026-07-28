import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">৪০৪</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পেজটি পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
        <p className="mt-2 text-sm text-muted-foreground">
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
      { title: "সমৃদ্ধি — স্বচ্ছ SME বিনিয়োগ প্ল্যাটফর্ম" },
      {
        name: "description",
        content:
          "যাচাইকৃত SME এবং যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে বিনিয়োগ করুন — আকর্ষণীয় লাভ।",
      },
      { property: "og:title", content: "সমৃদ্ধি — স্বচ্ছ SME বিনিয়োগ প্ল্যাটফর্ম" },
      {
        property: "og:description",
        content: "যাচাইকৃত SME এবং যাচাইকৃত ব্যবসা প্রতিষ্ঠানে স্বচ্ছ উপায়ে বিনিয়োগ করুন — আকর্ষণীয় লাভ।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "সমৃদ্ধি — স্বচ্ছ SME বিনিয়োগ প্ল্যাটফর্ম" },
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
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollRestoration />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
        <Footer />
      </div>
      
      {/* Global floating elements */}
      <GlobalNav />
      <FloatingWhatsAppButton />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/8801316110209"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 md:bottom-28 right-4 md:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
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
