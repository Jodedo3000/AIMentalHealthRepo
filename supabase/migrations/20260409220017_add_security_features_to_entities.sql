/*
  # Add Security Features to Entities

  ## Summary
  Adds a `security_features` column to the entities table to capture which
  compliance standards and security protocols an entity supports.

  ## Changes

  ### `entities` table
  - New column `security_features` (text array, default empty array)
    - Stores a list of applicable security/privacy features
    - Possible values: 'GDPR', 'HIPAA', 'CCPA', 'Role-based Access Control',
      'Crisis Protocol', 'Advanced Encryption'

  ## Notes
  - Existing rows default to an empty array (no features claimed)
  - The column is not nullable; uses an empty array as its zero state
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'security_features'
  ) THEN
    ALTER TABLE entities ADD COLUMN security_features text[] DEFAULT '{}' NOT NULL;
  END IF;
END $$;
