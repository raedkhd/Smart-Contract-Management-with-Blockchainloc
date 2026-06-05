import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Protocol Vault" }] }),
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/repository", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="flex items-center gap-3 text-zinc-500">
        <div className="size-6 bg-zinc-900 rounded-sm flex items-center justify-center">
          <div className="size-3 border border-zinc-50/30 rounded-full" />
        </div>
        <span className="text-sm font-medium tracking-tight">Protocol Vault</span>
      </div>
    </div>
  );
}
