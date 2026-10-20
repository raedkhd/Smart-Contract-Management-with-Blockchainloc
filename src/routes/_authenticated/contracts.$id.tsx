import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getContract, updateContractStage, addApproval } from "@/lib/contracts.functions";
import { getMe } from "@/lib/profile.functions";
import { SolidityCode } from "@/components/solidity-code";
import { NetworkBadge, StageBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/contracts/$id")({
  head: () => ({
    meta: [
      { title: "Contract Details — Protocol Vault" },
      { name: "description", content: "Review contract source, lifecycle stage, and approval timeline." },
      { property: "og:title", content: "Contract Details — Protocol Vault" },
      { property: "og:description", content: "Review contract source, lifecycle stage, and approval timeline." },
    ],
    links: [
      { rel: "canonical", href: "https://guard-chain-studio.lovable.app/contracts" },
    ],
  }),
  component: ContractDetail,
});

const STAGES = ["draft", "review", "audit", "approved", "deployed"] as const;
const APPROVAL_LABELS: Record<string, string> = {
  legal_review: "Legal Compliance Review",
  security_audit: "Security Audit",
  final_signoff: "Final Deployment Sign-off",
};

function ContractDetail() {
  const { id } = useParams({ from: "/_authenticated/contracts/$id" });
  const fetchOne = useServerFn(getContract);
  const fetchMe = useServerFn(getMe);
  const setStage = useServerFn(updateContractStage);
  const approve = useServerFn(addApproval);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => fetchOne({ data: { id } }),
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });

  const canEdit = !!me?.roles?.some((r) => r === "admin" || r === "legal");

  const onStage = async (stage: typeof STAGES[number]) => {
    try {
      await setStage({ data: { id, stage } });
      toast.success(`Stage → ${stage}`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const signApproval = async (kind: "legal_review" | "security_audit" | "final_signoff") => {
    try {
      await approve({ data: { contract_id: id, kind, status: "approved" } });
      toast.success("Approval signed");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (isLoading || !data) {
    return <div className="p-8 text-sm text-zinc-400">Loading…</div>;
  }

  const { contract, approvals } = data;

  return (
    <div className="p-4 md:p-8">
      <Link to="/repository" className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="size-3.5" /> Repository
      </Link>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">{contract.name}</h1>
            <span className="text-xs font-mono text-zinc-400">{contract.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <NetworkBadge network={contract.network} />
            <StageBadge stage={contract.stage} />
            <span className="text-xs text-zinc-500">
              Owner: {contract.owner?.display_name ?? contract.owner?.email ?? "—"}
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Select value={contract.stage} onValueChange={(v) => onStage(v as typeof STAGES[number])}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Source</h2>
          <SolidityCode source={contract.source_code} />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Meta label="Compiler" value={contract.compiler ?? "—"} mono />
            <Meta label="License" value={contract.license ?? "—"} mono />
            <Meta label="Created" value={format(new Date(contract.created_at), "MMM d, yyyy")} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Approval Timeline</h2>
            {canEdit && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => signApproval("legal_review")}>Sign legal</Button>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => signApproval("security_audit")}>Sign audit</Button>
                <Button size="sm" className="h-7 text-[11px]" onClick={() => signApproval("final_signoff")}>Final</Button>
              </div>
            )}
          </div>

          <div className="space-y-6 relative">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-zinc-200" />
            {approvals.length === 0 && (
              <p className="text-sm text-zinc-400 pl-8">No approvals yet.</p>
            )}
            {approvals.map((a) => {
              const done = a.status === "approved";
              return (
                <div key={a.id} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 size-4 rounded-full ring-4 ring-zinc-50 ${done ? "bg-emerald-500" : a.status === "rejected" ? "bg-red-500" : "bg-zinc-200"}`} />
                  <p className="text-sm font-medium">{APPROVAL_LABELS[a.kind]}</p>
                  <p className="text-xs text-zinc-500 mt-1 capitalize">{a.status}{a.note ? ` — ${a.note}` : ""}</p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-2 uppercase">
                    {a.approver?.display_name ?? a.approver?.email ?? "—"} · {format(new Date(a.created_at), "MMM d, HH:mm")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="ring-1 ring-black/5 rounded-md p-3 bg-zinc-100">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`text-xs mt-1 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
