import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: STUDIO_2214

// === BRAND CONFIG (используется в Header, Hero, Director, Calculator) ===
export const BRAND_CONFIG = {
  name: 'STUDIO_2214',
  tagline: 'Раскрой свою женственность в танце',
  niche: 'dance',
  city: 'Тольятти',
  logo: '',
  // Hero
  heroTitle: 'STUDIO_2214 — территория женского танца',
  heroSubtitle: 'Танцуй для себя',
  heroDescription: 'Современная танцевальная студия для женщин с двумя филиалами в Тольятти. Раскройте свою чувственность через танец в уютной атмосфере единомышленниц.',
  heroImage: 'https://placehold.co/800x600/1a1a1a/666666?text=Танцевальный+зал',
  heroQuote: 'Танец — это поэзия души в движении',
};

// === DIRECTOR CONFIG ===
export const DIRECTOR_CONFIG = {
  name: 'Имя Фамилия',
  title: 'Основатель студии',
  description: 'Профессиональный хореограф с 10-летним опытом преподавания. Создала STUDIO_2214 как пространство, где каждая женщина может раскрыть свою природную грацию через танец.',
  image: 'https://placehold.co/600x700/1a1a1a/666666?text=Фото+директора',
  achievements: ['Сертифицированный преподаватель Strip Plastic', 'Постановщик шоу-программ', 'Организатор танцевальных мастер-классов'],
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
  '2 удобные локации в городе',
  'Единый абонемент для обоих филиалов',
  'Занятия для любого уровня подготовки'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'strip',
    title: 'Strip Plastic',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Strip+Plastic',
    description: 'Чувственный танцевальный стиль, сочетающий элементы современной хореографии и пластики. Развивает грацию, гибкость и уверенность в себе.',
    tags: ['Пластика', 'Женственность', 'Хореография'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'heels',
    title: 'High Heels',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=High+Heels',
    description: 'Танцы на каблуках, сочетающие элементы джаз-фанка и стрип-пластики. Учимся красиво двигаться и чувствовать себя уверенно на каблуках.',
    tags: ['Каблуки', 'Хореография', 'Уверенность'],
    level: 'Начинающий',
    duration: '55 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'contemporary',
    title: 'Contemporary',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Contemporary',
    description: 'Современный танец, основанный на естественной пластике тела. Развивает координацию, выразительность и эмоциональность движений.',
    tags: ['Пластика', 'Импровизация', 'Эмоции'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'jazz',
    title: 'Jazz Funk',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Jazz+Funk',
    description: 'Энергичный танцевальный стиль, сочетающий элементы джаза и хип-хопа. Яркие связки, работа с ритмом и драйвовая музыка.',
    tags: ['Энергия', 'Ритм', 'Драйв'],
    level: 'Средний',
    duration: '55 мин',
    category: 'dance',
    complexity: 4,
    buttonText: 'Записаться'
  },
  {
    id: 'stretching',
    title: 'Dance Stretching',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Dance+Stretching',
    description: 'Растяжка с элементами хореографии. Улучшает гибкость, пластичность и амплитуду движений для танцев.',
    tags: ['Гибкость', 'Пластика', 'Растяжка'],
    level: 'Любой',
    duration: '55 мин',
    category: 'body',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'latina',
    title: 'Lady Style',
    image: 'https://placehold.co/800x600/1a1a1a/666666?text=Lady+Style',
    description: 'Женственная латина соло. Развиваем пластику, работаем над техникой движений бедер и корпуса.',
    tags: ['Латина', 'Женственность', 'Соло'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Имя Фамилия',
    image: 'https://placehold.co/400x500/1a1a1a/666666?text=Хореограф',
    specialties: ['Strip Plastic', 'High Heels'],
    experience: '7 лет',
    style: 'Чувственный подход'
  },
  {
    id: 2,
    name: 'Имя Фамилия',
    image: 'https://placehold.co/400x500/1a1a1a/666666?text=Хореограф',
    specialties: ['Contemporary', 'Jazz Funk'],
    experience: '5 лет',
    style: 'Энергичный стиль'
  },
  {
    id: 3,
    name: 'Имя Фамилия',
    image: 'https://placehold.co/400x500/1a1a1a/666666?text=Хореограф',
    specialties: ['Lady Style', 'Dance Stretching'],
    experience: '6 лет',
    style: 'Техничный подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://placehold.co/400x500/1a1a1a/666666?text=ДО',
    afterImg: 'https://placehold.co/400x500/1a1a1a/666666?text=ПОСЛЕ',
    title: 'История успеха: Анна К.',
    description: 'За 6 месяцев занятий Strip Plastic и High Heels обрела уверенность в себе и своем теле, научилась красиво двигаться и выступила на отчетном концерте студии'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Нужна ли танцевальная подготовка?',
    answer: 'Нет, мы набираем группы разных уровней. Для начинающих есть базовые группы, где все изучается с нуля.'
  },
  {
    question: 'Какая одежда нужна для занятий?',
    answer: 'Удобная облегающая одежда, позволяющая видеть линии тела. Для High Heels потребуются туфли на каблуке 5-10 см.'
  },
  {
    question: 'Проводите ли вы отчетные концерты?',
    answer: 'Да, каждые 3-4 месяца мы организуем отчетные концерты, где ученицы могут показать свои достижения.'
  },
  {
    question: 'С какого возраста можно заниматься?',
    answer: 'Мы принимаем учениц с 16 лет. Верхних возрастных ограничений нет.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу научиться красиво двигаться' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю танцевать на каблуках' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу стать пластичнее' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю выступать на сцене' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу раскрепоститься' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Ищу женский коллектив' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу почувствовать себя увереннее' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю о красивой осанке' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу научиться импровизировать' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Ищу способ самовыражения' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Хочу стать женственнее' },
  { image: 'https://placehold.co/100x100/1a1a1a/666666?text=Клиент', text: 'Мечтаю о гибком теле' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет танцевального опыта",
    answer: "80% наших учениц начинали с нуля. Мы формируем группы по уровням и уделяем особое внимание новичкам"
  },
  {
    myth: "Я не достаточно пластичная",
    answer: "Пластичность развивается постепенно. Мы подбираем нагрузку индивидуально и работаем в комфортном темпе"
  },
  {
    myth: "Боюсь, что не смогу заниматься на каблуках",
    answer: "Начинаем с базовых движений на небольшом каблуке. Постепенно вы научитесь уверенно двигаться даже на высокой шпильке"
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Два филиала",
    text: "Занимайтесь в любом удобном филиале по единому абонементу",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Филиалы'
  },
  {
    title: "Профессиональные хореографы",
    text: "Команда опытных преподавателей с профильным образованием",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Преподаватели'
  },
  {
    title: "Регулярные выступления",
    text: "Отчетные концерты каждые 3-4 месяца для всех желающих",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Концерты'
  },
  {
    title: "Уютная атмосфера",
    text: "Комфортные залы с профессиональным покрытием и зеркалами",
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Залы'
  }
];

// === CONTACTS ===
export const CONTACTS = {
  phone: '+7 (XXX) XXX-XX-XX',
  email: 'info@studio2214.ru',
  address: 'ул. Дзержинского, 27а и ул. Дзержинского, 16а',
  addressDetails: 'ТЦ «Флагман» и ТЦ «Карусель»',
  telegram: '@studio2214',
  whatsapp: '',
  vk: 'https://vk.com/studio2214',
  instagram: '',
  mapUrl: '',
  mapCoords: '',
};

// === PRICING ===
export const PRICING = [
  {
    name: 'Разовое занятие',
    price: '600 ₽',
    period: 'за занятие',
    features: ['Любое направление', '60 минут'],
    highlighted: false,
    category: 'групповые'
  },
  {
    name: 'Абонемент 8 занятий',
    price: '3800 ₽',
    period: '30 дней',
    features: ['8 групповых занятий', 'Любые направления', 'Заморозка 7 дней'],
    highlighted: true,
    category: 'абонементы'
  },
  {
    name: 'Абонемент 12 занятий',
    price: '5400 ₽',
    period: '45 дней',
    features: ['12 групповых занятий', 'Любые направления', 'Заморозка 14 дней'],
    highlighted: false,
    category: 'абонементы'
  },
  {
    name: 'Индивидуальное занятие',
    price: '2000 ₽',
    period: '60 минут',
    features: ['Персональная программа', 'Любое направление'],
    highlighted: false,
    category: 'персональные'
  }
];

// === REVIEWS ===
export const REVIEWS = [
  {
    name: 'Мария С.',
    text: 'Занимаюсь в студии уже полгода, и это лучшее, что я сделала для себя! Прекрасные преподаватели, уютная атмосфера и потрясающие результаты.',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Елена К.',
    text: 'Очень удобно, что можно ходить в оба филиала. High Heels с Анной просто супер!',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Ирина М.',
    text: 'Начала с нуля, боялась, что не получится. Теперь танцую во всех отчетных концертах!',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Анастасия П.',
    text: 'Strip plastic помог раскрыть женственность и обрести уверенность. Спасибо преподавателям за чуткий подход!',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Юлия Д.',
    text: 'Хожу на Contemporary, очень нравится подача материала и дружелюбная атмосфера в группе.',
    source: 'ВКонтакте',
    rating: 5
  }
];

// === GALLERY ===
export const GALLERY = [
  'https://placehold.co/600x400/1a1a1a/666666?text=Основной+зал',
  'https://placehold.co/600x400/1a1a1a/666666?text=Раздевалка',
  'https://placehold.co/600x400/1a1a1a/666666?text=Ресепшн',
  'https://placehold.co/600x400/1a1a1a/666666?text=Занятие+High+Heels',
  'https://placehold.co/600x400/1a1a1a/666666?text=Занятие+Strip+Plastic',
  'https://placehold.co/600x400/1a1a1a/666666?text=Отчетный+концерт'
];

// === QUIZ CONFIG ===
export const QUIZ_CONFIG = {
  managerName: 'Имя Фамилия',
  managerImage: 'https://placehold.co/200x200/1a1a1a/666666?text=Менеджер',
  tips: ['Для начинающих рекомендуем базовые группы', 'Можно совмещать разные направления', 'Первое занятие — пробное', 'Есть утренние и вечерние группы', 'Предоставляем рассрочку на абонементы'],
  steps: [
    {
      question: 'Был ли у вас опыт танцев?',
      options: ['Нет опыта', 'Занималась раньше', 'Занимаюсь сейчас', 'Есть профессиональный опыт']
    },
    {
      question: 'Какое направление вас интересует?',
      options: ['Strip Plastic', 'High Heels', 'Contemporary', 'Lady Style', 'Пока не определилась']
    },
    {
      question: 'В какое время удобнее заниматься?',
      options: ['Утро', 'День', 'Вечер', 'Выходные']
    },
    {
      question: 'Какая цель занятий?',
      options: ['Научиться танцевать', 'Стать пластичнее', 'Выступать на сцене', 'Для себя']
    },
    {
      question: 'В каком филиале удобнее заниматься?',
      options: ['ТЦ Флагман', 'ТЦ Карусель', 'Оба подходят']
    }
  ]
};

// === ATMOSPHERE ===
export const ATMOSPHERE = [
  {
    title: 'Просторные залы',
    description: 'Профессиональное покрытие, большие зеркала и качественное звуковое оборудование',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Танцевальный+зал'
  },
  {
    title: 'Комфортные раздевалки',
    description: 'Индивидуальные шкафчики, душевые кабины и фены для укладки',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Раздевалка'
  },
  {
    title: 'Уютная зона отдыха',
    description: 'Место, где можно отдохнуть до или после тренировки',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Зона+отдыха'
  },
  {
    title: 'Дружелюбная атмосфера',
    description: 'Поддерживающий коллектив единомышленниц',
    image: 'https://placehold.co/600x400/1a1a1a/666666?text=Команда'
  }
];

// === CALCULATOR STAGES (по нише) ===
export const CALCULATOR_STAGES = [
  {
    'status': '1 месяц занятий',
    'description': 'Освоение базовых движений, развитие чувства ритма',
    'tags': [
      'Основы',
      'Координация',
      'Ритм'
    ],
    'achievement': 'Базовые движения и связки'
  },
  {
    'status': '3 месяца занятий',
    'description': 'Уверенное исполнение базовых связок, работа над пластикой',
    'tags': [
      'Пластика',
      'Техника',
      'Уверенность'
    ],
    'achievement': 'Первое выступление'
  },
  {
    'status': '6 месяцев занятий',
    'description': 'Освоение сложных элементов, импровизация',
    'tags': [
      'Сложные элементы',
      'Импровизация',
      'Артистизм'
    ],
    'achievement': 'Сольный номер'
  },
  {
    'status': '12 месяцев занятий',
    'description': 'Профессиональный уровень исполнения, постановка номеров',
    'tags': [
      'Мастерство',
      'Постановки',
      'Выступления'
    ],
    'achievement': 'Участие в шоу-программах'
  }
];

// === SECTION TITLES (динамические заголовки секций) ===
export const SECTION_TITLES = {
  'calculator': {
    'title': 'Ваш путь в танце',
    'subtitle': 'От первых шагов до уверенного исполнения',
    'buttonText': 'Начать танцевать'
  },
  'directions': {
    'title': '6 направлений',
    'subtitle': 'для раскрытия женственности'
  },
  'pricing': {
    'title': 'Доступные абонементы',
    'subtitle': 'для любого графика занятий'
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
    'label': 'Танцевальные',
    'category': 'dance'
  },
  {
    'key': 'body',
    'label': 'Пластика',
    'category': 'body'
  },
  {
    'key': 'heels',
    'label': 'На каблуках',
    'category': 'dance'
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
