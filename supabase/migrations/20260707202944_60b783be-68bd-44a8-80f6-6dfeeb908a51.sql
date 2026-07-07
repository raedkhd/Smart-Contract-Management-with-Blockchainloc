
-- Audit trail: remove client-side INSERT ability
DROP POLICY IF EXISTS "Authenticated insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users insert own audits" ON public.audits;

-- contract_participants: restrict SELECT
DROP POLICY IF EXISTS "Authenticated read participants" ON public.contract_participants;

CREATE POLICY "Read participants scoped"
ON public.contract_participants
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'legal'::app_role)
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_participants.contract_id
      AND c.owner_id = auth.uid()
  )
);

-- signatures: restrict SELECT
DROP POLICY IF EXISTS "Authenticated read signatures" ON public.signatures;

CREATE POLICY "Read signatures scoped"
ON public.signatures
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'legal'::app_role)
  OR signer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = signatures.contract_id
      AND c.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.contract_participants p
    WHERE p.contract_id = signatures.contract_id
      AND p.user_id = auth.uid()
  )
);
