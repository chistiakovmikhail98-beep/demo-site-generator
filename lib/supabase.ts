import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
}

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/** Fetch project by slug from Supabase */
export async function getProjectBySlug(slug: string) {
  if (!supabase) return null;

  // Try slug column first
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'completed')
    .single();

  if (!error && data) return data;

  // Fallback: search in site_config->meta->slug
  const { data: fallback } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'completed')
    .filter('site_config->meta->>slug', 'eq', slug)
    .single();

  return fallback || null;
}

/** Fetch project by ID */
export async function getProjectById(id: string) {
  if (!supabase) return null;

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  return data || null;
}
