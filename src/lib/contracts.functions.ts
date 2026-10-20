import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Network = z.enum(["ethereum", "arbitrum", "optimism", "base", "polygon", "sepolia"]);
const Stage = z.enum(["draft", "review", "audit", "approved", "deployed"]);
const ApprovalKind = z.enum(["legal_review", "security_audit", "final_signoff"]);
const ApprovalStatus = z.enum(["pending", "approved", "rejected"]);

export const listContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("contracts")
      .select("id, name, version, network, stage, owner_id, updated_at, created_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ownerIds = Array.from(new Set((data ?? []).map((c) => c.owner_id)));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = ownerIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name, email").in("id", ownerIds)
      : { data: [] as { id: string; display_name: string | null; email: string | null }[] };

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (data ?? []).map((c) => ({
      ...c,
      owner: profileById.get(c.owner_id) ?? null,
    }));
  });

export const getContract = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const { data: approvals } = await supabase
      .from("contract_approvals")
      .select("*")
      .eq("contract_id", data.id)
      .order("created_at", { ascending: true });

    const { data: activity } = await supabase
      .from("contract_activity")
      .select("*")
      .eq("contract_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const userIds = Array.from(
      new Set(
        [
          contract.owner_id,
          ...(approvals ?? []).map((a) => a.approver_id).filter((x): x is string => !!x),
          ...(activity ?? []).map((a) => a.actor_id).filter((x): x is string => !!x),
        ],
      ),
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name, email").in("id", userIds)
      : { data: [] as { id: string; display_name: string | null; email: string | null }[] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    return {
      contract: { ...contract, owner: profileById.get(contract.owner_id) ?? null },
      approvals: (approvals ?? []).map((a) => ({
        ...a,
        approver: a.approver_id ? profileById.get(a.approver_id) ?? null : null,
      })),
      activity: (activity ?? []).map((a) => ({
        ...a,
        actor: a.actor_id ? profileById.get(a.actor_id) ?? null : null,
      })),
    };
  });

export const createContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({
      name: z.string().min(1).max(120),
      network: Network,
      version: z.string().min(1).max(40).default("v0.1.0"),
      source_code: z.string().max(200_000).default(""),
      description: z.string().max(2000).optional(),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        name: data.name,
        network: data.network,
        version: data.version,
        source_code: data.source_code,
        description: data.description ?? null,
        owner_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("contract_activity").insert({
      contract_id: contract.id,
      actor_id: userId,
      event: "contract.created",
    });
    return contract;
  });

export const updateContractStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid(), stage: Stage }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("contracts")
      .update({ stage: data.stage })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("contract_activity").insert({
      contract_id: data.id,
      actor_id: userId,
      event: "stage.changed",
      payload: { stage: data.stage },
    });
    return { ok: true };
  });

export const addApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({
      contract_id: z.string().uuid(),
      kind: ApprovalKind,
      status: ApprovalStatus,
      note: z.string().max(2000).optional(),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("contract_approvals").insert({
      contract_id: data.contract_id,
      approver_id: userId,
      kind: data.kind,
      status: data.status,
      note: data.note ?? null,
      signed_at: data.status === "approved" ? new Date().toISOString() : null,
    });
    if (error) throw new Error(error.message);
    await supabase.from("contract_activity").insert({
      contract_id: data.contract_id,
      actor_id: userId,
      event: `approval.${data.status}`,
      payload: { kind: data.kind },
    });
    return { ok: true };
  });

export const listAudits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("contract_approvals")
      .select("id, contract_id, kind, status, note, signed_at, created_at, approver_id, contracts(name, network, version)")
      .eq("kind", "security_audit")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
