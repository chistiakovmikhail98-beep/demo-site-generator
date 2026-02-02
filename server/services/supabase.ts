import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Service key для серверных операций

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL или SUPABASE_SERVICE_KEY не установлены');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Типы для БД
export interface DbProject {
  id: string;
  name: string;
  niche: string;
  status: 'pending' | 'processing' | 'building' | 'deploying' | 'completed' | 'failed';
  description?: string;
  color_scheme?: Record<string, string>;
  ai_model?: string;
  font_family?: string;
  site_config?: Record<string, unknown>;
  deployed_url?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface DbImage {
  id: string;
  project_id: string;
  url: string;
  type: 'gallery' | 'instructor' | 'hero' | 'atmosphere' | 'other';
  label?: string;
  order_index: number;
  created_at: string;
}

// === CRUD операции ===

export async function getProjects(): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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

export async function createProject(project: Omit<DbProject, 'created_at' | 'updated_at'>): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<DbProject>): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  // Сначала удаляем картинки проекта
  await supabase.from('images').delete().eq('project_id', id);

  // Удаляем файлы из storage
  const { data: files } = await supabase.storage
    .from('project-images')
    .list(id);

  if (files && files.length > 0) {
    await supabase.storage
      .from('project-images')
      .remove(files.map(f => `${id}/${f.name}`));
  }

  // Удаляем проект
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// === Работа с картинками ===

export async function getProjectImages(projectId: string): Promise<DbImage[]> {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addImage(image: Omit<DbImage, 'id' | 'created_at'>): Promise<DbImage> {
  const { data, error } = await supabase
    .from('images')
    .insert({
      ...image,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteImage(id: string): Promise<void> {
  const { error } = await supabase.from('images').delete().eq('id', id);
  if (error) throw error;
}

export async function updateImageOrder(projectId: string, imageIds: string[]): Promise<void> {
  // Обновляем порядок картинок
  for (let i = 0; i < imageIds.length; i++) {
    await supabase
      .from('images')
      .update({ order_index: i })
      .eq('id', imageIds[i]);
  }
}

// === Загрузка файлов ===

export async function uploadImage(
  projectId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const path = `${projectId}/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  // Получаем публичный URL
  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteStorageFile(url: string): Promise<void> {
  // Извлекаем путь из URL
  const match = url.match(/project-images\/(.+)$/);
  if (match) {
    await supabase.storage.from('project-images').remove([match[1]]);
  }
}
