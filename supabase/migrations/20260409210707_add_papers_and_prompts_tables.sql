/*
  # Add Papers and Prompts Tables

  ## Summary
  This migration adds two new tables to support research paper summaries and a
  prompt library for mental health AI use cases.

  ## New Tables

  ### 1. `papers`
  Stores academic research paper metadata and editorial summaries.
  - `id` — UUID primary key
  - `title` — Full paper title
  - `authors` — Array of author names
  - `abstract` — Full abstract text
  - `summary` — Short editorial summary (plain English overview)
  - `arxiv_id` — ArXiv identifier (e.g. "2512.04124")
  - `doi` — Digital Object Identifier
  - `journal` — Journal or conference name
  - `year` — Publication year
  - `url` — Primary link to the paper
  - `conditions` — Array of mental health conditions addressed
  - `frameworks` — Array of therapeutic frameworks used
  - `evidence_type` — Type of study (RCT, Pilot, etc.)
  - `open_access` — Whether freely available
  - `created_at`, `updated_at` — Timestamps

  ### 2. `prompts`
  Stores a library of curated AI prompts for mental health practitioners and users.
  - `id` — UUID primary key
  - `title` — Short prompt title
  - `prompt_text` — The full prompt text
  - `description` — Explanation of when and why to use this prompt
  - `condition` — Primary mental health condition it targets
  - `framework` — Therapeutic framework it draws from
  - `use_case` — Who should use it (e.g. "Therapist", "Self-guided user", "App builder")
  - `tags` — Additional tags
  - `created_at`, `updated_at` — Timestamps

  ## Security
  - RLS enabled on both tables
  - Public SELECT access for anon and authenticated users
  - INSERT/UPDATE/DELETE restricted to authenticated users

  ## Notes
  - `authors` and `conditions`, `frameworks`, `tags` are stored as `text[]` arrays
  - `year` is nullable int
  - `open_access` defaults to false
*/

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  authors text[] DEFAULT '{}',
  abstract text DEFAULT '',
  summary text DEFAULT '',
  arxiv_id text DEFAULT '',
  doi text DEFAULT '',
  journal text DEFAULT '',
  year int,
  url text DEFAULT '',
  conditions text[] DEFAULT '{}',
  frameworks text[] DEFAULT '{}',
  evidence_type text DEFAULT '',
  open_access boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view papers"
  ON papers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert papers"
  ON papers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update papers"
  ON papers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete papers"
  ON papers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year DESC);
CREATE INDEX IF NOT EXISTS idx_papers_conditions ON papers USING gin(conditions);
CREATE INDEX IF NOT EXISTS idx_papers_frameworks ON papers USING gin(frameworks);

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  prompt_text text NOT NULL DEFAULT '',
  description text DEFAULT '',
  condition text DEFAULT '',
  framework text DEFAULT '',
  use_case text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompts"
  ON prompts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update prompts"
  ON prompts FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete prompts"
  ON prompts FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_prompts_condition ON prompts(condition);
CREATE INDEX IF NOT EXISTS idx_prompts_framework ON prompts(framework);
