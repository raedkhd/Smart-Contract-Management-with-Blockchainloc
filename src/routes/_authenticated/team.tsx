import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTeam, listRoles, getMe } from "@/lib/profile.functions";
import { setTeamMemberRole } from "@/lib/admin.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team — Protocol Vault" },
      { name: "description", content: "Workspace members and their permission levels." },
      { property: "og:title", content: "Team — Protocol Vault" },
      { property: "og:description", content: "Workspace members and their permission levels." },
    ],
    links: [
      { rel: "canonical", href: "https://guard-chain-studio.lovable.app/team" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const fetchTeam = useServerFn(listTeam);
  const fetchRoles = useServerFn(listRoles);
  const fetchMe = useServerFn(getMe);
  const update = useServerFn(setTeamMemberRole);

  const { data: members, refetch, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => fetchTeam(),
  });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: () => fetchRoles() });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const isAdmin = me?.roles?.includes("admin") ?? false;

  const change = async (member_id: string, role_id: string) => {
    try {
      await update({ data: { member_id, role_id } });
      toast.success("Role updated");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Team</h1>
      <p className="text-zinc-500 text-sm max-w-[56ch] mb-8">
        Workspace members and their permission level. {isAdmin ? "" : "Admin role required to change roles."}
      </p>

      <div className="ring-1 ring-black/5 rounded-xl bg-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-200/50 border-b border-zinc-200/80">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Member</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Wallet</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-950/5 bg-zinc-50">
            {isLoading && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-xs">Loading…</td></tr>
            )}
            {!isLoading && (members?.length ?? 0) === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-xs">No team members yet.</td></tr>
            )}
            {members?.map((m) => (
              <tr key={m.id} className="hover:bg-zinc-100/50">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{m.display_name ?? m.email ?? "—"}</span>
                    <span className="text-xs text-zinc-500">{m.email ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-zinc-600">
                  {m.wallet_address ? `${m.wallet_address.slice(0, 5)}…${m.wallet_address.slice(-4)}` : "—"}
                </td>
                <td className="px-4 py-4">
                  {isAdmin && roles ? (
                    <Select
                      value={m.role_id}
                      onValueChange={(v) => change(m.id, v)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                      {m.role_name ?? "—"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
