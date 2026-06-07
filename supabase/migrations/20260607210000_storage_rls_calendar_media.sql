-- Storage RLS policies for calendar-media bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'calendar-media: authenticated upload'
  ) THEN
    CREATE POLICY "calendar-media: authenticated upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'calendar-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'calendar-media: public read'
  ) THEN
    CREATE POLICY "calendar-media: public read"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'calendar-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'calendar-media: owner delete'
  ) THEN
    CREATE POLICY "calendar-media: owner delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'calendar-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
