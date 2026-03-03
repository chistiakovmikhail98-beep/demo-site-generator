import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set — database operations will be unavailable');
}

export const pool = DATABASE_URL
  ? new Pool({ connectionString: DATABASE_URL })
  : null;

/** Run a query, returns rows */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pool) return [];
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/** Run a query, returns first row or null */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// === Project queries ===

export async function getProjectBySlug(slug: string) {
  if (!pool) return null;

  // Try slug column first
  let project = await queryOne(
    `SELECT * FROM projects WHERE slug = $1 AND status = 'completed' LIMIT 1`,
    [slug]
  );
  if (project) return project;

  // Fallback: search in site_config->meta->slug
  project = await queryOne(
    `SELECT * FROM projects WHERE status = 'completed' AND site_config->'meta'->>'slug' = $1 LIMIT 1`,
    [slug]
  );
  return project || null;
}

export async function getProjectById(id: string) {
  if (!pool) return null;
  return queryOne(`SELECT * FROM projects WHERE id = $1`, [id]);
}

// === Leads ===

export async function insertLead(data: {
  name: string;
  phone: string;
  messenger?: string;
  studio_name?: string;
  studio_phone?: string;
  source_url?: string;
}): Promise<boolean> {
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO leads (name, phone, messenger, studio_name, studio_phone, source_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [data.name, data.phone, data.messenger || 'telegram', data.studio_name || '', data.studio_phone || '', data.source_url || '']
    );
    return true;
  } catch (err) {
    console.error('[leads] DB insert error:', err);
    return false;
  }
}

// === Site Leads ===

export async function getProjectIdBySlug(slug: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(`SELECT id FROM projects WHERE slug = $1`, [slug]);
  return row?.id || null;
}

export async function insertSiteLead(data: {
  project_id?: string | null;
  name: string;
  phone: string;
  source?: string;
  quiz_answers?: any;
  source_url?: string;
}): Promise<boolean> {
  if (!pool) return false;
  try {
    await pool.query(
      `INSERT INTO site_leads (project_id, name, phone, source, quiz_answers, source_url, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())`,
      [data.project_id || null, data.name, data.phone, data.source || 'footer', data.quiz_answers ? JSON.stringify(data.quiz_answers) : null, data.source_url || '']
    );
    return true;
  } catch (err) {
    console.error('[site_leads] DB insert error:', err);
    return false;
  }
}

export async function getSiteLeads(projectId: string) {
  return query(
    `SELECT * FROM site_leads WHERE project_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [projectId]
  );
}

// === Queue ===

export async function insertQueueItem(data: { vk_url: string }): Promise<{ id: string } | null> {
  if (!pool) return null;
  const row = await queryOne<{ id: string }>(
    `INSERT INTO queue_items (vk_url, status, created_at) VALUES ($1, 'pending', NOW()) RETURNING id`,
    [data.vk_url]
  );
  return row;
}

// === Admin ===

export async function getProjectForLogin(id: string) {
  return queryOne<{ name: string; site_config: any; edit_password_hash: string }>(
    `SELECT name, site_config, edit_password_hash FROM projects WHERE id = $1`,
    [id]
  );
}

export async function getProjectName(id: string) {
  return queryOne<{ name: string }>(`SELECT name FROM projects WHERE id = $1`, [id]);
}

export async function getProjectConfig(id: string) {
  return queryOne<{ site_config: any }>(`SELECT site_config FROM projects WHERE id = $1`, [id]);
}

export async function updateProjectConfig(id: string, config: any): Promise<void> {
  if (!pool) throw new Error('Database not configured');
  await pool.query(
    `UPDATE projects SET site_config = $2, updated_at = NOW() WHERE id = $1`,
    [id, JSON.stringify(config)]
  );
}
