// Worker PostgreSQL client + DB operations

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

export const pool = new Pool({ connectionString: DATABASE_URL });

// === Queue operations ===

export interface QueueItem {
  id: string;
  vk_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  project_id?: string;
  batch_id?: string;
  batch_order?: number;
  options: {
    niche?: string;
    analyzePhotos?: boolean;
    extractColors?: boolean;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export async function getNextQueueItem(): Promise<QueueItem | null> {
  // Atomically claim next pending item using UPDATE ... RETURNING
  const { rows } = await pool.query(
    `UPDATE queue_items
     SET status = 'processing', started_at = NOW()
     WHERE id = (
       SELECT id FROM queue_items
       WHERE status = 'pending'
       ORDER BY batch_order ASC NULLS LAST, created_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING *`
  );
  if (!rows[0]) return null;
  // Parse options if it's a string
  const item = rows[0];
  if (typeof item.options === 'string') {
    try { item.options = JSON.parse(item.options); } catch { item.options = {}; }
  }
  return item || null;
}

export async function completeQueueItem(id: string, projectId: string): Promise<void> {
  await pool.query(
    `UPDATE queue_items SET status = 'completed', project_id = $2, completed_at = NOW() WHERE id = $1`,
    [id, projectId]
  );
}

export async function failQueueItem(id: string, error: string, retryCount: number): Promise<void> {
  await pool.query(
    `UPDATE queue_items SET status = 'failed', error_message = $2, retry_count = $3, completed_at = NOW() WHERE id = $1`,
    [id, error, retryCount]
  );
}

export async function requeueItem(id: string, error: string, retryCount: number): Promise<void> {
  await pool.query(
    `UPDATE queue_items SET status = 'pending', error_message = $2, retry_count = $3, started_at = NULL WHERE id = $1`,
    [id, error, retryCount]
  );
}

export async function resetStuckItems(minutesOld: number = 30): Promise<number> {
  const { rowCount } = await pool.query(
    `UPDATE queue_items SET status = 'pending', started_at = NULL
     WHERE status = 'processing' AND started_at < NOW() - INTERVAL '1 minute' * $1`,
    [minutesOld]
  );
  return rowCount || 0;
}

// === Project operations ===

export interface DbProject {
  id: string;
  name: string;
  niche: string;
  status: string;
  description?: string;
  color_scheme?: Record<string, string>;
  ai_model?: string;
  site_config?: Record<string, unknown>;
  deployed_url?: string;
  slug?: string;
  uploaded_files?: Array<{ path: string; filename: string; block: string; label?: string; order: number }>;
  vk_group_url?: string;
  vk_admins?: Array<{ name?: string; phone?: string; email?: string; role?: string; vkUrl?: string; vkId?: number }>;
  vk_contacts?: { phone?: string; email?: string; address?: string; site?: string };
  edit_password_hash?: string;
  edit_password_plain?: string;
  created_at: string;
  updated_at: string;
}

export async function createProject(project: Partial<DbProject> & { id: string; name: string; niche: string }): Promise<DbProject> {
  const now = new Date().toISOString();
  const { rows } = await pool.query(
    `INSERT INTO projects (id, name, niche, status, description, color_scheme, ai_model, site_config, deployed_url, slug, uploaded_files, vk_group_url, vk_admins, vk_contacts, edit_password_hash, edit_password_plain, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      project.id,
      project.name,
      project.niche,
      project.status || 'pending',
      project.description || null,
      project.color_scheme ? JSON.stringify(project.color_scheme) : null,
      project.ai_model || null,
      project.site_config ? JSON.stringify(project.site_config) : null,
      project.deployed_url || null,
      project.slug || null,
      project.uploaded_files ? JSON.stringify(project.uploaded_files) : null,
      project.vk_group_url || null,
      project.vk_admins ? JSON.stringify(project.vk_admins) : null,
      project.vk_contacts ? JSON.stringify(project.vk_contacts) : null,
      project.edit_password_hash || null,
      project.edit_password_plain || null,
      now,
      now,
    ]
  );
  return rows[0];
}

export async function updateProject(id: string, updates: Partial<DbProject>): Promise<void> {
  // Build dynamic SET clause
  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  for (const key of keys) {
    let val = (updates as any)[key];
    // Stringify JSON fields
    if (['color_scheme', 'site_config', 'uploaded_files', 'vk_admins', 'vk_contacts'].includes(key) && val !== null && typeof val === 'object') {
      val = JSON.stringify(val);
    }
    setClauses.push(`${key} = $${paramIdx}`);
    values.push(val);
    paramIdx++;
  }

  // Always update updated_at
  setClauses.push(`updated_at = NOW()`);

  values.push(id);
  await pool.query(
    `UPDATE projects SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`,
    values
  );
}

export async function getProject(id: string): Promise<DbProject | null> {
  const { rows } = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
  return rows[0] || null;
}

// === Storage operations ===

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/fitwebai/uploads';
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'fitwebai.ru';

export async function uploadImage(
  projectId: string,
  file: Buffer,
  filename: string,
  _contentType: string
): Promise<string> {
  const dir = path.join(UPLOADS_DIR, projectId);
  await fs.promises.mkdir(dir, { recursive: true });

  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(dir, safeName);
  await fs.promises.writeFile(filePath, file);

  return `https://${SITE_DOMAIN}/uploads/${projectId}/${safeName}`;
}

// === AI cost tracking ===

export async function saveAiCost(cost: {
  project_id?: string;
  type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  description?: string;
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO ai_costs (project_id, type, model, input_tokens, output_tokens, total_tokens, cost_usd, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [cost.project_id || null, cost.type, cost.model, cost.input_tokens, cost.output_tokens, cost.total_tokens, cost.cost_usd, cost.description || null]
    );
  } catch (err) {
    console.error('Failed to save AI cost:', err);
  }
}

export async function saveTokenStats(
  model: string,
  promptTokens: number,
  completionTokens: number,
  estimatedCost: number
): Promise<void> {
  try {
    // Upsert: increment if exists for today+model, otherwise insert
    await pool.query(
      `INSERT INTO token_stats (date, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost, requests_count, created_at, updated_at)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, 1, NOW(), NOW())
       ON CONFLICT (date, model) DO UPDATE SET
         prompt_tokens = token_stats.prompt_tokens + EXCLUDED.prompt_tokens,
         completion_tokens = token_stats.completion_tokens + EXCLUDED.completion_tokens,
         total_tokens = token_stats.total_tokens + EXCLUDED.total_tokens,
         estimated_cost = token_stats.estimated_cost + EXCLUDED.estimated_cost,
         requests_count = token_stats.requests_count + 1,
         updated_at = NOW()`,
      [model, promptTokens, completionTokens, promptTokens + completionTokens, estimatedCost]
    );
  } catch (err) {
    console.error('Failed to save token stats:', err);
  }
}
