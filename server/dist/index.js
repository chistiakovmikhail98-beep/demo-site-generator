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
import { parseVKGroup } from './services/vk.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ logger: true });
// Определяем окружение
const IS_VERCEL = !!process.env.VERCEL;
const USE_SUPABASE = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
// Пути (на Vercel используем /tmp)
const UPLOADS_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
const BUILDS_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'builds') : path.join(__dirname, 'builds');
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
// Статистика токенов
fastify.get('/api/tokens', async () => {
    try {
        return {
            total: tokenStats?.total || { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
            requests: tokenStats?.requests || [],
            costFormatted: `$${(tokenStats?.total?.estimatedCost || 0).toFixed(4)}`,
        };
    }
    catch (error) {
        return {
            total: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
            requests: [],
            costFormatted: '$0.0000',
        };
    }
});
// Парсинг группы ВКонтакте
fastify.post('/api/parse-vk', async (request, reply) => {
    try {
        const { url } = request.body;
        if (!url || !url.includes('vk.com')) {
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
        };
    }
    catch (error) {
        console.error('Ошибка парсинга ВК:', error);
        return reply.status(500).send({
            error: error instanceof Error ? error.message : 'Ошибка парсинга группы ВК',
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
    const uploadedFiles = [];
    // Временное хранение metadata для файлов
    const fileMetadata = new Map();
    let fileIndex = 0;
    let photoMetaJson = null; // Новый формат: JSON массив с type и label
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
                const filepath = path.join(UPLOADS_DIR, filename);
                const buffer = await part.toBuffer();
                await fs.writeFile(filepath, buffer);
                // Получаем metadata для этого файла
                const meta = fileMetadata.get(fileIndex) || {};
                uploadedFiles.push({
                    path: filepath,
                    filename,
                    block: meta.block || 'gallery', // По умолчанию — галерея
                    label: meta.label,
                    order: fileIndex,
                });
                fileIndex++;
            }
        }
        // Если есть photoMeta JSON (новый формат), применяем к загруженным файлам
        if (photoMetaJson) {
            try {
                const photoMeta = JSON.parse(photoMetaJson);
                uploadedFiles.forEach((file, idx) => {
                    if (photoMeta[idx]) {
                        file.block = photoMeta[idx].type || 'gallery';
                        file.label = photoMeta[idx].label;
                    }
                });
                console.log(`📷 Применены метаданные к ${uploadedFiles.length} файлам:`, uploadedFiles.map(f => `${f.block}:${f.label || 'без подписи'}`).join(', '));
            }
            catch { /* игнорируем невалидный JSON */ }
        }
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
        // AI парсит сырой текст
        console.log('🔍 Парсинг текста через AI...');
        console.log(`🤖 Модель: ${aiModel} | Шрифт: ${fontFamily} | Файлов: ${uploadedFiles.length}`);
        const parsed = await parseRawText(text, aiModel);
        console.log('✅ Распознано:', parsed.name, '| Ниша:', parsed.niche);
        // Создаём проект
        const projectId = nanoid(10);
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
            });
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
    // Сбрасываем статус и запускаем заново
    await updateProject(project.id, {
        status: 'pending',
        deployedUrl: undefined,
        error: undefined,
        siteConfig: undefined,
    });
    // Запускаем генерацию
    addToQueue(project.id);
    console.log(`🔄 Проект ${project.id} (${project.name}) добавлен на перегенерацию`);
    return {
        id: project.id,
        status: 'pending',
        message: 'Проект добавлен в очередь на повторную генерацию',
    };
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
                    uploadedFiles: [],
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
        // Шаг 1: Генерация через AI
        await updateProject(projectId, { status: 'processing' });
        const imageFiles = project.uploadedFiles.filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f.path));
        const siteConfig = await generateSiteConfig({
            name: project.name,
            niche: project.niche,
            description: project.description,
            imageFiles,
            colorScheme: project.colorScheme,
            aiModel: project.aiModel,
        });
        siteConfig.meta.projectId = projectId;
        await updateProject(projectId, { siteConfig });
        // Шаг 2: Сборка сайта (с передачей загруженных фото)
        await updateProject(projectId, { status: 'building' });
        const buildPath = await buildSite(projectId, siteConfig, project.uploadedFiles);
        // Шаг 3: Деплой на Vercel
        await updateProject(projectId, { status: 'deploying' });
        const deployedUrl = await deployToVercel(projectId, buildPath, siteConfig.meta.slug);
        await updateProject(projectId, {
            status: 'completed',
            deployedUrl,
        });
        console.log(`✅ Проект ${projectId} успешно создан: ${deployedUrl}`);
    }
    catch (error) {
        console.error(`❌ Ошибка проекта ${projectId}:`, error);
        await updateProject(projectId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
}
// Запуск сервера
const PORT = parseInt(process.env.PORT || '3001', 10);
// Для Vercel serverless
export default async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
}
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
