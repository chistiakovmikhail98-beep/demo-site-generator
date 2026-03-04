-- Migration: Builder + Payments tables
-- Run on VPS: psql -U fitwebai -d fitwebai -f deploy/migration-builder.sql

-- Add email/phone to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  yookassa_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) UNIQUE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_project_id ON subscriptions(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
