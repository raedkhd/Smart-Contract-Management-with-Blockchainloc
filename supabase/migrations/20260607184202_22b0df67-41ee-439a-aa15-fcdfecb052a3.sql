
-- =========================================================
-- ROLES & PERMISSIONS (dynamic)
-- =========================================================
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage roles" ON public.roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage permissions" ON public.permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage role_permissions" ON public.role_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role_assignments TO authenticated;
GRANT ALL ON public.user_role_assignments TO service_role;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or admin assignments" ON public.user_role_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin manage assignments" ON public.user_role_assignments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- BLOCKCHAIN NETWORKS
-- =========================================================
CREATE TABLE public.blockchain_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  chain_id integer,
  rpc_url text,
  explorer_url text,
  native_currency text,
  is_testnet boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blockchain_networks TO authenticated;
GRANT ALL ON public.blockchain_networks TO service_role;
ALTER TABLE public.blockchain_networks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read networks" ON public.blockchain_networks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage networks" ON public.blockchain_networks FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_networks_updated BEFORE UPDATE ON public.blockchain_networks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CONTRACT VERSIONS
-- =========================================================
CREATE TABLE public.contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  version text NOT NULL,
  source_code text NOT NULL DEFAULT '',
  changelog text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_versions TO authenticated;
GRANT ALL ON public.contract_versions TO service_role;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read versions" ON public.contract_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/legal manage versions" ON public.contract_versions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role));

-- =========================================================
-- DOCUMENTS
-- =========================================================
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text,
  file_url text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admin/legal manage documents" ON public.documents FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role));

-- =========================================================
-- CONTRACT PARTICIPANTS
-- =========================================================
CREATE TABLE public.contract_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id uuid,
  email text,
  full_name text,
  role text,
  wallet_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_participants TO authenticated;
GRANT ALL ON public.contract_participants TO service_role;
ALTER TABLE public.contract_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read participants" ON public.contract_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/legal manage participants" ON public.contract_participants FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role));

-- =========================================================
-- SIGNATURES
-- =========================================================
CREATE TABLE public.signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.contract_participants(id) ON DELETE SET NULL,
  signer_id uuid,
  signature_hash text,
  signed_at timestamptz,
  ip_address text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signatures TO authenticated;
GRANT ALL ON public.signatures TO service_role;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read signatures" ON public.signatures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signer can sign" ON public.signatures FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = signer_id);
CREATE POLICY "Signer can update own" ON public.signatures FOR UPDATE TO authenticated
  USING (auth.uid() = signer_id) WITH CHECK (auth.uid() = signer_id);
CREATE POLICY "Admin manage signatures" ON public.signatures FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- =========================================================
-- SMART CONTRACTS
-- =========================================================
CREATE TABLE public.smart_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  network_id uuid REFERENCES public.blockchain_networks(id) ON DELETE SET NULL,
  address text,
  abi jsonb,
  bytecode text,
  deployed_at timestamptz,
  deployed_by uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smart_contracts TO authenticated;
GRANT ALL ON public.smart_contracts TO service_role;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read smart_contracts" ON public.smart_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/legal manage smart_contracts" ON public.smart_contracts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role));
CREATE TRIGGER trg_smart_contracts_updated BEFORE UPDATE ON public.smart_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- BLOCKCHAIN TRANSACTIONS
-- =========================================================
CREATE TABLE public.blockchain_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smart_contract_id uuid REFERENCES public.smart_contracts(id) ON DELETE CASCADE,
  network_id uuid REFERENCES public.blockchain_networks(id) ON DELETE SET NULL,
  tx_hash text NOT NULL,
  from_address text,
  to_address text,
  value numeric,
  gas_used numeric,
  block_number bigint,
  status text NOT NULL DEFAULT 'pending',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blockchain_transactions TO authenticated;
GRANT ALL ON public.blockchain_transactions TO service_role;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read blockchain_tx" ON public.blockchain_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/legal manage blockchain_tx" ON public.blockchain_transactions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'legal'::app_role));

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own notifications" ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admin insert notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- =========================================================
-- AUDIT LOGS
-- =========================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  payload jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);
