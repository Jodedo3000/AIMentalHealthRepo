/*
  # Add summary field and Observational type to evidence

  1. Changes
    - `evidence` table: adds a `summary` text column (nullable) for study summaries
    - Updates the `evidence_type` check constraint to include 'Observational'

  2. Notes
    - The existing constraint is dropped and recreated to include the new type
    - All existing data is preserved
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evidence' AND column_name = 'summary'
  ) THEN
    ALTER TABLE evidence ADD COLUMN summary text NOT NULL DEFAULT '';
  END IF;
END $$;

ALTER TABLE evidence DROP CONSTRAINT IF EXISTS evidence_type_check;
ALTER TABLE evidence ADD CONSTRAINT evidence_type_check
  CHECK (type IN ('RCT', 'Meta-analysis', 'Peer-reviewed', 'Pilot', 'Anecdotal', 'Observational'));
