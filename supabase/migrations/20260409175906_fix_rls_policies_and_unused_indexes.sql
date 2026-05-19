/*
  # Fix RLS Policies and Remove Unused Indexes

  ## Changes

  ### 1. Remove Unused Indexes
  - Drop `idx_taxonomy_tag_name` — not used by any query
  - Drop `idx_entities_type` — not used by any query
  - Drop `idx_entities_focus` — not used by any query

  ### 2. Fix RLS Policies (Always-True clauses)
  All write policies for entities, evidence, media, and taxonomy had USING/WITH CHECK
  clauses that evaluated to `true`, effectively bypassing row-level security.
  Replaced with `auth.uid() IS NOT NULL` so only authenticated users can write.

  ### Tables affected
  - `entities` — UPDATE, INSERT, DELETE
  - `evidence` — UPDATE, INSERT, DELETE
  - `media` — UPDATE, INSERT, DELETE
  - `taxonomy` — UPDATE, INSERT, DELETE

  ### Security Notes
  - Public read (anon + authenticated) is unchanged and intentional for the gallery
  - Write access now requires a valid authenticated session (auth.uid() must exist)
  - This prevents unauthenticated API calls from mutating data
*/

-- Remove unused indexes
DROP INDEX IF EXISTS idx_taxonomy_tag_name;
DROP INDEX IF EXISTS idx_entities_type;
DROP INDEX IF EXISTS idx_entities_focus;

-- Fix entities write policies
DROP POLICY IF EXISTS "Authenticated can insert entities" ON entities;
DROP POLICY IF EXISTS "Authenticated can update entities" ON entities;
DROP POLICY IF EXISTS "Authenticated can delete entities" ON entities;

CREATE POLICY "Authenticated can insert entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete entities"
  ON entities FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix evidence write policies
DROP POLICY IF EXISTS "Authenticated can insert evidence" ON evidence;
DROP POLICY IF EXISTS "Authenticated can update evidence" ON evidence;
DROP POLICY IF EXISTS "Authenticated can delete evidence" ON evidence;

CREATE POLICY "Authenticated can insert evidence"
  ON evidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update evidence"
  ON evidence FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete evidence"
  ON evidence FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix media write policies
DROP POLICY IF EXISTS "Authenticated can insert media" ON media;
DROP POLICY IF EXISTS "Authenticated can update media" ON media;
DROP POLICY IF EXISTS "Authenticated can delete media" ON media;

CREATE POLICY "Authenticated can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update media"
  ON media FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete media"
  ON media FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Fix taxonomy write policies
DROP POLICY IF EXISTS "Authenticated can insert taxonomy" ON taxonomy;
DROP POLICY IF EXISTS "Authenticated can update taxonomy" ON taxonomy;
DROP POLICY IF EXISTS "Authenticated can delete taxonomy" ON taxonomy;

CREATE POLICY "Authenticated can insert taxonomy"
  ON taxonomy FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update taxonomy"
  ON taxonomy FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete taxonomy"
  ON taxonomy FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
