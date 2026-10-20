import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      id: userId,
      profile,
      roles: (roles ?? []).map((r) => r.role as "admin" | "legal" | "viewer"),
    };
  });

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: members, error }, { data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("team_members")
        .select("id, user_id, role_id, wallet_address, workspace_id, created_at")
        .order("created_at", { ascending: true }),
      supabaseAdmin.from("profiles").select("id, display_name, email, wallet_address"),
      supabaseAdmin.from("roles").select("id, name"),
    ]);
    if (error) throw new Error(error.message);
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const roleById = new Map((roles ?? []).map((r) => [r.id, r]));
    return (members ?? []).map((m) => {
      const p = profileById.get(m.user_id);
      const r = roleById.get(m.role_id);
      return {
        id: m.id,
        user_id: m.user_id,
        email: p?.email ?? null,
        display_name: p?.display_name ?? null,
        wallet_address: m.wallet_address ?? p?.wallet_address ?? null,
        role_id: m.role_id,
        role_name: r?.name ?? null,
        workspace_id: m.workspace_id,
      };
    });
  });

export const listRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("id, name, description")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });


export const setWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).nullable() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ wallet_address: data.address })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
