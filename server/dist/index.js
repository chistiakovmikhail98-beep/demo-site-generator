import 'dotenv/config';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { generateSiteConfig, parseRawText, tokenStats } from './services/ai.js';
import { buildSite } from './services/builder.js';
import { deployToVercel } from './services/deployer.js';
import * as supabaseService from './services/supabase.js';
import { parseVKGroup, parseVKPhotos } from './services/vk.js';
import { notifyNewSite } from './services/telegram.js';
import { queueManager } from './services/queue.js';
import { analyzePhotos, distributePhotos } from './services/photo-analyzer.js';
import { extractColorsFromUrl } from './services/color-extractor.js';
import { getVPSConfig } from './services/vps-deployer.js';
import sharp from 'sharp';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ logger: true });
// Определяем окружение
const IS_VERCEL = !!process.env.VERCEL;
const USE_SUPABASE = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
// Пути (на Vercel используем /tmp)
// ВАЖНО: BUILDS_DIR должен совпадать с builder.ts — используем process.cwd()
const UPLOADS_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
const BUILDS_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'builds') : path.join(process.cwd(), 'builds');
const PROJECTS_FILE = IS_VERCEL ? path.join(os.tmpdir(), 'projects.json') : path.join(__dirname, 'projects.json');
// Инициализация директорий
try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(BUILDS_DIR, { recursive: true });
}
catch (e) {
    console.warn('Could not create directories:', e);
}
// Диагностика путей при старте
console.log('📍 CWD:', process.cwd());
console.log('📍 __dirname:', __dirname);
const templatePath = path.join(process.cwd(), 'template');
try {
    const templateFiles = await fs.readdir(templatePath);
    console.log('✅ Template folder exists:', templatePath);
    console.log('📁 Template files:', templateFiles.slice(0, 5).join(', '), '...');
}
catch (e) {
    console.error('❌ Template folder NOT FOUND:', templatePath);
    console.log('📂 Listing CWD contents...');
    try {
        const cwdContents = await fs.readdir(process.cwd());
        console.log('📂 CWD contents:', cwdContents.join(', '));
    }
    catch (e2) {
        console.error('Failed to list CWD:', e2);
    }
}
// Загрузка/сохранение проектов
async function loadProjects() {
    try {
        const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
async function saveProjects(projects) {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}
async function updateProject(id, updates) {
    if (USE_SUPABASE) {
        // Маппинг полей Project -> DbProject
        const dbUpdates = {};
        if (updates.status !== undefined)
            dbUpdates.status = updates.status;
        if (updates.deployedUrl !== undefined)
            dbUpdates.deployed_url = updates.deployedUrl;
        if (updates.error !== undefined)
            dbUpdates.error = updates.error;
        if (updates.siteConfig !== undefined)
            dbUpdates.site_config = updates.siteConfig;
        await supabaseService.updateProject(id, dbUpdates);
        return;
    }
    const projects = await loadProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
        projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
        await saveProjects(projects);
    }
}
// Middleware
await fastify.register(cors, { origin: true });
await fastify.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
// Статика для загруженных файлов
await fastify.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    decorateReply: false,
});
// Статика для превью собранных сайтов
await fastify.register(fastifyStatic, {
    root: BUILDS_DIR,
    prefix: '/preview/',
    decorateReply: false,
});
// === API Routes ===
// Получить список проектов
fastify.get('/api/projects', async () => {
    if (USE_SUPABASE) {
        try {
            return await supabaseService.getProjects();
        }
        catch (error) {
            console.error('Supabase getProjects error:', error);
            return [];
        }
    }
    return await loadProjects();
});
// Получить проект по ID
fastify.get('/api/projects/:id', async (request, reply) => {
    if (USE_SUPABASE) {
        try {
            const project = await supabaseService.getProject(request.params.id);
            if (!project) {
                return reply.status(404).send({ error: 'Проект не найден' });
            }
            return project;
        }
        catch (error) {
            console.error('Supabase getProject error:', error);
            return reply.status(500).send({ error: 'Ошибка базы данных' });
        }
    }
    const projects = await loadProjects();
    const project = projects.find(p => p.id === request.params.id);
    if (!project) {
        return reply.status(404).send({ error: 'Проект не найден' });
    }
    return project;
});
// Статус генерации
fastify.get('/api/status/:id', async (request, reply) => {
    if (USE_SUPABASE) {
        try {
            const project = await supabaseService.getProject(request.params.id);
            if (!project) {
                return reply.status(404).send({ error: 'Проект не найден' });
            }
            return {
                id: project.id,
                status: project.status,
                deployedUrl: project.deployed_url,
                error: project.error,
            };
        }
        catch (error) {
            console.error('Supabase getProject error:', error);
            return reply.status(500).send({ error: 'Ошибка базы данных' });
        }
    }
    const projects = await loadProjects();
    const project = projects.find(p => p.id === request.params.id);
    if (!project) {
        return reply.status(404).send({ error: 'Проект не найден' });
    }
    return {
        id: project.id,
        status: project.status,
        deployedUrl: project.deployedUrl,
        error: project.error,
    };
});
// Создать и запустить генерацию
fastify.post('/api/generate', async (request, reply) => {
    const parts = request.parts();
    let name = '';
    let niche = 'stretching';
    let description = '';
    let colorScheme;
    const uploadedFiles = [];
    let fileIndex = 0;
    // Обработка multipart формы
    for await (const part of parts) {
        if (part.type === 'field') {
            if (part.fieldname === 'name')
                name = part.value;
            if (part.fieldname === 'niche')
                niche = part.value;
            if (part.fieldname === 'description')
                description = part.value;
            if (part.fieldname === 'colorScheme') {
                try {
                    colorScheme = JSON.parse(part.value);
                }
                catch { /* игнорируем невалидный JSON */ }
            }
        }
        else if (part.type === 'file') {
            // Сохраняем файл
            const uniqueId = nanoid(10);
            const ext = path.extname(part.filename);
            const filename = `${uniqueId}-${Date.now()}${ext}`;
            const filepath = path.join(UPLOADS_DIR, filename);
            const buffer = await part.toBuffer();
            await fs.writeFile(filepath, buffer);
            uploadedFiles.push({
                path: filepath,
                filename,
                block: 'gallery',
                order: fileIndex++,
            });
        }
    }
    if (!name) {
        return reply.status(400).send({ error: 'Название студии обязательно' });
    }
    // Создаём проект
    const projectId = nanoid(10);
    const project = {
        id: projectId,
        name,
        niche,
        status: 'pending',
        uploadedFiles,
        description,
        colorScheme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const projects = await loadProjects();
    projects.push(project);
    await saveProjects(projects);
    // Запускаем генерацию асинхронно
    processProject(projectId).catch(console.error);
    return { id: projectId, status: 'pending' };
});
// === Очередь для параллельной обработки ===
const CONCURRENCY = 10; // Сколько сайтов генерировать параллельно
const queue = [];
let activeWorkers = 0;
async function addToQueue(projectId) {
    queue.push(projectId);
    processQueue();
}
async function processQueue() {
    while (queue.length > 0 && activeWorkers < CONCURRENCY) {
        const projectId = queue.shift();
        if (!projectId)
            continue;
        activeWorkers++;
        processProject(projectId)
            .catch(console.error)
            .finally(() => {
            activeWorkers--;
            processQueue(); // Берём следующий из очереди
        });
    }
}
// Статус очереди
fastify.get('/api/queue', async () => {
    let projects = [];
    if (USE_SUPABASE) {
        try {
            projects = await supabaseService.getProjects();
        }
        catch (error) {
            console.error('Supabase getProjects error:', error);
        }
    }
    else {
        projects = await loadProjects();
    }
    const pending = projects.filter(p => p.status === 'pending').length;
    const processing = projects.filter(p => p.status === 'processing' || p.status === 'building' || p.status === 'deploying').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const failed = projects.filter(p => p.status === 'failed').length;
    return {
        queue: queue.length,
        activeWorkers,
        pending,
        processing,
        completed,
        failed,
        total: projects.length,
    };
});
// === ПАКЕТНАЯ ОБРАБОТКА VK ГРУПП ===
// Добавить batch VK URL-ов в очередь
fastify.post('/api/batch-vk', async (request, reply) => {
    try {
        const { vkUrls, options = {} } = request.body;
        if (!vkUrls || !Array.isArray(vkUrls) || vkUrls.length === 0) {
            return reply.status(400).send({ error: 'vkUrls должен быть непустым массивом' });
        }
        // Фильтруем только валидные VK URL
        const validUrls = vkUrls.filter(url => url && (url.includes('vk.com') || url.includes('vk.ru')));
        if (validUrls.length === 0) {
            return reply.status(400).send({ error: 'Не найдено валидных VK URL' });
        }
        // Добавляем в очередь
        const result = await queueManager.addBatch(validUrls, {
            niche: options.niche,
            analyzePhotos: options.analyzePhotos ?? true,
            extractColors: options.extractColors ?? true,
        });
        console.log(`📦 Batch добавлен: ${result.itemCount} VK групп`);
        return {
            success: true,
            batchId: result.batchId,
            totalItems: result.itemCount,
            skipped: vkUrls.length - validUrls.length,
            statusUrl: `/api/batch-vk/${result.batchId}/status`,
        };
    }
    catch (error) {
        console.error('Ошибка batch-vk:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка создания batch',
        });
    }
});
// Статус конкретного batch
fastify.get('/api/batch-vk/:batchId/status', async (request, reply) => {
    try {
        const stats = await queueManager.getBatchStatus(request.params.batchId);
        return {
            batchId: request.params.batchId,
            ...stats,
            progress: stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0,
        };
    }
    catch (error) {
        console.error('Ошибка получения статуса batch:', error);
        return reply.status(500).send({ error: 'Ошибка получения статуса' });
    }
});
// Общий статус очереди VK
fastify.get('/api/batch-vk/status', async () => {
    const status = await queueManager.getStatus();
    return {
        isRunning: status.isRunning,
        isPaused: status.isPaused,
        currentItem: status.currentItem ? {
            id: status.currentItem.id,
            vkUrl: status.currentItem.vk_url,
            startedAt: status.currentItem.started_at,
        } : null,
        stats: status.stats,
    };
});
// Управление очередью
fastify.post('/api/batch-vk/pause', async () => {
    queueManager.pause();
    return { success: true, message: 'Очередь поставлена на паузу' };
});
fastify.post('/api/batch-vk/resume', async () => {
    queueManager.resume();
    return { success: true, message: 'Очередь возобновлена' };
});
fastify.post('/api/batch-vk/retry-failed', async (request) => {
    const count = await queueManager.retryFailed(request.body?.batchId);
    return { success: true, retriedCount: count };
});
// Статистика токенов (текущая сессия)
fastify.get('/api/tokens', async () => {
    try {
        return {
            total: tokenStats?.total || { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
            requests: tokenStats?.requests || 0,
            costFormatted: `$${(tokenStats?.total?.estimatedCost || 0).toFixed(4)}`,
        };
    }
    catch (error) {
        return {
            total: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
            requests: 0,
            costFormatted: '$0.0000',
        };
    }
});
// Статистика токенов из БД (постоянная, по дням)
fastify.get('/api/tokens/stats', async (request) => {
    try {
        const days = parseInt(request.query.days || '30', 10);
        const stats = await supabaseService.getTokenStatsTotal();
        // Форматируем для удобного отображения
        return {
            success: true,
            summary: {
                totalTokens: stats.totalTokens,
                totalCost: stats.totalCost,
                totalCostFormatted: `$${stats.totalCost.toFixed(4)}`,
                totalRequests: stats.totalRequests,
            },
            byModel: Object.entries(stats.byModel).map(([model, data]) => ({
                model,
                tokens: data.tokens,
                cost: data.cost,
                costFormatted: `$${data.cost.toFixed(4)}`,
                requests: data.requests,
            })),
            byDay: stats.byDay.slice(0, days).map(day => ({
                date: day.date,
                tokens: day.tokens,
                cost: day.cost,
                costFormatted: `$${day.cost.toFixed(4)}`,
                requests: day.requests,
            })),
        };
    }
    catch (error) {
        console.error('Ошибка получения статистики токенов:', error);
        return {
            success: false,
            error: 'Не удалось получить статистику',
            summary: { totalTokens: 0, totalCost: 0, totalCostFormatted: '$0.0000', totalRequests: 0 },
            byModel: [],
            byDay: [],
        };
    }
});
// Парсинг группы ВКонтакте
fastify.post('/api/parse-vk', async (request, reply) => {
    try {
        const { url } = request.body;
        if (!url || (!url.includes('vk.com') && !url.includes('vk.ru'))) {
            return reply.status(400).send({ error: 'Укажите ссылку на группу ВК' });
        }
        const data = await parseVKGroup(url);
        return {
            success: true,
            name: data.name,
            description: data.description,
            contacts: data.contacts,
            admins: data.admins, // Контакты админов
            postsCount: data.posts.length,
            rawText: data.rawText,
            avatarUrl: data.avatarUrl, // URL аватарки группы для логотипа
        };
    }
    catch (error) {
        console.error('Ошибка парсинга ВК:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка парсинга группы ВК',
        });
    }
});
// Парсинг фотографий из группы ВК
fastify.post('/api/parse-vk-photos', async (request, reply) => {
    try {
        const { url, limit = 50 } = request.body;
        if (!url || (!url.includes('vk.com') && !url.includes('vk.ru'))) {
            return reply.status(400).send({ error: 'Укажите ссылку на группу ВК' });
        }
        const photos = await parseVKPhotos(url, Math.min(limit, 100)); // Максимум 100 фото
        return {
            success: true,
            count: photos.length,
            photos,
        };
    }
    catch (error) {
        console.error('Ошибка парсинга фото ВК:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка парсинга фото группы ВК',
        });
    }
});
// Извлечение цветов из изображения (для логотипов VK)
fastify.post('/api/extract-colors', async (request, reply) => {
    try {
        const { imageUrl } = request.body;
        if (!imageUrl) {
            return reply.status(400).send({ error: 'imageUrl is required' });
        }
        console.log(`🎨 Извлечение цветов из: ${imageUrl}`);
        // Скачиваем изображение
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Используем sharp для получения raw pixel data
        const { data, info } = await sharp(buffer)
            .resize(100, 100, { fit: 'cover' }) // Уменьшаем для скорости
            .raw()
            .toBuffer({ resolveWithObject: true });
        // RGB → HSL конвертация
        const rgbToHsl = (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                        break;
                    case g:
                        h = ((b - r) / d + 2) / 6;
                        break;
                    case b:
                        h = ((r - g) / d + 4) / 6;
                        break;
                }
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        };
        // HSL → RGB конвертация
        const hslToRgb = (h, s, l) => {
            h /= 360;
            s /= 100;
            l /= 100;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            }
            else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0)
                        t += 1;
                    if (t > 1)
                        t -= 1;
                    if (t < 1 / 6)
                        return p + (q - p) * 6 * t;
                    if (t < 1 / 2)
                        return q;
                    if (t < 2 / 3)
                        return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        };
        // RGB → HEX
        const rgbToHex = (r, g, b) => {
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };
        // Собираем цвета с их насыщенностью
        const colorBuckets = {};
        const channels = info.channels;
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const hsl = rgbToHsl(r, g, b);
            // Пропускаем чёрные и белые
            if (hsl.l < 5 || hsl.l > 95)
                continue;
            // Квантизируем в HSL пространстве
            const hBucket = Math.round(hsl.h / 15) * 15;
            const sBucket = Math.round(hsl.s / 20) * 20;
            const lBucket = Math.round(hsl.l / 20) * 20;
            const key = `${hBucket}-${sBucket}-${lBucket}`;
            // Очки за насыщенность
            const satScore = hsl.s * (hsl.l > 20 && hsl.l < 80 ? 1.5 : 1);
            if (!colorBuckets[key]) {
                colorBuckets[key] = { h: hBucket, s: sBucket, l: lBucket, count: 0, satScore: 0 };
            }
            colorBuckets[key].count++;
            colorBuckets[key].satScore += satScore;
        }
        // Сортируем по (частота * насыщенность)
        const sortedColors = Object.values(colorBuckets)
            .filter(c => c.s >= 15) // Минимальная насыщенность 15%
            .sort((a, b) => (b.count * b.satScore) - (a.count * a.satScore));
        console.log(`🎨 Найдено ${sortedColors.length} цветовых кластеров`);
        if (sortedColors.length === 0) {
            // Фоллбэк — берём любой цвет
            const fallbackColors = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
            if (fallbackColors.length > 0) {
                const c = fallbackColors[0];
                const rgb = hslToRgb(c.h, Math.max(c.s, 50), Math.min(Math.max(c.l, 40), 60));
                const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                console.log(`🎨 Фоллбэк цвет: ${hex}`);
                return { primary: hex, accent: hex };
            }
            return { primary: '#7c3aed', accent: '#a78bfa' }; // Дефолт
        }
        // Primary: самый частый насыщенный цвет
        const primaryColor = sortedColors[0];
        // Бустим насыщенность до минимум 60% для primary
        const boostedSat = Math.max(primaryColor.s, 60);
        const boostedL = Math.min(Math.max(primaryColor.l, 35), 55);
        const primaryRgb = hslToRgb(primaryColor.h, boostedSat, boostedL);
        const primaryHex = rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        // Accent: более светлая версия или контрастный цвет
        let accentHex;
        const contrastColor = sortedColors.find(c => Math.abs(c.h - primaryColor.h) > 30);
        if (contrastColor) {
            const accentRgb = hslToRgb(contrastColor.h, Math.max(contrastColor.s, 50), Math.min(Math.max(contrastColor.l, 50), 70));
            accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
        }
        else {
            // Делаем светлее primary
            const accentRgb = hslToRgb(primaryColor.h, Math.max(primaryColor.s - 10, 40), Math.min(primaryColor.l + 20, 75));
            accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
        }
        console.log(`🎨 Результат: primary=${primaryHex}, accent=${accentHex}`);
        return { primary: primaryHex, accent: accentHex };
    }
    catch (error) {
        console.error('Ошибка извлечения цветов:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Failed to extract colors',
        });
    }
});
// Батч-генерация из JSON-брифа (параллельная)
fastify.post('/api/batch', async (request, reply) => {
    const parts = request.parts();
    let briefData = [];
    const sharedImages = [];
    let sharedIdx = 0;
    for await (const part of parts) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            const ext = path.extname(part.filename).toLowerCase();
            // JSON бриф с данными студий
            if (ext === '.json') {
                try {
                    const content = buffer.toString('utf-8');
                    const parsed = JSON.parse(content);
                    briefData = Array.isArray(parsed) ? parsed : [parsed];
                }
                catch (e) {
                    return reply.status(400).send({ error: 'Невалидный JSON файл' });
                }
            }
            // Картинки — общие для всех студий
            else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(ext)) {
                const filename = `shared-${Date.now()}-${nanoid(5)}${ext}`;
                const filepath = path.join(UPLOADS_DIR, filename);
                await fs.writeFile(filepath, buffer);
                sharedImages.push({
                    path: filepath,
                    filename,
                    block: 'gallery',
                    order: sharedIdx++,
                });
            }
        }
    }
    if (briefData.length === 0) {
        return reply.status(400).send({ error: 'Загрузите JSON-файл с данными студий' });
    }
    // Создаём проекты для каждой студии
    const createdProjects = [];
    if (USE_SUPABASE) {
        for (const studio of briefData) {
            if (!studio.name)
                continue;
            const projectId = nanoid(10);
            await supabaseService.createProject({
                id: projectId,
                name: studio.name,
                niche: studio.niche || 'stretching',
                status: 'pending',
                description: studio.description || '',
            });
            createdProjects.push({ id: projectId, name: studio.name });
        }
    }
    else {
        const allProjects = await loadProjects();
        for (const studio of briefData) {
            if (!studio.name)
                continue;
            const projectId = nanoid(10);
            const project = {
                id: projectId,
                name: studio.name,
                niche: studio.niche || 'stretching',
                status: 'pending',
                uploadedFiles: [...sharedImages],
                description: studio.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            allProjects.push(project);
            createdProjects.push({ id: projectId, name: studio.name });
        }
        // Сохраняем все проекты разом
        await saveProjects(allProjects);
    }
    // Добавляем в очередь
    for (const p of createdProjects) {
        addToQueue(p.id);
    }
    console.log(`📦 Добавлено ${createdProjects.length} проектов в очередь`);
    return {
        message: `Создано ${createdProjects.length} проектов. Обработка идёт параллельно (${CONCURRENCY} одновременно).`,
        projects: createdProjects,
        queueStatus: `/api/queue`,
    };
});
// Превью — AI генерирует ПОЛНУЮ структуру сайта для просмотра перед созданием
fastify.post('/api/preview', async (request, reply) => {
    const body = request.body;
    const text = body.text || '';
    const aiModel = body.aiModel || 'gpt4o-mini';
    const overrideNiche = body.niche;
    if (!text || text.trim().length < 10) {
        return reply.status(400).send({ error: 'Вставьте текст о студии (минимум 10 символов)' });
    }
    try {
        console.log('👁️ Превью: AI генерирует полную структуру...');
        // Сначала парсим базовую инфу
        const parsed = await parseRawText(text, aiModel);
        const niche = overrideNiche || parsed.niche;
        // Генерируем ПОЛНЫЙ конфиг сайта (как при создании)
        const siteConfig = await generateSiteConfig({
            name: parsed.name,
            niche: niche,
            description: parsed.description,
            imageFiles: [],
            aiModel: aiModel,
        });
        // Возвращаем ПОЛНУЮ структуру для превью — всё что пойдёт на сайт
        return {
            success: true,
            preview: {
                name: siteConfig.brand.name,
                niche: siteConfig.brand.niche,
                nicheLabel: getNicheLabel(siteConfig.brand.niche),
                city: siteConfig.brand.city,
                tagline: siteConfig.brand.tagline,
                description: parsed.description,
                heroTitle: siteConfig.brand.heroTitle,
                heroDescription: siteConfig.brand.heroDescription,
                // Все секции полностью
                directions: siteConfig.sections.directions,
                pricing: siteConfig.sections.pricing,
                faq: siteConfig.sections.faq,
                calculatorStages: siteConfig.sections.calculatorStages,
                reviews: siteConfig.sections.reviews,
                instructors: siteConfig.sections.instructors,
                contacts: siteConfig.sections.contacts,
            },
            // Полный конфиг для последующего создания (без повторного AI вызова)
            fullConfig: siteConfig,
            message: `AI сгенерировал структуру для "${siteConfig.brand.name}"`,
        };
    }
    catch (error) {
        console.error('Ошибка превью:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка генерации превью'
        });
    }
});
// Хелпер для русских названий ниш
function getNicheLabel(niche) {
    const labels = {
        dance: 'Танцы',
        fitness: 'Фитнес',
        stretching: 'Растяжка',
        yoga: 'Йога',
        wellness: 'Wellness/SPA',
    };
    return labels[niche] || niche;
}
// Быстрая генерация из сырого текста — AI сам парсит
fastify.post('/api/quick', async (request, reply) => {
    let text = '';
    let aiModel = 'gpt4o-mini';
    let fontFamily = 'manrope';
    let colorScheme;
    let overrideNiche = null; // Ниша переданная вручную
    let fullConfigJson = null; // Полный конфиг из превью (чтобы не вызывать AI повторно)
    const uploadedFiles = [];
    // Буферы файлов для загрузки в Supabase Storage (после создания projectId)
    const pendingFiles = [];
    // Временное хранение metadata для файлов
    const fileMetadata = new Map();
    let fileIndex = 0;
    let photoMetaJson = null; // Новый формат: JSON массив с type и label
    let photoUrlsJson = null; // URL фото из ВК
    // VK данные для CRM
    let vkGroupUrl;
    let vkAdmins;
    const contentType = request.headers['content-type'] || '';
    // Обработка multipart формы (с файлами)
    if (contentType.includes('multipart/form-data')) {
        const parts = request.parts();
        for await (const part of parts) {
            if (part.type === 'field') {
                if (part.fieldname === 'text')
                    text = part.value;
                if (part.fieldname === 'aiModel')
                    aiModel = part.value;
                if (part.fieldname === 'fontFamily')
                    fontFamily = part.value;
                if (part.fieldname === 'niche')
                    overrideNiche = part.value;
                if (part.fieldname === 'colorScheme') {
                    try {
                        colorScheme = JSON.parse(part.value);
                    }
                    catch { /* игнорируем невалидный JSON */ }
                }
                // Новый формат: photoMeta как JSON массив [{type, label}, ...]
                if (part.fieldname === 'photoMeta') {
                    photoMetaJson = part.value;
                }
                // URL фото из ВК
                if (part.fieldname === 'photoUrls') {
                    photoUrlsJson = part.value;
                }
                // VK данные для CRM
                if (part.fieldname === 'vkGroupUrl') {
                    vkGroupUrl = part.value;
                }
                if (part.fieldname === 'vkAdmins') {
                    try {
                        vkAdmins = JSON.parse(part.value);
                    }
                    catch { /* игнорируем невалидный JSON */ }
                }
                // fullConfig из превью — чтобы не вызывать AI повторно
                if (part.fieldname === 'fullConfig') {
                    fullConfigJson = part.value;
                }
                // Старый формат: files[0].block, files[0].label, files[1].block, etc.
                const blockMatch = part.fieldname.match(/^files\[(\d+)\]\.block$/);
                if (blockMatch) {
                    const idx = parseInt(blockMatch[1], 10);
                    const meta = fileMetadata.get(idx) || {};
                    meta.block = part.value;
                    fileMetadata.set(idx, meta);
                }
                const labelMatch = part.fieldname.match(/^files\[(\d+)\]\.label$/);
                if (labelMatch) {
                    const idx = parseInt(labelMatch[1], 10);
                    const meta = fileMetadata.get(idx) || {};
                    meta.label = part.value;
                    fileMetadata.set(idx, meta);
                }
            }
            else if (part.type === 'file') {
                const uniqueId = nanoid(10);
                const ext = path.extname(part.filename);
                const filename = `${uniqueId}-${Date.now()}${ext}`;
                const buffer = await part.toBuffer();
                // Сохраняем буфер для последующей загрузки в Supabase Storage
                pendingFiles.push({
                    buffer,
                    filename,
                    contentType: part.mimetype || 'image/jpeg',
                    order: fileIndex,
                });
                fileIndex++;
            }
        }
        // photoMeta теперь применяется позже, при загрузке файлов в Storage
    }
    else {
        // Обычный JSON
        const body = request.body;
        text = body.text || '';
        aiModel = body.aiModel || 'gpt4o-mini';
        fontFamily = body.fontFamily || 'manrope';
        colorScheme = body.colorScheme;
    }
    if (!text || text.trim().length < 10) {
        return reply.status(400).send({ error: 'Вставьте текст о студии (минимум 10 символов)' });
    }
    try {
        // Проверяем, есть ли fullConfig из превью (чтобы не вызывать AI повторно)
        let parsed;
        let cachedSiteConfig = null;
        if (fullConfigJson) {
            // Используем конфиг из превью — БЕЗ вызова AI!
            try {
                cachedSiteConfig = JSON.parse(fullConfigJson);
                parsed = {
                    name: cachedSiteConfig.brand?.name || 'Студия',
                    niche: cachedSiteConfig.brand?.niche || 'fitness',
                    description: cachedSiteConfig.brand?.tagline,
                };
                console.log('✅ Используем конфиг из превью (без AI):', parsed.name, '| Ниша:', parsed.niche);
            }
            catch {
                // Если JSON невалидный — fallback на AI
                console.log('⚠️ Невалидный fullConfig, вызываем AI...');
                parsed = await parseRawText(text, aiModel);
            }
        }
        else {
            // AI парсит сырой текст
            console.log('🔍 Парсинг текста через AI...');
            console.log(`🤖 Модель: ${aiModel} | Шрифт: ${fontFamily} | Файлов: ${uploadedFiles.length}`);
            parsed = await parseRawText(text, aiModel);
            console.log('✅ Распознано:', parsed.name, '| Ниша:', parsed.niche);
        }
        // Создаём проект
        const projectId = nanoid(10);
        // Применяем photoMeta к pendingFiles
        let photoMeta = [];
        if (photoMetaJson) {
            try {
                photoMeta = JSON.parse(photoMetaJson);
            }
            catch { /* игнорируем невалидный JSON */ }
        }
        // Загружаем файлы в Supabase Storage (или локально) после получения projectId
        console.log(`📷 Загрузка ${pendingFiles.length} файлов для проекта ${projectId}...`);
        for (const pending of pendingFiles) {
            let filePath;
            if (USE_SUPABASE) {
                // Загружаем в Supabase Storage и получаем публичный URL
                filePath = await supabaseService.uploadImage(projectId, pending.buffer, pending.filename, pending.contentType);
                console.log(`📷 Загружено в Supabase Storage: ${pending.filename} → ${filePath}`);
            }
            else {
                // Локальное сохранение (fallback)
                filePath = path.join(UPLOADS_DIR, pending.filename);
                await fs.writeFile(filePath, pending.buffer);
                console.log(`📷 Сохранено локально: ${pending.filename}`);
            }
            // Получаем метаданные для этого файла
            const meta = fileMetadata.get(pending.order) || {};
            const photoMetaItem = photoMeta[pending.order] || {};
            uploadedFiles.push({
                path: filePath,
                filename: pending.filename,
                block: photoMetaItem.type || meta.block || 'gallery',
                label: photoMetaItem.label || meta.label,
                order: pending.order,
            });
        }
        if (uploadedFiles.length > 0) {
            console.log(`📷 Загружено ${uploadedFiles.length} файлов:`, uploadedFiles.map(f => `${f.block}:${f.label || 'без подписи'}`).join(', '));
        }
        // Обработка URL фото из ВК
        if (photoUrlsJson) {
            try {
                const urlPhotos = JSON.parse(photoUrlsJson);
                console.log(`📷 Загрузка ${urlPhotos.length} фото из ВК...`);
                for (let i = 0; i < urlPhotos.length; i++) {
                    const urlPhoto = urlPhotos[i];
                    try {
                        // Скачиваем фото по URL
                        const response = await fetch(urlPhoto.url);
                        if (!response.ok) {
                            console.log(`⚠️ Не удалось скачать фото: ${urlPhoto.url}`);
                            continue;
                        }
                        const buffer = Buffer.from(await response.arrayBuffer());
                        const ext = urlPhoto.url.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[0] || '.jpg';
                        const filename = `vk-${nanoid(10)}-${Date.now()}${ext}`;
                        let filePath;
                        if (USE_SUPABASE) {
                            filePath = await supabaseService.uploadImage(projectId, buffer, filename, `image/${ext.replace('.', '')}`);
                            console.log(`📷 VK фото загружено в Supabase: ${filename}`);
                        }
                        else {
                            filePath = path.join(UPLOADS_DIR, filename);
                            await fs.writeFile(filePath, buffer);
                            console.log(`📷 VK фото сохранено локально: ${filename}`);
                        }
                        uploadedFiles.push({
                            path: filePath,
                            filename,
                            block: urlPhoto.type || 'gallery',
                            label: urlPhoto.label,
                            order: pendingFiles.length + i,
                        });
                    }
                    catch (err) {
                        console.error(`⚠️ Ошибка загрузки VK фото:`, err);
                    }
                }
                console.log(`📷 Всего фото после VK: ${uploadedFiles.length}`);
            }
            catch (err) {
                console.error('⚠️ Ошибка парсинга photoUrls:', err);
            }
        }
        const project = {
            id: projectId,
            name: parsed.name,
            niche: overrideNiche || parsed.niche, // Используем переданную нишу если есть
            status: 'pending',
            uploadedFiles,
            description: parsed.description,
            colorScheme,
            aiModel,
            fontFamily,
            siteConfig: cachedSiteConfig || undefined, // Конфиг из превью (чтобы не вызывать AI повторно)
            // VK данные для CRM
            vkGroupUrl,
            vkAdmins,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const finalNiche = overrideNiche || parsed.niche;
        console.log(`📌 Финальная ниша: ${finalNiche} (override: ${overrideNiche}, parsed: ${parsed.niche})`);
        // Сохраняем в Supabase или файл
        if (USE_SUPABASE) {
            await supabaseService.createProject({
                id: projectId,
                name: parsed.name,
                niche: finalNiche,
                status: 'pending',
                description: parsed.description,
                color_scheme: colorScheme,
                ai_model: aiModel,
                font_family: fontFamily,
                uploaded_files: uploadedFiles.map(f => ({ ...f, order: f.order ?? 0 })),
                site_config: cachedSiteConfig, // Конфиг из превью
                // VK данные для CRM
                vk_group_url: vkGroupUrl,
                vk_admins: vkAdmins,
            });
            console.log(`📋 VK данные: группа=${vkGroupUrl || 'нет'}, админов=${vkAdmins?.length || 0}`);
        }
        else {
            const projects = await loadProjects();
            projects.push(project);
            await saveProjects(projects);
        }
        // Запускаем генерацию
        processProject(projectId).catch(console.error);
        return {
            id: projectId,
            name: parsed.name,
            niche: parsed.niche,
            status: 'pending',
        };
    }
    catch (error) {
        console.error('Ошибка парсинга:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка парсинга текста',
        });
    }
});
// === ДОПОЛНИТЕЛЬНЫЕ ENDPOINTS ===
// Удаление проекта
fastify.delete('/api/projects/:id', async (request, reply) => {
    if (USE_SUPABASE) {
        try {
            await supabaseService.deleteProject(request.params.id);
            console.log(`🗑️ Проект ${request.params.id} удалён (Supabase)`);
            return { success: true, message: 'Проект удалён' };
        }
        catch (error) {
            console.error('Supabase deleteProject error:', error);
            return reply.status(500).send({ error: 'Ошибка удаления проекта' });
        }
    }
    const projects = await loadProjects();
    const index = projects.findIndex(p => p.id === request.params.id);
    if (index === -1) {
        return reply.status(404).send({ error: 'Проект не найден' });
    }
    const project = projects[index];
    // Удаляем загруженные файлы
    for (const file of project.uploadedFiles) {
        try {
            await fs.unlink(file.path);
        }
        catch { /* файл может уже не существовать */ }
    }
    // Удаляем папку сборки
    const buildDir = path.join(BUILDS_DIR, project.id);
    try {
        await fs.rm(buildDir, { recursive: true, force: true });
    }
    catch { /* папка может не существовать */ }
    // Удаляем из списка
    projects.splice(index, 1);
    await saveProjects(projects);
    console.log(`🗑️ Проект ${project.id} (${project.name}) удалён`);
    return { success: true, message: 'Проект удалён' };
});
// Редактирование проекта
fastify.put('/api/projects/:id', async (request, reply) => {
    if (USE_SUPABASE) {
        try {
            const allowedFields = ['name', 'niche', 'description'];
            const updates = {};
            for (const field of allowedFields) {
                if (request.body[field] !== undefined) {
                    updates[field] = request.body[field];
                }
            }
            const updated = await supabaseService.updateProject(request.params.id, updates);
            console.log(`✏️ Проект ${request.params.id} обновлён (Supabase)`);
            return updated;
        }
        catch (error) {
            console.error('Supabase updateProject error:', error);
            return reply.status(500).send({ error: 'Ошибка обновления проекта' });
        }
    }
    const projects = await loadProjects();
    const index = projects.findIndex(p => p.id === request.params.id);
    if (index === -1) {
        return reply.status(404).send({ error: 'Проект не найден' });
    }
    const allowedFields = ['name', 'niche', 'description'];
    const updates = {};
    for (const field of allowedFields) {
        if (request.body[field] !== undefined) {
            updates[field] = request.body[field];
        }
    }
    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    await saveProjects(projects);
    console.log(`✏️ Проект ${request.params.id} обновлён`);
    return projects[index];
});
// Повторная генерация проекта
fastify.post('/api/projects/:id/regenerate', async (request, reply) => {
    try {
        const fullRegenerate = request.query.full === 'true';
        let project = null;
        if (USE_SUPABASE) {
            const dbProject = await supabaseService.getProject(request.params.id);
            if (dbProject) {
                project = {
                    id: dbProject.id,
                    name: dbProject.name,
                    niche: dbProject.niche,
                    description: dbProject.description,
                };
            }
        }
        else {
            const projects = await loadProjects();
            const found = projects.find(p => p.id === request.params.id);
            if (found) {
                project = {
                    id: found.id,
                    name: found.name,
                    niche: found.niche,
                    description: found.description,
                };
            }
        }
        if (!project) {
            return reply.status(404).send({ error: 'Проект не найден' });
        }
        // Проверяем минимальные данные для генерации
        if (!project.name || !project.niche) {
            return reply.status(400).send({
                error: 'Недостаточно данных для перегенерации. Нужны name и niche.',
            });
        }
        // Сбрасываем статус и запускаем заново
        // fullRegenerate=true — полная перегенерация через AI
        // fullRegenerate=false — только пересборка и передеплой (если есть siteConfig)
        const updates = {
            status: 'pending',
            deployedUrl: undefined,
            error: undefined,
        };
        if (fullRegenerate) {
            updates.siteConfig = undefined;
            console.log(`🔄 Полная перегенерация ${project.id} (${project.name})`);
        }
        else {
            console.log(`🔄 Передеплой ${project.id} (${project.name})`);
        }
        await updateProject(project.id, updates);
        // Запускаем генерацию
        addToQueue(project.id);
        return {
            id: project.id,
            status: 'pending',
            message: fullRegenerate
                ? 'Проект добавлен в очередь на полную перегенерацию'
                : 'Проект добавлен в очередь на передеплой',
        };
    }
    catch (error) {
        console.error(`❌ Ошибка перегенерации ${request.params.id}:`, error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка перегенерации',
        });
    }
});
// Скачать исходный код проекта (ZIP)
fastify.get('/api/projects/:id/download', async (request, reply) => {
    let project = null;
    if (USE_SUPABASE) {
        const dbProject = await supabaseService.getProject(request.params.id);
        if (dbProject) {
            project = { id: dbProject.id, name: dbProject.name };
        }
    }
    else {
        const projects = await loadProjects();
        const found = projects.find(p => p.id === request.params.id);
        if (found) {
            project = { id: found.id, name: found.name };
        }
    }
    if (!project) {
        return reply.status(404).send({ error: 'Проект не найден' });
    }
    const buildDir = path.join(BUILDS_DIR, project.id);
    try {
        await fs.access(buildDir);
    }
    catch {
        return reply.status(404).send({ error: 'Сборка проекта не найдена' });
    }
    // Возвращаем путь к папке сборки (для простоты)
    // В реальном проекте здесь можно создать ZIP и отправить
    return {
        project: project.name,
        buildPath: buildDir,
        message: 'Для скачивания ZIP используйте архиватор на сервере или настройте archiver',
    };
});
// === КАРТИНКИ ПРОЕКТА ===
// Хранилище картинок (в памяти, для локальной разработки)
const projectImages = new Map();
// Получить картинки проекта
fastify.get('/api/projects/:id/images', async (request) => {
    if (USE_SUPABASE) {
        try {
            return await supabaseService.getProjectImages(request.params.id);
        }
        catch (error) {
            console.error('Supabase getProjectImages error:', error);
            return [];
        }
    }
    const images = projectImages.get(request.params.id) || [];
    return images;
});
// Добавить картинку
fastify.post('/api/projects/:id/images', async (request) => {
    const { id } = request.params;
    const { url, type, label } = request.body;
    if (USE_SUPABASE) {
        try {
            const images = await supabaseService.getProjectImages(id);
            const newImage = await supabaseService.addImage({
                project_id: id,
                url,
                type: (type || 'gallery'),
                label,
                order_index: images.length,
            });
            console.log(`🖼️ Добавлена картинка для проекта ${id}: ${type} (Supabase)`);
            return newImage;
        }
        catch (error) {
            console.error('Supabase addImage error:', error);
            throw error;
        }
    }
    const images = projectImages.get(id) || [];
    const newImage = {
        id: nanoid(10),
        url,
        type: type || 'gallery',
        label,
    };
    images.push(newImage);
    projectImages.set(id, images);
    console.log(`🖼️ Добавлена картинка для проекта ${id}: ${type}`);
    return newImage;
});
// Удалить картинку
fastify.delete('/api/projects/:id/images/:imageId', async (request, reply) => {
    const { id, imageId } = request.params;
    if (USE_SUPABASE) {
        try {
            await supabaseService.deleteImage(imageId);
            console.log(`🗑️ Удалена картинка ${imageId} из проекта ${id} (Supabase)`);
            return { success: true };
        }
        catch (error) {
            console.error('Supabase deleteImage error:', error);
            throw error;
        }
    }
    const images = projectImages.get(id) || [];
    const filtered = images.filter(img => img.id !== imageId);
    projectImages.set(id, filtered);
    console.log(`🗑️ Удалена картинка ${imageId} из проекта ${id}`);
    return { success: true };
});
// === ЛИДЫ (заявки с демо-сайтов) ===
// Создать новый лид
fastify.post('/api/leads', async (request, reply) => {
    try {
        const { name, phone, messenger, studio_name, studio_phone, source_url } = request.body;
        if (!name || !phone || !studio_name) {
            return reply.status(400).send({ error: 'name, phone и studio_name обязательны' });
        }
        if (!USE_SUPABASE) {
            return reply.status(500).send({ error: 'Supabase не настроен' });
        }
        const lead = await supabaseService.createLead({
            name,
            phone,
            messenger,
            studio_name,
            studio_phone,
            source_url,
        });
        console.log(`📩 Новый лид: ${name} (${phone}) для студии "${studio_name}"`);
        return { success: true, lead };
    }
    catch (error) {
        console.error('Ошибка создания лида:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка создания заявки',
        });
    }
});
// Получить все лиды (для CRM)
fastify.get('/api/leads', async (request) => {
    if (!USE_SUPABASE) {
        return { leads: [], error: 'Supabase не настроен' };
    }
    try {
        const limit = parseInt(request.query.limit || '100', 10);
        const leads = await supabaseService.getLeads(limit);
        return { leads };
    }
    catch (error) {
        console.error('Ошибка получения лидов:', error);
        return { leads: [], error: 'Ошибка получения заявок' };
    }
});
// Обновить статус лида
fastify.patch('/api/leads/:id', async (request, reply) => {
    if (!USE_SUPABASE) {
        return reply.status(500).send({ error: 'Supabase не настроен' });
    }
    try {
        const { id } = request.params;
        const updates = {};
        if (request.body.status) {
            updates.status = request.body.status;
        }
        if (request.body.notes !== undefined) {
            updates.notes = request.body.notes;
        }
        const lead = await supabaseService.updateLead(id, updates);
        console.log(`📝 Лид ${id} обновлён: status=${request.body.status}`);
        return { success: true, lead };
    }
    catch (error) {
        console.error('Ошибка обновления лида:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка обновления заявки',
        });
    }
});
// Фоновый процесс генерации
async function processProject(projectId) {
    try {
        // Загружаем проект из Supabase или файла
        let project = null;
        if (USE_SUPABASE) {
            const dbProject = await supabaseService.getProject(projectId);
            if (dbProject) {
                project = {
                    id: dbProject.id,
                    name: dbProject.name,
                    niche: dbProject.niche,
                    status: dbProject.status,
                    uploadedFiles: dbProject.uploaded_files || [],
                    description: dbProject.description,
                    colorScheme: dbProject.color_scheme,
                    aiModel: dbProject.ai_model,
                    fontFamily: dbProject.font_family,
                    siteConfig: dbProject.site_config,
                    deployedUrl: dbProject.deployed_url,
                    error: dbProject.error,
                    createdAt: dbProject.created_at,
                    updatedAt: dbProject.updated_at,
                };
            }
        }
        else {
            const projects = await loadProjects();
            project = projects.find(p => p.id === projectId) || null;
        }
        if (!project)
            return;
        // Шаг 1: Генерация через AI (или использование кешированного конфига из превью)
        await updateProject(projectId, { status: 'processing' });
        // Защита от undefined/null uploadedFiles
        const uploadedFiles = project.uploadedFiles || [];
        const imageFiles = uploadedFiles.filter(f => f && f.path && /\.(png|jpg|jpeg|gif|webp)$/i.test(f.path));
        let siteConfig;
        if (project.siteConfig) {
            // Используем конфиг из превью — БЕЗ вызова AI!
            console.log(`✅ Используем кешированный конфиг из превью для ${projectId}`);
            siteConfig = project.siteConfig;
            // ВАЖНО: применяем colorScheme из проекта к кешированному конфигу!
            if (project.colorScheme) {
                siteConfig.sections = siteConfig.sections || {};
                siteConfig.sections.colorScheme = project.colorScheme;
                console.log(`🎨 Применены цвета из превью: primary=${project.colorScheme.primary}, accent=${project.colorScheme.accent}`);
            }
        }
        else {
            // Конфиг не был передан — генерируем через AI
            console.log(`🤖 Генерируем конфиг через AI для ${projectId}...`);
            siteConfig = await generateSiteConfig({
                name: project.name,
                niche: project.niche,
                description: project.description,
                imageFiles,
                colorScheme: project.colorScheme,
                aiModel: project.aiModel,
            });
        }
        siteConfig.meta.projectId = projectId;
        await updateProject(projectId, { siteConfig });
        // Шаг 2: Сборка сайта (с передачей загруженных фото)
        await updateProject(projectId, { status: 'building' });
        const buildPath = await buildSite(projectId, siteConfig, uploadedFiles);
        // Шаг 3: Деплой на Vercel
        await updateProject(projectId, { status: 'deploying' });
        const deployedUrl = await deployToVercel(projectId, buildPath, siteConfig.meta.slug);
        await updateProject(projectId, {
            status: 'completed',
            deployedUrl,
        });
        console.log(`✅ Проект ${projectId} успешно создан: ${deployedUrl}`);
        // Отправляем уведомление в Telegram
        try {
            // Получаем VK данные из проекта (могут быть в dbProject или project)
            let vkGroupUrl;
            let vkAdmins;
            if (USE_SUPABASE) {
                const dbProject = await supabaseService.getProject(projectId);
                vkGroupUrl = dbProject?.vk_group_url ?? undefined;
                vkAdmins = dbProject?.vk_admins;
            }
            else {
                vkGroupUrl = project.vkGroupUrl;
                vkAdmins = project.vkAdmins;
            }
            await notifyNewSite({
                siteName: project.name,
                siteUrl: deployedUrl,
                vkGroupUrl: vkGroupUrl || siteConfig.sections?.contacts?.vk || 'Не указана',
                admins: vkAdmins,
            });
        }
        catch (tgError) {
            console.error('⚠️ Ошибка отправки в Telegram:', tgError);
            // Не падаем из-за ошибки Telegram
        }
    }
    catch (error) {
        console.error(`❌ Ошибка проекта ${projectId}:`, error);
        await updateProject(projectId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
}
// Диагностика окружения (без раскрытия значений)
fastify.get('/api/diagnostics', async () => {
    const vpsConfig = getVPSConfig();
    return {
        vercelToken: !!process.env.VERCEL_TOKEN,
        vercelTokenLength: process.env.VERCEL_TOKEN?.length || 0,
        customDomain: process.env.CUSTOM_DOMAIN || null,
        railwayEnv: !!process.env.RAILWAY_ENVIRONMENT,
        supabaseConfigured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY,
        openrouterConfigured: !!process.env.OPENROUTER_API_KEY,
        vps: {
            configured: vpsConfig.configured,
            domain: vpsConfig.domain,
            sitesDir: vpsConfig.sitesDir,
        },
        nodeVersion: process.version,
        platform: process.platform,
    };
});
// Запуск сервера
const PORT = parseInt(process.env.PORT || '3001', 10);
// Для Vercel serverless
export default async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
}
// Graceful shutdown для Railway и других хостингов
const shutdown = async (signal) => {
    console.log(`\n⚠️ Получен ${signal}, завершаем работу...`);
    try {
        // Останавливаем очередь (ждём завершения текущего элемента)
        await queueManager.shutdown();
        await fastify.close();
        console.log('✅ Сервер корректно остановлен');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Ошибка при завершении:', err);
        process.exit(1);
    }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// === ИНИЦИАЛИЗАЦИЯ ОЧЕРЕДИ VK ===
// Обработчик элементов очереди - создаёт сайт из VK группы
queueManager.setProcessor(async (item) => {
    console.log(`\n🔄 Обработка VK группы: ${item.vk_url}`);
    // 1. Парсим VK группу
    const vkData = await parseVKGroup(item.vk_url);
    console.log(`✅ Распарсена группа: ${vkData.name}`);
    // 2. Извлекаем цвета из аватарки (если включено)
    let colorScheme;
    if (item.options?.extractColors !== false && vkData.avatarUrl) {
        try {
            console.log(`🎨 Извлечение цветов из аватарки...`);
            colorScheme = await extractColorsFromUrl(vkData.avatarUrl);
            console.log(`🎨 Цвета: primary=${colorScheme.primary}, accent=${colorScheme.accent}`);
        }
        catch (err) {
            console.warn(`⚠️ Не удалось извлечь цвета:`, err);
        }
    }
    // 3. Парсим фото из группы
    const photos = await parseVKPhotos(item.vk_url, 30); // 30 фото для анализа
    console.log(`📷 Получено ${photos.length} фото`);
    // 4. AI анализ фото (если включено и есть OPENROUTER_API_KEY)
    let distributedPhotos = null;
    if (item.options?.analyzePhotos !== false && process.env.OPENROUTER_API_KEY && photos.length > 0) {
        try {
            console.log(`🤖 AI анализ фотографий...`);
            const analysis = await analyzePhotos(photos, item.options?.niche || 'fitness', 25);
            distributedPhotos = distributePhotos(analysis.photos);
            console.log(`✅ Фото распределены: hero=${distributedPhotos.hero.length}, ` +
                `gallery=${distributedPhotos.gallery.length}, instructors=${distributedPhotos.instructors.length}`);
        }
        catch (err) {
            console.warn(`⚠️ AI анализ не удался, используем простое распределение:`, err);
        }
    }
    // 5. Создаём проект
    const projectId = nanoid(10);
    const niche = item.options?.niche || 'stretching';
    // Сохраняем в Supabase
    if (USE_SUPABASE) {
        await supabaseService.createProject({
            id: projectId,
            name: vkData.name,
            niche,
            status: 'pending',
            description: vkData.description,
            color_scheme: colorScheme,
            vk_group_url: item.vk_url,
            vk_admins: vkData.admins,
        });
    }
    // 6. Загружаем фото в Storage с учётом AI категоризации
    const uploadedFiles = [];
    // Определяем какие фото загружать и с какими категориями
    const photosToUpload = [];
    if (distributedPhotos) {
        // Используем AI категоризацию
        distributedPhotos.hero.slice(0, 3).forEach((p, i) => photosToUpload.push({ url: p.url, block: 'hero', order: i }));
        distributedPhotos.instructors.slice(0, 4).forEach((p, i) => photosToUpload.push({ url: p.url, block: 'instructors', order: 100 + i }));
        distributedPhotos.atmosphere.slice(0, 6).forEach((p, i) => photosToUpload.push({ url: p.url, block: 'atmosphere', order: 200 + i }));
        distributedPhotos.gallery.slice(0, 12).forEach((p, i) => photosToUpload.push({ url: p.url, block: 'gallery', order: 300 + i }));
    }
    else {
        // Простое распределение: первые 3 — hero, остальные — gallery
        photos.slice(0, 25).forEach((p, i) => photosToUpload.push({ url: p.url, block: i < 3 ? 'hero' : 'gallery', order: i }));
    }
    for (const photoItem of photosToUpload) {
        try {
            const response = await fetch(photoItem.url);
            if (!response.ok)
                continue;
            const buffer = Buffer.from(await response.arrayBuffer());
            const ext = photoItem.url.match(/\.(jpg|jpeg|png|webp)/i)?.[0] || '.jpg';
            const filename = `vk-${nanoid(6)}${ext}`;
            if (USE_SUPABASE) {
                const filePath = await supabaseService.uploadImage(projectId, buffer, filename, `image/${ext.replace('.', '')}`);
                uploadedFiles.push({
                    path: filePath,
                    filename,
                    block: photoItem.block,
                    order: photoItem.order,
                });
            }
        }
        catch (err) {
            console.error(`⚠️ Ошибка загрузки фото:`, err);
        }
    }
    console.log(`📷 Загружено ${uploadedFiles.length} фото`);
    // 7. Обновляем проект с фото
    if (USE_SUPABASE && uploadedFiles.length > 0) {
        await supabaseService.updateProject(projectId, {
            uploaded_files: uploadedFiles.map(f => ({ ...f, order: f.order ?? 0 })),
        });
    }
    // 8. Запускаем генерацию
    await processProject(projectId);
    return projectId;
});
// Подписка на события очереди (для логирования и Telegram)
queueManager.onEvent(async (event) => {
    switch (event.type) {
        case 'item_completed':
            console.log(`✅ Queue: ${event.item?.vk_url} -> completed`);
            break;
        case 'item_failed':
            console.log(`❌ Queue: ${event.item?.vk_url} failed: ${event.error}`);
            break;
        case 'batch_completed':
            console.log(`🎉 Batch ${event.batchId} завершён!`);
            console.log(`   Completed: ${event.stats?.completed}, Failed: ${event.stats?.failed}`);
            break;
        case 'queue_empty':
            console.log(`📭 Очередь пуста`);
            break;
    }
});
// Восстановление зависших элементов при старте
queueManager.recover().then(count => {
    if (count > 0) {
        console.log(`🔄 Восстановлено ${count} зависших элементов очереди`);
    }
});
// Локальный запуск (не на Vercel)
if (!IS_VERCEL) {
    try {
        // Railway и другие хостинги требуют 0.0.0.0 для внешних подключений
        const HOST = process.env.RAILWAY_ENVIRONMENT ? '0.0.0.0' : '127.0.0.1';
        await fastify.listen({ port: PORT, host: HOST });
        console.log(`🚀 Сервер запущен на http://${HOST}:${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
