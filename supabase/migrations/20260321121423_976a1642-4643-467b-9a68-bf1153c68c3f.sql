
-- Allow authenticated users to see trip_members rows matching their email (for invitations)
CREATE POLICY "Users can view invitations by email"
ON public.trip_members
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow users to accept invitations (update user_id on rows matching their email)
CREATE POLICY "Users can accept invitations"
ON public.trip_members
FOR UPDATE
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND user_id IS NULL)
WITH CHECK (user_id = auth.uid());

-- Allow users to delete/decline invitations matching their email
CREATE POLICY "Users can decline invitations"
ON public.trip_members
FOR DELETE
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND user_id IS NULL);
