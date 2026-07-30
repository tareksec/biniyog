import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
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
