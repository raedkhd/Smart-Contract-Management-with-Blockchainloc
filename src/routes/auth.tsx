import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Protocol Vault" },
      { name: "description", content: "Sign in to your Protocol Vault workspace to manage smart contracts and team approvals." },
      { property: "og:title", content: "Sign in — Protocol Vault" },
      { property: "og:description", content: "Sign in to your Protocol Vault workspace to manage smart contracts and team approvals." },
    ],
    links: [
      { rel: "canonical", href: "https://guard-chain-studio.lovable.app/auth" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/repository", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/repository", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-zinc-900 text-zinc-100 flex-col justify-between p-12">
        <div className="flex items-center gap-2 font-semibold">
          <div className="size-6 bg-zinc-50 rounded-sm flex items-center justify-center">
            <div className="size-3 border border-zinc-900/30 rounded-full" />
          </div>
          <span className="tracking-tight">Protocol Vault</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight max-w-md text-balance">
            Manage your Solidity deployments from draft to mainnet.
          </h2>
          <p className="text-zinc-400 text-sm max-w-md text-pretty">
            A team workspace for engineering, legal, and compliance — versioned source, lifecycle stages, and signed approvals before any contract ships.
          </p>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          v1.0 · EVM Compatible
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin" ? "Access your workspace." : "First user becomes admin."}
          </p>

          <Button onClick={google} disabled={loading} variant="outline" className="w-full mt-6">
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-muted-foreground hover:text-foreground mt-6 block mx-auto"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>

          <Link to="/repository" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mt-8 block text-center">
            ← back
          </Link>
        </div>
      </div>
    </div>
  );
}
