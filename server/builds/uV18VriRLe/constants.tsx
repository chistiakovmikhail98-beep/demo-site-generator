import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: Lazurite Dance Studio

// === BRAND CONFIG (используется в Header, Hero, Director, Calculator) ===
export const BRAND_CONFIG = {
  name: 'Lazurite Dance Studio',
  tagline: 'Танцуй. Мечтай. Вдохновляй',
  niche: 'dance',
  city: 'Колпино',
  logo: '',
  // Hero
  heroTitle: 'Раскрой свой танцевальный потенциал',
  heroSubtitle: 'Твоя история в танце',
  heroDescription: 'Современная танцевальная студия для детей и взрослых с авторскими программами и уникальной атмосферой. Развиваем пластику, уверенность и женственность.',
  heroImage: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
  heroQuote: 'Танец — это тайный язык души',
};

// === DIRECTOR CONFIG ===
export const DIRECTOR_CONFIG = {
  name: 'Ксения',
  title: 'Руководитель студии',
  description: 'Профессиональный хореограф с опытом более 7 лет. Создала уникальную методику обучения, позволяющую раскрыть потенциал каждого ученика независимо от начального уровня.',
  image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600',
  achievements: ['Призер международных танцевальных конкурсов', 'Автор программ по High Heels и Jazz-Funk', 'Организатор танцевальных фестивалей'],
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
  'Дружное танцевальное комьюнити'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'high-heels',
    title: 'High Heels',
    image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=800',
    description: 'Чувственный танцевальный стиль на каблуках. Развивает грацию, женственность и уверенность в себе. Идеально подходит для раскрытия внутренней красоты.',
    tags: ['Женственность', 'Пластика', 'Каблуки'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Записаться'
  },
  {
    id: 'jazz-funk',
    title: 'Jazz-Funk',
    image: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=800',
    description: 'Энергичное сочетание джаза и современной хореографии. Развивает координацию, пластичность и музыкальность.',
    tags: ['Энергия', 'Современность', 'Драйв'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 4,
    buttonText: 'Записаться'
  },
  {
    id: 'kids-dance',
    title: 'Детская хореография',
    image: 'https://images.unsplash.com/photo-1590332763476-90472e777351?w=800',
    description: 'Специальная программа для детей 3-4 лет. Развиваем музыкальность, координацию и творческий потенциал через игровую форму.',
    tags: ['Для детей', 'Развитие', 'Игра'],
    level: 'Начинающий',
    duration: '45 мин',
    category: 'dance',
    complexity: 1,
    buttonText: 'Записаться'
  },
  {
    id: 'street-dance',
    title: 'Уличные танцы',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
    description: 'Современные уличные стили для детей и подростков 5-17 лет. Развиваем свободу движения, уверенность и командный дух.',
    tags: ['Современность', 'Свобода', 'Команда'],
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
    description: 'Комплекс упражнений для развития гибкости и пластичности. Помогает улучшить танцевальные данные и общее самочувствие.',
    tags: ['Гибкость', 'Пластика', 'Развитие'],
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
    description: 'Интенсивные танцевальные тренировки на мини-батутах. Улучшает координацию и выносливость.',
    tags: ['Кардио', 'Координация', 'Энергия'],
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
    name: 'Ксения',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
    specialties: ['High Heels', 'Jazz-Funk'],
    experience: '7+ лет',
    style: 'Энергичный и вдохновляющий подход'
  },
  {
    id: 2,
    name: 'Имя Фамилия',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400',
    specialties: ['Уличные танцы', 'Детская хореография'],
    experience: '5+ лет',
    style: 'Креативный подход к обучению'
  },
  {
    id: 3,
    name: 'Имя Фамилия',
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400',
    specialties: ['Stretching', 'Jumping Fitness'],
    experience: '4+ лет',
    style: 'Индивидуальный подход'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://images.unsplash.com/photo-1552334823-ca7f70385fb4?w=600',
    afterImg: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600',
    title: 'История успеха: Анна К.',
    description: 'За 6 месяцев из новичка в уверенную танцовщицу. Выступила на отчетном концерте студии'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'С какого возраста можно начать заниматься?',
    answer: 'Мы принимаем детей с 3 лет на программу детской хореографии, а взрослых без ограничений по возрасту'
  },
  {
    question: 'Какая одежда нужна для занятий?',
    answer: 'Удобная спортивная одежда, не стесняющая движений. Для High Heels потребуются туфли на каблуке 5-10 см'
  },
  {
    question: 'Нужна ли специальная подготовка?',
    answer: 'Нет, мы набираем группы разных уровней, есть направления для начинающих'
  },
  {
    question: 'Можно ли присоединиться к группе в середине месяца?',
    answer: 'Да, вы можете начать с пробного занятия в любой момент'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1541904845501-0d6c11e4d925?w=100', text: 'Хочу научиться красиво танцевать' },
  { image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=100', text: 'Мечтаю стать увереннее' },
  { image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=100', text: 'Хочу выступать на сцене' },
  { image: 'https://images.unsplash.com/photo-1590332763476-90472e777351?w=100', text: 'Ищу занятия для ребенка' }
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=100', text: 'Хочу раскрепоститься' },
  { image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=100', text: 'Мечтаю о гибком теле' },
  { image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=100', text: 'Хочу найти хобби' },
  { image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=100', text: 'Ищу активный отдых' }
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=100', text: 'Хочу двигаться под музыку' },
  { image: 'https://images.unsplash.com/photo-1552334823-ca7f70385fb4?w=100', text: 'Мечтаю о сценических костюмах' },
  { image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=100', text: 'Хочу быть пластичнее' },
  { image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=100', text: 'Ищу творческое развитие' }
];

export const OBJECTIONS_PAIRS = [
  {
    myth: "У меня нет природных данных для танцев",
    answer: "Танцевать может каждый! Мы учитываем индивидуальные особенности и подбираем программу под ваш уровень"
  },
  {
    myth: "Я слишком взрослый для начала занятий",
    answer: "Начать танцевать можно в любом возрасте. У нас есть ученики, которые пришли в 30, 40 и даже 50 лет"
  },
  {
    myth: "Боюсь, что не смогу влиться в коллектив",
    answer: "В нашей студии дружественная атмосфера. Мы поддерживаем новичков и помогаем им адаптироваться"
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Профессиональные хореографы",
    text: "Наши преподаватели имеют профильное образование и регулярно повышают квалификацию",
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600'
  },
  {
    title: "Разнообразие направлений",
    text: "От классической хореографии до современных танцевальных стилей",
    image: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=600'
  },
  {
    title: "Комфортные залы",
    text: "Просторные залы с профессиональным покрытием и зеркалами",
    image: 'https://images.unsplash.com/photo-1576485436509-a7d286952b65?w=600'
  },
  {
    title: "Творческая атмосфера",
    text: "Регулярные мастер-классы, отчетные концерты и конкурсы",
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600'
  }
];

// === CONTACTS ===
export const CONTACTS = {
  phone: '+7 (911) 264-38-94',
  email: 'info@lazurite-dance.ru',
  address: 'г. Колпино',
  addressDetails: 'Центр города',
  telegram: '@lazurite_dance',
  whatsapp: '',
  vk: 'https://vk.com/lazurite_dance',
  instagram: '',
  mapUrl: '',
  mapCoords: '',
};

// === PRICING ===
export const PRICING = [
  {
    name: 'Пробное занятие',
    price: '500 ₽',
    period: 'разовое',
    features: ['Любое направление', 'Знакомство со студией', 'Консультация с тренером'],
    highlighted: false,
    category: 'групповые'
  },
  {
    name: 'Абонемент 8 занятий',
    price: '4800 ₽',
    period: '30 дней',
    features: ['8 групповых занятий', 'Заморозка 7 дней', 'Доступ к закрытому чату'],
    highlighted: true,
    category: 'абонементы'
  },
  {
    name: 'Абонемент 12 занятий',
    price: '6600 ₽',
    period: '30 дней',
    features: ['12 групповых занятий', 'Заморозка 10 дней', 'Бонусный мастер-класс'],
    highlighted: false,
    category: 'абонементы'
  },
  {
    name: 'Безлимитный абонемент',
    price: '8000 ₽',
    period: '30 дней',
    features: ['Все направления', 'Заморозка 14 дней', 'Доступ к мероприятиям'],
    highlighted: false,
    category: 'абонементы'
  }
];

// === REVIEWS ===
export const REVIEWS = [
  {
    name: 'Мария С.',
    text: 'Занимаюсь в студии уже полгода. Замечательные преподаватели, особенно нравится Jazz-Funk. Появилась уверенность в себе и своих движениях!',
    source: 'Яндекс',
    rating: 5
  },
  {
    name: 'Анна К.',
    text: 'Дочь ходит на детскую хореографию, в восторге от занятий. Преподаватели находят подход к каждому ребенку',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Елена П.',
    text: 'High Heels - это именно то, что я искала! Прекрасная атмосфера и профессиональный подход',
    source: 'Яндекс',
    rating: 5
  },
  {
    name: 'Ирина М.',
    text: 'Отличная студия! Занимаюсь stretching, результат заметен уже через месяц регулярных занятий',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Татьяна Д.',
    text: 'Jumping Fitness - это невероятно весело и эффективно. Спасибо за такое направление!',
    source: 'Яндекс',
    rating: 5
  }
];

// === GALLERY ===
export const GALLERY = [
  'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=600',
  'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600',
  'https://images.unsplash.com/photo-1576485436509-a7d286952b65?w=600',
  'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600',
  'https://images.unsplash.com/photo-1590332763476-90472e777351?w=600',
  'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600'
];

// === QUIZ CONFIG ===
export const QUIZ_CONFIG = {
  managerName: 'Ксения',
  managerImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200',
  tips: ['Выберите направление, которое вам интересно', 'Начните с пробного занятия', 'Не бойтесь пробовать новое', 'Регулярность важнее интенсивности', 'Приходите с подругой - вместе веселее'],
  steps: [
    {
      question: 'Какая у вас цель?',
      options: ['Научиться танцевать', 'Стать увереннее', 'Подтянуть фигуру', 'Найти хобби']
    },
    {
      question: 'Есть ли у вас танцевальный опыт?',
      options: ['Нет опыта', 'Немного танцевал(а)', 'Занимался(ась) раньше', 'Продолжаю заниматься']
    },
    {
      question: 'Какое направление вас интересует?',
      options: ['High Heels', 'Jazz-Funk', 'Уличные танцы', 'Stretching', 'Пока не определился(ась)']
    },
    {
      question: 'В какое время удобно заниматься?',
      options: ['Утро', 'День', 'Вечер', 'Выходные']
    },
    {
      question: 'Как вы узнали о нас?',
      options: ['Реклама', 'От друзей', 'Социальные сети', 'Проходил(а) мимо']
    }
  ]
};

// === ATMOSPHERE ===
export const ATMOSPHERE = [
  {
    title: 'Просторные залы',
    description: 'Светлые залы с профессиональным покрытием, зеркалами и современной системой вентиляции',
    image: 'https://images.unsplash.com/photo-1576485436509-a7d286952b65?w=600'
  },
  {
    title: 'Дружеская атмосфера',
    description: 'Теплое общение, поддержка и мотивация от преподавателей и других учеников',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600'
  },
  {
    title: 'Комфортные раздевалки',
    description: 'Удобные шкафчики, душевые и зона отдыха для наших учеников',
    image: 'https://images.unsplash.com/photo-1545016803-a7e357a737e4?w=600'
  },
  {
    title: 'Творческое пространство',
    description: 'Место, где каждый может раскрыть свой потенциал и найти единомышленников',
    image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600'
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
