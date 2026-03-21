-- Add attachment columns to the comments table
ALTER TABLE comments ADD COLUMN attachment_url text;
ALTER TABLE comments ADD COLUMN attachment_type text;

-- Create a public storage bucket for trip attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip_attachments', 'trip_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the storage bucket
-- 1. Allow public read access to the files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING ( bucket_id = 'trip_attachments' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'trip_attachments' AND auth.role() = 'authenticated' );