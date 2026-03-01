import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Service key для серверных операций
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️ SUPABASE_URL или SUPABASE_SERVICE_KEY не установлены — работаем в локальном режиме');
}
export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
// === CRUD операции ===
export async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data || [];
}
export async function getProject(id) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data;
}
export async function createProject(project) {
    const { data, error } = await supabase
        .from('projects')
        .insert({
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updateProject(id, updates) {
    const { data, error } = await supabase
        .from('projects')
        .update({
        ...updates,
        updated_at: new Date().toISOString(),
    })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function deleteProject(id) {
    // Сначала удаляем картинки проекта
    await supabase.from('images').delete().eq('project_id', id);
    // Удаляем файлы из storage
    const { data: files } = await supabase.storage
        .from('project-images')
        .list(id);
    if (files && files.length > 0) {
        await supabase.storage
            .from('project-images')
            .remove(files.map((f) => `${id}/${f.name}`));
    }
    // Удаляем проект
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error)
        throw error;
}
// === Работа с картинками ===
export async function getProjectImages(projectId) {
    const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
    if (error)
        throw error;
    return data || [];
}
export async function addImage(image) {
    const { data, error } = await supabase
        .from('images')
        .insert({
        ...image,
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function deleteImage(id) {
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (error)
        throw error;
}
export async function updateImageOrder(projectId, imageIds) {
    // Обновляем порядок картинок
    for (let i = 0; i < imageIds.length; i++) {
        await supabase
            .from('images')
            .update({ order_index: i })
            .eq('id', imageIds[i]);
    }
}
// === Загрузка файлов ===
export async function uploadImage(projectId, file, filename, contentType) {
    const path = `${projectId}/${Date.now()}-${filename}`;
    const { error } = await supabase.storage
        .from('project-images')
        .upload(path, file, {
        contentType,
        upsert: false,
    });
    if (error)
        throw error;
    // Получаем публичный URL
    const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(path);
    return data.publicUrl;
}
export async function deleteStorageFile(url) {
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
export async function downloadImage(url) {
    // Извлекаем путь из URL (project-images/projectId/filename)
    const match = url.match(/project-images\/(.+)$/);
    if (!match) {
        throw new Error(`Invalid storage URL: ${url}`);
    }
    const storagePath = match[1];
    const { data, error } = await supabase.storage
        .from('project-images')
        .download(storagePath);
    if (error)
        throw error;
    if (!data)
        throw new Error('No data returned from storage');
    // Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
/**
 * Сохраняет или обновляет статистику токенов за день
 */
export async function saveTokenStats(model, promptTokens, completionTokens, estimatedCost) {
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
        }
        else {
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
    }
    catch (error) {
        console.error('⚠️ Ошибка сохранения статистики токенов:', error);
        // Не бросаем ошибку — статистика не критична
    }
}
/**
 * Получает статистику токенов за период
 */
export async function getTokenStats(days = 30) {
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
export async function getTokenStatsTotal() {
    const stats = await getTokenStats(365); // Год
    const byModel = {};
    const byDayMap = {};
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
/**
 * Создаёт новый лид (заявку)
 */
export async function createLead(lead) {
    const { data, error } = await supabase
        .from('leads')
        .insert({
        ...lead,
        status: 'new',
        created_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
/**
 * Получает все лиды (для CRM)
 */
export async function getLeads(limit = 100) {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error)
        throw error;
    return data || [];
}
/**
 * Обновляет статус лида
 */
export async function updateLead(id, updates) {
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
/**
 * Добавляет один элемент в очередь
 */
export async function addQueueItem(vkUrl, options = {}, batchId, batchOrder) {
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
    if (error)
        throw error;
    return data;
}
/**
 * Добавляет пакет VK URL в очередь
 * @returns batch_id для отслеживания
 */
export async function addQueueBatch(vkUrls, options = {}) {
    const batchId = crypto.randomUUID();
    const items = vkUrls.map((url, index) => ({
        vk_url: url,
        status: 'pending',
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
    if (error)
        throw error;
    return { batchId, itemCount: items.length };
}
/**
 * Получает следующий элемент для обработки (FIFO)
 * Атомарно помечает его как processing
 */
export async function getNextQueueItem() {
    // Находим следующий pending элемент
    const { data: pending, error: findError } = await supabase
        .from('queue_items')
        .select('*')
        .eq('status', 'pending')
        .order('batch_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
    if (findError && findError.code !== 'PGRST116')
        throw findError;
    if (!pending)
        return null;
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
    if (error && error.code !== 'PGRST116')
        throw error;
    return data || null;
}
/**
 * Обновляет элемент очереди
 */
export async function updateQueueItem(id, updates) {
    const updateData = { ...updates };
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
    if (error)
        throw error;
    return data;
}
/**
 * Помечает элемент как выполненный
 */
export async function completeQueueItem(id, projectId) {
    return updateQueueItem(id, {
        status: 'completed',
        project_id: projectId,
    });
}
/**
 * Помечает элемент как failed
 */
export async function failQueueItem(id, errorMessage, retryCount) {
    return updateQueueItem(id, {
        status: 'failed',
        error_message: errorMessage,
        retry_count: retryCount,
    });
}
/**
 * Получает статистику очереди
 */
export async function getQueueStats() {
    const { data, error } = await supabase
        .from('queue_items')
        .select('status');
    if (error)
        throw error;
    const stats = {
        total: data?.length || 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
    };
    for (const item of data || []) {
        if (item.status in stats) {
            stats[item.status]++;
        }
    }
    return stats;
}
/**
 * Получает статистику по конкретному batch
 */
export async function getBatchStats(batchId) {
    const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .eq('batch_id', batchId)
        .order('batch_order', { ascending: true });
    if (error)
        throw error;
    const stats = {
        total: data?.length || 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
    };
    for (const item of data || []) {
        if (item.status in stats) {
            stats[item.status]++;
        }
    }
    return { ...stats, items: data || [] };
}
/**
 * Переводит failed элементы обратно в pending для retry
 */
export async function retryFailedItems(batchId) {
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
    if (error)
        throw error;
    return data?.length || 0;
}
/**
 * Очищает старые completed элементы (старше N дней)
 */
export async function cleanupOldQueueItems(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const { data, error } = await supabase
        .from('queue_items')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', cutoffDate.toISOString())
        .select();
    if (error)
        throw error;
    return data?.length || 0;
}
/**
 * Получает текущий processing элемент (если есть)
 */
export async function getCurrentProcessingItem() {
    const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .eq('status', 'processing')
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data || null;
}
/**
 * Сбрасывает зависшие processing элементы (старше N минут)
 * Используется при старте сервера для восстановления после краша
 */
export async function resetStuckProcessingItems(minutesOld = 30) {
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
    if (error)
        throw error;
    return data?.length || 0;
}
/**
 * Получает failed элементы очереди с сообщениями об ошибках
 */
export async function getFailedQueueItems(limit = 50) {
    const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .eq('status', 'failed')
        .order('completed_at', { ascending: false })
        .limit(limit);
    if (error)
        throw error;
    return data || [];
}
/**
 * Сохраняет расход AI в таблицу ai_costs
 * Автоматически обновляет ai_cost_usd в projects через триггер
 */
export async function saveAiCost(cost) {
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
export async function getAiCostsTotal() {
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
    const byType = {};
    const byModel = {};
    const byDayMap = {};
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
export async function getProjectAiCosts(projectId) {
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
