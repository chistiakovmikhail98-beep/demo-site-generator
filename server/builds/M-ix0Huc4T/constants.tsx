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
    id: 'high-heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=800',
    description: 'Женственная хореография на каблуках. Развиваем пластику, грацию и уверенность в себе. Идеально подходит для раскрытия женственности.',
    tags: ['Dance', 'Пластика', 'Женственность'],
    level: 'Начинающий/Продвинутый',
    duration: '75 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'jazz-funk',
    title: 'Jazz-Funk',
    image: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800',
    description: 'Энергичный микс джаза и современной хореографии. Развиваем координацию, выносливость и музыкальность.',
    tags: ['Dance', 'Энергия', 'Современность'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 4,
    buttonText: 'Попробовать'
  },
  {
    id: 'kids-dance',
    title: 'Детская хореография',
    image: 'https://images.unsplash.com/photo-1514246101573-cad3c04efd0c?w=800',
    description: 'Специальная программа для детей 3-4 лет. Развиваем музыкальность, координацию и творческий потенциал в игровой форме.',
    tags: ['Kids', 'Развитие', 'Творчество'],
    level: 'Начинающий',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Записать ребенка'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Современная хореография для детей и подростков 5-17 лет. Hip-hop, breaking, house dance в одном направлении.',
    tags: ['Urban', 'Современность', 'Энергия'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800',
    description: 'Комплекс упражнений для развития гибкости и подвижности. Подходит для танцоров всех направлений.',
    tags: ['Гибкость', 'Здоровье', 'Развитие'],
    level: 'Любой',
    duration: '55 мин',
    category: 'body',
    complexity: 2,
    buttonText: 'Начать'
  },
  {
    id: 'jumping',
    title: 'Jumping Fitness',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
    description: 'Интенсивные тренировки на мини-батутах. Улучшаем выносливость, координацию и тонус мышц.',
    tags: ['Фитнес', 'Кардио', 'Сила'],
    level: 'Любой',
    duration: '45 мин',
    category: 'special',
    complexity: 4,
    buttonText: 'Попробовать'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Ксения Светлова',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400',
    specialties: ['High Heels', 'Jazz-Funk'],
    experience: '8 лет',
    style: 'Энергичный, вдохновляющий подход'
  },
  {
    id: 2,
    name: 'Артем Волков',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    specialties: ['Street Dance', 'Breaking'],
    experience: '10 лет',
    style: 'Динамичный, современный стиль'
  },
  {
    id: 3,
    name: 'Мария Соколова',
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400',
    specialties: ['Детская хореография', 'Stretching'],
    experience: '6 лет',
    style: 'Мягкий, индивидуальный подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1552334105-c16aa4e880c3?w=600',
    afterImg: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=600',
    title: 'История успеха: Анна',
    description: 'За 8 месяцев занятий High Heels прошла путь от новичка до участницы танцевальной команды. Выступила на городском конкурсе и заняла призовое место.'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать заниматься?',
    answer: 'Мы принимаем детей с 3 лет в группы детской хореографии. Для взрослых возрастных ограничений нет.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы набираем группы разных уровней, есть направления для начинающих.'
  },
  {
    question: 'Какая форма одежды необходима?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels потребуются туфли на каблуке.'
  },
  {
    question: 'Как часто проходят занятия?',
    answer: 'Занятия проводятся 2-3 раза в неделю, в зависимости от выбранного направления и уровня подготовки.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1516481265257-97e5f4bc50d5?w=100', text: 'Научиться танцевать с нуля' },
  { image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100', text: 'Стать пластичнее' },
  { image: 'https://images.unsplash.com/photo-1523450001312-faa4e2e42567?w=100', text: 'Подтянуть фигуру' },
  { image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=100', text: 'Найти новое хобби' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=100', text: 'Повысить уверенность' },
  { image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=100', text: 'Выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1508215885820-4585e56135c8?w=100', text: 'Научить ребенка танцевать' },
  { image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=100', text: 'Раскрыть женственность' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1516481265257-97e5f4bc50d5?w=100', text: 'Улучшить координацию' },
  { image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100', text: 'Найти единомышленников' },
  { image: 'https://images.unsplash.com/photo-1523450001312-faa4e2e42567?w=100', text: 'Подготовиться к выступлению' },
  { image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=100', text: 'Сесть на шпагат' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природных данных для танцев",
    answer: "Танцевать может каждый! Мы работаем с любым уровнем подготовки и помогаем раскрыть индивидуальный потенциал каждого ученика."
  },
  {
    myth: "Я слишком взрослый для начала занятий",
    answer: "Начать танцевать никогда не поздно. У нас занимаются ученики разных возрастов, и мы подбираем программу с учетом индивидуальных особенностей."
  },
  {
    myth: "Боюсь, что не смогу успевать за группой",
    answer: "Мы формируем группы по уровням подготовки. Начинающие занимаются с такими же новичками, а преподаватели уделяют внимание каждому ученику."
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные залы",
    text: "2 просторных зала с профессиональным покрытием, зеркалами и современным звуковым оборудованием",
    image: 'https://images.unsplash.com/photo-1518689383591-5f0d76ec7c21?w=600'
  },
  {
    title: "Опытные преподаватели",
    text: "Команда сертифицированных хореографов с опытом преподавания и участия в международных проектах",
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600'
  },
  {
    title: "Удобное расписание",
    text: "Занятия в утреннее и вечернее время, возможность подобрать удобное расписание",
    image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600'
  },
  {
    title: "Регулярные мероприятия",
    text: "Отчетные концерты, мастер-классы, конкурсы и возможность выступать на городских мероприятиях",
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600'
  }
];
