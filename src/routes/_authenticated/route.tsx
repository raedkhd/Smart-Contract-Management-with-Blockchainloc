import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/profile.functions";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import { WalletButton } from "@/components/wallet-button";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const fetchMe = useServerFn(getMe);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <AppSidebar me={me ?? null} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm flex items-center justify-between md:justify-end gap-2 px-4 md:px-8 sticky top-0 z-10">
          <span className="md:hidden font-semibold tracking-tight text-sm">Protocol Vault</span>
          <div className="flex items-center gap-2">
            <WalletButton initialAddress={me?.profile?.wallet_address ?? null} />
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs" aria-label="Sign out">
              <LogOut className="size-3.5 md:mr-1.5" /> <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        </header>
        <MobileNav />
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
