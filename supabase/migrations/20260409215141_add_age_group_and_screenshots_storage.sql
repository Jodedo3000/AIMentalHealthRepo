/*
  # Add Age Group Field and Screenshots Storage Bucket

  ## Summary
  This migration extends the entities table with an age group classification
  and sets up a public Supabase Storage bucket for hosting screenshot images.

  ## Changes

  ### 1. `entities` table
  - New column `age_group` (text, default 'All ages')
    - Possible values: 'Adults', 'Children & Adolescents', 'All ages'
    - Allows filtering by target demographic

  ### 2. Storage
  - New public bucket `screenshots` for hosting entity screenshot images
  - Public SELECT policy so images are accessible without auth
  - Authenticated INSERT/UPDATE/DELETE for admin uploads

  ## Notes
  - The `age_group` column is nullable in spirit but defaults to 'All ages'
    to keep existing entities valid
  - The screenshots bucket is public (images are served without signed URLs)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'age_group'
  ) THEN
    ALTER TABLE entities ADD COLUMN age_group text DEFAULT 'All ages' NOT NULL;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Screenshots are publicly viewable'
  ) THEN
    CREATE POLICY "Screenshots are publicly viewable"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'screenshots');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload screenshots'
  ) THEN
    CREATE POLICY "Authenticated users can upload screenshots"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'screenshots' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete screenshots'
  ) THEN
    CREATE POLICY "Authenticated users can delete screenshots"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'screenshots' AND auth.uid() IS NOT NULL);
  END IF;
END $$;
