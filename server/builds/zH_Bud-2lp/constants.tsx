import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: Lazurite Dance Studio

// === BRAND CONFIG (используется в Header, Hero, Director, Calculator) ===
export const BRAND_CONFIG = {
  name: 'Lazurite Dance Studio',
  tagline: 'Танцуй. Создавай. Вдохновляй.',
  niche: 'dance',
  city: 'Колпино',
  logo: '',
  // Hero
  heroTitle: 'Раскрой свой танцевальный потенциал',
  heroSubtitle: 'Твоя история в танце',
  heroDescription: 'Современная танцевальная студия для детей и взрослых с авторскими программами и профессиональными хореографами',
  heroImage: 'https://placehold.co/800x600/1a1a1a/666666?text=Танцевальный+зал',
  heroQuote: 'Танец — это поэзия души в движении',
};

// === DIRECTOR CONFIG ===
export const DIRECTOR_CONFIG = {
  name: 'Имя Фамилия',
  title: 'Основатель студии',
  description: 'Профессиональный хореограф с опытом преподавания более 10 лет. Создала уникальную методику обучения танцам для взрослых с нуля.',
  image: 'https://placehold.co/600x700/1a1a1a/666666?text=Фото+директора',
  achievements: ['Победитель международных танцевальных конкурсов', 'Автор программы обучения High Heels', 'Постановщик шоу-программ'],
};

// Показывать Calculator только для fitness/yoga/stretching/wellness (НЕ для dance)
export const SHOW_CALCULATOR = false;

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'О студии', href: '#director' },
  { label: 'Результаты', href: '#progress-timeline' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#footer' },
];

export const HERO_ADVANTAGES = [
  'Группы для всех уровней',
  'Профессиональные хореографы',
  'Участие в конкурсах'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'heels',
    title: 'High Heels',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=High+Heels',
    description: 'Женственная хореография на каблуках. Развитие пластики, грации и уверенности в себе. Идеально для начинающих.',
    tags: ['Женственность', 'Пластика', 'Каблуки'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'jazz-funk',
    title: 'Jazz-Funk',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Jazz+Funk',
    description: 'Энергичный микс джаза и хип-хопа. Яркая хореография, работа с телом и музыкальностью.',
    tags: ['Энергия', 'Драйв', 'Техника'],
    level: 'Средний',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Растяжка',
    description: 'Комплексное развитие гибкости для танцоров. Работа со шпагатами и общей эластичностью мышц.',
    tags: ['Гибкость', 'Шпагаты', 'Пластика'],
    level: 'Любой',
    duration: '55 мин',
    category: 'body',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'kids-dance',
    title: 'Детская хореография',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Детские+танцы',
    description: 'Танцевальные занятия для детей 3-4 лет. Развитие координации, музыкальности и творческого потенциала.',
    tags: ['Дети', 'Развитие', 'Творчество'],
    level: 'Начинающий',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Записаться'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Street+Dance',
    description: 'Современная хореография для детей 5-17 лет. Hip-hop, breaking и другие уличные стили.',
    tags: ['Hip-hop', 'Breaking', 'Молодежь'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'jumping',
    title: 'Jumping Fitness',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Jumping+Fitness',
    description: 'Танцевальные тренировки на мини-батутах. Кардио нагрузка и хореография в одном занятии.',
    tags: ['Фитнес', 'Кардио', 'Танцы'],
    level: 'Любой',
    duration: '45 мин',
    category: 'special',
    complexity: 2,
    buttonText: 'Записаться'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Ксения',
    image: 'https://placehold.co/400x500/1a1a1a/666666?text=Хореограф+Ксения',
    specialties: ['High Heels', 'Jazz-Funk'],
    experience: '8+ лет',
    style: 'Современная хореография'
  },
  {
    id: 2,
    name: 'Имя Фамилия',
    image: 'https://placehold.co/400x500/1a1a1a/666666?text=Хореограф+детских+групп',
    specialties: ['Детская хореография', 'Уличные танцы'],
    experience: '5+ лет',
    style: 'Работа с детьми'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://placehold.co/400x500/1a1a1a/666666?text=ДО',
    afterImg: 'https://placehold.co/400x500/1a1a1a/666666?text=ПОСЛЕ',
    title: 'История успеха: Анна К.',
    description: 'От начинающей танцовщицы до участницы танцевальной команды за 8 месяцев'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Нужна ли танцевальная подготовка?',
    answer: 'Нет, мы набираем группы разных уровней, в том числе для начинающих'
  },
  {
    question: 'Какая одежда нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels понадобятся туфли на каблуке'
  },
  {
    question: 'Можно ли присоединиться к группе в середине месяца?',
    answer: 'Да, вы можете начать с разового занятия в любой момент'
  },
  {
    question: 'Проводите ли вы отчетные концерты?',
    answer: 'Да, регулярно организуем выступления и участвуем в танцевальных конкурсах'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу научиться танцевать с нуля' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю красиво двигаться на каблуках' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Ищу современные танцы для ребенка' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу стать увереннее в себе' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю выступать на сцене' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Нужна растяжка для танцев' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу развить пластику' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Ищу активный досуг' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу попасть в танцевальную команду' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю о шпагате' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Нужна женственная пластика' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу найти единомышленников' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природной пластики",
    answer: "Пластику можно развить! Наши программы построены так, чтобы постепенно раскрыть природную грацию каждого ученика"
  },
  {
    myth: "Я слишком взрослая для танцев",
    answer: "Танцевать можно начать в любом возрасте. У нас есть ученицы, которые пришли в 40+ и достигли впечатляющих результатов"
  },
  {
    myth: "Боюсь не успевать за группой",
    answer: "Мы формируем группы по уровню подготовки. Начинающие занимаются с начинающими, что создает комфортную атмосферу для обучения"
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные хореографы",
    text: "Команда опытных преподавателей с профильным образованием",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Преподаватели'
  },
  {
    title: "Группы по уровням",
    text: "Комфортное обучение в группах соответствующего уровня подготовки",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Группы'
  },
  {
    title: "Современное оборудование",
    text: "Просторные залы с профессиональным покрытием и зеркалами",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Оборудование'
  },
  {
    title: "Выступления",
    text: "Регулярные отчетные концерты и участие в конкурсах",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Выступления'
  }
];

// === CONTACTS ===
export const CONTACTS = {
  phone: '+7 (911) 264-38-94',
  email: 'info@lazurite.dance',
  address: 'г. Колпино',
  addressDetails: 'Центр города',
  telegram: '@lazuritedance',
  whatsapp: '',
  vk: 'https://vk.com/lazuritedance',
  instagram: '',
  mapUrl: '',
  mapCoords: '',
};

// === PRICING ===
export const PRICING = [
  {
    name: 'Разовое занятие',
    price: '700 ₽',
    period: 'за занятие',
    features: ['Любое направление', '60 минут', 'Без обязательств'],
    highlighted: false,
    category: 'групповые'
  },
  {
    name: 'Абонемент 8 занятий',
    price: '4800 ₽',
    period: 'в месяц',
    features: ['8 групповых занятий', 'Срок 30 дней', 'Заморозка 7 дней'],
    highlighted: true,
    category: 'абонементы'
  },
  {
    name: 'Абонемент 12 занятий',
    price: '6600 ₽',
    period: 'в месяц',
    features: ['12 групповых занятий', 'Срок 45 дней', 'Заморозка 14 дней'],
    highlighted: false,
    category: 'абонементы'
  },
  {
    name: 'Персональная тренировка',
    price: '2500 ₽',
    period: 'за занятие',
    features: ['Индивидуальный подход', '60 минут', 'Любое направление'],
    highlighted: false,
    category: 'персональные'
  }
];

// === REVIEWS ===
export const REVIEWS = [
  {
    name: 'Мария С.',
    text: 'Занимаюсь в студии уже полгода, и это лучшее, что я сделала для себя! High Heels полностью изменили мою походку и осанку',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Анна К.',
    text: 'Прекрасные преподаватели, которые находят подход к каждому ученику. Особенно впечатляет подача материала для новичков',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Елена М.',
    text: 'Дочь ходит на уличные танцы, в восторге от занятий! За год добились отличных результатов',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Ирина П.',
    text: 'Очень уютная студия с дружественной атмосферой. Jazz-Funk просто бомба!',
    source: 'Яндекс Карты',
    rating: 5
  }
];

// === GALLERY ===
export const GALLERY = [
  'https://placehold.co/600x400/1a1a1a/666666?text=Танцевальный+зал+1',
  'https://placehold.co/600x400/1a1a1a/666666?text=Танцевальный+зал+2',
  'https://placehold.co/600x400/1a1a1a/666666?text=Раздевалка',
  'https://placehold.co/600x400/1a1a1a/666666?text=Ресепшн',
  'https://placehold.co/600x400/1a1a1a/666666?text=Занятие+High+Heels',
  'https://placehold.co/600x400/1a1a1a/666666?text=Детская+группа'
];

// === QUIZ CONFIG ===
export const QUIZ_CONFIG = {
  managerName: 'Имя Фамилия',
  managerImage: 'https://placehold.co/200x200/1a1a1a/666666?text=Менеджер',
  tips: ['Для начинающих рекомендуем начать с базовых групп', 'Первое пробное занятие поможет определиться с направлением', 'Можно совмещать разные стили танцев', 'Форму для занятий легко подобрать в обычном спортивном магазине', 'Не переживайте о возрасте - танцевать можно начать в любом возрасте'],
  steps: [
    {
      question: 'Какой у вас танцевальный опыт?',
      options: ['Нет опыта', 'Начинающий', 'Средний', 'Продвинутый']
    },
    {
      question: 'Какое направление вас интересует?',
      options: ['High Heels', 'Jazz-Funk', 'Уличные танцы', 'Растяжка', 'Пока не определился']
    },
    {
      question: 'В какое время удобнее заниматься?',
      options: ['Утро', 'День', 'Вечер', 'Выходные']
    },
    {
      question: 'Какая ваша основная цель?',
      options: ['Научиться танцевать', 'Поддерживать форму', 'Выступать на сцене', 'Для себя']
    }
  ]
};

// === ATMOSPHERE ===
export const ATMOSPHERE = [
  {
    title: 'Просторные залы',
    description: 'Светлые залы с профессиональным покрытием и зеркалами',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Зал'
  },
  {
    title: 'Комфортные раздевалки',
    description: 'Удобные шкафчики и душевые комнаты',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Раздевалка'
  },
  {
    title: 'Зона отдыха',
    description: 'Уютное пространство для общения до и после занятий',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Лаундж'
  },
  {
    title: 'Дружественная атмосфера',
    description: 'Поддерживающее комьюнити единомышленников',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Команда'
  }
];

// === CALCULATOR STAGES (по нише) ===
export const CALCULATOR_STAGES = [
  {
    'status': '1 месяц',
    'description': 'Освоение базовых движений, развитие чувства ритма',
    'tags': [
      'Координация',
      'Ритм',
      'Основы'
    ],
    'achievement': 'Уверенное выполнение базовых связок'
  },
  {
    'status': '3 месяца',
    'description': 'Улучшение пластики, освоение танцевальных комбинаций',
    'tags': [
      'Пластика',
      'Техника',
      'Связки'
    ],
    'achievement': 'Исполнение полноценных танцевальных номеров'
  },
  {
    'status': '6 месяцев',
    'description': 'Уверенное владение техникой, импровизация',
    'tags': [
      'Импровизация',
      'Стиль',
      'Выступления'
    ],
    'achievement': 'Участие в отчетных концертах'
  },
  {
    'status': '12 месяцев',
    'description': 'Профессиональный уровень исполнения',
    'tags': [
      'Мастерство',
      'Конкурсы',
      'Шоу'
    ],
    'achievement': 'Участие в конкурсах и шоу-программах'
  }
];

// === SECTION TITLES (динамические заголовки секций) ===
export const SECTION_TITLES = {
  'calculator': {
    'title': 'Твой путь в танце',
    'subtitle': 'От первых шагов до уверенного исполнения',
    'buttonText': 'Начать танцевать'
  },
  'directions': {
    'title': '6 направлений',
    'subtitle': 'для любого уровня подготовки'
  },
  'pricing': {
    'title': 'Доступные абонементы',
    'subtitle': 'для комфортных занятий'
  }
};

// === DIRECTIONS TABS (табы для фильтрации направлений) ===
export const DIRECTIONS_TABS = [
  {
    'key': 'all',
    'label': 'Все'
  },
  {
    'key': 'dance',
    'label': 'Групповые',
    'category': 'dance'
  },
  {
    'key': 'body',
    'label': 'Индивидуальные',
    'category': 'body'
  },
  {
    'key': 'special',
    'label': 'Специальные',
    'category': 'special'
  }
];

// === COLOR SCHEME (цветовая схема) ===
export const COLOR_SCHEME = {
  'primary': '#ba000f',
  'accent': '#ff4444',
  'background': '#0c0c0f',
  'surface': '#18181b',
  'text': '#ffffff'
};
