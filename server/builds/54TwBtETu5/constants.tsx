import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: Lazurite Dance Studio

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'О студии', href: '#director' },
  { label: 'Результаты', href: '#progress-timeline' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#footer' },
];

export const HERO_ADVANTAGES = [
  '2 просторных зала с профессиональным покрытием',
  'Опытные преподаватели с международными сертификатами',
  'Более 15 танцевальных направлений'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'kids-dance',
    title: 'Детская хореография',
    image: 'https://images.unsplash.com/photo-1514246101573-cad3c04eecde?w=800',
    description: 'Развиваем пластику, координацию и музыкальность у детей 3-4 лет. Игровой формат занятий с элементами классической хореографии.',
    tags: ['Для детей', 'Хореография', 'Развитие'],
    level: 'Начинающий',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Пробное занятие'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Современная хореография для подростков 5-17 лет. Hip-hop, breaking, house dance под актуальную музыку.',
    tags: ['Подростки', 'Hip-hop', 'Энергия'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'high-heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=800',
    description: 'Женственная хореография на каблуках. Развиваем грацию, уверенность и чувственность движений.',
    tags: ['16+', 'Женственность', 'Стиль'],
    level: 'Любой',
    duration: '55 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Хочу на занятие'
  },
  {
    id: 'jazz-funk',
    title: 'Jazz-Funk',
    image: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800',
    description: 'Микс джазового танца и современной хореографии. Драйв, эмоции и отличная физическая форма.',
    tags: ['16+', 'Драйв', 'Фитнес'],
    level: 'Средний',
    duration: '55 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800',
    description: 'Комплексное развитие гибкости всего тела. Работаем над шпагатами и общей эластичностью мышц.',
    tags: ['Гибкость', 'Здоровье', 'Релакс'],
    level: 'Любой',
    duration: '55 мин',
    category: 'body',
    complexity: 2,
    buttonText: 'Попробовать'
  },
  {
    id: 'jumping',
    title: 'Jumping Fitness',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
    description: 'Интенсивные тренировки на мини-батутах. Сжигаем калории, укрепляем мышцы, заряжаемся энергией.',
    tags: ['Фитнес', 'Кардио', 'Похудение'],
    level: 'Любой',
    duration: '45 мин',
    category: 'special',
    complexity: 3,
    buttonText: 'Записаться'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Ксения Светлова',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400',
    specialties: ['High Heels', 'Jazz-Funk', 'Стретчинг'],
    experience: '8 лет',
    style: 'Энергичный драйв'
  },
  {
    id: 2,
    name: 'Максим Волков',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400',
    specialties: ['Street Dance', 'Hip-hop', 'Breaking'],
    experience: '10 лет',
    style: 'Современная хореография'
  },
  {
    id: 3,
    name: 'Алина Морозова',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400',
    specialties: ['Детская хореография', 'Jumping Fitness'],
    experience: '6 лет',
    style: 'Игровой подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400',
    afterImg: 'https://images.unsplash.com/photo-1563339007-6914941d521b?w=400',
    title: 'История успеха: Мария, 28 лет',
    description: 'За 6 месяцев занятий High Heels преодолела страх сцены, села на шпагат и выступила на отчетном концерте студии'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать заниматься?',
    answer: 'Мы принимаем детей с 3 лет на программу детской хореографии. Для взрослых возрастных ограничений нет.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы набираем группы разного уровня подготовки. Для новичков есть специальные программы с базовыми элементами.'
  },
  {
    question: 'Какая форма одежды нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels понадобятся туфли на каблуке.'
  },
  {
    question: 'Как часто рекомендуется заниматься?',
    answer: 'Для достижения результатов рекомендуем посещать занятия 2-3 раза в неделю.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=100', text: 'Научиться танцевать с нуля' },
  { image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100', text: 'Подтянуть фигуру' },
  { image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=100', text: 'Сесть на шпагат' },
  { image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=100', text: 'Найти хобби' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=100', text: 'Стать пластичнее' },
  { image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100', text: 'Повысить самооценку' },
  { image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=100', text: 'Похудеть' },
  { image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=100', text: 'Научиться танцевать на каблуках' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1478465726282-ddb11af11c77?w=100', text: 'Выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=100', text: 'Развить координацию' },
  { image: 'https://images.unsplash.com/photo-1508215885820-4585e56135c8?w=100', text: 'Найти единомышленников' },
  { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100', text: 'Укрепить здоровье' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природной пластики, танцы не для меня",
    answer: "Танцевать может каждый! Пластика и координация развиваются на занятиях постепенно. Главное – регулярные тренировки и желание учиться."
  },
  {
    myth: "Я слишком взрослый для танцев",
    answer: "Начать танцевать можно в любом возрасте. У нас занимаются ученики от 16 до 50+ лет, для каждого подбираем комфортную нагрузку."
  },
  {
    myth: "Боюсь не успевать за группой",
    answer: "Мы формируем группы по уровню подготовки. Начинающие занимаются с начинающими, а преподаватель уделяет внимание каждому ученику."
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные залы",
    text: "2 просторных зала с профессиональным покрытием, зеркалами и современным звуковым оборудованием",
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600'
  },
  {
    title: "Опытные преподаватели",
    text: "Команда сертифицированных хореографов с опытом преподавания и активной творческой деятельностью",
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600'
  },
  {
    title: "Удобное расписание",
    text: "Занятия в утреннее и вечернее время, возможность подобрать удобное расписание",
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600'
  },
  {
    title: "Регулярные мероприятия",
    text: "Отчетные концерты, мастер-классы, соревнования и летний танцевальный лагерь",
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600'
  }
];
