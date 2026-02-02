import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: IMPULS

// === BRAND CONFIG (используется в Header, Hero, Director, Calculator) ===
export const BRAND_CONFIG = {
  name: 'IMPULS',
  tagline: 'Танцуй. Создавай. Вдохновляй.',
  niche: 'dance',
  city: '',
  logo: '',
  // Hero
  heroTitle: 'Школа танцев IMPULS',
  heroSubtitle: 'Раскрой свой потенциал',
  heroDescription: 'Профессиональная танцевальная студия с 5 просторными залами и опытными хореографами. Обучаем танцам с нуля детей и взрослых.',
  heroImage: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=800',
  heroQuote: 'Танец — это тайный язык души',
};

// === DIRECTOR CONFIG ===
export const DIRECTOR_CONFIG = {
  name: 'Имя Фамилия',
  title: 'Основатель студии',
  description: 'Профессиональный хореограф с 15-летним опытом. Создала уникальную методику обучения танцам, позволяющую раскрыть потенциал каждого ученика независимо от начального уровня.',
  image: 'https://images.unsplash.com/photo-1541727687969-ce40493cd847?w=600',
  achievements: ['Победитель международных танцевальных конкурсов', 'Автор методики обучения танцам', 'Постановщик более 100 успешных шоу-программ'],
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
  '2 филиала в городе',
  '5 просторных залов',
  '150+ победителей конкурсов'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'hip-hop',
    title: 'Hip-Hop',
    image: 'https://images.unsplash.com/photo-1557330359-ffb0deed6163?w=800',
    description: 'Энергичный уличный стиль, сочетающий различные техники и направления. Развивает координацию, чувство ритма и уверенность в себе.',
    tags: ['Уличные танцы', 'Энергия', 'Ритм'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'contemporary',
    title: 'Contemporary',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
    description: 'Современный танец, объединяющий элементы классической хореографии и импровизации. Развивает пластику и выразительность.',
    tags: ['Пластика', 'Импровизация', 'Эмоции'],
    level: 'Начальный+',
    duration: '75 мин',
    category: 'dance',
    complexity: 4,
    buttonText: 'Записаться'
  },
  {
    id: 'heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Женственный танцевальный стиль на каблуках. Сочетает элементы jazz funk, strip plastic и шоу-хореографии.',
    tags: ['Женственность', 'Грация', 'Уверенность'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'bachata',
    title: 'Bachata',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
    description: 'Чувственный парный танец родом из Доминиканы. Развивает музыкальность, пластику и навыки социального танца.',
    tags: ['Парные танцы', 'Пластика', 'Социальные танцы'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2,
    buttonText: 'Записаться'
  },
  {
    id: 'strip',
    title: 'Strip Plastic',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800',
    description: 'Пластичный танцевальный стиль, развивающий женственность и грацию. Включает элементы contemporary и jazz modern.',
    tags: ['Пластика', 'Женственность', 'Грация'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'kids',
    title: 'Детские танцы',
    image: 'https://images.unsplash.com/photo-1472111623185-af5338f8f6bd?w=800',
    description: 'Танцевальные занятия для детей от 3 лет. Развивают координацию, музыкальность и творческие способности.',
    tags: ['Для детей', 'Развитие', 'Творчество'],
    level: 'Начальный',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Записаться'
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Имя Фамилия',
    image: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=400',
    specialties: ['Hip-Hop', 'Contemporary'],
    experience: '8 лет',
    style: 'Энергичный подход'
  },
  {
    id: 2,
    name: 'Имя Фамилия',
    image: 'https://images.unsplash.com/photo-1541727687969-ce40493cd847?w=400',
    specialties: ['High Heels', 'Strip Plastic'],
    experience: '6 лет',
    style: 'Женственная хореография'
  },
  {
    id: 3,
    name: 'Имя Фамилия',
    image: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=400',
    specialties: ['Bachata', 'Детские танцы'],
    experience: '7 лет',
    style: 'Индивидуальный подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400',
    afterImg: 'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?w=400',
    title: 'История успеха: Анна К.',
    description: 'За 6 месяцев от новичка до участницы танцевального конкурса'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать заниматься?',
    answer: 'Мы принимаем детей с 3 лет, взрослых – без ограничений по возрасту. Группы формируются с учетом возраста и уровня подготовки.'
  },
  {
    question: 'Какая одежда нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для разных направлений могут потребоваться специальная обувь (кроссовки, каблуки) – детали уточняйте у администратора.'
  },
  {
    question: 'Когда можно будет выступать на сцене?',
    answer: 'Первые выступления возможны уже через полгода регулярных занятий. Мы регулярно участвуем в конкурсах и организуем отчетные концерты.'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы набираем группы с нуля. Наши преподаватели помогут освоить базовые движения и постепенно повышать уровень.'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=100', text: 'Научиться красиво танцевать' },
  { image: 'https://images.unsplash.com/photo-1541727687969-ce40493cd847?w=100', text: 'Стать более пластичной' },
  { image: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=100', text: 'Выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=100', text: 'Раскрепоститься' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=100', text: 'Повысить уверенность' },
  { image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=100', text: 'Научиться социальным танцам' },
  { image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=100', text: 'Развить женственность' },
  { image: 'https://images.unsplash.com/photo-1557330359-ffb0deed6163?w=100', text: 'Улучшить координацию' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=100', text: 'Найти творческое хобби' },
  { image: 'https://images.unsplash.com/photo-1541727687969-ce40493cd847?w=100', text: 'Научиться двигаться под музыку' },
  { image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=100', text: 'Подготовиться к выступлению' },
  { image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=100', text: 'Найти единомышленников' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природной пластичности",
    answer: "Пластичность – это навык, который можно развить. Наши преподаватели помогут вам постепенно раскрыть свой потенциал через специальные упражнения и индивидуальный подход."
  },
  {
    myth: "Я слишком взрослый для танцев",
    answer: "Танцевать можно начать в любом возрасте! У нас есть группы для разных возрастных категорий, где темп обучения подбирается индивидуально."
  },
  {
    myth: "Боюсь, что не смогу догнать группу",
    answer: "Мы формируем группы по уровню подготовки. Начинающие занимаются с начинающими, а преподаватель уделяет внимание каждому ученику."
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные хореографы",
    text: "Команда опытных преподавателей с профильным образованием и регулярным повышением квалификации",
    image: 'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=600'
  },
  {
    title: "Просторные залы",
    text: "5 оборудованных залов площадью от 53 до 117 кв.м с профессиональным покрытием и зеркалами",
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600'
  },
  {
    title: "Регулярные выступления",
    text: "Возможность участвовать в отчетных концертах и конкурсах уже через полгода занятий",
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600'
  },
  {
    title: "Удобное расположение",
    text: "Два филиала в разных районах города с хорошей транспортной доступностью",
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600'
  }
];

// === CONTACTS ===
export const CONTACTS = {
  phone: '+7 (XXX) XXX-XX-XX',
  email: 'info@impuls-dance.ru',
  address: 'ул. Степная / ул. Гагарина',
  addressDetails: 'Просторные залы с современным оборудованием',
  telegram: '@impulsdance',
  whatsapp: '',
  vk: 'https://vk.com/impulsdance',
  instagram: '',
  mapUrl: '',
  mapCoords: '',
};

// === PRICING ===
export const PRICING = [
  {
    name: 'Пробное занятие',
    price: '100 ₽',
    period: 'разовое',
    features: ['Любое направление', '60 минут', 'Знакомство со студией'],
    highlighted: false,
    category: 'разовые'
  },
  {
    name: 'Разовое занятие',
    price: '500 ₽',
    period: 'за занятие',
    features: ['Любое направление', '60 минут'],
    highlighted: false,
    category: 'разовые'
  },
  {
    name: 'Абонемент 8 занятий',
    price: '3200 ₽',
    period: '30 дней',
    features: ['8 групповых занятий', 'Заморозка 7 дней', 'Скидка 10% на следующий'],
    highlighted: true,
    category: 'абонементы'
  },
  {
    name: 'Абонемент 12 занятий',
    price: '4500 ₽',
    period: '30 дней',
    features: ['12 групповых занятий', 'Заморозка 14 дней', 'Бонусное занятие'],
    highlighted: false,
    category: 'абонементы'
  },
  {
    name: 'Персональная тренировка',
    price: '2000 ₽',
    period: '60 минут',
    features: ['Индивидуальный подход', 'Любое направление', 'Гибкий график'],
    highlighted: false,
    category: 'персональные'
  }
];

// === REVIEWS ===
export const REVIEWS = [
  {
    name: 'Мария С.',
    text: 'Занимаюсь в IMPULS уже год, и это лучшее, что случилось со мной! Прекрасные преподаватели, удобное расписание и потрясающая атмосфера.',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Анна К.',
    text: 'Пришла с нулевым уровнем, через полгода уже участвовала в отчетном концерте. Очень довольна результатами!',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Елена М.',
    text: 'Отличная студия! Занимаюсь Strip Plastic, преподаватель внимательная, группа дружная. Всем рекомендую!',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Ирина Д.',
    text: 'Дочь ходит на детские танцы, в восторге от занятий. Преподаватели находят подход к каждому ребенку.',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Ольга В.',
    text: 'Просторные залы, профессиональные преподаватели, удобное расположение. Всё на высшем уровне!',
    source: 'Яндекс Карты',
    rating: 5
  }
];

// === GALLERY ===
export const GALLERY = [
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600',
  'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600',
  'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600',
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600',
  'https://images.unsplash.com/photo-1509460913899-515f1df34fea?w=600',
  'https://images.unsplash.com/photo-1557330359-ffb0deed6163?w=600'
];

// === QUIZ CONFIG ===
export const QUIZ_CONFIG = {
  managerName: 'Имя Фамилия',
  managerImage: 'https://images.unsplash.com/photo-1541727687969-ce40493cd847?w=200',
  tips: ['Выбирайте направление по своим интересам', 'Не бойтесь пробовать новое', 'Регулярные занятия - ключ к успеху', 'Правильная одежда важна для комфорта', 'Слушайте свое тело'],
  steps: [
    {
      question: 'Какой стиль танца вас интересует?',
      options: ['Hip-Hop', 'Contemporary', 'High Heels', 'Bachata', 'Strip Plastic', 'Пока не определился']
    },
    {
      question: 'Есть ли у вас танцевальный опыт?',
      options: ['Нет опыта', 'Начинающий', 'Средний уровень', 'Продвинутый']
    },
    {
      question: 'Какая цель занятий?',
      options: ['Научиться танцевать', 'Выступать на сцене', 'Для себя/хобби', 'Поддержание формы']
    },
    {
      question: 'Удобное время для занятий?',
      options: ['Утро', 'День', 'Вечер', 'Выходные']
    },
    {
      question: 'Предпочтительный формат?',
      options: ['Групповые занятия', 'Персональные тренировки', 'Интенсивы', 'Пока не определился']
    }
  ]
};

// === ATMOSPHERE ===
export const ATMOSPHERE = [
  {
    title: 'Просторные залы',
    description: 'Светлые залы с профессиональным покрытием, зеркалами и современным звуковым оборудованием',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600'
  },
  {
    title: 'Комфортные раздевалки',
    description: 'Удобные шкафчики, души и туалеты. Фен и питьевая вода в свободном доступе',
    image: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=600'
  },
  {
    title: 'Зона отдыха',
    description: 'Уютное пространство для общения до и после занятий',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600'
  },
  {
    title: 'Дружественная атмосфера',
    description: 'Поддерживающий коллектив единомышленников и внимательные преподаватели',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600'
  }
];

// === CALCULATOR STAGES (по нише) ===
export const CALCULATOR_STAGES = [
  {
    'status': 'Раскрепощение',
    'description': 'Уходит скованность, появляется уверенность в движениях. Вы начинаете чувствовать ритм.',
    'tags': [
      'Ритм',
      'Свобода',
      'Уверенность'
    ],
    'achievement': 'Первый танец без стеснения'
  },
  {
    'status': 'Пластика',
    'description': 'Движения становятся плавными и естественными. Тело слушается вас.',
    'tags': [
      'Грация',
      'Координация',
      'Стиль'
    ],
    'achievement': 'Красивая пластика в каждом движении'
  },
  {
    'status': 'Артистизм',
    'description': 'Вы не просто танцуете — вы выражаете себя. Каждый танец — история.',
    'tags': [
      'Эмоции',
      'Харизма',
      'Творчество'
    ],
    'achievement': 'Танец стал способом самовыражения'
  },
  {
    'status': 'Сцена',
    'description': 'Готовность к выступлениям. Вы танцуете с душой и вдохновляете других.',
    'tags': [
      'Performance',
      'Вдохновение',
      'Мастерство'
    ],
    'achievement': 'Уверенное выступление на сцене'
  }
];
