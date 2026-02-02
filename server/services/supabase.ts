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
  uploaded_files?: Array<{ path: string; filename: string; block: string; label?: string; order: number }>;
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

/**
 * Скачивает файл из Storage (работает с приватными bucket)
 * @param url - публичный URL или путь в storage
 * @returns Buffer с содержимым файла
 */
export async function downloadImage(url: string): Promise<Buffer> {
  // Извлекаем путь из URL (project-images/projectId/filename)
  const match = url.match(/project-images\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid storage URL: ${url}`);
  }

  const storagePath = match[1];
  const { data, error } = await supabase.storage
    .from('project-images')
    .download(storagePath);

  if (error) throw error;
  if (!data) throw new Error('No data returned from storage');

  // Blob to Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// === Статистика токенов ===

export interface DbTokenStats {
  id?: string;
  date: string; // YYYY-MM-DD
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  requests_count: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Сохраняет или обновляет статистику токенов за день
 */
export async function saveTokenStats(
  model: string,
  promptTokens: number,
  completionTokens: number,
  estimatedCost: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Пробуем получить существующую запись за сегодня
    const { data: existing } = await supabase
      .from('token_stats')
      .select('*')
      .eq('date', today)
      .eq('model', model)
      .single();

    if (existing) {
      // Обновляем существующую запись
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
      // Создаём новую запись
      await supabase
        .from('token_stats')
        .insert({
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

    console.log(`📊 Статистика токенов сохранена: ${today} / ${model}`);
  } catch (error) {
    console.error('⚠️ Ошибка сохранения статистики токенов:', error);
    // Не бросаем ошибку — статистика не критична
  }
}

/**
 * Получает статистику токенов за период
 */
export async function getTokenStats(days: number = 30): Promise<DbTokenStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('token_stats')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  if (error) {
    console.error('⚠️ Ошибка получения статистики токенов:', error);
    return [];
  }

  return data || [];
}

/**
 * Получает суммарную статистику за всё время
 */
export async function getTokenStatsTotal(): Promise<{
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  byDay: Array<{ date: string; tokens: number; cost: number; requests: number }>;
}> {
  const stats = await getTokenStats(365); // Год

  const byModel: Record<string, { tokens: number; cost: number; requests: number }> = {};
  const byDayMap: Record<string, { tokens: number; cost: number; requests: number }> = {};

  let totalTokens = 0;
  let totalCost = 0;
  let totalRequests = 0;

  for (const stat of stats) {
    // Общие
    totalTokens += stat.total_tokens;
    totalCost += stat.estimated_cost;
    totalRequests += stat.requests_count;

    // По модели
    if (!byModel[stat.model]) {
      byModel[stat.model] = { tokens: 0, cost: 0, requests: 0 };
    }
    byModel[stat.model].tokens += stat.total_tokens;
    byModel[stat.model].cost += stat.estimated_cost;
    byModel[stat.model].requests += stat.requests_count;

    // По дню
    if (!byDayMap[stat.date]) {
      byDayMap[stat.date] = { tokens: 0, cost: 0, requests: 0 };
    }
    byDayMap[stat.date].tokens += stat.total_tokens;
    byDayMap[stat.date].cost += stat.estimated_cost;
    byDayMap[stat.date].requests += stat.requests_count;
  }

  const byDay = Object.entries(byDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { totalTokens, totalCost, totalRequests, byModel, byDay };
}
