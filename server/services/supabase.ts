import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Service key для серверных операций

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL или SUPABASE_SERVICE_KEY не установлены — работаем в локальном режиме');
}

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null as any;

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
  // Outreach статус
  outreach_status?: 'new' | 'sent' | 'replied' | 'converted' | 'rejected';
  outreach_sent_at?: string;
  // VK данные для CRM
  vk_group_url?: string;
  vk_admins?: Array<{ name?: string; phone?: string; email?: string; role?: string; vkUrl?: string; vkId?: number }>;
  vk_contacts?: {
    phone?: string;
    email?: string;
    address?: string;
    site?: string;
  };
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
      .remove(files.map((f: { name: string }) => `${id}/${f.name}`));
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

// === Лиды (заявки с демо-сайтов) ===

export interface DbLead {
  id?: string;
  name: string;
  phone: string;
  messenger?: string;
  studio_name: string;
  studio_phone?: string;
  source_url?: string;
  status?: 'new' | 'contacted' | 'converted' | 'rejected';
  notes?: string;
  created_at?: string;
}

/**
 * Создаёт новый лид (заявку)
 */
export async function createLead(lead: Omit<DbLead, 'id' | 'created_at'>): Promise<DbLead> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...lead,
      status: 'new',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Получает все лиды (для CRM)
 */
export async function getLeads(limit: number = 100): Promise<DbLead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Обновляет статус лида
 */
export async function updateLead(id: string, updates: Partial<DbLead>): Promise<DbLead> {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// === Очередь для пакетной обработки ===

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DbQueueItem {
  id: string;
  vk_url: string;
  status: QueueItemStatus;
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

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

/**
 * Добавляет один элемент в очередь
 */
export async function addQueueItem(
  vkUrl: string,
  options: DbQueueItem['options'] = {},
  batchId?: string,
  batchOrder?: number
): Promise<DbQueueItem> {
  const { data, error } = await supabase
    .from('queue_items')
    .insert({
      vk_url: vkUrl,
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      options,
      batch_id: batchId,
      batch_order: batchOrder,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Добавляет пакет VK URL в очередь
 * @returns batch_id для отслеживания
 */
export async function addQueueBatch(
  vkUrls: string[],
  options: DbQueueItem['options'] = {}
): Promise<{ batchId: string; itemCount: number }> {
  const batchId = crypto.randomUUID();

  const items = vkUrls.map((url, index) => ({
    vk_url: url,
    status: 'pending' as QueueItemStatus,
    retry_count: 0,
    max_retries: 3,
    options,
    batch_id: batchId,
    batch_order: index,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('queue_items')
    .insert(items);

  if (error) throw error;

  return { batchId, itemCount: items.length };
}

/**
 * Получает следующий элемент для обработки (FIFO)
 * Атомарно помечает его как processing
 */
export async function getNextQueueItem(): Promise<DbQueueItem | null> {
  // Находим следующий pending элемент
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

  // Атомарно обновляем статус
  const { data, error } = await supabase
    .from('queue_items')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
    })
    .eq('id', pending.id)
    .eq('status', 'pending') // Защита от race condition
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Обновляет элемент очереди
 */
export async function updateQueueItem(
  id: string,
  updates: Partial<Pick<DbQueueItem, 'status' | 'error_message' | 'project_id' | 'retry_count'>>
): Promise<DbQueueItem> {
  const updateData: Record<string, unknown> = { ...updates };

  // Автоматически ставим completed_at при завершении
  if (updates.status === 'completed' || updates.status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('queue_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Помечает элемент как выполненный
 */
export async function completeQueueItem(id: string, projectId: string): Promise<DbQueueItem> {
  return updateQueueItem(id, {
    status: 'completed',
    project_id: projectId,
  });
}

/**
 * Помечает элемент как failed
 */
export async function failQueueItem(id: string, errorMessage: string, retryCount: number): Promise<DbQueueItem> {
  return updateQueueItem(id, {
    status: 'failed',
    error_message: errorMessage,
    retry_count: retryCount,
  });
}

/**
 * Получает статистику очереди
 */
export async function getQueueStats(): Promise<QueueStats> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('status');

  if (error) throw error;

  const stats: QueueStats = {
    total: data?.length || 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const item of data || []) {
    if (item.status in stats) {
      stats[item.status as keyof Omit<QueueStats, 'total'>]++;
    }
  }

  return stats;
}

/**
 * Получает статистику по конкретному batch
 */
export async function getBatchStats(batchId: string): Promise<QueueStats & { items: DbQueueItem[] }> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('*')
    .eq('batch_id', batchId)
    .order('batch_order', { ascending: true });

  if (error) throw error;

  const stats: QueueStats = {
    total: data?.length || 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const item of data || []) {
    if (item.status in stats) {
      stats[item.status as keyof Omit<QueueStats, 'total'>]++;
    }
  }

  return { ...stats, items: data || [] };
}

/**
 * Переводит failed элементы обратно в pending для retry
 */
export async function retryFailedItems(batchId?: string): Promise<number> {
  let query = supabase
    .from('queue_items')
    .update({
      status: 'pending',
      error_message: null,
      started_at: null,
      completed_at: null,
    })
    .eq('status', 'failed')
    .lt('retry_count', 3); // Только если не превышен лимит

  if (batchId) {
    query = query.eq('batch_id', batchId);
  }

  const { data, error } = await query.select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Очищает старые completed элементы (старше N дней)
 */
export async function cleanupOldQueueItems(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('queue_items')
    .delete()
    .eq('status', 'completed')
    .lt('completed_at', cutoffDate.toISOString())
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Получает текущий processing элемент (если есть)
 */
export async function getCurrentProcessingItem(): Promise<DbQueueItem | null> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('*')
    .eq('status', 'processing')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Сбрасывает зависшие processing элементы (старше N минут)
 * Используется при старте сервера для восстановления после краша
 */
export async function resetStuckProcessingItems(minutesOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setMinutes(cutoffDate.getMinutes() - minutesOld);

  const { data, error } = await supabase
    .from('queue_items')
    .update({
      status: 'pending',
      started_at: null,
    })
    .eq('status', 'processing')
    .lt('started_at', cutoffDate.toISOString())
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Получает failed элементы очереди с сообщениями об ошибках
 */
export async function getFailedQueueItems(limit: number = 50): Promise<DbQueueItem[]> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('*')
    .eq('status', 'failed')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// === AI Costs (детальный учёт расходов по проектам) ===

export interface DbAiCost {
  id?: string;
  project_id?: string;
  type: 'content_generation' | 'photo_analysis' | 'other';
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  description?: string;
  created_at?: string;
}

/**
 * Сохраняет расход AI в таблицу ai_costs
 * Автоматически обновляет ai_cost_usd в projects через триггер
 */
export async function saveAiCost(cost: Omit<DbAiCost, 'id' | 'created_at'>): Promise<DbAiCost> {
  const { data, error } = await supabase
    .from('ai_costs')
    .insert({
      ...cost,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('⚠️ Ошибка сохранения AI cost:', error);
    throw error;
  }

  console.log(`💰 AI cost сохранён: $${cost.cost_usd.toFixed(4)} (${cost.type}, ${cost.model})`);
  return data;
}

/**
 * Получает общую статистику AI расходов
 */
export async function getAiCostsTotal(): Promise<{
  totalCostUsd: number;
  totalTokens: number;
  byType: Record<string, { cost: number; tokens: number; count: number }>;
  byModel: Record<string, { cost: number; tokens: number; count: number }>;
  byDay: Array<{ date: string; cost: number; tokens: number; count: number }>;
}> {
  const { data, error } = await supabase
    .from('ai_costs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('⚠️ Ошибка получения AI costs:', error);
    return {
      totalCostUsd: 0,
      totalTokens: 0,
      byType: {},
      byModel: {},
      byDay: [],
    };
  }

  let totalCostUsd = 0;
  let totalTokens = 0;
  const byType: Record<string, { cost: number; tokens: number; count: number }> = {};
  const byModel: Record<string, { cost: number; tokens: number; count: number }> = {};
  const byDayMap: Record<string, { cost: number; tokens: number; count: number }> = {};

  for (const item of data || []) {
    totalCostUsd += Number(item.cost_usd) || 0;
    totalTokens += item.total_tokens || 0;

    // По типу
    if (!byType[item.type]) {
      byType[item.type] = { cost: 0, tokens: 0, count: 0 };
    }
    byType[item.type].cost += Number(item.cost_usd) || 0;
    byType[item.type].tokens += item.total_tokens || 0;
    byType[item.type].count++;

    // По модели
    if (!byModel[item.model]) {
      byModel[item.model] = { cost: 0, tokens: 0, count: 0 };
    }
    byModel[item.model].cost += Number(item.cost_usd) || 0;
    byModel[item.model].tokens += item.total_tokens || 0;
    byModel[item.model].count++;

    // По дню
    const date = item.created_at?.split('T')[0] || 'unknown';
    if (!byDayMap[date]) {
      byDayMap[date] = { cost: 0, tokens: 0, count: 0 };
    }
    byDayMap[date].cost += Number(item.cost_usd) || 0;
    byDayMap[date].tokens += item.total_tokens || 0;
    byDayMap[date].count++;
  }

  const byDay = Object.entries(byDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { totalCostUsd, totalTokens, byType, byModel, byDay };
}

/**
 * Получает расходы по конкретному проекту
 */
export async function getProjectAiCosts(projectId: string): Promise<DbAiCost[]> {
  const { data, error } = await supabase
    .from('ai_costs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('⚠️ Ошибка получения AI costs проекта:', error);
    return [];
  }

  return data || [];
}
