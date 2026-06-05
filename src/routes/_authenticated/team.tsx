import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTeam, getMe } from "@/lib/profile.functions";
import { setUserRole } from "@/lib/admin.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/team")({
  component: TeamPage,
});

function TeamPage() {
  const fetchTeam = useServerFn(listTeam);
  const fetchMe = useServerFn(getMe);
  const update = useServerFn(setUserRole);

  const { data, refetch } = useQuery({ queryKey: ["team"], queryFn: () => fetchTeam() });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const isAdmin = me?.roles?.includes("admin");

  const change = async (user_id: string, role: "admin" | "legal" | "viewer") => {
    try {
      await update({ data: { user_id, role } });
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
            {data?.map((m) => {
              const role = (m.roles[0] as "admin" | "legal" | "viewer" | undefined) ?? "viewer";
              return (
                <tr key={m.id} className="hover:bg-zinc-100/50">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{m.display_name ?? "—"}</span>
                      <span className="text-xs text-zinc-500">{m.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-zinc-600">
                    {m.wallet_address ? `${m.wallet_address.slice(0,5)}…${m.wallet_address.slice(-4)}` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {isAdmin ? (
                      <Select value={role} onValueChange={(v) => change(m.id, v as "admin" | "legal" | "viewer")}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="legal">legal</SelectItem>
                          <SelectItem value="viewer">viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">{role}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
