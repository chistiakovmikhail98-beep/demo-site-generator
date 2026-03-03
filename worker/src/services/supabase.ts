// Worker Supabase client + DB operations

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
  process.exit(1);
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const { data: pending, error: findError } = await supabase
    .from('queue_items')
    .select('*')
    .eq('status', 'pending')
    .order('batch_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (findError && findError.code !== 'PGRST116') throw findError;
  if (!pending) return null;

  // Atomically claim
  const { data, error } = await supabase
    .from('queue_items')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function completeQueueItem(id: string, projectId: string): Promise<void> {
  await supabase
    .from('queue_items')
    .update({
      status: 'completed',
      project_id: projectId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function failQueueItem(id: string, error: string, retryCount: number): Promise<void> {
  await supabase
    .from('queue_items')
    .update({
      status: 'failed',
      error_message: error,
      retry_count: retryCount,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function requeueItem(id: string, error: string, retryCount: number): Promise<void> {
  await supabase
    .from('queue_items')
    .update({
      status: 'pending',
      error_message: error,
      retry_count: retryCount,
      started_at: null,
    })
    .eq('id', id);
}

export async function resetStuckItems(minutesOld: number = 30): Promise<number> {
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - minutesOld);

  const { data, error } = await supabase
    .from('queue_items')
    .update({ status: 'pending', started_at: null })
    .eq('status', 'processing')
    .lt('started_at', cutoff.toISOString())
    .select();

  if (error) throw error;
  return data?.length || 0;
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
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      status: project.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<DbProject>): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function getProject(id: string): Promise<DbProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// === Storage operations ===

export async function uploadImage(
  projectId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const path = `${projectId}/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, file, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(path);

  return data.publicUrl;
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
  await supabase
    .from('ai_costs')
    .insert({ ...cost, created_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error) console.error('Failed to save AI cost:', error.message);
    });
}

export async function saveTokenStats(
  model: string,
  promptTokens: number,
  completionTokens: number,
  estimatedCost: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: existing } = await supabase
      .from('token_stats')
      .select('*')
      .eq('date', today)
      .eq('model', model)
      .single();

    if (existing) {
      await supabase
        .from('token_stats')
        .update({
          prompt_tokens: existing.prompt_tokens + promptTokens,
          completion_tokens: existing.completion_tokens + completionTokens,
          total_tokens: existing.total_tokens + promptTokens + completionTokens,
          estimated_cost: existing.estimated_cost + estimatedCost,
          requests_count: existing.requests_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('token_stats').insert({
        date: today,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        estimated_cost: estimatedCost,
        requests_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Failed to save token stats:', err);
  }
}
