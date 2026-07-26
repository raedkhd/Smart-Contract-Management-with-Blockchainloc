DROP POLICY IF EXISTS "Members update own wallet" ON public.team_members;
CREATE POLICY "Members update own wallet" ON public.team_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());