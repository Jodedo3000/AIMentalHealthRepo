/*
  # Change business_model from single text to text array

  ## Summary
  Updates the `business_model` column on the entities table from a single
  constrained text value to a text array, allowing entities to belong to
  multiple business models simultaneously (e.g. both "Platform" and "B2B2C").

  ## Changes

  ### `entities` table
  - Drops the existing check constraint on `business_model`
  - Converts `business_model` column from `text` to `text[]`
  - Existing non-null values are wrapped into a single-element array
  - NULL values become an empty array

  ## Notes
  - No data is lost; existing single values are preserved inside an array
  - The check constraint is removed since valid values are enforced at the app level
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'business_model'
    AND data_type = 'text'
  ) THEN
    ALTER TABLE entities DROP CONSTRAINT IF EXISTS entities_business_model_check;

    ALTER TABLE entities
      ALTER COLUMN business_model DROP DEFAULT;

    ALTER TABLE entities
      ALTER COLUMN business_model TYPE text[]
      USING CASE
        WHEN business_model IS NULL THEN '{}'::text[]
        ELSE ARRAY[business_model]
      END;

    ALTER TABLE entities
      ALTER COLUMN business_model SET DEFAULT '{}',
      ALTER COLUMN business_model SET NOT NULL;
  END IF;
END $$;
