-- FitWebAI PostgreSQL Schema
-- Run as: psql -U fitwebai -d fitwebai -f init-postgres.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Projects ===
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT 'fitness',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  color_scheme JSONB,
  ai_model TEXT,
  site_config JSONB,
  deployed_url TEXT,
  slug TEXT UNIQUE,
  uploaded_files JSONB,
  vk_group_url TEXT,
  vk_admins JSONB,
  vk_contacts JSONB,
  edit_password_hash TEXT,
  edit_password_plain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- === Queue Items ===
CREATE TABLE IF NOT EXISTS queue_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  vk_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  project_id TEXT REFERENCES projects(id),
  batch_id TEXT,
  batch_order INTEGER,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_items(status);
CREATE INDEX IF NOT EXISTS idx_queue_batch ON queue_items(batch_id);

-- === Leads (from DemoBanner — "Хотите такой же сайт?") ===
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  messenger TEXT DEFAULT 'telegram',
  studio_name TEXT DEFAULT '',
  studio_phone TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === Site Leads (from client sites — quiz/footer forms) ===
CREATE TABLE IF NOT EXISTS site_leads (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  project_id TEXT REFERENCES projects(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT DEFAULT 'footer',
  quiz_answers JSONB,
  source_url TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_leads_project ON site_leads(project_id);

-- === AI Costs ===
CREATE TABLE IF NOT EXISTS ai_costs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  project_id TEXT,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === Token Stats (daily aggregates) ===
CREATE TABLE IF NOT EXISTS token_stats (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10,6) NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, model)
);
