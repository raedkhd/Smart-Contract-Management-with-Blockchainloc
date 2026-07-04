
-- networks
CREATE TABLE public.networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chain_id integer NOT NULL UNIQUE,
  rpc_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.networks TO authenticated;
GRANT ALL ON public.networks TO service_role;
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read networks" ON public.networks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage networks" ON public.networks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- team_members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  wallet_address text,
  workspace_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX ON public.team_members (workspace_id);
CREATE INDEX ON public.team_members (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user in this workspace?
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE workspace_id = _workspace_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Members read own workspace" ON public.team_members
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id) OR user_id = auth.uid());

CREATE POLICY "Admins insert members" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can change role_id; other fields can be updated by admins too.
CREATE POLICY "Admins update members" ON public.team_members
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members update own wallet" ON public.team_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND role_id = (SELECT role_id FROM public.team_members tm WHERE tm.id = team_members.id)
  );

CREATE POLICY "Admins delete members" ON public.team_members
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- audits
CREATE TABLE public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audits (actor_id);
CREATE INDEX ON public.audits (created_at DESC);
GRANT SELECT, INSERT ON public.audits TO authenticated;
GRANT ALL ON public.audits TO service_role;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own audits" ON public.audits
  FOR SELECT TO authenticated
  USING (actor_id = auth.uid());

CREATE POLICY "Admins read all audits" ON public.audits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own audits" ON public.audits
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
