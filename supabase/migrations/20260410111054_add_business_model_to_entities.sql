/*
  # Add Business Model to Entities

  ## Summary
  Adds a `business_model` column to the entities table to capture
  the commercial model an entity operates under.

  ## Changes

  ### `entities` table
  - New column `business_model` (text, nullable)
    - Possible values: 'B2B', 'B2C', 'B2B2C', 'Platform'
    - Null means not specified

  ## Notes
  - Existing rows default to NULL (unspecified)
  - Uses a check constraint to enforce allowed values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'business_model'
  ) THEN
    ALTER TABLE entities ADD COLUMN business_model text;
    ALTER TABLE entities ADD CONSTRAINT entities_business_model_check
      CHECK (business_model IN ('B2B', 'B2C', 'B2B2C', 'Platform'));
  END IF;
END $$;
