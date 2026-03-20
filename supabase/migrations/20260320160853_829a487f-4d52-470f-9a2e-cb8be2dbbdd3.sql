
-- Drop the recursive policies
DROP POLICY IF EXISTS "Members can view shared trips" ON public.trips;
DROP POLICY IF EXISTS "Members can view shared members" ON public.trip_members;
DROP POLICY IF EXISTS "Members can view shared activities" ON public.activities;
DROP POLICY IF EXISTS "Members can view shared expenses" ON public.expenses;
DROP POLICY IF EXISTS "Members can view shared checklist" ON public.checklist_items;
DROP POLICY IF EXISTS "Members can view shared comments" ON public.comments;

-- Create a SECURITY DEFINER function to check trip membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_trip_member(_user_id uuid, _trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE user_id = _user_id AND trip_id = _trip_id
  )
$$;

-- Recreate policies using the function
CREATE POLICY "Members can view shared trips"
ON public.trips FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), id));

CREATE POLICY "Members can view shared members"
ON public.trip_members FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Members can view shared activities"
ON public.activities FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Members can view shared expenses"
ON public.expenses FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Members can view shared checklist"
ON public.checklist_items FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Members can view shared comments"
ON public.comments FOR SELECT TO authenticated
USING (public.is_trip_member(auth.uid(), trip_id));
