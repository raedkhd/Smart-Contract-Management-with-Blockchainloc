import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAudits } from "@/lib/contracts.functions";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/audits")({
  head: () => ({
    meta: [
      { title: "Security Audits — Protocol Vault" },
      { name: "description", content: "Audit reviews recorded against contracts across the workspace." },
      { property: "og:title", content: "Security Audits — Protocol Vault" },
      { property: "og:description", content: "Audit reviews recorded against contracts across the workspace." },
    ],
    links: [
      { rel: "canonical", href: "https://guard-chain-studio.lovable.app/audits" },
    ],
  }),
  component: AuditsPage,
});

function AuditsPage() {
  const fetch = useServerFn(listAudits);
  const { data, isLoading } = useQuery({ queryKey: ["audits"], queryFn: () => fetch() });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Security Audits</h1>
      <p className="text-zinc-500 text-sm max-w-[56ch] mb-8">
        Audit reviews recorded against contracts across the workspace.
      </p>

      <div className="ring-1 ring-black/5 rounded-xl bg-zinc-100 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-zinc-200/50 border-b border-zinc-200/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Contract</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Note</th>
              <th className="px-4 py-3 font-medium text-zinc-500 text-right">Logged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-950/5 bg-zinc-50">
            {isLoading && (<tr><td colSpan={4} className="px-4 py-10 text-center text-zinc-400 text-sm">Loading…</td></tr>)}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-zinc-400 text-sm">No audits recorded yet.</td></tr>
            )}
            {data?.map((a) => {
              const c = (a as unknown as { contracts: { name: string; version: string } | null }).contracts;
              return (
                <tr key={a.id} className="hover:bg-zinc-100/50">
                  <td className="px-4 py-4">
                    <Link to="/contracts/$id" params={{ id: a.contract_id }} className="font-medium hover:text-zinc-700">
                      {c?.name ?? "—"}
                    </Link>
                    <div className="text-[10px] font-mono text-zinc-400">{c?.version}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium capitalize ${a.status === "approved" ? "text-emerald-700" : a.status === "rejected" ? "text-red-700" : "text-amber-700"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-600 max-w-md">{a.note ?? "—"}</td>
                  <td className="px-4 py-4 text-right text-zinc-500 text-xs">{format(new Date(a.created_at), "MMM d, HH:mm")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
