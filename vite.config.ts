// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * Image performance plugin:
 * - All images default to loading="lazy" and decoding="async"
 * - Hero images are prioritized with loading="eager" and fetchpriority="high"
 */
function imageLazyLoadPlugin(): Plugin {
  return {
    name: "vite-image-lazy-load",
    transformIndexHtml(html: string) {
      return html.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
        const isHero = /hero|banner|eager|high/i.test(attrs);
        if (isHero) {
          let updated = attrs;
          if (!/loading=/i.test(updated)) updated += ' loading="eager"';
          if (!/fetchpriority=/i.test(updated)) updated += ' fetchpriority="high"';
          return `<img ${updated}>`;
        }
        let updated = attrs;
        if (!/loading=/i.test(updated)) updated += ' loading="lazy"';
        if (!/decoding=/i.test(updated)) updated += ' decoding="async"';
        return `<img ${updated}>`;
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [imageLazyLoadPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            const normalized = id.replace(/\\/g, "/");
            if (normalized.includes("/node_modules/")) {
              if (
                normalized.includes("/node_modules/react/") ||
                normalized.includes("/node_modules/react-dom/") ||
                normalized.includes("/node_modules/scheduler/")
              ) {
                return "vendor-react";
              }
              if (normalized.includes("/node_modules/@tanstack/")) {
                return "vendor-tanstack";
              }
              if (normalized.includes("/node_modules/@radix-ui/")) {
                return "vendor-radix";
              }
              if (normalized.includes("/node_modules/gsap/")) {
                return "vendor-gsap";
              }
              if (normalized.includes("/node_modules/framer-motion/")) {
                return "vendor-framer";
              }
              if (normalized.includes("/node_modules/@supabase/")) {
                return "vendor-supabase";
              }
            }
          },
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
