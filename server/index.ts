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
import type { Project, Niche, ColorScheme, AIModel, FontFamily, UploadedFile, PhotoBlockType, SiteConfig } from './types.js';
import { generateSiteConfig, parseRawText, tokenStats } from './services/ai.js';
import { buildSite } from './services/builder.js';
import { deployToVercel } from './services/deployer.js';
import * as supabaseService from './services/supabase.js';
import { parseVKGroup, parseVKPhotos } from './services/vk.js';
import sharp from 'sharp';

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
} catch (e) {
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
} catch (e) {
  console.error('❌ Template folder NOT FOUND:', templatePath);
  console.log('📂 Listing CWD contents...');
  try {
    const cwdContents = await fs.readdir(process.cwd());
    console.log('📂 CWD contents:', cwdContents.join(', '));
  } catch (e2) {
    console.error('Failed to list CWD:', e2);
  }
}

// Загрузка/сохранение проектов
async function loadProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  if (USE_SUPABASE) {
    // Маппинг полей Project -> DbProject
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.deployedUrl !== undefined) dbUpdates.deployed_url = updates.deployedUrl;
    if (updates.error !== undefined) dbUpdates.error = updates.error;
    if (updates.siteConfig !== undefined) dbUpdates.site_config = updates.siteConfig;

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
    } catch (error) {
      console.error('Supabase getProjects error:', error);
      return [];
    }
  }
  return await loadProjects();
});

// Получить проект по ID
fastify.get<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
  if (USE_SUPABASE) {
    try {
      const project = await supabaseService.getProject(request.params.id);
      if (!project) {
        return reply.status(404).send({ error: 'Проект не найден' });
      }
      return project;
    } catch (error) {
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
fastify.get<{ Params: { id: string } }>('/api/status/:id', async (request, reply) => {
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
    } catch (error) {
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
  let niche: Niche = 'stretching';
  let description = '';
  let colorScheme: ColorScheme | undefined;
  const uploadedFiles: UploadedFile[] = [];
  let fileIndex = 0;

  // Обработка multipart формы
  for await (const part of parts) {
    if (part.type === 'field') {
      if (part.fieldname === 'name') name = part.value as string;
      if (part.fieldname === 'niche') niche = part.value as Niche;
      if (part.fieldname === 'description') description = part.value as string;
      if (part.fieldname === 'colorScheme') {
        try {
          colorScheme = JSON.parse(part.value as string);
        } catch { /* игнорируем невалидный JSON */ }
      }
    } else if (part.type === 'file') {
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
  const project: Project = {
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
const queue: string[] = [];
let activeWorkers = 0;

async function addToQueue(projectId: string): Promise<void> {
  queue.push(projectId);
  processQueue();
}

async function processQueue(): Promise<void> {
  while (queue.length > 0 && activeWorkers < CONCURRENCY) {
    const projectId = queue.shift();
    if (!projectId) continue;

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
  let projects: Array<{ status: string }> = [];

  if (USE_SUPABASE) {
    try {
      projects = await supabaseService.getProjects();
    } catch (error) {
      console.error('Supabase getProjects error:', error);
    }
  } else {
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

// Статистика токенов (текущая сессия)
fastify.get('/api/tokens', async () => {
  try {
    return {
      total: tokenStats?.total || { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      requests: tokenStats?.requests || 0,
      costFormatted: `$${(tokenStats?.total?.estimatedCost || 0).toFixed(4)}`,
    };
  } catch (error) {
    return {
      total: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      requests: 0,
      costFormatted: '$0.0000',
    };
  }
});

// Статистика токенов из БД (постоянная, по дням)
fastify.get<{ Querystring: { days?: string } }>('/api/tokens/stats', async (request) => {
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
  } catch (error) {
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
fastify.post<{ Body: { url: string } }>('/api/parse-vk', async (request, reply) => {
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
  } catch (error) {
    console.error('Ошибка парсинга ВК:', error);
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Ошибка парсинга группы ВК',
    });
  }
});

// Парсинг фотографий из группы ВК
fastify.post<{ Body: { url: string; limit?: number } }>('/api/parse-vk-photos', async (request, reply) => {
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
  } catch (error) {
    console.error('Ошибка парсинга фото ВК:', error);
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Ошибка парсинга фото группы ВК',
    });
  }
});

// Извлечение цветов из изображения (для логотипов VK)
fastify.post<{ Body: { imageUrl: string } }>('/api/extract-colors', async (request, reply) => {
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
    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    // HSL → RGB конвертация
    const hslToRgb = (h: number, s: number, l: number) => {
      h /= 360; s /= 100; l /= 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    // RGB → HEX
    const rgbToHex = (r: number, g: number, b: number) => {
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Собираем цвета с их насыщенностью
    const colorBuckets: Record<string, { h: number; s: number; l: number; count: number; satScore: number }> = {};
    const channels = info.channels;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const hsl = rgbToHsl(r, g, b);

      // Пропускаем чёрные и белые
      if (hsl.l < 5 || hsl.l > 95) continue;

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
    let accentHex: string;
    const contrastColor = sortedColors.find(c => Math.abs(c.h - primaryColor.h) > 30);
    if (contrastColor) {
      const accentRgb = hslToRgb(contrastColor.h, Math.max(contrastColor.s, 50), Math.min(Math.max(contrastColor.l, 50), 70));
      accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
    } else {
      // Делаем светлее primary
      const accentRgb = hslToRgb(primaryColor.h, Math.max(primaryColor.s - 10, 40), Math.min(primaryColor.l + 20, 75));
      accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
    }

    console.log(`🎨 Результат: primary=${primaryHex}, accent=${accentHex}`);

    return { primary: primaryHex, accent: accentHex };
  } catch (error) {
    console.error('Ошибка извлечения цветов:', error);
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Failed to extract colors',
    });
  }
});

// Батч-генерация из JSON-брифа (параллельная)
fastify.post('/api/batch', async (request, reply) => {
  const parts = request.parts();

  let briefData: Array<{ name: string; niche?: Niche; description?: string }> = [];
  const sharedImages: UploadedFile[] = [];
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
        } catch (e) {
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
  const createdProjects: Array<{ id: string; name: string }> = [];

  if (USE_SUPABASE) {
    for (const studio of briefData) {
      if (!studio.name) continue;

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
  } else {
    const allProjects = await loadProjects();

    for (const studio of briefData) {
      if (!studio.name) continue;

      const projectId = nanoid(10);
      const project: Project = {
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
  const body = request.body as { text?: string; aiModel?: AIModel; niche?: Niche };
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
  } catch (error) {
    console.error('Ошибка превью:', error);
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Ошибка генерации превью'
    });
  }
});

// Хелпер для русских названий ниш
function getNicheLabel(niche: string): string {
  const labels: Record<string, string> = {
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
  let aiModel: AIModel = 'gpt4o-mini';
  let fontFamily: FontFamily = 'manrope';
  let colorScheme: ColorScheme | undefined;
  let overrideNiche: Niche | null = null; // Ниша переданная вручную
  let fullConfigJson: string | null = null; // Полный конфиг из превью (чтобы не вызывать AI повторно)
  const uploadedFiles: UploadedFile[] = [];

  // Буферы файлов для загрузки в Supabase Storage (после создания projectId)
  const pendingFiles: Array<{
    buffer: Buffer;
    filename: string;
    contentType: string;
    order: number;
  }> = [];

  // Временное хранение metadata для файлов
  const fileMetadata: Map<number, { block?: PhotoBlockType; label?: string }> = new Map();
  let fileIndex = 0;
  let photoMetaJson: string | null = null; // Новый формат: JSON массив с type и label
  let photoUrlsJson: string | null = null; // URL фото из ВК

  const contentType = request.headers['content-type'] || '';

  // Обработка multipart формы (с файлами)
  if (contentType.includes('multipart/form-data')) {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'field') {
        if (part.fieldname === 'text') text = part.value as string;
        if (part.fieldname === 'aiModel') aiModel = part.value as AIModel;
        if (part.fieldname === 'fontFamily') fontFamily = part.value as FontFamily;
        if (part.fieldname === 'niche') overrideNiche = part.value as Niche;
        if (part.fieldname === 'colorScheme') {
          try {
            colorScheme = JSON.parse(part.value as string);
          } catch { /* игнорируем невалидный JSON */ }
        }
        // Новый формат: photoMeta как JSON массив [{type, label}, ...]
        if (part.fieldname === 'photoMeta') {
          photoMetaJson = part.value as string;
        }
        // URL фото из ВК
        if (part.fieldname === 'photoUrls') {
          photoUrlsJson = part.value as string;
        }
        // fullConfig из превью — чтобы не вызывать AI повторно
        if (part.fieldname === 'fullConfig') {
          fullConfigJson = part.value as string;
        }
        // Старый формат: files[0].block, files[0].label, files[1].block, etc.
        const blockMatch = part.fieldname.match(/^files\[(\d+)\]\.block$/);
        if (blockMatch) {
          const idx = parseInt(blockMatch[1], 10);
          const meta = fileMetadata.get(idx) || {};
          meta.block = part.value as PhotoBlockType;
          fileMetadata.set(idx, meta);
        }
        const labelMatch = part.fieldname.match(/^files\[(\d+)\]\.label$/);
        if (labelMatch) {
          const idx = parseInt(labelMatch[1], 10);
          const meta = fileMetadata.get(idx) || {};
          meta.label = part.value as string;
          fileMetadata.set(idx, meta);
        }
      } else if (part.type === 'file') {
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
  } else {
    // Обычный JSON
    const body = request.body as {
      text?: string;
      aiModel?: AIModel;
      fontFamily?: FontFamily;
      colorScheme?: ColorScheme;
    };
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
    let parsed: { name: string; niche: Niche; description?: string };
    let cachedSiteConfig: SiteConfig | null = null;

    if (fullConfigJson) {
      // Используем конфиг из превью — БЕЗ вызова AI!
      try {
        cachedSiteConfig = JSON.parse(fullConfigJson) as SiteConfig;
        parsed = {
          name: cachedSiteConfig.brand?.name || 'Студия',
          niche: cachedSiteConfig.brand?.niche || 'fitness',
          description: cachedSiteConfig.brand?.tagline,
        };
        console.log('✅ Используем конфиг из превью (без AI):', parsed.name, '| Ниша:', parsed.niche);
      } catch {
        // Если JSON невалидный — fallback на AI
        console.log('⚠️ Невалидный fullConfig, вызываем AI...');
        parsed = await parseRawText(text, aiModel);
      }
    } else {
      // AI парсит сырой текст
      console.log('🔍 Парсинг текста через AI...');
      console.log(`🤖 Модель: ${aiModel} | Шрифт: ${fontFamily} | Файлов: ${uploadedFiles.length}`);
      parsed = await parseRawText(text, aiModel);
      console.log('✅ Распознано:', parsed.name, '| Ниша:', parsed.niche);
    }

    // Создаём проект
    const projectId = nanoid(10);

    // Применяем photoMeta к pendingFiles
    let photoMeta: Array<{ type?: string; label?: string }> = [];
    if (photoMetaJson) {
      try {
        photoMeta = JSON.parse(photoMetaJson);
      } catch { /* игнорируем невалидный JSON */ }
    }

    // Загружаем файлы в Supabase Storage (или локально) после получения projectId
    console.log(`📷 Загрузка ${pendingFiles.length} файлов для проекта ${projectId}...`);
    for (const pending of pendingFiles) {
      let filePath: string;

      if (USE_SUPABASE) {
        // Загружаем в Supabase Storage и получаем публичный URL
        filePath = await supabaseService.uploadImage(
          projectId,
          pending.buffer,
          pending.filename,
          pending.contentType
        );
        console.log(`📷 Загружено в Supabase Storage: ${pending.filename} → ${filePath}`);
      } else {
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
        block: (photoMetaItem.type as PhotoBlockType) || meta.block || 'gallery',
        label: photoMetaItem.label || meta.label,
        order: pending.order,
      });
    }

    if (uploadedFiles.length > 0) {
      console.log(`📷 Загружено ${uploadedFiles.length} файлов:`,
        uploadedFiles.map(f => `${f.block}:${f.label || 'без подписи'}`).join(', '));
    }

    // Обработка URL фото из ВК
    if (photoUrlsJson) {
      try {
        const urlPhotos: Array<{ url: string; type?: string; label?: string }> = JSON.parse(photoUrlsJson);
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

            let filePath: string;
            if (USE_SUPABASE) {
              filePath = await supabaseService.uploadImage(
                projectId,
                buffer,
                filename,
                `image/${ext.replace('.', '')}`
              );
              console.log(`📷 VK фото загружено в Supabase: ${filename}`);
            } else {
              filePath = path.join(UPLOADS_DIR, filename);
              await fs.writeFile(filePath, buffer);
              console.log(`📷 VK фото сохранено локально: ${filename}`);
            }

            uploadedFiles.push({
              path: filePath,
              filename,
              block: (urlPhoto.type as PhotoBlockType) || 'gallery',
              label: urlPhoto.label,
              order: pendingFiles.length + i,
            });
          } catch (err) {
            console.error(`⚠️ Ошибка загрузки VK фото:`, err);
          }
        }

        console.log(`📷 Всего фото после VK: ${uploadedFiles.length}`);
      } catch (err) {
        console.error('⚠️ Ошибка парсинга photoUrls:', err);
      }
    }

    const project: Project = {
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
        color_scheme: colorScheme as Record<string, string> | undefined,
        ai_model: aiModel,
        font_family: fontFamily,
        uploaded_files: uploadedFiles.map(f => ({ ...f, order: f.order ?? 0 })),
        site_config: cachedSiteConfig as unknown as Record<string, unknown> | undefined, // Конфиг из превью
      });
    } else {
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
  } catch (error) {
    console.error('Ошибка парсинга:', error);
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Ошибка парсинга текста',
    });
  }
});

// === ДОПОЛНИТЕЛЬНЫЕ ENDPOINTS ===

// Удаление проекта
fastify.delete<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
  if (USE_SUPABASE) {
    try {
      await supabaseService.deleteProject(request.params.id);
      console.log(`🗑️ Проект ${request.params.id} удалён (Supabase)`);
      return { success: true, message: 'Проект удалён' };
    } catch (error) {
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
    } catch { /* файл может уже не существовать */ }
  }

  // Удаляем папку сборки
  const buildDir = path.join(BUILDS_DIR, project.id);
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
  } catch { /* папка может не существовать */ }

  // Удаляем из списка
  projects.splice(index, 1);
  await saveProjects(projects);

  console.log(`🗑️ Проект ${project.id} (${project.name}) удалён`);

  return { success: true, message: 'Проект удалён' };
});

// Редактирование проекта
fastify.put<{ Params: { id: string }; Body: Partial<Project> }>('/api/projects/:id', async (request, reply) => {
  if (USE_SUPABASE) {
    try {
      const allowedFields = ['name', 'niche', 'description'];
      const updates: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if ((request.body as Record<string, unknown>)[field] !== undefined) {
          updates[field] = (request.body as Record<string, unknown>)[field];
        }
      }

      const updated = await supabaseService.updateProject(request.params.id, updates);
      console.log(`✏️ Проект ${request.params.id} обновлён (Supabase)`);
      return updated;
    } catch (error) {
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
  const updates: Partial<Project> = {};

  for (const field of allowedFields) {
    if ((request.body as Record<string, unknown>)[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = (request.body as Record<string, unknown>)[field];
    }
  }

  projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
  await saveProjects(projects);

  console.log(`✏️ Проект ${request.params.id} обновлён`);

  return projects[index];
});

// Повторная генерация проекта
fastify.post<{ Params: { id: string } }>('/api/projects/:id/regenerate', async (request, reply) => {
  let project: { id: string; name: string } | null = null;

  if (USE_SUPABASE) {
    const dbProject = await supabaseService.getProject(request.params.id);
    if (dbProject) {
      project = { id: dbProject.id, name: dbProject.name };
    }
  } else {
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
fastify.get<{ Params: { id: string } }>('/api/projects/:id/download', async (request, reply) => {
  let project: { id: string; name: string } | null = null;

  if (USE_SUPABASE) {
    const dbProject = await supabaseService.getProject(request.params.id);
    if (dbProject) {
      project = { id: dbProject.id, name: dbProject.name };
    }
  } else {
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
  } catch {
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
const projectImages = new Map<string, Array<{ id: string; url: string; type: string; label?: string }>>();

// Получить картинки проекта
fastify.get<{ Params: { id: string } }>('/api/projects/:id/images', async (request) => {
  if (USE_SUPABASE) {
    try {
      return await supabaseService.getProjectImages(request.params.id);
    } catch (error) {
      console.error('Supabase getProjectImages error:', error);
      return [];
    }
  }
  const images = projectImages.get(request.params.id) || [];
  return images;
});

// Добавить картинку
fastify.post<{ Params: { id: string }; Body: { url: string; type: string; label?: string } }>(
  '/api/projects/:id/images',
  async (request) => {
    const { id } = request.params;
    const { url, type, label } = request.body;

    if (USE_SUPABASE) {
      try {
        const images = await supabaseService.getProjectImages(id);
        const newImage = await supabaseService.addImage({
          project_id: id,
          url,
          type: (type || 'gallery') as 'gallery' | 'instructor' | 'hero' | 'atmosphere' | 'other',
          label,
          order_index: images.length,
        });
        console.log(`🖼️ Добавлена картинка для проекта ${id}: ${type} (Supabase)`);
        return newImage;
      } catch (error) {
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
  }
);

// Удалить картинку
fastify.delete<{ Params: { id: string; imageId: string } }>(
  '/api/projects/:id/images/:imageId',
  async (request, reply) => {
    const { id, imageId } = request.params;

    if (USE_SUPABASE) {
      try {
        await supabaseService.deleteImage(imageId);
        console.log(`🗑️ Удалена картинка ${imageId} из проекта ${id} (Supabase)`);
        return { success: true };
      } catch (error) {
        console.error('Supabase deleteImage error:', error);
        throw error;
      }
    }

    const images = projectImages.get(id) || [];
    const filtered = images.filter(img => img.id !== imageId);
    projectImages.set(id, filtered);

    console.log(`🗑️ Удалена картинка ${imageId} из проекта ${id}`);

    return { success: true };
  }
);

// Фоновый процесс генерации
async function processProject(projectId: string): Promise<void> {
  try {
    // Загружаем проект из Supabase или файла
    let project: Project | null = null;
    if (USE_SUPABASE) {
      const dbProject = await supabaseService.getProject(projectId);
      if (dbProject) {
        project = {
          id: dbProject.id,
          name: dbProject.name,
          niche: dbProject.niche as Project['niche'],
          status: dbProject.status,
          uploadedFiles: (dbProject.uploaded_files as Project['uploadedFiles']) || [],
          description: dbProject.description,
          colorScheme: dbProject.color_scheme as Project['colorScheme'],
          aiModel: dbProject.ai_model as Project['aiModel'],
          fontFamily: dbProject.font_family as Project['fontFamily'],
          siteConfig: dbProject.site_config as Project['siteConfig'],
          deployedUrl: dbProject.deployed_url,
          error: dbProject.error,
          createdAt: dbProject.created_at,
          updatedAt: dbProject.updated_at,
        };
      }
    } else {
      const projects = await loadProjects();
      project = projects.find(p => p.id === projectId) || null;
    }
    if (!project) return;

    // Шаг 1: Генерация через AI (или использование кешированного конфига из превью)
    await updateProject(projectId, { status: 'processing' });

    const imageFiles = project.uploadedFiles.filter(f =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(f.path)
    );

    let siteConfig: SiteConfig;

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
    } else {
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
    const buildPath = await buildSite(projectId, siteConfig, project.uploadedFiles);

    // Шаг 3: Деплой на Vercel
    await updateProject(projectId, { status: 'deploying' });
    const deployedUrl = await deployToVercel(projectId, buildPath, siteConfig.meta.slug);

    await updateProject(projectId, {
      status: 'completed',
      deployedUrl,
    });

    console.log(`✅ Проект ${projectId} успешно создан: ${deployedUrl}`);
  } catch (error) {
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
export default async function handler(req: Request, res: Response) {
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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
