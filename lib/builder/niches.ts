import type { Niche } from '../types';

export interface NichePreset {
  id: Niche;
  name: string;
  description: string;
  icon: string;
  defaultSlogan: string;
  defaultDirections: Array<{
    title: string;
    description: string;
    duration: string;
    tags: string[];
    category: string;
    complexity: number;
  }>;
  defaultAdvantages: Array<{
    title: string;
    text: string;
  }>;
  heroAdvantages: string[];
}

export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'dance',
    name: 'Танцевальная студия',
    description: 'Школы танцев, хореографические студии',
    icon: '💃',
    defaultSlogan: 'Танцуй. Чувствуй. Живи.',
    defaultDirections: [
      { title: 'Современная хореография', description: 'Контемпорари, джаз-модерн и авторские постановки', duration: '60 мин', tags: ['Пластика', 'Импровизация'], category: 'dance', complexity: 2 },
      { title: 'Хип-хоп', description: 'Уличный стиль, фристайл и баттловые техники', duration: '60 мин', tags: ['Энергия', 'Свобода'], category: 'dance', complexity: 2 },
      { title: 'Бальные танцы', description: 'Вальс, танго, фокстрот — классика для пар', duration: '75 мин', tags: ['Пара', 'Классика'], category: 'dance', complexity: 3 },
      { title: 'Pole dance', description: 'Акробатика на пилоне, пластика и сила', duration: '60 мин', tags: ['Сила', 'Гибкость'], category: 'dance', complexity: 3 },
      { title: 'Детские танцы', description: 'Развитие координации и ритма для детей от 4 лет', duration: '45 мин', tags: ['Дети', 'Развитие'], category: 'beginner', complexity: 1 },
    ],
    defaultAdvantages: [
      { title: 'Профессиональные хореографы', text: 'Педагоги с опытом выступлений и побед на конкурсах' },
      { title: 'Залы с зеркалами', text: 'Просторные залы с профессиональным покрытием и зеркалами' },
      { title: 'Концерты и отчётные', text: 'Регулярные выступления и участие в фестивалях' },
      { title: 'Любой уровень', text: 'Группы для начинающих и продвинутых танцоров' },
    ],
    heroAdvantages: ['Современные направления', 'Профессиональные педагоги', 'Концерты и выступления'],
  },
  {
    id: 'fitness',
    name: 'Фитнес-студия',
    description: 'Тренажёрные залы, функциональные тренировки',
    icon: '💪',
    defaultSlogan: 'Твоё тело. Твоя сила.',
    defaultDirections: [
      { title: 'Функциональный тренинг', description: 'Комплексные упражнения на все группы мышц', duration: '55 мин', tags: ['Сила', 'Выносливость'], category: 'body', complexity: 2 },
      { title: 'Круговая тренировка', description: 'Интенсивный формат для максимального жиросжигания', duration: '45 мин', tags: ['Интенсив', 'Жиросжигание'], category: 'body', complexity: 3 },
      { title: 'Пилатес', description: 'Укрепление глубоких мышц, улучшение осанки', duration: '55 мин', tags: ['Осанка', 'Тонус'], category: 'wellness', complexity: 1 },
      { title: 'TRX-тренировка', description: 'Функциональные петли для всего тела', duration: '50 мин', tags: ['Баланс', 'Сила'], category: 'body', complexity: 2 },
      { title: 'Женский фитнес', description: 'Программы для женского здоровья и красивой фигуры', duration: '55 мин', tags: ['Фигура', 'Здоровье'], category: 'wellness', complexity: 1 },
    ],
    defaultAdvantages: [
      { title: 'Персональный подход', text: 'Индивидуальные программы с учётом ваших целей' },
      { title: 'Современное оборудование', text: 'Тренажёры премиум-класса от ведущих производителей' },
      { title: 'Малые группы', text: 'До 8 человек — максимум внимания каждому' },
      { title: 'Результат с гарантией', text: 'Видимые изменения уже через 4 недели тренировок' },
    ],
    heroAdvantages: ['Малые группы до 8 чел.', 'Современное оборудование', 'Первая тренировка бесплатно'],
  },
  {
    id: 'stretching',
    name: 'Студия растяжки',
    description: 'Стретчинг, шпагат, гибкость',
    icon: '🧘‍♀️',
    defaultSlogan: 'Гибкость. Грация. Свобода.',
    defaultDirections: [
      { title: 'Стретчинг', description: 'Глубокая растяжка всего тела для гибкости', duration: '60 мин', tags: ['Гибкость', 'Расслабление'], category: 'wellness', complexity: 1 },
      { title: 'Шпагат с нуля', description: 'Пошаговая программа выхода на продольный и поперечный шпагат', duration: '60 мин', tags: ['Шпагат', 'Прогресс'], category: 'wellness', complexity: 2 },
      { title: 'Пластика тела', description: 'Волны, изоляции, плавные движения для женственности', duration: '55 мин', tags: ['Пластика', 'Грация'], category: 'dance', complexity: 1 },
      { title: 'Стретчинг + силовая', description: 'Сочетание растяжки и упражнений на тонус мышц', duration: '60 мин', tags: ['Тонус', 'Гибкость'], category: 'body', complexity: 2 },
    ],
    defaultAdvantages: [
      { title: 'Безопасная растяжка', text: 'Анатомически грамотный подход без травм' },
      { title: 'Видимый прогресс', text: 'Фото-замеры каждый месяц для отслеживания результата' },
      { title: 'Тёплый зал', text: 'Подогрев пола и комфортная температура для глубокой растяжки' },
      { title: 'Для любого уровня', text: 'От нулевой гибкости до профессионального шпагата' },
    ],
    heroAdvantages: ['Безопасная методика', 'Шпагат за 3 месяца', 'Тёплый зал'],
  },
  {
    id: 'yoga',
    name: 'Йога-студия',
    description: 'Йога, медитация, пранаяма',
    icon: '🕉️',
    defaultSlogan: 'Баланс тела и ума.',
    defaultDirections: [
      { title: 'Хатха-йога', description: 'Классическая практика асан для баланса и гармонии', duration: '75 мин', tags: ['Баланс', 'Гармония'], category: 'wellness', complexity: 1 },
      { title: 'Виньяса-флоу', description: 'Динамическая йога с плавными переходами между асанами', duration: '60 мин', tags: ['Динамика', 'Поток'], category: 'wellness', complexity: 2 },
      { title: 'Йога-нидра', description: 'Глубокое расслабление и медитация через осознанный сон', duration: '60 мин', tags: ['Медитация', 'Релакс'], category: 'wellness', complexity: 1 },
      { title: 'Аэройога', description: 'Практика в гамаках: декомпрессия позвоночника и невесомость', duration: '60 мин', tags: ['Гамаки', 'Невесомость'], category: 'wellness', complexity: 2 },
    ],
    defaultAdvantages: [
      { title: 'Сертифицированные инструкторы', text: 'Все преподаватели с международными сертификатами' },
      { title: 'Атмосфера покоя', text: 'Эко-материалы, ароматерапия, приглушённый свет' },
      { title: 'Малые группы', text: 'До 10 человек для индивидуального подхода' },
      { title: 'Всё включено', text: 'Коврики, пропсы, чай после практики' },
    ],
    heroAdvantages: ['Малые группы', 'Международные сертификаты', 'Первое занятие бесплатно'],
  },
  {
    id: 'wellness',
    name: 'Wellness-студия',
    description: 'Комплексное оздоровление, массаж, SPA',
    icon: '✨',
    defaultSlogan: 'Энергия. Здоровье. Красота.',
    defaultDirections: [
      { title: 'Оздоровительная гимнастика', description: 'Мягкие упражнения для здоровья спины и суставов', duration: '55 мин', tags: ['Здоровье', 'Суставы'], category: 'wellness', complexity: 1 },
      { title: 'ЛФК и реабилитация', description: 'Восстановление после травм под контролем специалиста', duration: '50 мин', tags: ['Реабилитация', 'Восстановление'], category: 'wellness', complexity: 1 },
      { title: 'Фейсфитнес', description: 'Упражнения для лица: подтяжка, лифтинг, молодость', duration: '40 мин', tags: ['Лицо', 'Молодость'], category: 'wellness', complexity: 1 },
      { title: 'Дыхательные практики', description: 'Бодифлекс, оксисайз и пранаяма для энергии', duration: '45 мин', tags: ['Дыхание', 'Энергия'], category: 'wellness', complexity: 1 },
    ],
    defaultAdvantages: [
      { title: 'Медицинский подход', text: 'Программы составлены совместно с врачами' },
      { title: 'Комплексный результат', text: 'Работа с телом, дыханием и эмоциями' },
      { title: 'Уютное пространство', text: 'Камерная атмосфера для комфортных занятий' },
      { title: 'Индивидуальные программы', text: 'Учитываем ваши особенности и противопоказания' },
    ],
    heroAdvantages: ['Медицинский подход', 'Индивидуальные программы', 'Пробное занятие бесплатно'],
  },
];

export function getNichePreset(niche: Niche): NichePreset {
  return NICHE_PRESETS.find(n => n.id === niche) || NICHE_PRESETS[0];
}
