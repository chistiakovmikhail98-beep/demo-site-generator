// ============================================================
// SiteConfig → SiteData mapper
// Replaces the old data.tsx + constants.tsx chain.
// Input: SiteConfig JSON from Supabase
// Output: SiteData consumed by React template components
// ============================================================

import type { SiteConfig, Niche } from './types';
import type { SiteData, BlockConfig, HeaderData, FooterData } from '@/components/template/types';

export function configToSiteData(config: SiteConfig): SiteData {
  const { brand: b, sections: s } = config;
  const d = s.director || { name: '', title: '', description: '', image: '', achievements: [] };
  const titles = s.sectionTitles || {};
  const calcStages = s.calculatorStages || getDefaultCalculatorStages(b.niche);
  const defaultTitles = getDefaultSectionTitles(b.niche, s.directions?.length || 10);

  // --- Header ---
  const header: HeaderData = {
    brandName: b.name,
    logo: b.logo,
    navItems: [
      { label: 'Направления', href: '#directions' },
      { label: 'О студии', href: '#director' },
      { label: 'Результаты', href: '#progress-timeline' },
      { label: 'Цены', href: '#pricing' },
      { label: 'Вопросы', href: '#faq' },
      { label: 'Контакты', href: '#footer' },
    ],
  };

  // --- Footer ---
  const footer: FooterData = {
    brandName: b.name,
    phone: s.contacts?.phone || '+7 (XXX) XXX-XX-XX',
    email: s.contacts?.email || '',
    address: s.contacts?.address || '',
    addressDetails: s.contacts?.addressDetails || '',
    telegram: s.contacts?.telegram || '',
    vk: s.contacts?.vk || '',
    instagram: s.contacts?.instagram || '',
    mapUrl: s.contacts?.mapUrl || '',
    mapCoords: s.contacts?.mapCoords || '',
  };

  // --- Block variants ---
  const variants = getBlockVariants(s.blockVariants);

  // --- Layout ---
  // Funnel order: attention → interest → desire → action
  const layout: BlockConfig[] = [
    { type: 'hero', variant: variants.hero as 1|2|3, visible: true, order: 0 },
    { type: 'requests', variant: variants.requests as 1|2|3, visible: true, order: 1 },
    { type: 'directions', variant: variants.directions as 1|2|3, visible: true, order: 2 },
    { type: 'advantages', variant: variants.advantages as 1|2|3, visible: true, order: 3 },
    { type: 'instructors', variant: variants.instructors as 1|2|3, visible: true, order: 4 },
    { type: 'director', variant: variants.director as 1|2|3, visible: true, order: 5 },
    { type: 'stories', variant: variants.stories as 1|2|3, visible: true, order: 6 },
    { type: 'atmosphere', variant: variants.atmosphere as 1|2|3, visible: true, order: 7 },
    { type: 'gallery', variant: variants.gallery as 1|2|3, visible: true, order: 8 },
    { type: 'reviews', variant: variants.reviews as 1|2|3, visible: true, order: 9 },
    { type: 'progressTimeline', variant: 1, visible: true, order: 10 },
    { type: 'pricing', variant: variants.pricing as 1|2|3, visible: true, order: 11 },
    { type: 'quiz', variant: 1, visible: true, order: 12 },
    { type: 'calculator', variant: 1, visible: true, order: 13 },
    { type: 'objections', variant: variants.objections as 1|2|3, visible: true, order: 14 },
    { type: 'faq', variant: variants.faq as 1|2|3, visible: true, order: 15 },
  ];

  return {
    brand: {
      name: b.name,
      tagline: b.tagline,
      niche: b.niche,
      city: b.city,
      logo: b.logo,
    },

    hero: {
      brandName: b.name,
      city: b.city,
      heroTitle: b.heroTitle || b.name,
      heroSubtitle: b.heroSubtitle || b.tagline,
      heroDescription: b.heroDescription || '',
      heroImage: b.heroImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      heroQuote: b.heroQuote || '',
      advantages: s.heroAdvantages || [],
      niche: b.niche,
      buttonText: 'Записаться',
      heroStats: buildHeroStats(s),
    },

    directions: {
      title: titles.directions?.title || defaultTitles.directions?.title || 'Направления',
      subtitle: titles.directions?.subtitle || defaultTitles.directions?.subtitle,
      directions: (s.directions || []).map((d, i) => ({
        id: d.id || `dir-${i}`,
        title: d.title,
        image: d.image,
        description: d.description,
        tags: d.tags || [],
        level: d.level,
        duration: d.duration,
        category: d.category,
        complexity: d.complexity || 1,
        calories: undefined,
        buttonText: d.buttonText,
      })),
      tabs: s.directionsTabs || getDefaultDirectionsTabs(),
    },

    gallery: {
      images: s.gallery || [],
      title: 'Галерея',
    },

    instructors: {
      title: titles.instructors?.title || 'Тренеры',
      instructors: (s.instructors || []).map((inst, i) => ({
        id: String(i + 1),
        name: inst.name,
        image: inst.image,
        specialties: inst.specialties || [],
        experience: inst.experience,
        style: inst.style,
      })),
      ctaTitle: titles.instructors?.ctaTitle,
      ctaDescription: titles.instructors?.ctaDescription,
    },

    pricing: {
      title: 'Тарифы',
      plans: (s.pricing || []).map((p, i) => ({
        id: i + 1,
        name: p.name,
        price: p.price,
        validity: p.period || '',
        classes: 0,
        pricePerClass: '',
        targetAudience: p.category || '',
        isPopular: p.highlighted,
        features: p.features || [],
      })),
    },

    stories: {
      title: titles.stories?.title || 'Истории успеха',
      stories: (s.stories || []).map((st, i) => ({
        id: String(i + 1),
        beforeImg: st.beforeImg,
        afterImg: st.afterImg,
        title: st.title,
        description: st.description,
      })),
    },

    director: {
      name: d.name,
      title: d.title,
      description: d.description,
      image: d.image,
      achievements: d.achievements || [],
    },

    advantages: {
      title: 'Преимущества',
      advantages: (s.advantages || []).map(a => ({
        title: a.title,
        text: a.text,
        image: a.image,
      })),
    },

    atmosphere: {
      title: titles.atmosphere?.title || 'Фотоэкскурсия',
      subtitle: titles.atmosphere?.subtitle || 'по студии',
      items: (s.atmosphere || []).map((a, i) => ({
        id: String(i),
        image: a.image,
        title: a.title,
        description: a.description,
      })),
    },

    reviews: {
      title: titles.reviews?.title || 'Отзывы',
      subtitle: titles.reviews?.subtitle,
      reviews: (s.reviews || []).map((r, i) => ({
        id: String(i),
        name: r.name,
        text: r.text,
        rating: r.rating || 5,
        source: r.source,
      })),
    },

    faq: {
      title: titles.faq?.title || 'FAQ',
      subtitle: titles.faq?.subtitle,
      items: s.faq || [],
    },

    objections: {
      title: 'Мифы и правда',
      pairs: s.objections || [],
    },

    requests: {
      title: titles.requests?.title || 'С какими запросами приходят',
      buttonText: titles.requests?.buttonText,
      rows: chunkRequests(s.requests || []),
    },

    calculator: {
      title: titles.calculator?.title || defaultTitles.calculator?.title || 'Как меняется тело',
      subtitle: titles.calculator?.subtitle || defaultTitles.calculator?.subtitle,
      stages: calcStages.map((st, i) => ({
        id: String(i),
        title: st.status,
        description: st.description,
        tags: st.tags,
        achievements: [st.achievement],
        progress: (i + 1) * 25,
      })),
    },

    quiz: {
      managerName: s.quiz?.managerName || 'Имя Фамилия',
      managerImage: s.quiz?.managerImage || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200',
      tips: s.quiz?.tips || [],
      steps: (s.quiz?.steps || []).map((step, i) => ({
        id: i + 1,
        question: step.question,
        options: step.options || [],
      })),
    },

    progressTimeline: {
      title: titles.calculator?.title || defaultTitles.calculator?.title || 'Как меняется тело',
      subtitle: titles.calculator?.subtitle || defaultTitles.calculator?.subtitle,
      stages: calcStages.map((st, i) => ({
        id: String(i),
        title: st.status,
        description: st.description,
        tags: st.tags,
        achievements: [st.achievement],
        stats: {
          'Техника': [20, 45, 75, 90][i] || 50,
          'Сила': [10, 30, 60, 95][i] || 50,
          'Гибкость': [30, 55, 80, 100][i] || 50,
          'Выносливость': [25, 60, 75, 95][i] || 50,
        },
      })),
    },

    footer,
    header,
    layout,
  };
}

// ── Helpers ──

/** Split flat requests array into rows of 4 */
function chunkRequests(requests: Array<{ image: string; text: string }>): Array<Array<{ text: string; image?: string }>> {
  const rows: Array<Array<{ text: string; image?: string }>> = [];
  for (let i = 0; i < requests.length; i += 4) {
    rows.push(requests.slice(i, i + 4).map(r => ({ text: r.text, image: r.image })));
  }
  // Ensure at least 3 rows for the marquee effect
  while (rows.length < 3) rows.push([]);
  return rows;
}

/** Get block variant selections, clamped to 1-3 */
function getBlockVariants(blockVariants?: Record<string, number>): Record<string, number> {
  const defaults: Record<string, number> = {
    hero: 1, directions: 1, gallery: 1, instructors: 1,
    stories: 1, reviews: 1, director: 1, pricing: 1,
    faq: 1, objections: 1, requests: 1, advantages: 1, atmosphere: 1,
  };
  if (!blockVariants) return defaults;

  const result = { ...defaults };
  for (const [key, val] of Object.entries(blockVariants)) {
    if (key in result && typeof val === 'number' && val >= 1 && val <= 3) {
      result[key] = val;
    }
  }
  return result;
}

/** Default calculator stages by niche */
function getDefaultCalculatorStages(niche: Niche) {
  const stagesByNiche: Record<string, Array<{ status: string; description: string; tags: string[]; achievement: string }>> = {
    fitness: [
      { status: 'Адаптация', description: 'Тело привыкает к нагрузкам. Улучшается выносливость и общее самочувствие.', tags: ['Выносливость', 'Тонус', 'Привычка'], achievement: 'Регулярные тренировки стали частью жизни' },
      { status: 'Прогресс', description: 'Видимые изменения в теле. Мышцы укрепляются, жировая прослойка уменьшается.', tags: ['Сила', 'Рельеф', 'Энергия'], achievement: 'Первые видимые результаты в зеркале' },
      { status: 'Трансформация', description: 'Тело работает как слаженный механизм. Вы сильнее, выносливее, увереннее.', tags: ['Мощь', 'Форма', 'Уверенность'], achievement: 'Полная трансформация тела и духа' },
      { status: 'Мастерство', description: 'Фитнес стал образом жизни. Вы достигли своих целей и ставите новые.', tags: ['Образ жизни', 'Цели', 'Развитие'], achievement: 'Спорт навсегда стал частью вас' },
    ],
    dance: [
      { status: 'Раскрепощение', description: 'Уходит скованность, появляется уверенность в движениях. Вы начинаете чувствовать ритм.', tags: ['Ритм', 'Свобода', 'Уверенность'], achievement: 'Первый танец без стеснения' },
      { status: 'Пластика', description: 'Движения становятся плавными и естественными. Тело слушается вас.', tags: ['Грация', 'Координация', 'Стиль'], achievement: 'Красивая пластика в каждом движении' },
      { status: 'Артистизм', description: 'Вы не просто танцуете — вы выражаете себя. Каждый танец — история.', tags: ['Эмоции', 'Харизма', 'Творчество'], achievement: 'Танец стал способом самовыражения' },
      { status: 'Сцена', description: 'Готовность к выступлениям. Вы танцуете с душой и вдохновляете других.', tags: ['Выступление', 'Вдохновение', 'Мастерство'], achievement: 'Уверенное выступление на сцене' },
    ],
    stretching: [
      { status: 'Снятие зажимов', description: 'Уходят привычные боли и напряжение. Тело начинает расслабляться.', tags: ['Релаксация', 'Снятие боли', 'Дыхание'], achievement: 'Первый день без боли в спине' },
      { status: 'Осознанное тело', description: 'Возвращается естественная мобильность. Тело становится послушным.', tags: ['Мобильность', 'Осанка', 'Гибкость'], achievement: 'Привычка держать спину ровно' },
      { status: 'Глубокая растяжка', description: 'Мышцы и связки становятся эластичными. Шпагат всё ближе.', tags: ['Эластичность', 'Шпагат', 'Лёгкость'], achievement: 'Видимый прогресс в растяжке' },
      { status: 'Полная гибкость', description: 'Тело гибкое и здоровое. Вы двигаетесь легко и свободно.', tags: ['Свобода', 'Здоровье', 'Гармония'], achievement: 'Шпагат и полная свобода движений' },
    ],
    yoga: [
      { status: 'Присутствие', description: 'Учитесь быть здесь и сейчас. Дыхание становится осознанным.', tags: ['Дыхание', 'Осознанность', 'Покой'], achievement: 'Первая медитация без отвлечений' },
      { status: 'Баланс', description: 'Тело и ум находят равновесие. Стресс отступает.', tags: ['Равновесие', 'Спокойствие', 'Гармония'], achievement: 'Внутренний покой в любой ситуации' },
      { status: 'Глубина', description: 'Практика становится глубокой и трансформирующей.', tags: ['Трансформация', 'Сила', 'Ясность'], achievement: 'Сложные асаны даются легко' },
      { status: 'Единство', description: 'Йога — это ваш путь. Гармония тела, ума и духа.', tags: ['Целостность', 'Мудрость', 'Свет'], achievement: 'Йога стала образом жизни' },
    ],
    wellness: [
      { status: 'Перезагрузка', description: 'Организм начинает восстанавливаться. Уходит накопленная усталость.', tags: ['Отдых', 'Детокс', 'Восстановление'], achievement: 'Глубокий здоровый сон' },
      { status: 'Обновление', description: 'Энергия возвращается. Тело чувствует себя моложе.', tags: ['Энергия', 'Молодость', 'Сияние'], achievement: 'Заметное улучшение самочувствия' },
      { status: 'Расцвет', description: 'Здоровье и красота изнутри. Вы сияете.', tags: ['Красота', 'Здоровье', 'Гармония'], achievement: 'Комплименты от окружающих' },
      { status: 'Гармония', description: 'Полный баланс тела и духа. Забота о себе — ваш стиль жизни.', tags: ['Баланс', 'Образ жизни', 'Благополучие'], achievement: 'Полная гармония и благополучие' },
    ],
  };
  return stagesByNiche[niche] || stagesByNiche.fitness;
}

/** Default section titles by niche */
function getDefaultSectionTitles(niche: Niche, directionsCount: number) {
  const nicheTexts: Record<string, { calcTitle: string; calcSubtitle: string; calcButton: string }> = {
    dance: { calcTitle: 'Как раскрывается талант', calcSubtitle: 'Трансформация через танец', calcButton: 'Начать танцевать' },
    fitness: { calcTitle: 'Как меняется тело', calcSubtitle: 'Трансформация через тренировки', calcButton: 'Начать тренироваться' },
    stretching: { calcTitle: 'Как меняется тело', calcSubtitle: 'Трансформация через растяжку', calcButton: 'Начать путь к гибкости' },
    yoga: { calcTitle: 'Путь к гармонии', calcSubtitle: 'Трансформация через практику', calcButton: 'Начать практику' },
    wellness: { calcTitle: 'Путь к здоровью', calcSubtitle: 'Комплексная трансформация', calcButton: 'Начать путь к здоровью' },
  };
  const texts = nicheTexts[niche] || nicheTexts.fitness;

  return {
    calculator: { title: texts.calcTitle, subtitle: texts.calcSubtitle, buttonText: texts.calcButton },
    directions: { title: `${directionsCount} направлений`, subtitle: 'в одной студии' },
    pricing: { title: 'Прозрачные цены', subtitle: 'без скрытых платежей' },
  };
}

/** Build hero stats from available config data */
function buildHeroStats(s: SiteConfig['sections']): Array<{ value: string; label: string }> {
  const dirCount = s.directions?.length || 0;
  const instructorCount = s.instructors?.length || 0;
  const reviewCount = s.reviews?.length || 0;

  const stats: Array<{ value: string; label: string }> = [];

  if (dirCount > 0) stats.push({ value: `${dirCount}+`, label: 'направлений' });
  if (instructorCount > 0) stats.push({ value: `${instructorCount}+`, label: 'тренеров' });
  if (reviewCount > 0) stats.push({ value: `${reviewCount * 50}+`, label: 'учеников' });

  return stats.length >= 3 ? stats.slice(0, 3) : stats;
}

/** Default direction tabs */
function getDefaultDirectionsTabs() {
  return [
    { key: 'all', label: 'Все' },
    { key: 'group', label: 'Групповые', category: 'dance' },
    { key: 'personal', label: 'Индивидуальные', category: 'body' },
    { key: 'recovery', label: 'Восстановление', category: 'beginner' },
    { key: 'special', label: 'Специальные', category: 'special' },
    { key: 'wellness', label: 'Оздоровление', category: 'wellness' },
    { key: 'online', label: 'Онлайн', category: 'online' },
  ];
}
