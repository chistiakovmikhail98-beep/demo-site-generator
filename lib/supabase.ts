// Re-export from db.ts — Supabase has been replaced with direct PostgreSQL
export { pool, getProjectBySlug, getProjectById } from './db';

// Legacy alias: `supabase` is now `pool` (null when DATABASE_URL not set)
export { pool as supabase } from './db';
