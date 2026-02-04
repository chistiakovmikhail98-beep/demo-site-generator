/**
 * PhotoAnalyzer - анализ фотографий с Claude Haiku Vision через OpenRouter
 *
 * Категоризация фото для демо-сайтов:
 * - hero: главный баннер (качественное фото студии/занятия)
 * - gallery: галерея (общие фото)
 * - instructors: тренеры (портреты взрослых)
 * - atmosphere: атмосфера (интерьер, детали)
 * - stories: до/после (если применимо)
 *
 * Стоимость: ~$0.0002 за фото (Claude Haiku Vision через OpenRouter)
 */
// OpenRouter API для Claude Haiku Vision
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Модель Claude Haiku для vision (самая дешёвая с поддержкой изображений)
const VISION_MODEL = 'anthropic/claude-3-haiku';
/**
 * Предварительная фильтрация фото без AI
 * Отсеивает явно неподходящие фото
 */
export function prefilterPhotos(photos) {
    return photos.filter(photo => {
        // Минимальный размер 400px по любой стороне
        if (photo.width && photo.width < 400)
            return false;
        if (photo.height && photo.height < 400)
            return false;
        // Пропускаем очевидные логотипы/иконки (квадратные маленькие)
        if (photo.width && photo.height) {
            const ratio = photo.width / photo.height;
            // Слишком узкие или высокие - вероятно баннеры/рекламы
            if (ratio < 0.3 || ratio > 3)
                return false;
        }
        return true;
    });
}
/**
 * Анализирует одно фото с Claude Haiku Vision через OpenRouter
 */
async function analyzePhoto(imageUrl, niche = 'fitness') {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY не установлен');
    }
    const nicheContext = {
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
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://fitwebai.ru',
                'X-Title': 'FitWebAI Photo Analyzer',
            },
            body: JSON.stringify({
                model: VISION_MODEL,
                max_tokens: 200,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl,
                                },
                            },
                            {
                                type: 'text',
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        // Парсим ответ (OpenAI-совместимый формат)
        const text = data.choices?.[0]?.message?.content || '';
        const tokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
        // Извлекаем JSON из ответа
        const jsonMatch = text.match(/\{[\s\S]*\}/);
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
    }
    catch (error) {
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
 */
export async function analyzePhotos(photos, niche = 'fitness', limit = 25) {
    // Предварительная фильтрация
    const filtered = prefilterPhotos(photos).slice(0, limit);
    console.log(`📷 Анализ ${filtered.length} фото (из ${photos.length})...`);
    const results = [];
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
        }
        catch (error) {
            console.error(`   ⚠️ Ошибка фото ${i + 1}:`, error);
            results.push({
                url: photo.url,
                category: 'gallery',
                confidence: 0.3,
            });
        }
    }
    // Примерная стоимость OpenRouter Claude Haiku Vision
    // ~$0.00025 за 1K input tokens + $0.00125 за 1K output tokens
    const estimatedCost = (totalTokens / 1000) * 0.0005; // Усреднённая цена
    console.log(`✅ Анализ завершён: ${results.length} фото, ~$${estimatedCost.toFixed(4)}`);
    return {
        photos: results,
        totalCost: estimatedCost,
        totalTokens,
    };
}
/**
 * Распределяет проанализированные фото по секциям сайта
 */
export function distributePhotos(analyzed) {
    // Фильтруем skip и сортируем по confidence
    const valid = analyzed
        .filter(p => p.category !== 'skip' && p.quality !== 'low')
        .sort((a, b) => b.confidence - a.confidence);
    const result = {
        hero: [],
        gallery: [],
        instructors: [],
        atmosphere: [],
    };
    for (const photo of valid) {
        switch (photo.category) {
            case 'hero':
                if (result.hero.length < 3)
                    result.hero.push(photo);
                else
                    result.gallery.push(photo);
                break;
            case 'instructors':
                if (result.instructors.length < 6)
                    result.instructors.push(photo);
                else
                    result.gallery.push(photo);
                break;
            case 'atmosphere':
                if (result.atmosphere.length < 8)
                    result.atmosphere.push(photo);
                else
                    result.gallery.push(photo);
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
        if (best)
            result.hero.push(best);
    }
    return result;
}
