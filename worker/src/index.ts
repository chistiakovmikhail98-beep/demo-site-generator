// ============================================================
// FitWebAI Worker — polls queue, processes VK URLs
// Runs as a separate PM2 process alongside Next.js
//
// Pipeline: VK URL → parse group → extract colors → parse photos
//   → AI analyze photos → AI generate content → save config → notify
//
// Key difference from old architecture:
// NO build/deploy step! Saving SiteConfig to Supabase = instant deploy
// because Next.js SSR reads config from DB on every request.
// ============================================================

import { nanoid } from 'nanoid';
import {
  getNextQueueItem,
  completeQueueItem,
  failQueueItem,
  requeueItem,
  setQueueItemProject,
  resetStuckItems,
  createProject,
  updateProject,
  getProject,
  uploadImage,
  saveAiCost,
  type QueueItem,
} from './services/supabase.js';
import { parseVKGroup, parseVKPhotos, type ParsedVKData } from './services/vk.js';
import { extractColorsFromUrl } from './services/color-extractor.js';
import { analyzePhotos, distributePhotos, type AnalyzedPhoto } from './services/photo-analyzer.js';
import { generateSiteConfig, detectNiche, type SiteConfig } from './services/ai.js';
import { notifyNewSite } from './services/telegram.js';

const POLL_INTERVAL = 5000; // 5 seconds
const DOMAIN = process.env.SITE_DOMAIN || 'fitwebai.ru';

// Generate edit password
function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 6; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

// Hash password with bcrypt
import bcrypt from 'bcryptjs';
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// === Main processing pipeline ===

type PhotoBlockType = 'hero' | 'gallery' | 'instructors' | 'atmosphere';

interface UploadedFile {
  path: string;
  filename: string;
  block: PhotoBlockType;
  order: number;
  label?: string;
}

async function processQueueItem(item: QueueItem): Promise<void> {
  const vkUrl = item.vk_url;
  console.log(`\n🔄 Обработка VK группы: ${vkUrl}`);

  // 1. Parse VK group
  console.log(`[1/7] Парсинг VK группы...`);
  const vkData = await parseVKGroup(vkUrl);
  console.log(`✅ ${vkData.name}`);

  // 2. Extract colors from avatar
  let colorScheme: { primary: string; accent: string } | undefined;
  if (item.options.extractColors !== false && vkData.avatarUrl) {
    try {
      console.log(`[2/7] Извлечение цветов...`);
      colorScheme = await extractColorsFromUrl(vkData.avatarUrl);
    } catch (err) {
      console.warn(`⚠️ Цвета не извлечены:`, err);
    }
  } else {
    console.log(`[2/7] Извлечение цветов — пропущено`);
  }

  // 3. Parse VK photos
  console.log(`[3/7] Парсинг фото...`);
  const photos = await parseVKPhotos(vkUrl, 30);
  console.log(`📷 ${photos.length} фото`);

  // 4. Detect niche
  const niche = item.options.niche || detectNiche(vkData.name, vkData.description, vkData.posts);

  // 5. Create project (or reuse existing from previous failed attempt)
  console.log(`[4/7] Создание проекта...`);
  const slug = generateSlug(vkData.name);
  let projectId: string;

  // Check if project already exists (from a previous retry)
  const existing = item.project_id ? await getProject(item.project_id) : null;
  if (existing) {
    projectId = existing.id;
    console.log(`♻️ Проект уже существует: ${projectId}`);
  } else {
    projectId = nanoid(10);
    await createProject({
      id: projectId,
      name: vkData.name,
      niche,
      status: 'processing',
      description: vkData.description,
      slug,
      color_scheme: colorScheme as Record<string, string> | undefined,
      ai_model: 'gemini-2.5-flash',
      vk_group_url: vkUrl,
      vk_admins: vkData.admins,
      vk_contacts: {
        phone: vkData.contacts.phone,
        email: vkData.contacts.email,
        address: vkData.contacts.address,
        site: vkData.contacts.site,
      },
    });
    // Save project_id to queue item so retries can find the existing project
    await setQueueItemProject(item.id, projectId);
  }

  // 5b. Upload VK avatar as logo
  let logoUrl: string | undefined;
  if (vkData.avatarUrl) {
    try {
      const avatarResp = await fetch(vkData.avatarUrl);
      if (avatarResp.ok) {
        const avatarBuf = Buffer.from(await avatarResp.arrayBuffer());
        const avatarExt = vkData.avatarUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[0] || '.jpg';
        logoUrl = await uploadImage(projectId, avatarBuf, `logo${avatarExt}`, `image/${avatarExt.replace('.', '')}`);
        console.log(`🖼️ Логотип загружен: ${logoUrl}`);
      }
    } catch (err) {
      console.warn(`⚠️ Логотип не загружен:`, err);
    }
  }

  // 6. AI analyze photos & upload to Storage
  let distributedPhotos: ReturnType<typeof distributePhotos> | null = null;

  if (item.options.analyzePhotos !== false && photos.length > 0) {
    try {
      console.log(`[5/7] AI анализ фото...`);
      const analysis = await analyzePhotos(photos, niche, 25, projectId);
      distributedPhotos = distributePhotos(analysis.photos);
      console.log(`✅ hero=${distributedPhotos.hero.length}, gallery=${distributedPhotos.gallery.length}, instructors=${distributedPhotos.instructors.length}`);
    } catch (err) {
      console.warn(`⚠️ AI анализ не удался:`, err);
    }
  } else {
    console.log(`[5/7] AI анализ фото — пропущен`);
  }

  // Upload photos to Supabase Storage
  const uploadedFiles: UploadedFile[] = [];
  const photosToUpload: Array<{ url: string; block: PhotoBlockType; order: number }> = [];

  if (distributedPhotos) {
    distributedPhotos.hero.slice(0, 3).forEach((p, i) =>
      photosToUpload.push({ url: p.url, block: 'hero', order: i }));
    distributedPhotos.instructors.slice(0, 4).forEach((p, i) =>
      photosToUpload.push({ url: p.url, block: 'instructors', order: 100 + i }));
    distributedPhotos.atmosphere.slice(0, 6).forEach((p, i) =>
      photosToUpload.push({ url: p.url, block: 'atmosphere', order: 200 + i }));
    distributedPhotos.gallery.slice(0, 12).forEach((p, i) =>
      photosToUpload.push({ url: p.url, block: 'gallery', order: 300 + i }));
  } else {
    photos.slice(0, 25).forEach((p, i) =>
      photosToUpload.push({ url: p.url, block: i < 3 ? 'hero' : 'gallery', order: i }));
  }

  for (const photoItem of photosToUpload) {
    try {
      const response = await fetch(photoItem.url);
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = photoItem.url.match(/\.(jpg|jpeg|png|webp)/i)?.[0] || '.jpg';
      const filename = `vk-${nanoid(6)}${ext}`;

      const filePath = await uploadImage(projectId, buffer, filename, `image/${ext.replace('.', '')}`);
      uploadedFiles.push({ path: filePath, filename, block: photoItem.block, order: photoItem.order });
    } catch {
      // Skip failed uploads
    }
  }

  console.log(`📷 Загружено ${uploadedFiles.length} фото`);

  if (uploadedFiles.length > 0) {
    await updateProject(projectId, {
      uploaded_files: uploadedFiles.map(f => ({ ...f, order: f.order ?? 0 })),
    } as any);
  }

  // 7. Generate site content with AI
  console.log(`[6/7] AI генерация контента...`);
  const siteConfig = await generateSiteConfig({
    name: vkData.name,
    niche: niche as any,
    description: vkData.rawText, // Full text for AI
    imageUrls: uploadedFiles.filter(f => f.block === 'hero' || f.block === 'atmosphere').slice(0, 5).map(f => f.path),
    colorScheme,
    projectId,
  });

  // Set project ID and slug in config
  siteConfig.meta.projectId = projectId;
  siteConfig.meta.slug = slug;

  // Inject real photo URLs into config
  injectPhotos(siteConfig, uploadedFiles);

  // Inject logo
  if (logoUrl) {
    siteConfig.brand.logo = logoUrl;
  }

  // Inject real contacts from VK
  if (siteConfig.sections.contacts) {
    if (vkData.contacts.phone) siteConfig.sections.contacts.phone = vkData.contacts.phone;
    if (vkData.contacts.email) siteConfig.sections.contacts.email = vkData.contacts.email;
    if (vkData.contacts.address) siteConfig.sections.contacts.address = vkData.contacts.address;
    if (vkData.contacts.vk) siteConfig.sections.contacts.vk = vkData.contacts.vk;
    if (vkData.contacts.site) siteConfig.sections.contacts.site = vkData.contacts.site;
  }

  // 8. Save config = DEPLOY (instant!)
  console.log(`[7/7] Сохранение конфига (= деплой)...`);
  const deployedUrl = `https://${slug}.${DOMAIN}`;

  // Generate edit password
  const editPassword = generatePassword();
  const editPasswordHash = await hashPassword(editPassword);

  await updateProject(projectId, {
    status: 'completed',
    site_config: siteConfig as any,
    deployed_url: deployedUrl,
    slug,
    edit_password_hash: editPasswordHash,
    edit_password_plain: editPassword,
  });

  // Mark queue item as completed
  await completeQueueItem(item.id, projectId);

  console.log(`\n✅ Сайт создан: ${deployedUrl}`);
  console.log(`🔑 Пароль: ${editPassword}`);

  // 9. Send Telegram notification
  try {
    await notifyNewSite({
      siteName: vkData.name,
      siteUrl: deployedUrl,
      vkGroupUrl: vkUrl,
      groupPhone: vkData.contacts.phone,
      groupEmail: vkData.contacts.email,
      groupAddress: vkData.contacts.address,
      groupSite: vkData.contacts.site,
      admins: vkData.admins,
      editPassword,
    });
  } catch (tgErr) {
    console.error('⚠️ Telegram notification failed:', tgErr);
  }
}

// Inject uploaded photos into SiteConfig sections
function injectPhotos(config: SiteConfig, files: UploadedFile[]): void {
  const byBlock: Record<string, string[]> = {};
  for (const f of files.sort((a, b) => a.order - b.order)) {
    if (!byBlock[f.block]) byBlock[f.block] = [];
    byBlock[f.block].push(f.path);
  }

  // Hero image
  if (byBlock.hero?.[0]) {
    config.brand.heroImage = byBlock.hero[0];
  }

  // Gallery
  if (byBlock.gallery?.length) {
    config.sections.gallery = byBlock.gallery;
  }

  // Instructors
  if (byBlock.instructors?.length && Array.isArray(config.sections.instructors)) {
    config.sections.instructors.forEach((inst: any, i: number) => {
      if (byBlock.instructors[i]) inst.image = byBlock.instructors[i];
    });
  }

  // Atmosphere
  if (byBlock.atmosphere?.length && Array.isArray(config.sections.atmosphere)) {
    config.sections.atmosphere.forEach((atm: any, i: number) => {
      if (byBlock.atmosphere[i]) atm.image = byBlock.atmosphere[i];
    });
  }

  // Hero advantages / stories could also get photos
  if (byBlock.hero?.length > 1 && Array.isArray(config.sections.advantages)) {
    config.sections.advantages.forEach((adv: any, i: number) => {
      if (byBlock.hero[i + 1]) adv.image = byBlock.hero[i + 1];
    });
  }
}

function generateSlug(name: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };

  // Extract brand name: skip generic words (студия, школа, фитнес, танцы, etc.)
  const skipWords = new Set([
    'студия', 'школа', 'центр', 'клуб', 'зал', 'дом', 'мир',
    'фитнес', 'танцы', 'танца', 'танцев', 'йога', 'йоги',
    'растяжка', 'растяжки', 'спорт', 'спорта', 'велнес',
    'dance', 'studio', 'fitness', 'yoga', 'stretch', 'sport', 'club',
    'для', 'детей', 'взрослых', 'женщин', 'мужчин',
    'и', 'в', 'на', 'г', 'город',
  ]);

  const words = name.toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !skipWords.has(w));

  // Take the first brand word, or first two short words
  let brand = '';
  if (words.length > 0) {
    brand = words[0];
    // If brand word is short (<5 chars) and there's a second word, combine
    if (brand.length < 5 && words.length > 1 && !skipWords.has(words[1])) {
      brand = `${words[0]}-${words[1]}`;
    }
  }

  if (!brand) brand = `studio-${Date.now().toString(36)}`;

  return brand
    .replace(/[а-яё]/g, char => translitMap[char] || char)
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);
}

// === Polling loop ===

async function pollQueue(): Promise<void> {
  try {
    const item = await getNextQueueItem();
    if (!item) return;

    try {
      await processQueueItem(item);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount < item.max_retries) {
        console.log(`⚠️ Ошибка (retry ${newRetryCount}/${item.max_retries}): ${errorMessage}`);
        await requeueItem(item.id, errorMessage, newRetryCount);
      } else {
        console.log(`❌ Failed permanently: ${errorMessage}`);
        await failQueueItem(item.id, errorMessage, newRetryCount);
      }
    }
  } catch (err) {
    console.error('Queue poll error:', err);
  }
}

async function main(): Promise<void> {
  console.log('🚀 FitWebAI Worker started');
  console.log(`   Domain: ${DOMAIN}`);
  console.log(`   Polling every ${POLL_INTERVAL / 1000}s`);

  // Recover stuck items from crashes
  const recovered = await resetStuckItems(30);
  if (recovered > 0) {
    console.log(`🔄 Recovered ${recovered} stuck items`);
  }

  // Initial poll
  await pollQueue();

  // Continuous polling
  setInterval(pollQueue, POLL_INTERVAL);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
