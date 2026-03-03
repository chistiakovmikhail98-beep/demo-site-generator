-- FitWebAI: Supabase schema migration for new architecture
-- Run this ONCE before deploying the new version

-- 1. Add slug column for subdomain routing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Unique index for fast lookups by slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;

-- 3. Add theme column for client-side theme overrides
ALTER TABLE projects ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{}';

-- 4. Ensure edit_password columns exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS edit_password_hash TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS edit_password_plain TEXT;

-- 5. Site leads table (visitor submissions from quiz/footer)
CREATE TABLE IF NOT EXISTS site_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT DEFAULT 'footer',        -- quiz | footer | chat
  status TEXT DEFAULT 'new',           -- new | contacted | converted | rejected
  quiz_answers JSONB,
  source_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_leads_project ON site_leads(project_id, created_at DESC);

-- 6. Generate slugs for existing projects that don't have one
-- (Run after migration, manually review results)
-- UPDATE projects SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'))
-- WHERE slug IS NULL AND name IS NOT NULL;
