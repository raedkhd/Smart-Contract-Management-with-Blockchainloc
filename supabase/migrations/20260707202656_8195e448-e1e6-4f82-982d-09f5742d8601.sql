
DROP POLICY IF EXISTS "Members update own wallet" ON public.team_members;

CREATE POLICY "Members update own wallet"
ON public.team_members
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_team_member_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.role_id IS DISTINCT FROM OLD.role_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    RAISE EXCEPTION 'Only admins can change role, user, or workspace on a team member';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_team_member_role_escalation ON public.team_members;
CREATE TRIGGER prevent_team_member_role_escalation
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_team_member_role_escalation();
