import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Custom scroll restoration is handled in GlobalScrollRestoration
    // (__root.tsx), which sets history.scrollRestoration='manual' and applies
    // POP/PUSH-aware logic. Disable TanStack Router's built-in restoration so
    // it doesn't fight the custom handler and cause a "flash to footer" when
    // it restores a saved position right before we scroll to top.
    scrollRestoration: false,
    // Cache preloaded route data for 30 seconds so in-session navigation
    // between already-visited routes is instant (no refetch / server roundtrip).
    defaultPreloadStaleTime: 30_000,
    // When a route transition IS pending (async loader running),
    // show the pending component immediately — no delay.
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  return router;
};
