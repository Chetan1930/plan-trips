
-- Create a security definer function to get current user's email
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = _user_id
$$;

-- Drop broken policies
DROP POLICY IF EXISTS "Users can accept invitations" ON public.trip_members;
DROP POLICY IF EXISTS "Users can decline invitations" ON public.trip_members;
DROP POLICY IF EXISTS "Users can view invitations by email" ON public.trip_members;

-- Recreate with security definer function
CREATE POLICY "Users can view invitations by email"
ON public.trip_members FOR SELECT TO authenticated
USING (email = public.get_user_email(auth.uid()));

CREATE POLICY "Users can accept invitations"
ON public.trip_members FOR UPDATE TO authenticated
USING (email = public.get_user_email(auth.uid()) AND user_id IS NULL)
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can decline invitations"
ON public.trip_members FOR DELETE TO authenticated
USING (email = public.get_user_email(auth.uid()) AND user_id IS NULL);
