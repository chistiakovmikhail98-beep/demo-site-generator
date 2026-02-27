import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SiteConfig, Niche, ColorScheme, UploadedFile } from '../types.js';
import { saveTokenStats, saveAiCost } from './supabase.js';
import fs from 'fs/promises';

// Цены Gemini 3 Flash Preview за 1M токенов
const GEMINI_PRICING = {
  input: 0.50,
  output: 3.00,
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
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 32000,
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
        // Читаем файл: HTTP URL → fetch, локальный путь → fs.readFile
        let imageData: Buffer;
        if (imageFile.path.startsWith('http://') || imageFile.path.startsWith('https://')) {
          const resp = await fetch(imageFile.path);
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} при загрузке ${imageFile.path}`);
          }
          imageData = Buffer.from(await resp.arrayBuffer());
        } else {
          imageData = await fs.readFile(imageFile.path);
        }
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

  // Промпт для генерации — детальная JSON-схема для Gemini 3 Flash
  parts.push({
    text: `
Сгенерируй ПОЛНЫЙ JSON для сайта студии. ВАЖНО: заполни ВСЕ секции полностью, не пропускай поля!

{
  "brand": {
    "name": "${name}",
    "tagline": "Короткий слоган 3-6 слов",
    "niche": "${niche}",
    "city": "Город (извлеки из названия/описания)",
    "heroTitle": "КРЕАТИВНЫЙ заголовок 3-7 слов",
    "heroSubtitle": "Акцент 2-4 слова",
    "heroDescription": "1-2 предложения без клише",
    "heroImage": "",
    "heroQuote": "Цитата или пустая строка"
  },
  "sections": {
    "colorScheme": ${imageFiles.length > 0 ? '{"primary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex"}' : 'null'},
    "heroAdvantages": ["Преимущество 1", "Преимущество 2", "Преимущество 3"],
    "directions": [
      {"id": "dir-0", "title": "Название", "image": "", "description": "Описание направления 2-3 предложения", "tags": ["тег1", "тег2"], "level": "Все уровни", "duration": "60 мин", "category": "dance", "complexity": 3, "buttonText": "Записаться"}
    ],
    "instructors": [
      {"name": "Имя Фамилия", "image": "", "specialties": ["Специализация 1", "Специализация 2"], "experience": "5 лет опыта", "style": "Описание стиля работы"}
    ],
    "stories": [
      {"beforeImg": "", "afterImg": "", "title": "Имя, результат", "description": "История успеха 2-3 предложения"}
    ],
    "faq": [
      {"question": "Вопрос?", "answer": "Развёрнутый ответ 2-3 предложения"}
    ],
    "requests": [
      {"image": "", "text": "Запрос клиента"}
    ],
    "objections": [
      {"myth": "Миф/возражение клиента", "answer": "Развёрнутый ответ на возражение"}
    ],
    "advantages": [
      {"title": "Заголовок преимущества", "text": "Описание преимущества 1-2 предложения", "image": ""}
    ],
    "director": {
      "name": "Имя Фамилия", "title": "Основатель студии", "description": "Описание директора 2-3 предложения",
      "image": "", "achievements": ["Достижение 1", "Достижение 2", "Достижение 3"]
    },
    "contacts": {
      "phone": "+7 (XXX) XXX-XX-XX", "email": "", "address": "Адрес студии",
      "telegram": "", "whatsapp": "", "vk": "", "instagram": ""
    },
    "pricing": [
      {"name": "Название тарифа", "price": "2500 ₽", "period": "/мес", "features": ["Включено 1", "Включено 2", "Включено 3"], "highlighted": false, "category": ""}
    ],
    "reviews": [
      {"name": "Имя", "text": "Текст отзыва 2-3 предложения", "source": "VK", "rating": 5}
    ],
    "gallery": [],
    "quiz": {
      "managerName": "Имя Фамилия",
      "managerImage": "",
      "tips": ["Подсказка 1", "Подсказка 2"],
      "steps": [
        {"question": "Вопрос квиза?", "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"]}
      ]
    },
    "atmosphere": [
      {"title": "Заголовок", "description": "Описание атмосферы", "image": ""}
    ],
    "calculatorStages": [
      {"status": "Название стадии", "description": "Описание стадии 1-2 предложения", "tags": ["тег1", "тег2", "тег3"], "achievement": "Достижение на этой стадии"}
    ],
    "sectionTitles": {
      "calculator": {"title": "Как меняется тело", "subtitle": "Трансформация", "buttonText": "Начать"},
      "directions": {"title": "{count} направлений", "subtitle": "в одной студии"},
      "pricing": {"title": "Прозрачные цены", "subtitle": "без скрытых платежей"}
    },
    "directionsTabs": [
      {"key": "all", "label": "Все"},
      {"key": "group", "label": "Групповые", "category": "dance"},
      {"key": "personal", "label": "Индивидуальные", "category": "body"}
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

ТРЕБОВАНИЯ К КОНТЕНТУ:
- directions: 6-10 направлений РЕЛЕВАНТНЫХ НИШЕ "${niche}" (см. guidelines выше)
- category для directions: "dance" (групповые), "body" (индивидуальные), "beginner" (восстановление), "special" (специализированные), "wellness" (спа/wellness), "online" (онлайн)
- instructors: 2-4 инструктора. ЕСЛИ имена НЕ указаны — используй "Имя Фамилия" (placeholder)
- stories: 2 истории успеха
- faq: 5-6 вопросов РЕЛЕВАНТНЫХ НИШЕ
- requests: 12 запросов клиентов РЕЛЕВАНТНЫХ НИШЕ (короткие фразы из 3-6 слов)
- objections: 3 возражения с развёрнутыми ответами РЕЛЕВАНТНЫМИ НИШЕ
- advantages: 4-6 преимуществ студии
- director: ЕСЛИ имя НЕ указано — используй "Имя Фамилия" (placeholder)
- pricing: 4-6 тарифов (разовые, абонементы, персональные). Цены РЕАЛИСТИЧНЫЕ для ниши. Один тариф highlighted: true
- reviews: 6 отзывов. Имена в формате "Имя К." (сокращённая фамилия). Тексты позитивные, релевантные нише
- gallery: пустой массив [] (фото подставятся автоматически)
- quiz.steps: 5-7 штук (КАЖДЫЙ шаг ОБЯЗАТЕЛЬНО с 3-4 options!). Вопросы РЕЛЕВАНТНЫ нише
- quiz.tips: 5-7 подсказок менеджера (по одной на каждый шаг!)
- atmosphere: 4 шага описания атмосферы студии
- directionsTabs: 4-6 табов для фильтрации направлений. Первый всегда { key: "all", label: "Все" }. Остальные по категориям

🔥 calculatorStages: ОБЯЗАТЕЛЬНО 4 СТАДИИ ФИЗИЧЕСКОГО РАЗВИТИЯ ТЕЛА!
ЭТО ПРОГРЕСС УЧЕНИКА ОТ НОВИЧКА К МАСТЕРУ, А НЕ СПИСОК СТИЛЕЙ/НАПРАВЛЕНИЙ!

❌ ЗАПРЕЩЕНО для calculatorStages:
- Названия танцевальных стилей: "Хип-хоп", "Контемп", "Джаз-фанк"
- Generic слова: "Этап 1", "Раскрепощение", "Адаптация", "Прогресс", "Мастерство"
- Названия упражнений/тренировок: "Кардио", "Силовая"

✅ ПРИМЕРЫ правильных calculatorStages (от новичка к мастеру):
* Для танцев: "Базовая координация" → "Связки движений" → "Музыкальность" → "Импровизация"
* Для растяжки: "Подвижность суставов" → "Глубокие наклоны" → "Полушпагат" → "Полный шпагат"
* Для фитнеса: "Техника упражнений" → "Рост силы" → "Выносливость" → "Рельеф тела"
* Для pole: "Хват и базовые крутки" → "Перевороты" → "Трюки на высоте" → "Связки и хореография"

СТРУКТУРА КАЖДОГО calculatorStage:
- status: название УРОВНЯ развития (2-4 слова)
- description: что ФИЗИЧЕСКИ происходит с телом на этом этапе (2-3 предложения)
- tags: 3 конкретных НАВЫКА этого этапа (НЕ абстрактные слова!)
- achievement: ИЗМЕРИМЫЙ результат ("Шпагат -10см", "8 базовых элементов", "30 минут без отдыха")

🎯 sectionTitles:
- calculator: title УНИКАЛЬНЫЙ (НЕ "Как меняется тело"!), subtitle отражает специфику студии, buttonText — призыв к действию
- directions: title используй "{count} направлений", subtitle релевантный нише
- pricing: title и subtitle релевантные нише

ОТВЕТЬ ТОЛЬКО ВАЛИДНЫМ JSON БЕЗ MARKDOWN-ОБЁРТКИ! НЕ оборачивай в \`\`\`json!`,
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
        saveTokenStats('gemini-3-flash-preview', inputTokens, outputTokens, estimatedCost).catch(console.error);
        saveAiCost({
          type: 'content_generation',
          model: 'gemini-3-flash-preview',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          cost_usd: estimatedCost,
          description: `Content generation with ${imageFiles.length} photos`,
        }).catch(console.error);
      }

      const content = response.text();

      // Дебаг: логируем размер и finishReason
      const finishReason = response.candidates?.[0]?.finishReason;
      console.log(`📝 Ответ: ${content.length} символов, finishReason: ${finishReason}`);
      if (content.length < 3000) {
        console.warn(`⚠️ Короткий ответ! Первые 500 символов: ${content.substring(0, 500)}`);
      }

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

      // Нормализуем ответ Gemini — поля могут быть с другими именами
      const sec = parsed.sections;

      // instructors: specialization→specialties, photo→image
      if (Array.isArray(sec.instructors)) {
        sec.instructors = sec.instructors.map((inst: any) => ({
          name: inst.name || 'Имя Фамилия',
          image: inst.image || inst.photo || '',
          specialties: inst.specialties || (inst.specialization ? [inst.specialization] : []),
          experience: inst.experience || '',
          style: inst.style || '',
        }));
      }

      // pricing: title→name
      if (Array.isArray(sec.pricing)) {
        sec.pricing = sec.pricing.map((p: any) => ({
          name: p.name || p.title || '',
          price: p.price || '',
          period: p.period || '',
          features: Array.isArray(p.features) ? p.features : [],
          highlighted: p.highlighted || false,
          category: p.category || '',
        }));
      }

      // reviews: clientName→name
      if (Array.isArray(sec.reviews)) {
        sec.reviews = sec.reviews.map((r: any) => ({
          name: r.name || r.clientName || '',
          text: r.text || '',
          source: r.source || '',
          rating: r.rating || 5,
        }));
      }

      // objections: objection→myth
      if (Array.isArray(sec.objections)) {
        sec.objections = sec.objections.map((o: any) => ({
          myth: o.myth || o.objection || '',
          answer: o.answer || '',
        }));
      }

      // requests: string[] → {image, text}[]
      if (Array.isArray(sec.requests)) {
        sec.requests = sec.requests.map((r: any) => {
          if (typeof r === 'string') {
            return { image: '', text: r };
          }
          return { image: r.image || '', text: r.text || '' };
        });
      }

      // atmosphere: string[] → {title, description, image}[]
      if (Array.isArray(sec.atmosphere)) {
        sec.atmosphere = sec.atmosphere.map((a: any) => {
          if (typeof a === 'string') {
            return { title: a, description: '', image: '' };
          }
          return { title: a.title || '', description: a.description || '', image: a.image || '' };
        });
      }

      // director: photo→image, position→title, quote→description
      if (sec.director && typeof sec.director === 'object') {
        sec.director = {
          name: sec.director.name || 'Имя Фамилия',
          title: sec.director.title || sec.director.position || '',
          description: sec.director.description || sec.director.quote || '',
          image: sec.director.image || sec.director.photo || '',
          achievements: sec.director.achievements || [],
        };
      }

      // stories: normalize fields
      if (Array.isArray(sec.stories)) {
        sec.stories = sec.stories.map((st: any) => ({
          beforeImg: st.beforeImg || st.beforeAfterPhoto || '',
          afterImg: st.afterImg || st.beforeAfterPhoto || '',
          title: st.title || st.clientName || '',
          description: st.description || st.story || '',
        }));
      }

      // advantages: icon→image
      if (Array.isArray(sec.advantages)) {
        sec.advantages = sec.advantages.map((a: any) => ({
          title: a.title || '',
          text: a.text || a.description || '',
          image: a.image || '',
        }));
      }

      // quiz: ensure steps[].options is always array
      if (sec.quiz && Array.isArray(sec.quiz.steps)) {
        sec.quiz.steps = sec.quiz.steps.map((step: any) => ({
          question: step.question || '',
          options: Array.isArray(step.options) ? step.options : [],
        }));
      }

      // calculatorStages: title→status, ensure tags/achievement
      if (Array.isArray(sec.calculatorStages)) {
        sec.calculatorStages = sec.calculatorStages.map((s: any) => ({
          status: s.status || s.title || '',
          description: s.description || '',
          tags: Array.isArray(s.tags) ? s.tags : [],
          achievement: s.achievement || '',
        }));
      }

      // directions: ensure all expected fields
      if (Array.isArray(sec.directions)) {
        sec.directions = sec.directions.map((d: any, i: number) => ({
          id: d.id || `dir-${i}`,
          title: d.title || '',
          image: d.image || '',
          description: d.description || '',
          tags: Array.isArray(d.tags) ? d.tags : [],
          level: d.level || 'Все уровни',
          duration: d.duration || '60 мин',
          category: d.category || 'all',
          complexity: d.complexity || 3,
        }));
      }

      const siteConfig: SiteConfig = {
        meta: {
          projectId: '',
          slug: generateSlug(name),
          createdAt: new Date().toISOString(),
        },
        brand: parsed.brand,
        sections: {
          ...sec,
          colorScheme: colorScheme || sec.colorScheme,
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
