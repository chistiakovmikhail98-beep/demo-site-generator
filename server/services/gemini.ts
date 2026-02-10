import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SiteConfig, Niche, ColorScheme, UploadedFile } from '../types.js';
import { saveTokenStats, saveAiCost } from './supabase.js';
import fs from 'fs/promises';

// Цены Gemini 3 Flash за 1M токенов
const GEMINI_PRICING = {
  input: 0.10,
  output: 0.40,
};

// Ленивая инициализация клиента
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY не установлен в .env');
    }
    console.log('🔑 Инициализация Gemini API...');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

interface GenerateInput {
  name: string;
  niche: Niche;
  description?: string;
  imageFiles: UploadedFile[];
  textContent?: string;
  colorScheme?: ColorScheme;
}

export async function generateSiteConfigWithGemini(input: GenerateInput): Promise<SiteConfig> {
  const { name, niche, description, imageFiles, colorScheme } = input;

  const genAI = getGeminiClient();

  // Gemini 3 Flash с Agentic Vision
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash',
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 8000,
    },
  });

  console.log(`🤖 Используем модель: gemini-3-flash`);

  // Системный промпт (такой же как в ai.ts)
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

${imageFiles.length > 0 ? `\n📷 АНАЛИЗ ФОТО:\nПРОАНАЛИЗИРУЙ все ${imageFiles.length} фото студии. Используй Agentic Vision:\n- Извлеки ЦВЕТОВУЮ СХЕМУ из интерьера/брендинга (3-5 hex цветов)\n- Посчитай оборудование/залы (если видно)\n- Оцени уровень студии (премиум/средний/бюджетный) по интерьеру\n- Найди уникальные фишки (необычное оборудование, стиль)\n- Прочитай текст с фото (прайсы, расписания, акции)\n- Опиши атмосферу конкретными словами\n\nВСЕ описания и USP должны быть основаны на РЕАЛЬНОМ визуальном анализе!` : ''}

Формат ответа — ТОЛЬКО валидный JSON без markdown-обёртки.`;

  // Подготовка контента
  const parts: any[] = [];

  // Текстовая часть
  let textPart = `${systemPrompt}\n\nНазвание студии: ${name}\n`;
  if (description) {
    textPart += `\nОписание:\n${description}\n`;
  }

  // Добавляем изображения (НОВОЕ!)
  if (imageFiles.length > 0) {
    console.log(`📷 Отправка ${imageFiles.length} фото в Gemini для анализа...`);

    for (const imageFile of imageFiles) {
      try {
        // Читаем файл и конвертируем в base64
        const imageData = await fs.readFile(imageFile.path);
        const base64Image = imageData.toString('base64');

        // Определяем MIME type
        const mimeType = imageFile.path.endsWith('.png') ? 'image/png' : 'image/jpeg';

        parts.push({
          inlineData: {
            data: base64Image,
            mimeType,
          },
        });

        console.log(`  ✅ Добавлено фото: ${imageFile.label || imageFile.block} (${(imageData.length / 1024).toFixed(1)}KB)`);
      } catch (err) {
        console.error(`  ⚠️ Ошибка чтения фото ${imageFile.path}:`, err);
      }
    }
  }

  // Добавляем текст в конец (после фото)
  parts.push({ text: textPart });

  // Промпт для генерации
  parts.push({
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
    "colorScheme": ${imageFiles.length > 0 ? '"ОБЯЗАТЕЛЬНО извлеки 3-5 hex цветов из фото интерьера/брендинга! Формат: {\\"primary\\": \\"#hex\\", \\"secondary\\": \\"#hex\\", \\"accent\\": \\"#hex\\", \\"background\\": \\"#hex\\", \\"text\\": \\"#hex\\"}"' : 'null'},
    "heroAdvantages": [
      "Преимущество 1 для hero-секции (КОНКРЕТНОЕ, основанное на визуальном анализе фото!)",
      "Преимущество 2",
      "Преимущество 3"
    ],
    "directions": [...],
    "instructors": [...],
    "stories": [...],
    "faq": [...],
    "requests": [...],
    "objections": [...],
    "advantages": [...],
    "director": {...},
    "contacts": {...},
    "pricing": [...],
    "reviews": [...],
    "gallery": [...],
    "quiz": {...},
    "atmosphere": [...],
    "calculatorStages": [...],
    "sectionTitles": {...},
    "directionsTabs": [...]
  }
}

ТРЕБОВАНИЯ:
- ВСЕ описания должны быть основаны на РЕАЛЬНОМ визуальном анализе фото!
- Если фото загружены — colorScheme ОБЯЗАТЕЛЕН (извлеки из интерьера)!
- Упоминай КОНКРЕТНЫЕ детали с фото (количество залов, тренажеры, стиль интерьера)
- Используй Agentic Vision для подсчета объектов и извлечения текста
- directions: 6-10 направлений РЕЛЕВАНТНЫХ НИШЕ "${niche}"
- instructors: 2-4 инструктора. ЕСЛИ имена НЕ указаны — используй "Имя Фамилия"
- stories: 1-2 истории успеха
- faq: 4-6 вопросов РЕЛЕВАНТНЫХ НИШЕ
- requests: 12 запросов клиентов РЕЛЕВАНТНЫХ НИШЕ
- objections: 3 возражения с ответами РЕЛЕВАНТНЫХ НИШЕ
- advantages: 4-6 преимуществ студии (КОНКРЕТНЫХ, с фото!)
- pricing: 4-6 тарифов. Цены реалистичные. Один highlighted: true
- reviews: 5-8 отзывов
- gallery: 6-8 placeholder изображений
- quiz: 5-7 шагов квиза
- atmosphere: 4 шага описания атмосферы
- calculatorStages: ОБЯЗАТЕЛЬНО 4 СТАДИИ ФИЗИЧЕСКОГО РАЗВИТИЯ ТЕЛА!

ОТВЕТЬ ТОЛЬКО JSON!`,
  });

  // Retry логика
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Генерация конфига через Gemini (попытка ${attempt}/${maxRetries})...`);

      const result = await model.generateContent(parts);
      const response = result.response;

      // Получаем usage metadata
      const usageMetadata = response.usageMetadata;
      if (usageMetadata) {
        const inputTokens = usageMetadata.promptTokenCount || 0;
        const outputTokens = usageMetadata.candidatesTokenCount || 0;
        const totalTokens = usageMetadata.totalTokenCount || 0;

        const estimatedCost =
          (inputTokens / 1_000_000) * GEMINI_PRICING.input +
          (outputTokens / 1_000_000) * GEMINI_PRICING.output;

        console.log(`💰 Токены: ${inputTokens} in + ${outputTokens} out = ${totalTokens} | ~$${estimatedCost.toFixed(4)}`);

        // Сохраняем в БД
        saveTokenStats('gemini-3-flash', inputTokens, outputTokens, estimatedCost).catch(console.error);
        saveAiCost({
          type: 'content_generation',
          model: 'gemini-3-flash',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          cost_usd: estimatedCost,
          description: `Content generation with ${imageFiles.length} photos`,
        }).catch(console.error);
      }

      const content = response.text();

      // Парсим JSON
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      if (!jsonStr.startsWith('{')) {
        console.error('Gemini вернул не JSON объект. Начало ответа:', jsonStr.substring(0, 200));
        throw new Error('Ответ Gemini не начинается с {');
      }

      if (!jsonStr.endsWith('}')) {
        console.error('JSON обрезан! Конец ответа:', jsonStr.substring(jsonStr.length - 200));
        const lastBrace = jsonStr.lastIndexOf('}');
        if (lastBrace > 0) {
          jsonStr = jsonStr.substring(0, lastBrace + 1);
          console.log('Попытка обрезать до последней }');
        }
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.brand || !parsed.sections) {
        console.error('JSON не содержит brand или sections');
        throw new Error('Неполный ответ Gemini');
      }

      const siteConfig: SiteConfig = {
        meta: {
          projectId: '',
          slug: generateSlug(name),
          createdAt: new Date().toISOString(),
        },
        brand: parsed.brand,
        sections: {
          ...parsed.sections,
          colorScheme: colorScheme || parsed.sections.colorScheme,
        },
      };

      console.log(`✅ Конфиг успешно сгенерирован с попытки ${attempt}`);
      return siteConfig;

    } catch (err) {
      lastError = err as Error;
      console.error(`=== ОШИБКА ГЕНЕРАЦИИ (попытка ${attempt}/${maxRetries}) ===`);
      console.error('Ошибка:', err);

      if (attempt < maxRetries) {
        console.log(`🔄 Повторная попытка через 1 сек...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.error('❌ Не удалось сгенерировать конфиг после всех попыток');
  throw lastError || new Error('Не удалось распарсить ответ Gemini');
}

function getNicheDescription(niche: Niche): string {
  const descriptions: Record<Niche, string> = {
    fitness: 'Фитнес-студия — силовые тренировки, кардио, функциональный тренинг',
    dance: 'Танцевальная студия — танцы различных направлений',
    stretching: 'Студия растяжки — стретчинг, шпагат, гибкость, коррекция осанки',
    yoga: 'Йога-студия — йога, медитация, дыхательные практики',
    wellness: 'Wellness-центр — комплексный подход к здоровью и красоте',
  };
  return descriptions[niche];
}

function getNicheGuidelines(niche: Niche): string {
  const guidelines: Record<Niche, string> = {
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/[а-яё]/g, (char) => {
      const translitMap: Record<string, string> = {
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
