import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContracts } from "@/lib/contracts.functions";
import { NetworkBadge } from "@/components/badges";

export const Route = createFileRoute("/_authenticated/lifecycle")({
  component: LifecyclePage,
});

const COLUMNS: { key: "draft" | "review" | "audit" | "approved" | "deployed"; label: string; accent: string }[] = [
  { key: "draft", label: "Draft", accent: "border-zinc-400" },
  { key: "review", label: "In Review", accent: "border-blue-500" },
  { key: "audit", label: "Under Audit", accent: "border-amber-500" },
  { key: "approved", label: "Approved", accent: "border-emerald-500" },
  { key: "deployed", label: "Deployed", accent: "border-indigo-500" },
];

function LifecyclePage() {
  const list = useServerFn(listContracts);
  const { data } = useQuery({ queryKey: ["contracts"], queryFn: () => list() });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Lifecycle Board</h1>
      <p className="text-zinc-500 text-sm max-w-[56ch] mb-8">
        Track every contract from draft to deployment across review and audit stages.
      </p>

      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const items = (data ?? []).filter((c) => c.stage === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>{col.label}</span>
                <span className="text-zinc-400">{items.length}</span>
              </h3>
              <div className="space-y-3">
                {items.length === 0 && (
                  <div className="text-[11px] text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-lg">
                    Empty
                  </div>
                )}
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to="/contracts/$id"
                    params={{ id: c.id }}
                    className={`block p-3 bg-zinc-100 ring-1 ring-black/5 rounded-lg border-l-2 ${col.accent} hover:bg-zinc-200/40 transition-colors`}
                  >
                    <p className="text-xs font-medium mb-1">{c.name}</p>
                    <div className="flex items-center justify-between">
                      <NetworkBadge network={c.network} />
                      <span className="text-[10px] font-mono text-zinc-400">{c.version}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
