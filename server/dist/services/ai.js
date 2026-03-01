import OpenAI from 'openai';
import { saveTokenStats, saveAiCost } from './supabase.js';
import { generateSiteConfigWithGemini } from './gemini.js';
// Маппинг моделей на OpenRouter ID
const MODEL_MAP = {
    'deepseek': 'deepseek/deepseek-chat',
    'gpt4o-mini': 'openai/gpt-4o-mini',
    'sonnet': 'anthropic/claude-3.5-sonnet',
    'gemini-3-flash': 'gemini-3-flash', // Прямой Gemini API
};
// Цены за 1M токенов (input/output)
const PRICING_MAP = {
    'deepseek': { input: 0.14, output: 0.28 },
    'gpt4o-mini': { input: 0.15, output: 0.60 },
    'sonnet': { input: 3, output: 15 },
    'gemini-3-flash': { input: 0.50, output: 3.00 }, // Gemini 3 Flash Preview цены
};
// Модель по умолчанию (переключаем на Gemini!)
const DEFAULT_MODEL = 'gemini-3-flash';
// Глобальный счётчик
export const tokenStats = {
    total: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
    },
    requests: 0,
    byProject: new Map(),
};
// Активная модель для текущего запроса (устанавливается перед вызовом)
let currentPricing = PRICING_MAP['gpt4o-mini'];
function trackUsage(usage, projectId, modelName, costType = 'content_generation') {
    if (!usage) {
        return { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 };
    }
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || 0;
    const estimatedCost = (promptTokens / 1_000_000) * currentPricing.input +
        (completionTokens / 1_000_000) * currentPricing.output;
    // Обновляем глобальную статистику (in-memory, сбрасывается при рестарте)
    tokenStats.total.promptTokens += promptTokens;
    tokenStats.total.completionTokens += completionTokens;
    tokenStats.total.totalTokens += totalTokens;
    tokenStats.total.estimatedCost += estimatedCost;
    tokenStats.requests++;
    // Сохраняем для проекта (in-memory)
    if (projectId) {
        const existing = tokenStats.byProject.get(projectId) || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            estimatedCost: 0,
        };
        tokenStats.byProject.set(projectId, {
            promptTokens: existing.promptTokens + promptTokens,
            completionTokens: existing.completionTokens + completionTokens,
            totalTokens: existing.totalTokens + totalTokens,
            estimatedCost: existing.estimatedCost + estimatedCost,
        });
    }
    const model = modelName || 'unknown';
    // 💾 Сохраняем в Supabase: старая таблица (агрегация по дням)
    saveTokenStats(model, promptTokens, completionTokens, estimatedCost).catch(err => {
        console.error('⚠️ Не удалось сохранить статистику в БД:', err);
    });
    // 💾 Сохраняем в Supabase: новая таблица ai_costs (детально по проектам)
    saveAiCost({
        project_id: projectId,
        type: costType,
        model,
        input_tokens: promptTokens,
        output_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: estimatedCost,
        description: `${costType} via ${model}`,
    }).catch(err => {
        console.error('⚠️ Не удалось сохранить AI cost:', err);
    });
    console.log(`💰 Токены: ${promptTokens} in + ${completionTokens} out = ${totalTokens} | ~$${estimatedCost.toFixed(4)}`);
    return { promptTokens, completionTokens, totalTokens, estimatedCost };
}
// Ленивая инициализация клиента (после загрузки .env)
let openaiClient = null;
function getOpenAI() {
    if (!openaiClient) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY не установлен в .env');
        }
        console.log('🔑 Инициализация OpenRouter с ключом:', apiKey.substring(0, 20) + '...');
        openaiClient = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey,
            defaultHeaders: {
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'Demo Site Generator',
            },
        });
    }
    return openaiClient;
}
export async function generateSiteConfig(input) {
    const { name, niche, description, imageFiles, colorScheme, aiModel } = input;
    // Debug: показать какая модель запрошена
    console.log(`🔍 generateSiteConfig вызван: aiModel=${JSON.stringify(aiModel)}, DEFAULT=${DEFAULT_MODEL}`);
    // Если aiModel не указан, null или undefined — используем Gemini
    const effectiveModel = aiModel || DEFAULT_MODEL;
    const modelKey = (effectiveModel in MODEL_MAP ? effectiveModel : DEFAULT_MODEL);
    console.log(`🔍 modelKey=${modelKey}`);
    // 🚀 Если Gemini — используем прямой Gemini API с Agentic Vision
    if (modelKey === 'gemini-3-flash') {
        console.log(`🚀 Переключение на Gemini 3 Flash (с анализом ${imageFiles.length} фото)`);
        return generateSiteConfigWithGemini(input);
    }
    // Остальные модели через OpenRouter
    // Устанавливаем цены для трекинга
    currentPricing = PRICING_MAP[modelKey];
    const modelId = MODEL_MAP[modelKey];
    console.log(`🤖 Используем модель: ${modelId} (запрошено: ${aiModel})`);
    const messages = [];
    // Системный промпт
    const systemPrompt = `Ты — ЛУЧШИЙ копирайтер и маркетолог для фитнес-индустрии. Твоя задача — создать ПРОДАЮЩИЙ, УНИКАЛЬНЫЙ контент.

Ниша: ${getNicheDescription(niche)}

🔥 КРИТИЧЕСКИ ВАЖНО — УНИКАЛЬНОСТЬ:
- Генерируй контент на РУССКОМ языке
- КАЖДЫЙ сайт должен быть УНИКАЛЬНЫМ! НЕ используй шаблонные фразы типа "Добро пожаловать", "Мы рады"
- heroTitle должен быть КРЕАТИВНЫМ и ЦЕПЛЯЮЩИМ — используй боли/желания клиента
- heroSubtitle — яркий акцент, 2-4 слова, вызывающие эмоции
- heroDescription — короткий, продающий текст БЕЗ клише

💡 ПРИМЕРЫ ХОРОШИХ heroTitle (для вдохновения):
- "Твоё тело. Твои правила." (фитнес)
- "Раскрой свою пластику" (танцы)
- "Гибкость без боли" (растяжка)
- "Сила в спокойствии" (йога)

⚡ СТИЛЬ ТЕКСТОВ:
- Короткие предложения. Без воды.
- Глаголы в повелительном наклонении: "Приходи", "Попробуй", "Почувствуй"
- Используй цифры и факты где возможно
- Преимущества формулируй как РЕЗУЛЬТАТЫ для клиента
- Если НЕТ информации о человеке — используй placeholder "Имя Фамилия" (НЕ выдумывай!)

🎯 КОНТЕНТ ПО НИШЕ "${niche}":
${getNicheGuidelines(niche)}

Формат ответа — ТОЛЬКО валидный JSON без markdown-обёртки.`;
    messages.push({ role: 'system', content: systemPrompt });
    // Контент пользователя
    const userContent = [];
    let textPart = `Название студии: ${name}\n`;
    if (description) {
        textPart += `\nОписание:\n${description}\n`;
    }
    userContent.push({ type: 'text', text: textPart });
    // Примечание: изображения НЕ отправляются в AI
    // Они будут подставлены напрямую в builder.ts по типу блока (hero, gallery, etc.)
    if (imageFiles.length > 0) {
        console.log(`📷 Загружено ${imageFiles.length} фото (будут подставлены в builder)`);
    }
    // Промпт для генерации новой структуры
    userContent.push({
        type: 'text',
        text: `
Сгенерируй JSON для сайта студии со следующей структурой:

{
  "brand": {
    "name": "${name}",
    "tagline": "Короткий слоган 3-6 слов",
    "niche": "${niche}",
    "city": "Город из названия/описания/адреса (например: Оренбург, Москва, СПб). ОБЯЗАТЕЛЬНО извлеки город если он есть в тексте!",
    "heroTitle": "КРЕАТИВНЫЙ заголовок 3-7 слов. НЕ 'Добро пожаловать'! Используй боль/желание клиента",
    "heroSubtitle": "Яркий акцент 2-4 слова с эмоцией (например: 'Твоя сила', 'Без границ', 'Начни сегодня')",
    "heroDescription": "1-2 коротких предложения БЕЗ клише. Конкретика и результат для клиента",
    "heroImage": "https://placehold.co/800x600/1a1a1a/666666?text=Фото+студии",
    "heroQuote": "Вдохновляющая цитата для главного экрана (или пустая строка)"
  },
  "sections": {
    "heroAdvantages": [
      "Преимущество 1 для hero-секции",
      "Преимущество 2",
      "Преимущество 3"
    ],
    "directions": [
      {
        "id": "yoga",
        "title": "Йога",
        "image": "https://placehold.co/800x600/1a1a1a/666666?text=Фото+направления",
        "description": "Описание направления 2-3 предложения",
        "tags": ["Mind & Body", "Гибкость", "Тонус"],
        "level": "Любой",
        "duration": "60 мин",
        "category": "dance",
        "complexity": 3,
        "buttonText": "Записаться"
      }
    ],
    "instructors": [
      {
        "name": "Имя Фамилия",
        "image": "https://placehold.co/400x500/1a1a1a/666666?text=Фото+тренера",
        "specialties": ["Йога", "Пилатес"],
        "experience": "5+ лет",
        "style": "Мягкий подход"
      }
    ],
    "stories": [
      {
        "beforeImg": "https://placehold.co/400x500/1a1a1a/666666?text=ДО",
        "afterImg": "https://placehold.co/400x500/1a1a1a/666666?text=ПОСЛЕ",
        "title": "История успеха: Имя",
        "description": "Описание результата"
      }
    ],
    "faq": [
      { "question": "Вопрос?", "answer": "Ответ" }
    ],
    "requests": [
      { "image": "https://placehold.co/100x100/1a1a1a/666666?text=Клиент", "text": "Запрос клиента" }
    ],
    "objections": [
      { "myth": "Миф/возражение", "answer": "Ответ на возражение" }
    ],
    "advantages": [
      {
        "title": "Преимущество",
        "text": "Описание преимущества",
        "image": "https://placehold.co/600x400/1a1a1a/666666?text=Преимущество"
      }
    ],
    "director": {
      "name": "Имя основателя",
      "title": "Основатель студии",
      "description": "Описание 2-3 предложения",
      "achievements": ["Достижение 1", "Достижение 2"],
      "image": "https://placehold.co/600x700/1a1a1a/666666?text=Фото+директора"
    },
    "contacts": {
      "phone": "+7 (XXX) XXX-XX-XX",
      "email": "info@studio.ru",
      "address": "Адрес студии",
      "addressDetails": "Дополнительно (этаж, ТЦ)",
      "telegram": "@username",
      "vk": "https://vk.com/..."
    },
    "pricing": [
      {
        "name": "Разовое занятие",
        "price": "1000 ₽",
        "period": "за занятие",
        "features": ["Групповое занятие", "60 минут"],
        "highlighted": false,
        "category": "групповые"
      },
      {
        "name": "Абонемент 8 занятий",
        "price": "6400 ₽",
        "period": "в месяц",
        "features": ["8 групповых занятий", "Срок 30 дней", "Заморозка 7 дней"],
        "highlighted": true,
        "category": "абонементы"
      }
    ],
    "reviews": [
      {
        "name": "Имя К.",
        "text": "Текст отзыва о студии",
        "source": "Яндекс Карты",
        "rating": 5
      }
    ],
    "gallery": [
      "https://placehold.co/600x400/1a1a1a/666666?text=Фото+зала+1",
      "https://placehold.co/600x400/1a1a1a/666666?text=Фото+зала+2"
    ],
    "quiz": {
      "managerName": "Имя Фамилия",
      "managerImage": "https://placehold.co/200x200/1a1a1a/666666?text=Менеджер",
      "tips": [
        "Подсказка менеджера 1",
        "Подсказка менеджера 2"
      ],
      "steps": [
        {
          "question": "Какая у вас цель?",
          "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Другое"]
        }
      ]
    },
    "atmosphere": [
      {
        "title": "Уютное пространство",
        "description": "Описание атмосферы студии",
        "image": "https://placehold.co/600x400/1a1a1a/666666?text=Атмосфера+студии"
      }
    ],
    "calculatorStages": [
      {
        "status": "УНИКАЛЬНОЕ название этапа на основе направлений студии",
        "description": "Что конкретно происходит с телом — специфика ниши",
        "tags": ["ТехническийТермин1", "ТехническийТермин2", "ТехническийТермин3"],
        "achievement": "Измеримый результат (например: '8 базовых элементов')"
      }
    ],
    "sectionTitles": {
      "calculator": {
        "title": "УНИКАЛЬНЫЙ заголовок трансформации (НЕ 'Как меняется тело'!)",
        "subtitle": "Подзаголовок отражающий специфику студии",
        "buttonText": "Призыв к действию релевантный нише"
      },
      "directions": {
        "title": "{count} направлений",
        "subtitle": "в одной студии"
      },
      "pricing": {
        "title": "Прозрачные цены",
        "subtitle": "без скрытых платежей"
      }
    },
    "directionsTabs": [
      { "key": "all", "label": "Все" },
      { "key": "group", "label": "Групповые", "category": "dance" },
      { "key": "personal", "label": "Индивидуальные", "category": "body" }
    ],
    "blockVariants": {
      "hero": 1,
      "directions": 1,
      "gallery": 1,
      "instructors": 1,
      "stories": 1,
      "reviews": 1,
      "director": 1,
      "pricing": 1,
      "faq": 1,
      "objections": 1,
      "requests": 1,
      "advantages": 1,
      "atmosphere": 1
    }
  }
}

🎨 ВАРИАНТЫ БЛОКОВ (blockVariants):
Выбери визуальный вариант (1, 2 или 3) для каждого блока. НЕ ставь всем 1 — создавай разнообразие!

hero: 1=карта+фото сбоку, 2=фулскрин фон+статы, 3=сетка+метрики
directions: 1=грид карточки+фильтры, 2=горизонтальные строки, 3=карусель
gallery: 1=бесконечный маркиз, 2=masonry+лайтбокс, 3=главное фото+превью
instructors: 1=тёмные карты+CTA, 2=светлый грид+инста, 3=карусель+цитаты
stories: 1=до/после рядом, 2=полноширинный слайдер, 3=вертикальный таймлайн
reviews: 1=маркиз-скролл, 2=карточки грид, 3=спотлайт-цитата
director: 1=фото+достижения, 2=полноширинный баннер, 3=side-by-side
pricing: 1=мульти-план+премиум, 2=три колонки, 3=табы
faq: 1=сайдбар+аккордеон, 2=полноширинный аккордеон, 3=чат Q&A
objections: 1=миф/ответ карточки, 2=до/после тоггл, 3=аккордеон
requests: 1=маркиз строки, 2=облако пиллов, 3=грид+иконки
advantages: 1=фото-оверлей карты, 2=иконки минимализм, 3=бенто-грид
atmosphere: 1=scroll-sticky, 2=фото грид, 3=фулскрин слайдер

Критерии выбора:
- Ниша и стиль (танцы → более выразительные, фитнес → строгие)
- Количество контента (много направлений → грид, мало → карусель)
- Визуальное разнообразие между блоками!

ТРЕБОВАНИЯ:
- directions: 6-10 направлений РЕЛЕВАНТНЫХ НИШЕ "${niche}" (см. guidelines выше)
- category для directions: "dance" (групповые), "body" (индивидуальные), "beginner" (восстановление), "special" (специализированные), "wellness" (спа/wellness), "online" (онлайн)
- instructors: 2-4 инструктора. ЕСЛИ имена НЕ указаны — используй "Имя Фамилия" (placeholder)
- stories: 1-2 истории успеха
- faq: 4-6 вопросов РЕЛЕВАНТНЫХ НИШЕ
- requests: 12 запросов клиентов РЕЛЕВАНТНЫХ НИШЕ (короткие фразы)
- objections: 3 возражения с ответами РЕЛЕВАНТНЫХ НИШЕ
- advantages: 4-6 преимуществ студии
- director: ЕСЛИ имя НЕ указано — используй "Имя Фамилия" (placeholder)
- pricing: 4-6 тарифов (разовые, абонементы, персональные). Цены реалистичные для ниши. Один тариф highlighted: true
- reviews: 5-8 отзывов. Имена в формате "Имя К." (сокращённая фамилия). Тексты позитивные, релевантные нише
- gallery: 6-8 placeholder изображений с описательным текстом (Фото зала, Занятие, Интерьер и т.д.)
- quiz: 5-7 шагов квиза. Вопросы релевантны нише. managerName: "Имя Фамилия". tips: 5-7 подсказок менеджера
- atmosphere: 4 шага описания атмосферы студии с placeholder изображениями
- calculatorStages: ОБЯЗАТЕЛЬНО 4 СТАДИИ ФИЗИЧЕСКОГО РАЗВИТИЯ ТЕЛА!
  🔥 КРИТИЧЕСКИ ВАЖНО — ЭТО ПРОГРЕСС УЧЕНИКА, А НЕ СПИСОК СТИЛЕЙ/НАПРАВЛЕНИЙ!

  ❌ КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО:
  - Названия танцевальных стилей: "Хип-хоп", "Контемп", "Джаз-фанк"
  - Generic слова: "Этап 1", "Раскрепощение", "Адаптация", "Прогресс", "Мастерство"
  - Названия упражнений/тренировок: "Кардио", "Силовая"

  ✅ ДОЛЖНЫ БЫТЬ ЭТАПЫ ФИЗИЧЕСКОГО РАЗВИТИЯ (от новичка к мастеру):
  * Для танцев: "Базовая координация" → "Связки движений" → "Музыкальность" → "Импровизация"
  * Для растяжки: "Подвижность суставов" → "Глубокие наклоны" → "Полушпагат" → "Полный шпагат"
  * Для фитнеса: "Техника упражнений" → "Рост силы" → "Выносливость" → "Рельеф тела"
  * Для pole: "Хват и базовые крутки" → "Перевороты" → "Трюки на высоте" → "Связки и хореография"

  КАЖДЫЙ ЭТАП — ЭТО УРОВЕНЬ ФИЗИЧЕСКОГО РАЗВИТИЯ, а НЕ название стиля!

  СТРУКТУРА ЭТАПА:
  - status: название УРОВНЯ развития (2-4 слова), например "Базовая координация"
  - description: что ФИЗИЧЕСКИ происходит с телом на этом этапе (2-3 предложения)
  - tags: 3 конкретных НАВЫКА этого этапа (НЕ абстрактные слова!)
  - achievement: ИЗМЕРИМЫЙ результат ("Шпагат -10см", "8 базовых элементов", "30 минут без отдыха")
- sectionTitles: заголовки для секций калькулятора (title, subtitle, buttonText), направлений (title используй "{count} направлений", subtitle), цен (title, subtitle) — ВСЁ РЕЛЕВАНТНО НИШЕ!
- directionsTabs: 4-6 табов для фильтрации направлений (key, label, category). Первый всегда { key: "all", label: "Все" }. Остальные по категориям directions
- ВСЕ изображения: используй placeholder URL формата https://placehold.co/WxH/1a1a1a/666666?text=Описание (с пробелами как +)
- contacts: телефон в формате +7 (XXX) XXX-XX-XX, если нет данных — используй placeholder

ОТВЕТЬ ТОЛЬКО JSON!`,
    });
    messages.push({ role: 'user', content: userContent });
    // Retry логика для надёжности
    const maxRetries = 3;
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🤖 Генерация конфига (попытка ${attempt}/${maxRetries})...`);
            // Вызов API
            const openai = getOpenAI();
            const response = await openai.chat.completions.create({
                model: modelId,
                messages,
                max_tokens: 8000, // Увеличен лимит для больших ответов
                temperature: 0.85, // Повышена для креативности и уникальности
            });
            // Трекаем токены и сохраняем в БД
            trackUsage(response.usage, undefined, modelId);
            const content = response.choices[0]?.message?.content || '';
            // Парсим JSON
            let jsonStr = content.trim();
            // Убираем markdown обёртку
            if (jsonStr.startsWith('```json'))
                jsonStr = jsonStr.slice(7);
            if (jsonStr.startsWith('```'))
                jsonStr = jsonStr.slice(3);
            if (jsonStr.endsWith('```'))
                jsonStr = jsonStr.slice(0, -3);
            jsonStr = jsonStr.trim();
            // Проверяем что это валидный JSON объект
            if (!jsonStr.startsWith('{')) {
                console.error('AI вернул не JSON объект. Начало ответа:', jsonStr.substring(0, 200));
                throw new Error('Ответ AI не начинается с {');
            }
            // Проверяем что JSON не обрезан (заканчивается на })
            if (!jsonStr.endsWith('}')) {
                console.error('JSON обрезан! Конец ответа:', jsonStr.substring(jsonStr.length - 200));
                // Пробуем найти последнюю закрывающую скобку
                const lastBrace = jsonStr.lastIndexOf('}');
                if (lastBrace > 0) {
                    jsonStr = jsonStr.substring(0, lastBrace + 1);
                    console.log('Попытка обрезать до последней }');
                }
            }
            const parsed = JSON.parse(jsonStr);
            // Проверяем что есть нужные поля
            if (!parsed.brand || !parsed.sections) {
                console.error('JSON не содержит brand или sections');
                throw new Error('Неполный ответ AI');
            }
            const siteConfig = {
                meta: {
                    projectId: '',
                    slug: generateSlug(name),
                    createdAt: new Date().toISOString(),
                },
                brand: parsed.brand,
                sections: {
                    ...parsed.sections,
                    // Добавляем colorScheme если передана пользователем
                    colorScheme: colorScheme || parsed.sections.colorScheme,
                },
            };
            console.log(`✅ Конфиг успешно сгенерирован с попытки ${attempt}`);
            return siteConfig;
        }
        catch (err) {
            lastError = err;
            console.error(`=== ОШИБКА ПАРСИНГА JSON (попытка ${attempt}/${maxRetries}) ===`);
            console.error('Ошибка:', err);
            if (attempt < maxRetries) {
                console.log(`🔄 Повторная попытка через 1 сек...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    // Все попытки исчерпаны
    console.error('❌ Не удалось сгенерировать конфиг после всех попыток');
    throw lastError || new Error('Не удалось распарсить ответ AI');
}
function getNicheDescription(niche) {
    const descriptions = {
        fitness: 'Фитнес-студия — силовые тренировки, кардио, функциональный тренинг',
        dance: 'Танцевальная студия — танцы различных направлений',
        stretching: 'Студия растяжки — стретчинг, шпагат, гибкость, коррекция осанки',
        yoga: 'Йога-студия — йога, медитация, дыхательные практики',
        wellness: 'Wellness-центр — комплексный подход к здоровью и красоте',
    };
    return descriptions[niche];
}
function getNicheGuidelines(niche) {
    const guidelines = {
        dance: `- Направления: различные танцевальные стили (хип-хоп, contemporary, pole dance, high heels, bachata, strip plastic и т.д.)
- FAQ: про танцевальный опыт, одежду для танцев, выступления
- Преимущества: атмосфера, хореографы, творческое самовыражение
- Запросы: "Научиться красиво двигаться", "Раскрепоститься", "Выступить на сцене"
- НЕ добавляй: калькулятор калорий, коррекцию осанки, лечение спины`,
        fitness: `- Направления: силовые тренировки, кардио, функциональный тренинг, TRX, кроссфит
- FAQ: про питание, результаты, интенсивность тренировок
- Преимущества: оборудование, персональный подход, результаты
- Запросы: "Похудеть", "Набрать мышечную массу", "Повысить выносливость"`,
        stretching: `- Направления: шпагат, растяжка спины, гибкость, коррекция осанки, пилатес
- FAQ: про гибкость, боли в спине, возраст для занятий
- Преимущества: безопасный подход, работа с зажимами
- Запросы: "Сесть на шпагат", "Избавиться от боли в спине", "Улучшить осанку"`,
        yoga: `- Направления: хатха-йога, виньяса, кундалини, медитация, пранаяма
- FAQ: про медитацию, философию йоги, духовные практики
- Преимущества: mindfulness, баланс, внутренняя гармония
- Запросы: "Обрести спокойствие", "Научиться медитировать", "Снять стресс"`,
        wellness: `- Направления: массаж, SPA-процедуры, детокс, восстановление
- FAQ: про комплексные программы, противопоказания
- Преимущества: холистический подход, релаксация
- Запросы: "Полная перезагрузка", "Восстановить энергию", "Детокс"`,
    };
    return guidelines[niche];
}
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/[а-яё]/g, (char) => {
        const translitMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        };
        return translitMap[char] || char;
    })
        .substring(0, 30);
}
export async function parseRawText(rawText, aiModel = DEFAULT_MODEL) {
    const openai = getOpenAI();
    // Определяем модель
    const modelKey = (aiModel in MODEL_MAP ? aiModel : DEFAULT_MODEL);
    const modelId = MODEL_MAP[modelKey];
    currentPricing = PRICING_MAP[modelKey];
    console.log(`🔍 Парсинг через: ${modelId}`);
    const response = await openai.chat.completions.create({
        model: modelId,
        messages: [
            {
                role: 'system',
                content: `Ты парсер информации о фитнес/танцевальных/wellness студиях.

Из сырого текста извлеки:
1. Название студии (name)
2. Нишу (niche): stretching, dance, fitness, yoga, wellness
3. Описание (description) — вся полезная информация

Ответь ТОЛЬКО JSON:
{
  "name": "Название студии",
  "niche": "stretching",
  "description": "Полное описание со всеми деталями"
}

Если название не найдено — придумай на основе контекста.
Определи нишу по ключевым словам:
- stretching: растяжка, стретчинг, шпагат, гибкость (НЕ если есть танцы!)
- dance: танцы, хореография, pole dance, школа танцев, танцевальная, k-pop, джаз-фанк, бальные, хип-хоп, contemporary, балет
- fitness: фитнес, тренировки, силовые, кардио, тренажёрный зал
- yoga: йога, медитация, пранаяма, асаны
- wellness: спа, массаж, косметология

ВАЖНО: Если в тексте есть "танц", "dance", "хореограф" — ниша ОБЯЗАТЕЛЬНО dance!`
            },
            {
                role: 'user',
                content: rawText
            }
        ],
        max_tokens: 1000,
        temperature: 0.3,
    });
    // Трекаем токены и сохраняем в БД
    trackUsage(response.usage, undefined, modelId);
    const content = response.choices[0]?.message?.content || '';
    try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith('```json'))
            jsonStr = jsonStr.slice(7);
        if (jsonStr.startsWith('```'))
            jsonStr = jsonStr.slice(3);
        if (jsonStr.endsWith('```'))
            jsonStr = jsonStr.slice(0, -3);
        const parsed = JSON.parse(jsonStr.trim());
        return {
            name: parsed.name || 'Студия',
            niche: parsed.niche || 'stretching',
            description: parsed.description || rawText,
        };
    }
    catch (err) {
        console.error('Ошибка парсинга:', err);
        // Fallback
        return {
            name: 'Студия',
            niche: 'stretching',
            description: rawText,
        };
    }
}
