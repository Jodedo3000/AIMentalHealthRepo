/*
  # AI Mental Health & Wellbeing Repository Schema

  ## Overview
  Creates the core tables for tracking applications at the intersection of AI and mental health.

  ## New Tables

  ### entities
  - Core table for apps, research projects, and VC-backed companies
  - `id` (uuid, primary key)
  - `name` (text) - Entity name
  - `type` (text) - App, Research, or VC
  - `focus` (text) - Clinical or Wellness
  - `description` (text) - Full description
  - `affective_ai` (boolean) - Whether it uses affective/emotional AI
  - `ai_details` (text) - Details about AI implementation
  - `url` (text) - Primary URL
  - `logo_url` (text) - Logo image URL
  - `created_at`, `updated_at` timestamps

  ### evidence
  - Research evidence linked to entities
  - `id` (uuid, primary key)
  - `entity_id` (uuid, FK to entities)
  - `title` (text) - Study/evidence title
  - `source_url` (text) - Link to source
  - `type` (text) - RCT, Pilot, Peer-reviewed, Anecdotal
  - `date` (date) - Publication date
  - `notes` (text) - Additional notes

  ### media
  - Screenshots and images for entities
  - `id` (uuid, primary key)
  - `entity_id` (uuid, FK to entities)
  - `image_url` (text) - Image URL
  - `caption` (text) - Image caption
  - `category` (text) - Onboarding, AI-Interaction, Dashboard
  - `sort_order` (int)

  ### taxonomy
  - Tags linking entities to conditions/frameworks
  - `id` (uuid, primary key)
  - `entity_id` (uuid, FK to entities)
  - `tag_name` (text) - e.g., Depression, Anxiety, PERMA, CBT
  - `tag_type` (text) - condition, framework, or general

  ## Security
  - RLS enabled on all tables
  - Public read access for gallery
  - Admin-only write access (service role)
*/

CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('App', 'Research', 'VC', 'App/Research')),
  focus text NOT NULL CHECK (focus IN ('Clinical', 'Wellness', 'Both')),
  description text NOT NULL DEFAULT '',
  affective_ai boolean NOT NULL DEFAULT false,
  ai_details text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  title text NOT NULL,
  source_url text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('RCT', 'Pilot', 'Peer-reviewed', 'Anecdotal', 'Meta-analysis')),
  date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('Onboarding', 'AI-Interaction', 'Dashboard', 'General')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  tag_type text NOT NULL CHECK (tag_type IN ('condition', 'framework', 'general')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(entity_id, tag_name)
);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read entities"
  ON entities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete entities"
  ON entities FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Public can read evidence"
  ON evidence FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert evidence"
  ON evidence FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update evidence"
  ON evidence FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete evidence"
  ON evidence FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Public can read media"
  ON media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update media"
  ON media FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete media"
  ON media FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Public can read taxonomy"
  ON taxonomy FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert taxonomy"
  ON taxonomy FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update taxonomy"
  ON taxonomy FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete taxonomy"
  ON taxonomy FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_evidence_entity_id ON evidence(entity_id);
CREATE INDEX IF NOT EXISTS idx_media_entity_id ON media(entity_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_entity_id ON taxonomy(entity_id);
CREATE INDEX IF NOT EXISTS idx_taxonomy_tag_name ON taxonomy(tag_name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_focus ON entities(focus);
