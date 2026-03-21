-- Enable RLS just in case it isn't enabled
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- ACTIVITIES: Allow any trip member to insert, update, or delete
DROP POLICY IF EXISTS "Members can insert activities" ON activities;
CREATE POLICY "Members can insert activities" ON activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can update activities" ON activities;
CREATE POLICY "Members can update activities" ON activities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can delete activities" ON activities;
CREATE POLICY "Members can delete activities" ON activities FOR DELETE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);

-- EXPENSES: Allow any trip member to insert, update, or delete
DROP POLICY IF EXISTS "Members can insert expenses" ON expenses;
CREATE POLICY "Members can insert expenses" ON expenses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can update expenses" ON expenses;
CREATE POLICY "Members can update expenses" ON expenses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can delete expenses" ON expenses;
CREATE POLICY "Members can delete expenses" ON expenses FOR DELETE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);

-- CHECKLIST ITEMS: Allow any trip member to insert, update, or delete
DROP POLICY IF EXISTS "Members can insert checklist items" ON checklist_items;
CREATE POLICY "Members can insert checklist items" ON checklist_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can update checklist items" ON checklist_items;
CREATE POLICY "Members can update checklist items" ON checklist_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members can delete checklist items" ON checklist_items;
CREATE POLICY "Members can delete checklist items" ON checklist_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);