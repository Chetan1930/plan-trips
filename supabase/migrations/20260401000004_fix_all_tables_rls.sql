-- Enable RLS just in case it's disabled
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ALLOW MEMBERS TO MANAGE EXPENSES
CREATE POLICY "Trip members can insert expenses" ON expenses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can update expenses" ON expenses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can delete expenses" ON expenses FOR DELETE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = expenses.trip_id AND user_id = auth.uid())
);

-- ALLOW MEMBERS TO MANAGE CHECKLIST ITEMS
CREATE POLICY "Trip members can insert checklist_items" ON checklist_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can update checklist_items" ON checklist_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can delete checklist_items" ON checklist_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = checklist_items.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = checklist_items.trip_id AND user_id = auth.uid())
);

-- ALLOW MEMBERS TO MANAGE ACTIVITIES (ITINERARY)
CREATE POLICY "Trip members can insert activities" ON activities FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can update activities" ON activities FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);
CREATE POLICY "Trip members can delete activities" ON activities FOR DELETE USING (
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = activities.trip_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM trips WHERE id = activities.trip_id AND user_id = auth.uid())
);