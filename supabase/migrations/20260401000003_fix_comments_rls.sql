-- Enable RLS for comments just in case
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow any trip member (or owner) to insert comments
DROP POLICY IF EXISTS "Members can insert comments" ON comments;
CREATE POLICY "Members can insert comments" ON comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = comments.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = comments.trip_id AND user_id = auth.uid())
);

-- Allow any trip member to update comments (if needed)
DROP POLICY IF EXISTS "Members can update comments" ON comments;
CREATE POLICY "Members can update comments" ON comments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = comments.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = comments.trip_id AND user_id = auth.uid())
);

-- Allow any trip member to delete comments (if needed)
DROP POLICY IF EXISTS "Members can delete comments" ON comments;
CREATE POLICY "Members can delete comments" ON comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = comments.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = comments.trip_id AND user_id = auth.uid())
);