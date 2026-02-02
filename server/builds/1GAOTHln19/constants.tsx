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
    image: 'https://images.unsplash.com/photo-1514246101535-4faec03f8e8b?w=800',
    description: 'Развиваем пластику, координацию и музыкальность у детей 3-4 лет. Игровой формат занятий с элементами классической хореографии.',
    tags: ['Для детей', 'Хореография', 'Развитие'],
    level: 'Начальный',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Пробное занятие'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Современная хореография для детей и подростков 5-17 лет. Hip-hop, Breaking, House dance с участием в баттлах и соревнованиях.',
    tags: ['Для детей', 'Hip-hop', 'Баттлы'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'high-heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800',
    description: 'Женственная, чувственная хореография на каблуках. Развиваем пластику, грацию и уверенность в себе.',
    tags: ['16+', 'Женственность', 'Пластика'],
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
    description: 'Энергичное направление, сочетающее элементы джаза и современной хореографии. Драйв, экспрессия и отличная физическая форма.',
    tags: ['16+', 'Энергия', 'Современные танцы'],
    level: 'Средний',
    duration: '55 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Попробовать'
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=800',
    description: 'Комплекс упражнений для развития гибкости и подвижности. Работаем над продольным и поперечным шпагатом.',
    tags: ['Гибкость', 'Шпагат', 'Здоровье'],
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
    description: 'Интенсивные кардио-тренировки на мини-батутах. Улучшаем выносливость, координацию и тонус мышц.',
    tags: ['Кардио', 'Похудение', 'Тонус'],
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
    specialties: ['High Heels', 'Jazz-Funk'],
    experience: '8 лет',
    style: 'Энергичный, вдохновляющий подход'
  },
  {
    id: 2,
    name: 'Артём Волков',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    specialties: ['Уличные танцы', 'Breaking'],
    experience: '10 лет',
    style: 'Динамичный стиль преподавания'
  },
  {
    id: 3,
    name: 'Мария Соколова',
    image: 'https://images.unsplash.com/photo-1595859703064-2cd77ba3cd63?w=400',
    specialties: ['Детская хореография', 'Растяжка'],
    experience: '6 лет',
    style: 'Внимательный подход к каждому ученику'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    afterImg: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400',
    title: 'История успеха: Анна, 28 лет',
    description: 'За 8 месяцев занятий High Heels прошла путь от новичка до участницы танцевальной команды. Обрела уверенность в себе и новых друзей.'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать занятия?',
    answer: 'Мы принимаем детей с 3 лет на программу детской хореографии. Для взрослых возрастных ограничений нет.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы формируем группы по уровням подготовки. Для новичков есть специальные программы с базовыми элементами.'
  },
  {
    question: 'Какая форма одежды нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels потребуются туфли на устойчивом каблуке.'
  },
  {
    question: 'Как часто рекомендуется посещать занятия?',
    answer: 'Для заметного прогресса рекомендуем заниматься 2-3 раза в неделю.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1516481265257-97e5f4bc50d5?w=100', text: 'Научиться танцевать с нуля' },
  { image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=100', text: 'Сесть на шпагат' },
  { image: 'https://images.unsplash.com/photo-1529940340007-8ef64abc360a?w=100', text: 'Похудеть и подтянуть тело' },
  { image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=100', text: 'Найти хобби для ребёнка' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=100', text: 'Добавить женственности' },
  { image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=100', text: 'Выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1470468969717-61d5d54fd036?w=100', text: 'Преодолеть стеснительность' },
  { image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100', text: 'Научиться танцевать на каблуках' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=100', text: 'Улучшить осанку' },
  { image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=100', text: 'Найти единомышленников' },
  { image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=100', text: 'Развить координацию' },
  { image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=100', text: 'Подготовиться к выступлению' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природных данных для танцев",
    answer: "Танцевать может каждый! Мы учитываем индивидуальные особенности и подбираем программу под ваш уровень. Главное – желание и регулярные занятия."
  },
  {
    myth: "Я слишком взрослый для начала занятий танцами",
    answer: "Возраст – не помеха! У нас занимаются ученики разных возрастов, многие начали после 30 и 40 лет. Важен ваш настрой и готовность развиваться."
  },
  {
    myth: "Боюсь, что не смогу влиться в коллектив",
    answer: "Мы создаём дружественную атмосферу в группах. Новички всегда получают поддержку от преподавателей и других учеников. Многие находят здесь новых друзей!"
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные залы",
    text: "2 просторных зала с профессиональным покрытием, зеркалами и современным звуковым оборудованием",
    image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=600'
  },
  {
    title: "Опытные преподаватели",
    text: "Команда сертифицированных тренеров с богатым опытом выступлений и преподавания",
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600'
  },
  {
    title: "Удобное расписание",
    text: "Занятия в утреннее и вечернее время, в выходные дни. Возможность подобрать удобное время",
    image: 'https://images.unsplash.com/photo-1475452779376-caebfb988090?w=600'
  },
  {
    title: "Регулярные мероприятия",
    text: "Мастер-классы, открытые уроки, отчётные концерты и возможность участия в конкурсах",
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600'
  }
];
