import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Role = z.enum(["admin", "legal", "viewer"]);

async function requireAdmin(supabase: ReturnType<typeof Object>, userId: string) {
  // intentionally re-query via service role via RLS-respecting auth client wouldn't work for has_role (revoked)
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), role: Role }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Remove other roles, set the one chosen (single-role model in v1)
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: data.user_id,
      role: data.role,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setTeamMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ member_id: z.string().uuid(), role_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("team_members")
      .update({ role_id: data.role_id })
      .eq("id", data.member_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

