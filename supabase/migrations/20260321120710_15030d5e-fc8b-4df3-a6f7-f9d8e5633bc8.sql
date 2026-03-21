
-- Enable realtime for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Allow members to insert comments on shared trips
CREATE POLICY "Members can insert comments on shared trips"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (is_trip_member(auth.uid(), trip_id) AND user_id = auth.uid());
