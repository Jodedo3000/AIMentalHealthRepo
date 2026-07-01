/*
  # Relax media.category to free-text app sections

  The original schema constrained media.category to a fixed set
  ('Onboarding', 'AI-Interaction', 'Dashboard', 'General'). To support
  Mobbin-style galleries grouped by arbitrary "part of the app" sections
  (e.g. "AI Chat with Fy", "AI Letter", "Personalization Quiz"), drop the
  CHECK constraint and allow any non-empty text label.
*/

ALTER TABLE media DROP CONSTRAINT IF EXISTS media_category_check;
ALTER TABLE media ALTER COLUMN category SET DEFAULT 'General';
