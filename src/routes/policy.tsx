import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/policy")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy" });
  },
  component: () => null,
});
