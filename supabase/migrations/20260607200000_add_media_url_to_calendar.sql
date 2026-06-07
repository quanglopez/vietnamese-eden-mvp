-- Add media_url column to content_calendar_items
ALTER TABLE content_calendar_items
  ADD COLUMN IF NOT EXISTS media_url text;

-- Create calendar-media storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('calendar-media', 'calendar-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to calendar-media
CREATE POLICY "Authenticated users can upload calendar media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'calendar-media');

-- Allow public read of calendar-media
CREATE POLICY "Public read calendar media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'calendar-media');
