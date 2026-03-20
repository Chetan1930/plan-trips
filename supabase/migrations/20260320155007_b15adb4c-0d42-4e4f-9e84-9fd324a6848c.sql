
-- 1. Allow trip members (by user_id) to SELECT trips they're members of
CREATE POLICY "Members can view shared trips"
ON public.trips FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trips.id
    AND trip_members.user_id = auth.uid()
  )
);

-- 2. Allow trip members to SELECT activities/expenses/checklist/comments/members for shared trips
CREATE POLICY "Members can view shared activities"
ON public.activities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = activities.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view shared expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = expenses.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view shared checklist"
ON public.checklist_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = checklist_items.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view shared comments"
ON public.comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = comments.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view shared members"
ON public.trip_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = trip_members.trip_id
    AND tm.user_id = auth.uid()
  )
);

-- 3. Function to auto-link trip_members by email when a user signs up
CREATE OR REPLACE FUNCTION public.link_trip_members_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trip_members
  SET user_id = NEW.id
  WHERE email = NEW.email
    AND user_id IS NULL;
  RETURN NEW;
END;
$$;

-- 4. Trigger on auth.users insert (signup)
CREATE TRIGGER on_auth_user_created_link_members
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_trip_members_on_signup();
