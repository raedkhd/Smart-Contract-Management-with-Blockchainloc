import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  // Server-side 307 during SSR; client-side router redirect on navigation.
  // No component is rendered, so SSR never emits an empty body for "/".
  beforeLoad: () => {
    throw redirect({ to: "/repository" });
  },
});
