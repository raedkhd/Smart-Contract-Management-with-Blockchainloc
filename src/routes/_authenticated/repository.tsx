import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listContracts, createContract } from "@/lib/contracts.functions";
import { NetworkBadge, StageBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/repository")({
  head: () => ({
    meta: [
      { title: "Contract Repository — Protocol Vault" },
      { name: "description", content: "Manage the lifecycle of your Solidity deployments from draft to mainnet execution." },
      { property: "og:title", content: "Contract Repository — Protocol Vault" },
      { property: "og:description", content: "Manage the lifecycle of your Solidity deployments from draft to mainnet execution." },
    ],
    links: [
      { rel: "canonical", href: "https://guard-chain-studio.lovable.app/repository" },
    ],
  }),
  component: RepositoryPage,
});

function RepositoryPage() {
  const list = useServerFn(listContracts);
  const create = useServerFn(createContract);
  const { data, refetch, isLoading } = useQuery({ queryKey: ["contracts"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", network: "ethereum" as const, version: "v0.1.0", source_code: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await create({ data: form });
      toast.success("Contract added");
      setOpen(false);
      setForm({ name: "", network: "ethereum", version: "v0.1.0", source_code: "" });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Contract Repository</h1>
          <p className="text-zinc-500 text-sm max-w-[56ch]">
            Manage the lifecycle of your Solidity deployments from draft to mainnet execution.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="size-4 mr-1.5" />New contract</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="LiquidityVault.sol" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Network</Label>
                  <Select value={form.network} onValueChange={(v) => setForm({ ...form, network: v as typeof form.network })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["ethereum","arbitrum","optimism","base","polygon","sepolia"].map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Version</Label>
                  <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Solidity source</Label>
                <Textarea
                  rows={10}
                  value={form.source_code}
                  onChange={(e) => setForm({ ...form, source_code: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.20;"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={saving || !form.name}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="ring-1 ring-black/5 rounded-xl bg-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-200/50 border-b border-zinc-200/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Contract</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Network</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Owner</th>
              <th className="px-4 py-3 font-medium text-zinc-500 text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-950/5 bg-zinc-50">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400 text-sm">Loading…</td></tr>
            )}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400 text-sm">No contracts yet. Add your first.</td></tr>
            )}
            {data?.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-100/50 transition-colors">
                <td className="px-4 py-4">
                  <Link to="/contracts/$id" params={{ id: c.id }} className="flex flex-col hover:text-zinc-700">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs font-mono text-zinc-400">{c.version}</span>
                  </Link>
                </td>
                <td className="px-4 py-4"><NetworkBadge network={c.network} /></td>
                <td className="px-4 py-4"><StageBadge stage={c.stage} /></td>
                <td className="px-4 py-4 text-xs text-zinc-600">{c.owner?.display_name ?? c.owner?.email ?? "—"}</td>
                <td className="px-4 py-4 text-right text-zinc-500 text-xs">
                  {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
