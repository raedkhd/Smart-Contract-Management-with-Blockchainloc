import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { LayoutGrid, Workflow, ShieldCheck, Users } from "lucide-react";

const nav = [
  { to: "/repository", label: "Repository", icon: LayoutGrid },
  { to: "/lifecycle", label: "Lifecycle", icon: Workflow },
  { to: "/audits", label: "Audits", icon: ShieldCheck },
  { to: "/team", label: "Team Settings", icon: Users },
];

export function AppSidebar({ me }: { me: { profile: { display_name: string | null; email: string | null } | null; roles: string[] } | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = me?.roles?.[0] ?? "viewer";
  const displayName = me?.profile?.display_name || me?.profile?.email || "Member";

  return (
    <aside className="w-64 border-r border-zinc-200 bg-zinc-100/50 flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-6 bg-zinc-900 rounded-sm flex items-center justify-center">
            <div className="size-3 border border-zinc-50/30 rounded-full" />
          </div>
          <span className="font-semibold tracking-tight">Protocol Vault</span>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "bg-zinc-200/60 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-200/40",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-2">
          <div className="size-8 rounded-full bg-zinc-200 ring-1 ring-black/5 flex items-center justify-center text-xs font-medium text-zinc-600">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">{displayName}</span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
