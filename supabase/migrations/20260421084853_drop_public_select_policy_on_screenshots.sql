/*
  # Drop broad SELECT policy on screenshots bucket

  ## Summary
  Removes the "Screenshots are publicly viewable" policy from storage.objects.

  ## Why
  The `screenshots` bucket is already public, meaning Supabase serves individual
  object URLs without any policy check. The SELECT policy on storage.objects is
  separate from URL serving — it controls the Storage LIST API. Leaving it in
  place with `USING (true)` allows any anonymous client to enumerate every file
  in the bucket, which exposes more data than intended.

  Removing this policy has no effect on image loading via direct URLs; those
  continue to work because the bucket itself is marked public.
*/

DROP POLICY IF EXISTS "Screenshots are publicly viewable" ON storage.objects;
