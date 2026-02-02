import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// === BRAND CONFIG (заглушка — будет перезаписан при генерации) ===
export const BRAND_CONFIG = {
  name: 'Victoria Marus Studio',
  tagline: 'Студия здорового движения',
  niche: 'wellness',
  city: 'Смоленск',
  logo: 'https://i.ibb.co/Cpqv9C9M/11zon-cropped-2.png',
  heroTitle: 'Студия',
  heroSubtitle: 'здорового движения',
  heroDescription: 'Пространство, где тело и разум воссоединяются. Экосистема заботы о себе через осознанное движение.',
  heroImage: 'https://i.ibb.co/wNQcQNrh/photo-248.jpg',
  heroQuote: 'Счастливая жизнь рождается из гармонии тела и разума',
};

// === DIRECTOR CONFIG (заглушка — будет перезаписан при генерации) ===
export const DIRECTOR_CONFIG = {
  name: 'Виктория Марус',
  title: 'Основатель студии',
  description: 'Автор детского курса по коррекции осанки и эксперт в области биомеханики движения.',
  image: 'https://i.ibb.co/R4YwpgRx/photo-6.jpg',
  achievements: [
    'Международный сертификат CAFS от обучающего центра "Анатомия"',
    'Сертификат SEAS (итальянская методика коррекции сколиоза)',
    'Основатель женского онлайн клуба «Движение с любовью»',
    'Партнер сети центров «Кипарис» и «Академии здорового тела»',
    'Специалист по оценке ОДА и восстановительному тренингу',
  ],
};

// Показывать Calculator только для fitness/yoga/stretching/wellness (НЕ для dance)
export const SHOW_CALCULATOR = true;

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'О студии', href: '#director' },
  { label: 'Результаты', href: '#progress-timeline' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#footer' },
];

export const HERO_ADVANTAGES = [
  'Единственная системная забота о здоровье в Смоленске',
  'Тренировки без боли и насилия над собой',
  'Первая диагностика со скидкой 50%'
];

export const DIRECTIONS: Direction[] = [
  {
    id: 'posture',
    title: 'Коррекция осанки',
    image: 'https://i.ibb.co/8DMrYhXQ/photo-1.jpg',
    description: 'Авторская методика Виктории Марус. Работаем со сколиозом, гиперлордозом и болями в спине.',
    tags: ['Здоровая спина', 'Дыхание', 'Осанка'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance', // "Групповые" in the new tabs logic
    complexity: 2,
    buttonText: 'Записаться на диагностику'
  },
  {
    id: 'yoga',
    title: 'Йога',
    image: 'https://i.ibb.co/vKDV9bQ/photo-154.jpg',
    description: 'Мягкая практика для укрепления тела и ментального спокойствия. Работа с дыханием и гибкостью.',
    tags: ['Mind & Body', 'Гибкость', 'Тонус'],
    level: 'Любой',
    duration: '60-80 мин',
    category: 'dance',
    complexity: 3,
    buttonText: 'Начать практику'
  },
  {
    id: 'pilates',
    title: 'Пилатес',
    image: 'https://i.ibb.co/N2t6Fb6w/photo-16.jpg',
    description: 'Система упражнений для укрепления глубоких мышц-стабилизаторов и создания крепкого корсета.',
    tags: ['Кор', 'Контроль', 'Сила'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 3
  },
  {
    id: 'stretching',
    title: 'Растяжка',
    image: 'https://i.ibb.co/KjL7HcNK/photo-197.jpg',
    description: 'Безопасное развитие гибкости без надрывов. Улучшение кровообращения и снятие зажимов.',
    tags: ['Гибкость', 'Релакс', 'Шпагат'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 2
  },
  {
    id: 'functional',
    title: 'Функциональный тренинг',
    image: 'https://i.ibb.co/67GYNm3h/photo-144.jpg',
    description: 'Упражнения на развитие выносливости, баланса и координации для повседневной жизни.',
    tags: ['Тонус', 'Выносливость', 'Движение'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 4
  },
  {
    id: 'power',
    title: 'Силовой тренинг',
    image: 'https://i.ibb.co/PZ6bxbDF/photo-204.jpg',
    description: 'Корректный функциональный тренинг для силы без вреда для суставов.',
    tags: ['Функционал', 'Сила', 'Энергия'],
    level: 'Любой',
    duration: '60 мин',
    category: 'dance',
    complexity: 4
  },
  {
    id: 'individual',
    title: 'Индивидуальные тренировки',
    image: 'https://i.ibb.co/96qNpB2/photo-21.jpg',
    description: 'Персональный подход с учетом ваших целей и состояния здоровья. Максимальный контроль тренера.',
    tags: ['VIP', 'Результат', 'Персонально'],
    level: 'Спец',
    duration: '60-90 мин',
    category: 'body', // "Индивидуальные"
    complexity: 5
  },
  {
    id: 'massage',
    title: 'Фитнес-массаж',
    image: 'https://i.ibb.co/DDkjxvzJ/photo-211.jpg',
    description: 'Восстановительный массаж для глубокой релаксации мышц.',
    tags: ['Лимфодренаж', 'Релакс', 'Зажимы'],
    level: 'Любой',
    duration: '50-80 мин',
    category: 'beginner', // "Восстановление"
    complexity: 1
  },
  {
    id: 'lymph-techniques',
    title: 'Лимфодренажные техники',
    image: 'https://i.ibb.co/CsYWjmvW/photo-255.jpg',
    description: 'Работа с лимфатической системой для устранения отечности и детоксикации организма.',
    tags: ['Лимфодренаж', 'Отеки', 'Детокс'],
    level: 'Любой',
    duration: '60 мин',
    category: 'beginner',
    complexity: 1
  },
  {
    id: 'muscle-tension',
    title: 'Работа с зажимами',
    image: 'https://i.ibb.co/nMkyzNJV/photo-89.jpg',
    description: 'Глубокая проработка триггерных точек и мышечных блоков для освобождения движения.',
    tags: ['МФР', 'Триггеры', 'Расслабление'],
    level: 'Любой',
    duration: '60 мин',
    category: 'beginner',
    complexity: 2
  },
  {
    id: 'energy-morning',
    title: 'Энергия утра',
    image: 'https://i.ibb.co/gZ1bVGqv/photo-31.jpg',
    description: 'Короткие утренние практики для пробуждения тела, заряда бодрости и настройки на день.',
    tags: ['Утро', 'Зарядка', 'Энергия'],
    level: 'Любой',
    duration: '45 мин',
    category: 'special', // "Специализированные"
    complexity: 2
  },
  {
    id: 'kids-yozhiki',
    title: 'Детские «Йожики»',
    image: 'https://i.ibb.co/0yY9x52N/photo-152.jpg',
    description: 'Игровая йога для детей 7-14 лет. Формируем здоровую осанку и привычку двигаться.',
    tags: ['7-14 лет', 'Профилактика', 'Здоровье'],
    level: 'Дети',
    duration: '45-60 мин',
    category: 'special',
    complexity: 2
  },
  {
    id: 'teens-trust',
    title: 'Йога-доверие',
    image: 'https://i.ibb.co/kgBNVSM5/photo-116.jpg',
    description: 'Программа для подростков. Помощь в принятии тела, коррекция осанки и снятие стресса.',
    tags: ['Подростки', 'Баланс', 'Осанка'],
    level: 'Спец',
    duration: '60 мин',
    category: 'special',
    complexity: 3
  },
  {
    id: 'women-30',
    title: 'Программа 30+',
    image: 'https://i.ibb.co/0WCZXxz/photo-165.jpg',
    description: 'Специализированные занятия для женщин, учитывающие возрастные изменения и потребности организма.',
    tags: ['Женское здоровье', 'Гормоны', 'Тонус'],
    level: 'Любой',
    duration: '60 мин',
    category: 'special',
    complexity: 3
  },
  {
    id: 'bath',
    title: 'Банные девичники',
    image: 'https://i.ibb.co/m5xtPxxh/photo-96.jpg',
    description: 'Ритуалы парения, скрабирования и глубокого ментального отдыха в кругу единомышленниц.',
    tags: ['SPA', 'Детокс', 'Общение'],
    level: 'Любой',
    duration: '4 часа',
    category: 'wellness', // "Wellness"
    complexity: 1
  },
  {
    id: 'games',
    title: 'Трансформационные игры',
    image: 'https://i.ibb.co/XkFC0Dtr/photo-188.jpg',
    description: 'Психологические игры для поиска ответов на важные вопросы и внутреннего роста.',
    tags: ['Психология', 'Познание', 'Инсайт'],
    level: 'Любой',
    duration: '2-3 часа',
    category: 'wellness',
    complexity: 2
  },
  {
    id: 'retreat',
    title: 'Выездные ретриты',
    description: 'Групповые выездные мероприятия для полной перезагрузки в красивых местах.',
    image: 'https://i.ibb.co/mmsF867/photo-72.jpg',
    tags: ['Путешествия', 'Йога', 'Перезагрузка'],
    level: 'Любой',
    duration: '3-7 дней',
    category: 'wellness',
    complexity: 2
  },
  {
    id: 'online-club',
    title: 'Клуб «Движение с любовью»',
    image: 'https://i.ibb.co/FGWHqfb/photo-91.jpg',
    description: 'Женское онлайн-сообщество с тренировками и консультациями Виктории Марус.',
    tags: ['Онлайн', 'Поддержка', 'Тренировки'],
    level: 'Любой',
    duration: 'Подписка',
    category: 'online', // "Онлайн"
    complexity: 2
  },
  {
    id: 'remote-training',
    title: 'Дистанционные тренировки',
    image: 'https://i.ibb.co/8D3HwkZ2/photo-48.jpg',
    description: 'Персональные консультации и тренировочный процесс под контролем Виктории в онлайн-формате.',
    tags: ['Консультации', 'Онлайн', 'Дистанционно'],
    level: 'Любой',
    duration: '60 мин',
    category: 'online',
    complexity: 3
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Виктория Марус',
    image: 'https://i.ibb.co/zhn5BSnq/photo-252.jpg',
    specialties: ['Коррекция осанки', 'Йога', 'Пилатес'],
    experience: 'Автор курсов',
    style: 'Основатель, эксперт CAFS и SEAS'
  },
  {
    id: 2,
    name: 'Виктория Володченкова',
    image: 'https://i.ibb.co/Q7hpvzwt/photo-342.jpg',
    specialties: ['Функциональный тренинг', 'Растяжка'],
    experience: 'Тренер',
    style: 'Сила и контроль'
  },
  {
    id: 3,
    name: 'Светлана Широбокова',
    image: 'https://i.ibb.co/pBJSD3bw/photo-312.jpg',
    specialties: ['Йога', 'Массаж'],
    experience: 'Тренер',
    style: 'Гармония & Релакс'
  }
];

export const STORIES: Story[] = [
  {
    id: 1,
    beforeImg: 'https://i.ibb.co/20XgkSpz/Mc-Uk-VNBg-G3l4-Zp-Ga2-GYU5-Jx-Kt-JBx-Nip-n-IEh-Y-Sxq-Bt-OKZFKFKQUp-Puh-Ty-f-L6n-Qz-b5-L7xj-WJNEAIGr0-DDX.jpg',
    afterImg: 'https://i.ibb.co/rGSX7jQv/Mc-Uk-VNBg-G3l4-Zp-Ga2-GYU5-Jx-Kt-JBx-Nip-n-IEh-Y-Sxq-Bt-OKZFKFKQUp-Puh-Ty-f-L6n-Qz-b5-L7xj-WJNEAIGr0-DDX.jpg',
    title: 'Вдохновляющая Евгения: мах в бесконечность',
    description: 'Результат активной работы над гибкостью с января по октябрь 2024 года. Качественная складка достигнута через межмышечную координацию и устойчивость стоп без изнурительной статики.'
  },
  {
    id: 2,
    beforeImg: 'https://i.ibb.co/0RC65HXk/xdv-KJ1-Gi-HCv-FZ4-Mkbj6-Xnac-Amvl3a-Wb0-IB7o-J7gl-NBQLVRmqku-EW8-QZsd2qzh-Cn-PXC2g1dm-ZIRj-U77aof-JTL55w.jpg',
    afterImg: 'https://i.ibb.co/sXWJwy0/0m-QUXuod5t-LN6-KKdc-JI1sl-H0-GUu-EIEcccgw-CDy4dwh-U87-h-Pcl-EKiv8q-A53e-M8hid-K09-Kd2v-Eol-WHfb-ltps.jpg',
    title: 'Вера в себя: Екатерина',
    description: 'Путь от полной убеждённости в невозможности Бакасаны до уверенного выполнения асан на утренних группах по йоге. Маленькие шаги и упорство полностью изменили характер ученицы.'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Нужна ли диагностика перед началом?',
    answer: 'Да, мы настоятельно рекомендуем первичную диагностику. Это позволяет нам понять вашу уникальную ситуацию и подобрать безопасную нагрузку.'
  },
  {
    question: 'Можно ли заниматься при болях в спине?',
    answer: 'Не просто можно, а нужно. Наша студия специализируется на движении без боли. Мы подберем упражнения, которые помогут снять напряжение.'
  },
  {
    question: 'Как часто нужно посещать занятия?',
    answer: 'Для видимого результата в коррекции осанки или восстановлении мы рекомендуем 2-3 занятия в неделю.'
  },
  {
    question: 'Есть ли программы для детей?',
    answer: 'Да, у нас есть группы «Йожики» (7-14 лет) и подростковые программы «Йога-доверие».'
  }
];

export const REQUESTS_ROW_1 = [
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=100', text: 'Избавиться от боли в спине' },
  { image: 'https://images.unsplash.com/photo-1518611012118-29a8d63a8174?auto=format&fit=crop&q=80&w=100', text: 'Исправить осанку ребенку' },
  { image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=100', text: 'Восстановиться после травмы' },
  { image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=100', text: 'Снять стресс и напряжение' },
];

export const REQUESTS_ROW_2 = [
  { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=100', text: 'Найти баланс тела и разума' },
  { image: 'https://images.unsplash.com/photo-1594132176008-868514930263?auto=format&fit=crop&q=80&w=100', text: 'Вернуть легкость движений' },
  { image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=100', text: 'Забыть о сутулости' },
  { image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=100', text: 'Здоровые привычки' },
];

export const REQUESTS_ROW_3 = [
  { image: 'https://images.unsplash.com/photo-1518310323272-61943c220f8c?auto=format&fit=crop&q=80&w=100', text: 'Мягкое восстановление' },
  { image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=100', text: 'Сильный кор' },
  { image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=100', text: 'Эластичность мышц' },
  { image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=100', text: 'Гибкость без боли' },
];

export const OBJECTIONS_PAIRS = [
  { 
    myth: "Йога и Пилатес — это скучно", 
    answer: "В нашей студии это глубокая работа с телом. Вы почувствуете мышцы, о существовании которых даже не догадывались." 
  },
  { 
    myth: "Мне уже поздно исправлять осанку", 
    answer: "Наше тело пластично в любом возрасте. У нас есть эффективные программы для женщин 45+ и мужчин 35+." 
  },
  { 
    myth: "Нужна хорошая растяжка, чтобы начать", 
    answer: "Растяжка — это результат, а не требование. Мы начинаем с вашего текущего уровня и бережно развиваем гибкость." 
  }
];

export const ADVANTAGES_GRID: Advantage[] = [
  {
    title: "Системный подход",
    text: "От диагностики до полного восстановления. Мы лечим причину, а не следствие.",
    image: 'https://i.ibb.co/fVmmmcyb/photo-11.jpg'
  },
  {
    title: "Международная экспертиза",
    text: "Виктория Марус имеет сертификации CAFS и SEAS (итальянская методика лечения сколиоза).",
    image: 'https://i.ibb.co/0R9CWkNC/photo-9-1.jpg'
  },
  {
    title: "Без насилия над телом",
    text: "Мы сторонники осознанного фитнеса. Никаких экстремальных нагрузок и боли.",
    image: 'https://i.ibb.co/TBsYbxHK/photo-220.jpg'
  },
  {
    title: "Wellness-сообщество",
    text: "Банные девичники, трансформационные игры и выездные события для гармонии.",
    image: 'https://i.ibb.co/35zDLNpw/photo-300.jpg'
  },
  {
    title: "Экосистема заботы",
    text: "Объединяем тренировки, массаж и психологический комфорт в одном пространстве.",
    image: 'https://i.ibb.co/5gvRRy17/photo-280.jpg'
  },
  {
    title: "Женский онлайн-клуб",
    text: "Клуб «Движение с любовью» для тех, кто хочет заниматься дистанционно под присмотром.",
    image: 'https://i.ibb.co/nvqn14x/photo-238.jpg'
  },
];

// === НОВЫЕ КОНСТАНТЫ (заглушки — будут перезаписаны при генерации) ===

// Контакты студии
export const CONTACTS = {
  phone: '+7 (960) 582-22-04',
  email: 'info@viktoriamarus.ru',
  address: 'ул. Рыленкова, 49',
  addressDetails: 'г. Смоленск, ТЦ Кривич, 2 этаж',
  telegram: '@viktoriamarus',
  whatsapp: '',
  vk: 'https://vk.ru/viktoriamarusstudio',
  instagram: 'https://www.instagram.com/viktoria_marus_studio',
  mapUrl: 'https://yandex.ru/maps/12/smolensk/?text=ул.+Рыленкова,+49',
  mapCoords: '32.096285,54.753360',
};

// Тарифы и цены
export const PRICING = [
  {
    name: 'Разовое занятие',
    price: '1 000 ₽',
    period: 'за занятие',
    features: ['Групповое занятие', '60 минут'],
    highlighted: false,
    category: 'групповые'
  },
  {
    name: 'Абонемент 8 занятий',
    price: '6 400 ₽',
    period: 'в месяц',
    features: ['8 групповых занятий', 'Срок действия 30 дней', 'Заморозка 7 дней'],
    highlighted: true,
    category: 'абонементы'
  },
  {
    name: 'Персональная тренировка',
    price: '2 500 ₽',
    period: 'за занятие',
    features: ['Индивидуальный подход', '60-90 минут', 'Составление программы'],
    highlighted: false,
    category: 'персональные'
  },
  {
    name: 'Диагностика ОДА',
    price: '3 000 ₽',
    period: 'разово',
    features: ['Полная оценка', 'План восстановления', 'Рекомендации'],
    highlighted: false,
    category: 'диагностика'
  },
];

// Отзывы клиентов
export const REVIEWS = [
  {
    name: 'Никита Р.',
    text: 'Сначала ходил на занятия, затем взял онлайн-консультацию. Оба формата очень понравились — всё объясняется понятно, упражнения действительно помогают.',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Анна С.',
    text: 'После занятий чувствую себя пушинкой, тело говорит "спасибо". Атмосфера в студии потрясающая!',
    source: 'ВКонтакте',
    rating: 5
  },
  {
    name: 'Ирина В.',
    text: 'Замечательная, располагающая обстановка. Все занятия на высшем уровне, грамотный подход.',
    source: 'Google',
    rating: 5
  },
  {
    name: 'Анастасия Н.',
    text: 'Это не просто зал для тренировок, это уютное и атмосферное пространство. Тренеры грамотные и внимательные.',
    source: 'Яндекс Карты',
    rating: 5
  },
  {
    name: 'Наталия Т.',
    text: 'Очень уютная студия, прям уходить не хочется. Атмосфера прекрасная, сделана с любовью.',
    source: 'ВКонтакте',
    rating: 5
  },
];

// Галерея изображений
export const GALLERY = [
  'https://i.ibb.co/tMMjcq1R/photo-156.jpg',
  'https://i.ibb.co/Q7qsZPz7/photo-18.jpg',
  'https://i.ibb.co/wNd9yXB5/photo-229.jpg',
  'https://i.ibb.co/kZB7RTK/photo-10.jpg',
  'https://i.ibb.co/Pz0jjY6d/photo-213.jpg',
  'https://i.ibb.co/zV4BmGdR/photo-34.jpg'
];

// Конфигурация квиза
export const QUIZ_CONFIG = {
  managerName: 'Виктория Марус',
  managerImage: 'https://i.ibb.co/LDrvK08K/photo-7.jpg',
  tips: [
    'Выберите, для кого ищем занятия. У нас есть программы для любого возраста!',
    'Честный ответ поможет подобрать наиболее эффективную методику.',
    'Это поможет сфокусироваться на главном результате.',
    'Укажите контакты, чтобы мы могли связаться для консультации.',
    'Подберем формат занятий под ваш образ жизни.',
    'Подумайте, когда удобнее выделить время на заботу о себе.',
    'Всё готово! Сейчас сформирую персональный план.'
  ],
  steps: [
    { question: 'Кто будет заниматься?', options: ['Женщина (30-45+ лет)', 'Мужчина (35+ лет)', 'Ребенок (7-14 лет)', 'Подросток (14-17 лет)'] },
    { question: 'Есть ли дискомфорт или боли?', options: ['Боли в спине или шее', 'Последствия травм', 'Хроническая усталость', 'Особых проблем нет'] },
    { question: 'Какая ваша главная цель?', options: ['Исправить осанку', 'Восстановиться после травмы', 'Обрести гибкость', 'Улучшить форму'] },
    { question: 'Желаемый формат занятий?', options: ['Групповые', 'Индивидуально', 'Комбинированный', 'Пока не знаю'] },
    { question: 'Удобное время для занятий?', options: ['Будни (утро/день)', 'Будни (вечер)', 'Выходные дни', 'Плавающий график'] }
  ]
};

// Атмосфера студии (для компонента Atmosphere)
export const ATMOSPHERE = [
  {
    title: 'Уютное пространство',
    description: 'Наша студия — это место, где всё продумано для вашего комфорта. Светлые залы с профессиональным оборудованием.',
    image: 'https://i.ibb.co/wZLzcdbQ/photo-104.jpg'
  },
  {
    title: 'Научный подход',
    description: 'Мы начинаем работу с глубокой оценки опорно-двигательного аппарата. Это фундамент персональной программы.',
    image: 'https://i.ibb.co/C3xLgW7K/IMG-3297.jpg'
  },
  {
    title: 'Движение без боли',
    description: 'Тренировки проходят под контролем опытных наставников. Мы учим тело двигаться правильно и легко.',
    image: 'https://i.ibb.co/WNnKRxTT/photo-127.jpg'
  },
  {
    title: 'Современные методики',
    description: 'Использование специализированного инвентаря помогает проработать глубокие мышцы.',
    image: 'https://i.ibb.co/XhNZdz6/IMG-3290.jpg'
  }
];

// Заголовки секций (для единообразия)
export const SECTION_TITLES = {
  directions: {
    title: '{count} направлений',
    subtitle: 'в одной студии'
  },
  calculator: {
    title: 'Как меняется тело',
    subtitle: 'Трансформация через системный подход',
    buttonText: 'Начать путь к здоровью'
  },
  reviews: {
    title: 'Отзывы',
    subtitle: 'наших учеников'
  },
  atmosphere: {
    title: 'Фотоэкскурсия',
    subtitle: 'по студии'
  },
  instructors: {
    title: 'Тренеры',
    ctaTitle: 'Приходите на пробный урок!',
    ctaDescription: 'Вы сможете познакомиться с нашими направлениями, тренерами и тренировочным процессом.'
  },
  stories: {
    title: 'Истории успеха',
    beforeLabel: 'До',
    afterLabel: 'После'
  },
  requests: {
    title: 'С какими запросами приходят в студию',
    buttonText: 'Подобрать программу сегодня'
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Ответы на самые частые вопросы'
  }
};

// Табы для направлений
export const DIRECTIONS_TABS = [
  { key: 'all', label: 'Все' },
  { key: 'group', label: 'Групповые', category: 'dance' },
  { key: 'personal', label: 'Индивидуальные', category: 'body' },
  { key: 'recovery', label: 'Восстановление', category: 'beginner' },
  { key: 'special', label: 'Специальные', category: 'special' },
  { key: 'wellness', label: 'Wellness', category: 'wellness' },
  { key: 'online', label: 'Онлайн', category: 'online' }
];

// Конфигурация AI чата
export const AI_CHAT_CONFIG = {
  managerName: DIRECTOR_CONFIG.name,
  managerImage: DIRECTOR_CONFIG.image,
  managerTitle: 'Основатель',
  managerExpertise: 'Эксперт по здоровому движению',
  welcomeMessage: `Здравствуйте! Я ${DIRECTOR_CONFIG.name}, основатель студии. Рада, что вы интересуетесь здоровьем! Чем могу помочь?`,
  responseTime: 'Отвечаю в течение пары минут',
  placeholderText: 'Задайте вопрос...',
};

// Стадии для калькулятора прогресса (по нише)
export const CALCULATOR_STAGES = [
  { status: 'Снятие зажимов', description: 'Вы научитесь правильно дышать, разгрузите нервную систему и почувствуете первое облегчение.', tags: ['Дыхание', 'Релакс', 'Снятие боли'], achievement: 'Первый день без боли в спине' },
  { status: 'Осознанное тело', description: 'Возвращается естественная мобильность суставов. Тело становится послушным.', tags: ['Мобильность', 'Осанка', 'Гибкость'], achievement: 'Привычка держать спину ровно' },
  { status: 'Сильный корсет', description: 'Глубокие мышцы-стабилизаторы укреплены. Вы чувствуете легкость в движениях.', tags: ['Глубокий кор', 'Баланс', 'Стабильность'], achievement: 'Свобода движений без ограничений' },
  { status: 'Системное здоровье', description: 'Здоровое движение становится образом жизни. Тело работает как единый механизм.', tags: ['Биомеханика', 'Выносливость', 'Гармония'], achievement: 'Полная трансформация здоровья' }
];