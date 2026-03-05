import type { SiteConfig, Niche, ColorScheme } from '../types';
import type { BuilderState } from './store';
import { getNichePreset } from './niches';
import { getPaletteById, COLOR_PALETTES } from './color-palettes';
import { nanoid } from '../utils';

/**
 * Convert builder state to SiteConfig (the format stored in PostgreSQL).
 * This produces the same structure that AI-worker generates from VK parsing.
 */
export function builderToSiteConfig(state: BuilderState): SiteConfig {
  const niche = state.niche || 'dance';
  const preset = getNichePreset(niche);
  const slug = generateSlug(state.studioInfo.name, state.studioInfo.city);
  const projectId = nanoid(10);

  // Resolve color scheme
  const palette = state.customColors
    ? {
        primary: state.customColors.primary,
        accent: state.customColors.accent,
        background: '#09090b',
        surface: '#18181b',
        text: '#f4f4f5',
      }
    : (getPaletteById(state.colorPresetId)?.colorScheme || COLOR_PALETTES[0].colorScheme);

  const colorScheme: ColorScheme = {
    primary: palette.primary,
    accent: palette.accent,
    background: palette.background,
    surface: palette.surface,
    text: palette.text,
  };

  // Build directions from niche preset
  const directions = preset.defaultDirections.map((d, i) => ({
    id: `dir-${i + 1}`,
    title: d.title,
    image: '',
    description: d.description,
    tags: d.tags,
    level: d.complexity <= 1 ? 'Начинающий' : d.complexity === 2 ? 'Средний' : 'Продвинутый',
    duration: d.duration,
    category: d.category as any,
    complexity: d.complexity,
  }));

  // Build advantages from niche preset
  const advantages = preset.defaultAdvantages.map(a => ({
    title: a.title,
    text: a.text,
    image: '',
  }));

  // Parse pricing from free-text input
  const pricing = parsePricingInfo(state.pricingInfo);

  // Build block variants
  const blockVariants: Record<string, 1 | 2 | 3> = {};
  for (const blockId of state.selectedBlocks) {
    blockVariants[blockId] = state.blockVariants[blockId] || 1;
  }

  return {
    meta: {
      projectId,
      slug,
      createdAt: new Date().toISOString(),
    },
    brand: {
      name: state.studioInfo.name || 'Моя студия',
      tagline: preset.defaultSlogan,
      niche,
      city: state.studioInfo.city,
      heroTitle: state.heroTitle || preset.defaultSlogan,
      heroSubtitle: state.heroSubtitle || '',
      heroDescription: state.studioInfo.description || '',
      heroImage: '',
    },
    sections: {
      heroAdvantages: preset.heroAdvantages,
      directions,
      instructors: [],
      stories: [],
      faq: getDefaultFaq(niche),
      requests: getDefaultRequests(niche),
      objections: getDefaultObjections(niche),
      advantages,
      director: {
        name: '',
        title: 'Основатель',
        description: '',
        achievements: [],
        image: '',
      },
      contacts: {
        phone: state.studioInfo.phone,
        email: state.studioInfo.email,
        address: state.studioInfo.address,
        telegram: state.studioInfo.telegram,
        vk: state.studioInfo.vk,
        instagram: state.studioInfo.instagram,
        whatsapp: state.studioInfo.whatsapp,
      },
      pricing,
      reviews: [],
      gallery: [],
      quiz: {
        managerName: 'Менеджер',
        managerImage: '',
        tips: ['Подберём направление', 'Составим расписание', 'Бесплатная консультация'],
        steps: [
          { question: 'Какой у вас опыт?', options: ['Нулевой', 'Немного занимался(ась)', 'Есть опыт', 'Профессиональный'] },
          { question: 'Какова ваша цель?', options: ['Для удовольствия', 'Для здоровья', 'Для фигуры', 'Профессиональное развитие'] },
          { question: 'Удобное время?', options: ['Утро', 'День', 'Вечер', 'Выходные'] },
        ],
      },
      atmosphere: [],
      colorScheme,
      blockVariants,
      sectionTitles: {},
    },
  };
}

function generateSlug(name: string, city: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };

  const skipWords = new Set([
    'студия', 'школа', 'центр', 'клуб', 'зал', 'дом',
    'фитнес', 'танцы', 'танца', 'йога', 'растяжка', 'спорт',
    'dance', 'studio', 'fitness', 'yoga', 'stretch',
    'для', 'детей', 'взрослых', 'и', 'в', 'на', 'г',
  ]);

  const fullText = `${name} ${city}`.trim().toLowerCase();
  if (!fullText) return `studio-${Date.now().toString(36)}`;

  const words = fullText
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !skipWords.has(w));

  // Take brand word + city (if short enough)
  let slug = '';
  if (words.length >= 2) {
    slug = `${words[0]}-${words[words.length - 1]}`; // brand + city
  } else if (words.length === 1) {
    slug = words[0];
  } else {
    slug = `studio-${Date.now().toString(36)}`;
  }

  return slug
    .replace(/[а-яё]/g, ch => translitMap[ch] || ch)
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
}

function parsePricingInfo(text: string): Array<{
  name: string; price: string; period?: string;
  features: string[]; highlighted?: boolean;
}> {
  if (!text.trim()) {
    return [
      { name: 'Разовое', price: '800 ₽', features: ['1 занятие', 'Любое направление'] },
      { name: '4 занятия', price: '2 800 ₽', features: ['4 занятия', 'Срок: 1 месяц', 'Любое направление'] },
      { name: '8 занятий', price: '4 800 ₽', features: ['8 занятий', 'Срок: 1 месяц', 'Любое направление'], highlighted: true },
      { name: 'Безлимит', price: '6 000 ₽', period: 'мес', features: ['Безлимитное посещение', 'Все направления', 'Заморозка 7 дней'] },
    ];
  }

  // Simple line-by-line parser
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map((line, i) => {
    const clean = line.replace(/^[-•*]\s*/, '').trim();
    const match = clean.match(/^(.+?)[\s:—–-]+(\d[\d\s]*₽?р?руб?\.?)(.*)$/i);
    if (match) {
      return {
        name: match[1].trim(),
        price: match[2].trim().replace(/\s+/g, ' '),
        features: match[3] ? [match[3].trim()] : [],
        highlighted: i === Math.floor(lines.length / 2),
      };
    }
    return { name: clean, price: '', features: [], highlighted: false };
  }).filter(p => p.name);
}

function getDefaultFaq(niche: Niche) {
  return [
    { question: 'Нужна ли подготовка для начала занятий?', answer: 'Нет, мы принимаем учеников с любым уровнем подготовки. Преподаватели подберут нагрузку индивидуально.' },
    { question: 'Что взять на первое занятие?', answer: 'Удобную спортивную одежду, сменную обувь и воду. Коврики и инвентарь предоставляем.' },
    { question: 'Можно ли заморозить абонемент?', answer: 'Да, заморозка абонемента доступна на срок до 14 дней по уважительной причине.' },
    { question: 'Есть ли пробное занятие?', answer: 'Да, первое пробное занятие бесплатно! Запишитесь через форму на сайте.' },
  ];
}

function getDefaultRequests(niche: Niche) {
  const map: Record<Niche, Array<{ text: string; image: string }>> = {
    dance: [
      { text: 'Хочу научиться танцевать', image: '' },
      { text: 'Ищу хобби для души', image: '' },
      { text: 'Хочу красиво двигаться', image: '' },
      { text: 'Нужна подготовка к свадебному танцу', image: '' },
    ],
    fitness: [
      { text: 'Хочу похудеть', image: '' },
      { text: 'Нужен тонус после декрета', image: '' },
      { text: 'Хочу красивую фигуру', image: '' },
      { text: 'Ищу занятия без тренажёров', image: '' },
    ],
    stretching: [
      { text: 'Мечтаю сесть на шпагат', image: '' },
      { text: 'Хочу стать гибкой', image: '' },
      { text: 'Болит спина от сидячей работы', image: '' },
      { text: 'Хочу красивую осанку', image: '' },
    ],
    yoga: [
      { text: 'Хочу снять стресс', image: '' },
      { text: 'Ищу практику для тела и ума', image: '' },
      { text: 'Хочу начать медитировать', image: '' },
      { text: 'Нужна помощь со спиной', image: '' },
    ],
    wellness: [
      { text: 'Хочу улучшить здоровье', image: '' },
      { text: 'Ищу мягкие нагрузки', image: '' },
      { text: 'Нужна реабилитация', image: '' },
      { text: 'Хочу энергии и бодрости', image: '' },
    ],
  };
  return map[niche] || map.dance;
}

function getDefaultObjections(niche: Niche) {
  return [
    { myth: 'У меня нет данных для этого', answer: 'Данные не нужны — мы учим с нуля. 80% наших учеников начинали без опыта.' },
    { myth: 'Я слишком стар(а) для занятий', answer: 'Наши ученики — от 4 до 65 лет. Программы адаптируются под любой возраст.' },
    { myth: 'Это дорого', answer: 'Стоимость одного занятия — от 500₽. Это инвестиция в здоровье и хорошее настроение.' },
  ];
}
