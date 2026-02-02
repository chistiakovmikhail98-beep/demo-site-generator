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
  'Группы для всех возрастов и уровней подготовки'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'kids-dance',
    title: 'Детская хореография',
    image: 'https://images.unsplash.com/photo-1514436598301-21be7c3b5317?w=800',
    description: 'Развивающие занятия для детей 3-4 лет. Формируем чувство ритма, координацию и музыкальность через игровую форму.',
    tags: ['Для детей', 'Развитие', 'Хореография'],
    level: 'Начальный',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Записаться на пробное'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Современная хореография для подростков 5-17 лет. Hip-hop, Breaking, House - развиваем индивидуальный стиль.',
    tags: ['Для подростков', 'Современные', 'Энергия'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Попробовать'
  },
  {
    id: 'high-heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    description: 'Женственная хореография на каблуках. Развиваем пластику, грацию и уверенность в себе.',
    tags: ['16+', 'Женственность', 'Пластика'],
    level: 'Любой',
    duration: '55 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'jazz-funk',
    title: 'Jazz-Funk',
    image: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800',
    description: 'Яркое танцевальное направление, сочетающее элементы джаза и современной хореографии.',
    tags: ['16+', 'Энергия', 'Стиль'],
    level: 'Средний',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Хочу на занятие'
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800',
    description: 'Комплекс упражнений для развития гибкости и подвижности. Подходит танцорам любых направлений.',
    tags: ['Гибкость', 'Восстановление', 'Профилактика'],
    level: 'Любой',
    duration: '55 мин',
    category: 'body',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'jumping',
    title: 'Jumping Fitness',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
    description: 'Интенсивные кардио-тренировки на мини-батутах. Улучшаем выносливость и координацию.',
    tags: ['Кардио', 'Сила', 'Координация'],
    level: 'Любой',
    duration: '45 мин',
    category: 'special',
    complexity: 3,
    buttonText: 'Попробовать'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Ксения Светлова',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400',
    specialties: ['High Heels', 'Jazz-Funk', 'Растяжка'],
    experience: '8 лет',
    style: 'Энергичный, вдохновляющий подход'
  },
  {
    id: 2,
    name: 'Артём Волков',
    image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400',
    specialties: ['Уличные танцы', 'Breaking'],
    experience: '10 лет',
    style: 'Креативный, технический подход'
  },
  {
    id: 3,
    name: 'Мария Соколова',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400',
    specialties: ['Детская хореография', 'Jumping Fitness'],
    experience: '6 лет',
    style: 'Игровой, развивающий подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1602827114685-efb565a25edc?w=800',
    afterImg: 'https://images.unsplash.com/photo-1602827114685-efb565a25edc?w=800',
    title: 'История успеха: Анна',
    description: 'За 6 месяцев занятий High Heels преодолела страх выступлений, обрела уверенность в себе и стала участницей танцевальной команды студии'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать заниматься?',
    answer: 'Мы принимаем детей с 3 лет на программу детской хореографии. Для взрослых возрастных ограничений нет.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы набираем группы разных уровней, включая начинающих. Главное – ваше желание танцевать!'
  },
  {
    question: 'Какая форма одежды нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels понадобятся туфли на устойчивом каблуке.'
  },
  {
    question: 'Как часто рекомендуется заниматься?',
    answer: 'Для заметного прогресса рекомендуем посещать занятия 2-3 раза в неделю.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1517637633369-e4cc28755e01?w=100', text: 'Научиться танцевать с нуля' },
  { image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=100', text: 'Повысить гибкость' },
  { image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100', text: 'Подтянуть фигуру' },
  { image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=100', text: 'Улучшить координацию' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=100', text: 'Найти хобби' },
  { image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100', text: 'Выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1517637633369-e4cc28755e01?w=100', text: 'Развить пластику' },
  { image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=100', text: 'Стать увереннее' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100', text: 'Найти единомышленников' },
  { image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=100', text: 'Снять стресс' },
  { image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=100', text: 'Развить музыкальность' },
  { image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100', text: 'Подготовиться к выступлению' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природных данных для танцев",
    answer: "Танцевать может каждый! Мы учитываем индивидуальные особенности и помогаем раскрыть ваш потенциал в комфортном темпе."
  },
  {
    myth: "Я слишком взрослый для начала занятий",
    answer: "Возраст – не помеха. У нас занимаются ученики разных возрастов, и мы гарантируем подходящую программу для каждого."
  },
  {
    myth: "Боюсь не успевать за группой",
    answer: "Мы формируем группы по уровню подготовки и уделяем внимание каждому ученику. Вы всегда будете в комфортной среде."
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные залы",
    text: "2 просторных зала с профессиональным покрытием, зеркалами и современным звуковым оборудованием",
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600'
  },
  {
    title: "Опытные преподаватели",
    text: "Команда сертифицированных тренеров с богатым опытом выступлений и преподавания",
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600'
  },
  {
    title: "Удобное расписание",
    text: "Занятия в утреннее и вечернее время, включая выходные дни",
    image: 'https://images.unsplash.com/photo-1517637633369-e4cc28755e01?w=600'
  },
  {
    title: "Дружное комьюнити",
    text: "Регулярные мероприятия, мастер-классы и возможность участия в конкурсах",
    image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600'
  }
];
