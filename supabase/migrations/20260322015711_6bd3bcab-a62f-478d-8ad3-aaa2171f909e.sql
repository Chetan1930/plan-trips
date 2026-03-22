
-- Add attachment columns to comments
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS attachment_type text;

-- Add added_by column to checklist_items
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS added_by text;

-- Create storage bucket for trip attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('trip_attachments', 'trip_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload
CREATE POLICY "Authenticated users can upload trip attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trip_attachments');

-- Storage RLS: allow public read
CREATE POLICY "Public can view trip attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'trip_attachments');

-- Members can INSERT activities on shared trips
CREATE POLICY "Members can insert activities"
ON public.activities FOR INSERT TO authenticated
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can UPDATE activities on shared trips
CREATE POLICY "Members can update activities"
ON public.activities FOR UPDATE TO authenticated
USING (is_trip_member(auth.uid(), trip_id))
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can DELETE activities on shared trips
CREATE POLICY "Members can delete activities"
ON public.activities FOR DELETE TO authenticated
USING (is_trip_member(auth.uid(), trip_id));

-- Members can INSERT expenses on shared trips
CREATE POLICY "Members can insert expenses"
ON public.expenses FOR INSERT TO authenticated
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can UPDATE expenses on shared trips
CREATE POLICY "Members can update expenses"
ON public.expenses FOR UPDATE TO authenticated
USING (is_trip_member(auth.uid(), trip_id))
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can DELETE expenses on shared trips
CREATE POLICY "Members can delete expenses"
ON public.expenses FOR DELETE TO authenticated
USING (is_trip_member(auth.uid(), trip_id));

-- Members can INSERT checklist items on shared trips
CREATE POLICY "Members can insert checklist items"
ON public.checklist_items FOR INSERT TO authenticated
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can UPDATE checklist items on shared trips
CREATE POLICY "Members can update checklist items"
ON public.checklist_items FOR UPDATE TO authenticated
USING (is_trip_member(auth.uid(), trip_id))
WITH CHECK (is_trip_member(auth.uid(), trip_id));

-- Members can DELETE checklist items on shared trips
CREATE POLICY "Members can delete checklist items"
ON public.checklist_items FOR DELETE TO authenticated
USING (is_trip_member(auth.uid(), trip_id));
