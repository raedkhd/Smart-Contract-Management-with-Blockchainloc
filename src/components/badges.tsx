import { cn } from "@/lib/utils";

const networkStyles: Record<string, string> = {
  ethereum: "bg-zinc-100 text-zinc-600 ring-black/5",
  arbitrum: "bg-blue-50 text-blue-700 ring-blue-600/10",
  optimism: "bg-red-50 text-red-700 ring-red-600/10",
  base: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
  polygon: "bg-purple-50 text-purple-700 ring-purple-600/10",
  sepolia: "bg-amber-50 text-amber-700 ring-amber-600/10",
};

export function NetworkBadge({ network }: { network: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ring-1 uppercase", networkStyles[network] ?? networkStyles.ethereum)}>
      {network}
    </span>
  );
}

const stageStyles: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-zinc-100 text-zinc-600 ring-black/10" },
  review: { label: "In Review", cls: "bg-blue-50 text-blue-700 ring-blue-600/10" },
  audit: { label: "Under Audit", cls: "bg-amber-50 text-amber-700 ring-amber-600/10" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/10" },
  deployed: { label: "Deployed", cls: "bg-indigo-50 text-indigo-700 ring-indigo-600/10" },
};

export function StageBadge({ stage }: { stage: string }) {
  const s = stageStyles[stage] ?? stageStyles.draft;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1", s.cls)}>
      {s.label}
    </span>
  );
}
