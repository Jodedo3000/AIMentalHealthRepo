/*
  # Add source_evidence_id to papers

  ## Changes

  ### Modified Tables
  - `papers`
    - New nullable column `source_evidence_id` (uuid) — references the evidence row
      that auto-generated this paper, so the two stay linked.

  ### Notes
  - No ON DELETE CASCADE: if evidence is deleted the paper is kept (the user may
    have already enriched it).
  - Column is nullable so manually created papers are unaffected.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'papers' AND column_name = 'source_evidence_id'
  ) THEN
    ALTER TABLE papers ADD COLUMN source_evidence_id uuid REFERENCES evidence(id) ON DELETE SET NULL;
  END IF;
END $$;
