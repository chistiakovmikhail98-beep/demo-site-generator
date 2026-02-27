/**
 * PhotoAnalyzer - анализ фотографий с Gemini Flash (vision)
 *
 * Категоризация фото для демо-сайтов:
 * - hero: главный баннер (качественное фото студии/занятия)
 * - gallery: галерея (общие фото)
 * - instructors: тренеры (портреты взрослых)
 * - atmosphere: атмосфера (интерьер, детали)
 * - stories: до/после (если применимо)
 *
 * Стоимость: ~$0.00001 за фото (Gemini Flash - в 20 раз дешевле Claude Haiku)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveAiCost } from './supabase.js';

// Gemini API для vision
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const VISION_MODEL = 'gemini-3-flash-preview';

// Типы категорий фото
export type PhotoCategory = 'hero' | 'gallery' | 'instructors' | 'atmosphere' | 'stories' | 'skip';

export interface AnalyzedPhoto {
  url: string;
  category: PhotoCategory;
  confidence: number; // 0-1
  description?: string;
  isChild?: boolean; // Есть ли дети на фото
  isGroup?: boolean; // Групповое фото
  quality?: 'high' | 'medium' | 'low';
}

export interface PhotoAnalysisResult {
  photos: AnalyzedPhoto[];
  totalCost: number;
  totalTokens: number;
}

/**
 * Предварительная фильтрация фото без AI
 * Отсеивает явно неподходящие фото
 */
export function prefilterPhotos(
  photos: Array<{ url: string; width?: number; height?: number }>
): Array<{ url: string; width?: number; height?: number }> {
  return photos.filter(photo => {
    // Минимальный размер 400px по любой стороне
    if (photo.width && photo.width < 400) return false;
    if (photo.height && photo.height < 400) return false;

    // Пропускаем очевидные логотипы/иконки (квадратные маленькие)
    if (photo.width && photo.height) {
      const ratio = photo.width / photo.height;
      // Слишком узкие или высокие - вероятно баннеры/рекламы
      if (ratio < 0.3 || ratio > 3) return false;
    }

    return true;
  });
}

/**
 * Анализирует одно фото с Gemini Flash Vision
 */
async function analyzePhoto(
  imageUrl: string,
  niche: string = 'fitness'
): Promise<{ category: PhotoCategory; confidence: number; description: string; isChild: boolean; isGroup: boolean; quality: 'high' | 'medium' | 'low'; tokens: number }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY не установлен');
  }

  const nicheContext: Record<string, string> = {
    dance: 'танцевальная студия',
    fitness: 'фитнес-зал',
    stretching: 'студия растяжки',
    yoga: 'йога-студия',
    wellness: 'SPA/wellness центр',
  };

  const prompt = `Проанализируй это фото для сайта ${nicheContext[niche] || 'фитнес-студия'}.

Определи:
1. КАТЕГОРИЯ (одно из): hero (главное фото для баннера), instructors (портрет тренера), gallery (занятия/тренировки), atmosphere (интерьер/детали), stories (результаты до/после), skip (не подходит - реклама, текст, низкое качество)

2. УВЕРЕННОСТЬ: число от 0 до 1

3. ДЕТИ: есть ли на фото дети (true/false)

4. ГРУППА: групповое фото или одиночное (true/false)

5. КАЧЕСТВО: high (отлично для сайта), medium (нормально), low (плохое качество/размытое)

6. ОПИСАНИЕ: краткое описание (5-10 слов)

Формат ответа СТРОГО JSON:
{"category":"...", "confidence":0.9, "isChild":false, "isGroup":true, "quality":"high", "description":"..."}`;

  try {
    // Скачиваем изображение и конвертируем в base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Определяем MIME type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: VISION_MODEL,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: contentType,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();
    const tokens = response.usageMetadata?.totalTokenCount || 0;

    // Убираем markdown code fences (Gemini 3 Flash оборачивает в ```json ... ```)
    const cleanText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    // Извлекаем JSON из ответа
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Не удалось распарсить ответ:', text);
      return {
        category: 'gallery',
        confidence: 0.5,
        description: 'Не удалось проанализировать',
        isChild: false,
        isGroup: false,
        quality: 'medium',
        tokens,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      category: parsed.category || 'gallery',
      confidence: parsed.confidence || 0.5,
      description: parsed.description || '',
      isChild: parsed.isChild || false,
      isGroup: parsed.isGroup || false,
      quality: parsed.quality || 'medium',
      tokens,
    };
  } catch (error) {
    console.error('❌ Ошибка анализа фото:', error);
    return {
      category: 'gallery',
      confidence: 0.3,
      description: 'Ошибка анализа',
      isChild: false,
      isGroup: false,
      quality: 'medium',
      tokens: 0,
    };
  }
}

/**
 * Анализирует batch фотографий
 * @param photos - массив URL фото
 * @param niche - ниша бизнеса
 * @param limit - максимум фото для анализа
 * @param projectId - ID проекта для учёта расходов
 */
export async function analyzePhotos(
  photos: Array<{ url: string; width?: number; height?: number }>,
  niche: string = 'fitness',
  limit: number = 25,
  projectId?: string
): Promise<PhotoAnalysisResult> {
  // Предварительная фильтрация
  const filtered = prefilterPhotos(photos).slice(0, limit);

  console.log(`📷 Анализ ${filtered.length} фото (из ${photos.length})...`);

  const results: AnalyzedPhoto[] = [];
  let totalTokens = 0;

  // Анализируем последовательно (rate limits)
  for (let i = 0; i < filtered.length; i++) {
    const photo = filtered[i];

    try {
      console.log(`   [${i + 1}/${filtered.length}] Анализ...`);

      const analysis = await analyzePhoto(photo.url, niche);
      totalTokens += analysis.tokens;

      results.push({
        url: photo.url,
        category: analysis.category,
        confidence: analysis.confidence,
        description: analysis.description,
        isChild: analysis.isChild,
        isGroup: analysis.isGroup,
        quality: analysis.quality,
      });

      // Небольшая задержка между запросами
      if (i < filtered.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`   ⚠️ Ошибка фото ${i + 1}:`, error);
      results.push({
        url: photo.url,
        category: 'gallery',
        confidence: 0.3,
      });
    }
  }

  // Стоимость Gemini 2.5 Flash: $0.30 input / $2.50 output per 1M tokens
  // Vision обычно ~95% input (изображение) + 5% output (JSON ответ)
  const inputTokens = Math.round(totalTokens * 0.95);
  const outputTokens = Math.round(totalTokens * 0.05);
  const estimatedCost = (inputTokens / 1_000_000) * 0.30 + (outputTokens / 1_000_000) * 2.50;

  console.log(`✅ Анализ завершён: ${results.length} фото, ~$${estimatedCost.toFixed(5)} (Gemini Flash)`);

  // 💾 Сохраняем расход в ai_costs
  if (totalTokens > 0) {
    saveAiCost({
      project_id: projectId,
      type: 'photo_analysis',
      model: VISION_MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      cost_usd: estimatedCost,
      description: `Photo analysis: ${results.length} photos (Gemini Flash)`,
    }).catch(err => {
      console.error('⚠️ Не удалось сохранить AI cost для фото:', err);
    });
  }

  return {
    photos: results,
    totalCost: estimatedCost,
    totalTokens,
  };
}

/**
 * Распределяет проанализированные фото по секциям сайта
 */
export function distributePhotos(analyzed: AnalyzedPhoto[]): {
  hero: AnalyzedPhoto[];
  gallery: AnalyzedPhoto[];
  instructors: AnalyzedPhoto[];
  atmosphere: AnalyzedPhoto[];
} {
  // Фильтруем skip и сортируем по confidence
  const valid = analyzed
    .filter(p => p.category !== 'skip' && p.quality !== 'low')
    .sort((a, b) => b.confidence - a.confidence);

  const result = {
    hero: [] as AnalyzedPhoto[],
    gallery: [] as AnalyzedPhoto[],
    instructors: [] as AnalyzedPhoto[],
    atmosphere: [] as AnalyzedPhoto[],
  };

  for (const photo of valid) {
    switch (photo.category) {
      case 'hero':
        if (result.hero.length < 3) result.hero.push(photo);
        else result.gallery.push(photo);
        break;
      case 'instructors':
        if (result.instructors.length < 6) result.instructors.push(photo);
        else result.gallery.push(photo);
        break;
      case 'atmosphere':
        if (result.atmosphere.length < 8) result.atmosphere.push(photo);
        else result.gallery.push(photo);
        break;
      case 'gallery':
      case 'stories':
      default:
        result.gallery.push(photo);
    }
  }

  // Если нет hero - берём лучшее из gallery
  if (result.hero.length === 0 && result.gallery.length > 0) {
    const best = result.gallery.shift();
    if (best) result.hero.push(best);
  }

  return result;
}
