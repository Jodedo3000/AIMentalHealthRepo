/*
  # Add ai_description to entities

  1. Changes
    - `entities` table: adds `ai_description` (text) — a rich markdown field describing how AI
      is used within the product. Separate from the short `ai_details` field; this one supports
      full structured markdown (headings, bullets, bold).

  2. Notes
    - DEFAULT '' so existing rows are non-null and the column is safe to read immediately.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'ai_description'
  ) THEN
    ALTER TABLE entities ADD COLUMN ai_description text DEFAULT '' NOT NULL;
  END IF;
END $$;
