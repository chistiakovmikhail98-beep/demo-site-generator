import type { BlockType } from '@/components/template/types';

export interface BlockDefinition {
  id: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'header' | 'content' | 'social-proof' | 'conversion' | 'footer';
  required: boolean;
  variants: Array<{
    id: 1 | 2 | 3;
    name: string;
    description: string;
  }>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    id: 'hero', name: 'Главный экран', description: 'Первый экран сайта с заголовком, описанием и CTA',
    icon: '🏠', category: 'header', required: true,
    variants: [
      { id: 1, name: 'Карточка слева', description: 'Текст в карточке слева, фото справа' },
      { id: 2, name: 'Split-layout', description: 'Текст на тёмном фоне, фото в контейнере' },
      { id: 3, name: 'Минималистичный', description: 'Лаконичный текст слева, крупное фото справа' },
    ],
  },
  {
    id: 'directions', name: 'Направления', description: 'Карточки направлений занятий',
    icon: '🎯', category: 'content', required: true,
    variants: [
      { id: 1, name: 'Карточки', description: 'Сетка карточек с фото и описанием' },
      { id: 2, name: 'Горизонтальный список', description: 'Горизонтальная прокрутка' },
      { id: 3, name: 'Аккордеон', description: 'Раскрывающиеся секции с деталями' },
    ],
  },
  {
    id: 'advantages', name: 'Преимущества', description: 'Ключевые преимущества студии',
    icon: '⭐', category: 'content', required: false,
    variants: [
      { id: 1, name: 'Карточки с фото', description: 'Визуальные карточки с иллюстрациями' },
      { id: 2, name: 'Иконки и текст', description: 'Минималистичные иконки с описанием' },
      { id: 3, name: 'Статистика', description: 'Цифры и достижения' },
    ],
  },
  {
    id: 'instructors', name: 'Тренеры', description: 'Команда инструкторов с фото и специализацией',
    icon: '👥', category: 'content', required: false,
    variants: [
      { id: 1, name: 'Карточки', description: 'Фото, имя, специализация' },
      { id: 2, name: 'Горизонтальный скролл', description: 'Прокрутка карточек' },
      { id: 3, name: 'Большие портреты', description: 'Крупные фото с деталями' },
    ],
  },
  {
    id: 'gallery', name: 'Галерея', description: 'Фотографии студии и занятий',
    icon: '📸', category: 'content', required: false,
    variants: [
      { id: 1, name: 'Masonry', description: 'Сетка разного размера' },
      { id: 2, name: 'Скролл', description: 'Горизонтальная прокрутка' },
      { id: 3, name: 'Сетка', description: 'Равномерная сетка 3 колонки' },
    ],
  },
  {
    id: 'pricing', name: 'Тарифы', description: 'Абонементы и цены',
    icon: '💰', category: 'conversion', required: true,
    variants: [
      { id: 1, name: 'Три колонки', description: 'Классическая сетка тарифов' },
      { id: 2, name: 'С акцентом', description: 'Выделенный популярный тариф' },
      { id: 3, name: 'Слайдер', description: 'Прокрутка карточек' },
    ],
  },
  {
    id: 'reviews', name: 'Отзывы', description: 'Отзывы клиентов',
    icon: '💬', category: 'social-proof', required: false,
    variants: [
      { id: 1, name: 'Карусель', description: 'Слайдер отзывов' },
      { id: 2, name: 'Masonry', description: 'Сетка карточек' },
      { id: 3, name: 'Список', description: 'Вертикальный список' },
    ],
  },
  {
    id: 'faq', name: 'Вопросы и ответы', description: 'Часто задаваемые вопросы',
    icon: '❓', category: 'conversion', required: false,
    variants: [
      { id: 1, name: 'Аккордеон', description: 'Раскрывающиеся вопросы' },
      { id: 2, name: 'Две колонки', description: 'Вопросы в двух колонках' },
      { id: 3, name: 'Карточки', description: 'Вопросы в виде карточек' },
    ],
  },
  {
    id: 'stories', name: 'Истории успеха', description: 'До/после и трансформации клиентов',
    icon: '🌟', category: 'social-proof', required: false,
    variants: [
      { id: 1, name: 'Слайдер до/после', description: 'Сравнение фото до и после' },
      { id: 2, name: 'Карточки', description: 'Карточки с историями' },
      { id: 3, name: 'Timeline', description: 'Временная шкала трансформаций' },
    ],
  },
  {
    id: 'atmosphere', name: 'Атмосфера', description: 'Погружение в атмосферу студии',
    icon: '🎨', category: 'content', required: false,
    variants: [
      { id: 1, name: 'Полноэкранный', description: 'Иммерсивный опыт с большими фото' },
      { id: 2, name: 'Сетка', description: 'Мозаика из фото и текста' },
      { id: 3, name: 'Скролл', description: 'Горизонтальная прокрутка' },
    ],
  },
  {
    id: 'requests', name: 'Запросы клиентов', description: 'С какими запросами к нам приходят',
    icon: '🔍', category: 'social-proof', required: false,
    variants: [
      { id: 1, name: 'Бегущая строка', description: 'Marquee-анимация' },
      { id: 2, name: 'Сетка', description: 'Статичная сетка запросов' },
      { id: 3, name: 'Список', description: 'Вертикальный список' },
    ],
  },
  {
    id: 'objections', name: 'Мифы и возражения', description: 'Развенчание мифов',
    icon: '🛡️', category: 'conversion', required: false,
    variants: [
      { id: 1, name: 'Карточки', description: 'Миф → Правда в карточках' },
      { id: 2, name: 'Аккордеон', description: 'Раскрывающиеся пары' },
      { id: 3, name: 'Сравнение', description: 'Таблица сравнения' },
    ],
  },
  {
    id: 'quiz', name: 'Квиз', description: 'Интерактивный опрос для захвата лидов',
    icon: '📋', category: 'conversion', required: false,
    variants: [
      { id: 1, name: 'Пошаговый', description: 'По одному вопросу за раз' },
      { id: 2, name: 'Компактный', description: 'Все вопросы на одном экране' },
      { id: 3, name: 'С прогрессом', description: 'Прогресс-бар и анимации' },
    ],
  },
  {
    id: 'calculator', name: 'Калькулятор прогресса', description: 'Визуализация прогресса по месяцам',
    icon: '📊', category: 'conversion', required: false,
    variants: [
      { id: 1, name: 'Timeline', description: 'Горизонтальная шкала прогресса' },
      { id: 2, name: 'Карточки этапов', description: 'Карточки по месяцам' },
      { id: 3, name: 'Слайдер', description: 'Скролл между этапами' },
    ],
  },
  {
    id: 'progressTimeline', name: 'Этапы обучения', description: 'Путь ученика от новичка к мастерству',
    icon: '📈', category: 'content', required: false,
    variants: [
      { id: 1, name: 'Вертикальный', description: 'Вертикальная шкала этапов' },
      { id: 2, name: 'Горизонтальный', description: 'Горизонтальная шкала' },
      { id: 3, name: 'Карточки', description: 'Карточки этапов' },
    ],
  },
];

/** Get required block IDs */
export function getRequiredBlocks(): string[] {
  return BLOCK_DEFINITIONS.filter(b => b.required).map(b => b.id);
}

/** Get default enabled blocks (required + popular optional) */
export function getDefaultBlocks(): string[] {
  const popular = ['hero', 'directions', 'advantages', 'instructors', 'gallery', 'pricing', 'reviews', 'faq', 'quiz'];
  return popular;
}

/** Get block definition by ID */
export function getBlockDef(id: string): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS.find(b => b.id === id);
}
