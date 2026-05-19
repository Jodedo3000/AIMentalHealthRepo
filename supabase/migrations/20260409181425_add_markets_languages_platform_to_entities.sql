/*
  # Add markets, languages, and platform fields to entities

  ## Changes

  ### Modified Table: entities
  - `markets` (text[]) — Target markets, e.g. {US, UK, EU, Global}
  - `languages` (text[]) — Supported languages, e.g. {English, Spanish, French}
  - `platform` (text[]) — Available platforms, e.g. {iOS, Android, Web}

  All three fields default to empty arrays and are non-nullable.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'markets'
  ) THEN
    ALTER TABLE entities ADD COLUMN markets text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'languages'
  ) THEN
    ALTER TABLE entities ADD COLUMN languages text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'platform'
  ) THEN
    ALTER TABLE entities ADD COLUMN platform text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;
