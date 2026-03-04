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
    `SELECT * FROM projects WHERE slug = $1 AND status IN ('completed', 'draft') LIMIT 1`,
    [slug]
  );
  if (project) return project;

  // Fallback: search in site_config->meta->slug
  project = await queryOne(
    `SELECT * FROM projects WHERE status IN ('completed', 'draft') AND site_config->'meta'->>'slug' = $1 LIMIT 1`,
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

/** Lookup by id first, fallback to slug */
export async function getProjectForLogin(idOrSlug: string) {
  const byId = await queryOne<{ id: string; name: string; site_config: any; edit_password_hash: string }>(
    `SELECT id, name, site_config, edit_password_hash FROM projects WHERE id = $1`,
    [idOrSlug]
  );
  if (byId) return byId;
  return queryOne<{ id: string; name: string; site_config: any; edit_password_hash: string }>(
    `SELECT id, name, site_config, edit_password_hash FROM projects WHERE slug = $1`,
    [idOrSlug]
  );
}

/** Lookup by id first, fallback to slug */
export async function getProjectName(idOrSlug: string) {
  const byId = await queryOne<{ name: string }>(`SELECT name FROM projects WHERE id = $1`, [idOrSlug]);
  if (byId) return byId;
  return queryOne<{ name: string }>(`SELECT name FROM projects WHERE slug = $1`, [idOrSlug]);
}

/** Lookup by id first, fallback to slug */
export async function getProjectConfig(idOrSlug: string) {
  const byId = await queryOne<{ id: string; site_config: any }>(`SELECT id, site_config FROM projects WHERE id = $1`, [idOrSlug]);
  if (byId) return byId;
  return queryOne<{ id: string; site_config: any }>(`SELECT id, site_config FROM projects WHERE slug = $1`, [idOrSlug]);
}

export async function updateProjectConfig(id: string, config: any): Promise<void> {
  if (!pool) throw new Error('Database not configured');
  await pool.query(
    `UPDATE projects SET site_config = $2, updated_at = NOW() WHERE id = $1`,
    [id, JSON.stringify(config)]
  );
}

// === Superadmin ===

export async function getAllProjects() {
  return query(
    `SELECT id, name, slug, status, niche, deployed_url, edit_password_plain, created_at, updated_at
     FROM projects ORDER BY created_at DESC`
  );
}

export async function getAllLeads(type: 'demo' | 'site' | 'all' = 'all', filters?: { projectId?: string; from?: string; to?: string }) {
  if (type === 'demo' || type === 'all') {
    const demoLeads = await query(
      `SELECT id, name, phone, messenger, studio_name, source_url, created_at, 'demo' as lead_type
       FROM leads ORDER BY created_at DESC`
    );
    if (type === 'demo') return demoLeads;

    const siteQuery = filters?.projectId
      ? `SELECT sl.id, sl.name, sl.phone, sl.source, sl.quiz_answers, sl.source_url, sl.status, sl.created_at, p.name as project_name, p.slug, 'site' as lead_type
         FROM site_leads sl LEFT JOIN projects p ON sl.project_id = p.id WHERE sl.project_id = $1 ORDER BY sl.created_at DESC`
      : `SELECT sl.id, sl.name, sl.phone, sl.source, sl.quiz_answers, sl.source_url, sl.status, sl.created_at, p.name as project_name, p.slug, 'site' as lead_type
         FROM site_leads sl LEFT JOIN projects p ON sl.project_id = p.id ORDER BY sl.created_at DESC`;
    const siteLeads = filters?.projectId ? await query(siteQuery, [filters.projectId]) : await query(siteQuery);

    if (type === 'all') return [...demoLeads, ...siteLeads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return siteLeads;
  }

  // type === 'site'
  const q = filters?.projectId
    ? `SELECT sl.id, sl.name, sl.phone, sl.source, sl.quiz_answers, sl.source_url, sl.status, sl.created_at, p.name as project_name, p.slug, 'site' as lead_type
       FROM site_leads sl LEFT JOIN projects p ON sl.project_id = p.id WHERE sl.project_id = $1 ORDER BY sl.created_at DESC`
    : `SELECT sl.id, sl.name, sl.phone, sl.source, sl.quiz_answers, sl.source_url, sl.status, sl.created_at, p.name as project_name, p.slug, 'site' as lead_type
       FROM site_leads sl LEFT JOIN projects p ON sl.project_id = p.id ORDER BY sl.created_at DESC`;
  return filters?.projectId ? query(q, [filters.projectId]) : query(q);
}

export async function getStats() {
  const [projects, leads, siteLeads, todayLeads, todaySiteLeads] = await Promise.all([
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM projects`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM leads`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM site_leads`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM leads WHERE created_at >= CURRENT_DATE`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM site_leads WHERE created_at >= CURRENT_DATE`),
  ]);
  return {
    totalProjects: parseInt(projects?.count || '0'),
    totalLeads: parseInt(leads?.count || '0') + parseInt(siteLeads?.count || '0'),
    demoLeads: parseInt(leads?.count || '0'),
    siteLeads: parseInt(siteLeads?.count || '0'),
    todayLeads: parseInt(todayLeads?.count || '0') + parseInt(todaySiteLeads?.count || '0'),
  };
}

export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const row = excludeId
    ? await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM projects WHERE slug = $1 AND id != $2`, [slug, excludeId])
    : await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM projects WHERE slug = $1`, [slug]);
  return parseInt(row?.count || '0') === 0;
}

export async function updateProjectSlug(id: string, newSlug: string): Promise<void> {
  if (!pool) throw new Error('Database not configured');
  await pool.query(
    `UPDATE projects SET slug = $2, updated_at = NOW() WHERE id = $1`,
    [id, newSlug]
  );
}

export async function updateProjectFields(id: string, fields: { name?: string; slug?: string; status?: string }): Promise<void> {
  if (!pool) throw new Error('Database not configured');
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (fields.name !== undefined) { sets.push(`name = $${++idx}`); values.push(fields.name); }
  if (fields.slug !== undefined) { sets.push(`slug = $${++idx}`); values.push(fields.slug); }
  if (fields.status !== undefined) { sets.push(`status = $${++idx}`); values.push(fields.status); }

  if (sets.length === 0) return;
  sets.push('updated_at = NOW()');
  await pool.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $1`, [id, ...values]);
}

export async function deleteProject(id: string): Promise<void> {
  if (!pool) throw new Error('Database not configured');
  await pool.query(`DELETE FROM site_leads WHERE project_id = $1`, [id]);
  await pool.query(`DELETE FROM queue_items WHERE project_id = $1`, [id]);
  await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
}
