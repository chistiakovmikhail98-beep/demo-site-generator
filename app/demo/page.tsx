import TemplateApp from '@/components/template/App';
import type { SiteConfig } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FitWebAI — Демо сайт',
};

const DEMO_CONFIG: SiteConfig = {
  meta: { projectId: 'demo-001', slug: 'studio-energy', createdAt: '2026-03-03T10:00:00Z' },
  brand: {
    name: 'Studio Energy',
    tagline: 'Танцуй. Чувствуй. Живи.',
    niche: 'dance',
    city: 'Москва',
    heroTitle: 'Раскрой свою энергию через движение',
    heroSubtitle: '12 направлений танца',
    heroDescription: 'Авторские программы от хореографов с опытом 10+ лет. Первое занятие — бесплатно.',
    heroImage: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=1400&h=900&fit=crop&q=80',
    heroQuote: 'Танец — это разговор между телом и душой',
    logo: '',
  },
  sections: {
    colorScheme: {
      primary: '#8b5cf6',
      accent: '#f472b6',
      background: '#0c0c0f',
      surface: '#18181b',
      text: '#ffffff',
    },
    heroAdvantages: ['3 зала по 120 м²', 'Группы до 12 человек', '98% довольных учеников'],
    directions: [
      { id: 'dir-0', title: 'Contemporary', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop&q=80', description: 'Современная хореография с элементами импровизации. Развитие пластики и самовыражения.', tags: ['пластика', 'импровизация'], level: 'Средний', duration: '75 мин', category: 'dance', complexity: 3, buttonText: 'Записаться' },
      { id: 'dir-1', title: 'High Heels', image: 'https://images.unsplash.com/photo-1504005511787-4762d6f15ac0?w=800&h=600&fit=crop&q=80', description: 'Женственная хореография на каблуках. Раскрепощение и уверенность в себе.', tags: ['каблуки', 'женственность'], level: 'Начинающий', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться' },
      { id: 'dir-2', title: 'Hip-Hop', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop&q=80', description: 'Уличные стили: popping, locking, breaking. Энергия и драйв.', tags: ['street', 'grooves'], level: 'Все уровни', duration: '60 мин', category: 'dance', complexity: 3, buttonText: 'Записаться' },
      { id: 'dir-3', title: 'Stretching', image: 'https://images.unsplash.com/photo-1485727749690-d091e8284ef3?w=800&h=600&fit=crop&q=80', description: 'Глубокая растяжка для гибкости и красивых линий тела.', tags: ['шпагат', 'гибкость'], level: 'Все уровни', duration: '60 мин', category: 'body', complexity: 1, buttonText: 'Записаться' },
      { id: 'dir-4', title: 'Pole Dance', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80', description: 'Акробатика на пилоне. Сила, грация и уверенность.', tags: ['пилон', 'акробатика'], level: 'Начинающий', duration: '75 мин', category: 'dance', complexity: 4, buttonText: 'Записаться' },
      { id: 'dir-5', title: 'Bachata', image: 'https://images.unsplash.com/photo-1565104552787-dd863a0cf5d6?w=800&h=600&fit=crop&q=80', description: 'Латиноамериканский парный танец. Чувственность и ритм.', tags: ['латина', 'парный'], level: 'Все уровни', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться' },
      { id: 'dir-6', title: 'K-Pop', image: 'https://images.unsplash.com/photo-1550026593-cb89847b168d?w=800&h=600&fit=crop&q=80', description: 'Хореография в стиле корейских айдолов. Синхронность и харизма.', tags: ['k-pop', 'cover'], level: 'Начинающий', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться' },
      { id: 'dir-7', title: 'Dancehall', image: 'https://images.unsplash.com/photo-1609602961949-eddbb90383cc?w=800&h=600&fit=crop&q=80', description: 'Ямайский танцевальный стиль. Свобода движения и groove.', tags: ['ямайка', 'groove'], level: 'Средний', duration: '60 мин', category: 'dance', complexity: 3, buttonText: 'Записаться' },
    ],
    instructors: [
      { name: 'Алёна Волкова', image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&h=600&fit=crop&q=80', specialties: ['Contemporary', 'Stretching'], experience: '8 лет преподавания', style: 'Мягкий подход, внимание к каждому ученику' },
      { name: 'Дмитрий Орлов', image: 'https://images.unsplash.com/photo-1502519144081-acca18599776?w=600&h=600&fit=crop&q=80', specialties: ['Hip-Hop', 'Dancehall'], experience: '12 лет на сцене', style: 'Энергичный, мотивирующий' },
      { name: 'Камила Ренатова', image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600&h=600&fit=crop&q=80', specialties: ['High Heels', 'Pole Dance'], experience: '6 лет', style: 'Раскрепощение через движение' },
    ],
    stories: [
      { beforeImg: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=500&h=700&fit=crop&q=80', afterImg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=700&fit=crop&q=80', title: 'Мария, 28 лет', description: 'За 3 месяца села на шпагат и полюбила своё тело. Теперь танцую 4 раза в неделю!' },
      { beforeImg: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&h=700&fit=crop&q=80', afterImg: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500&h=700&fit=crop&q=80', title: 'Анна, 35 лет', description: 'Пришла зажатая, боялась двигаться. Через полгода выступила на отчётном концерте.' },
    ],
    faq: [
      { question: 'Нужен ли опыт для начала занятий?', answer: 'Нет! У нас есть группы для абсолютных новичков. Тренер адаптирует программу под ваш уровень.' },
      { question: 'Что взять на первое занятие?', answer: 'Удобную одежду, чистую сменную обувь и воду. Для stretching — носки.' },
      { question: 'Можно ли заморозить абонемент?', answer: 'Да, на срок до 14 дней в течение месяца. Бесплатно, по запросу в мессенджере.' },
      { question: 'Как проходит пробное занятие?', answer: 'Вы приходите за 10 минут, знакомитесь с тренером. Занятие проходит в полном формате — вы не сидите, а танцуете!' },
      { question: 'Есть ли детские группы?', answer: 'Да, принимаем детей от 5 лет. Расписание: будни 16:00–18:00, суббота 10:00–12:00.' },
    ],
    requests: [
      { image: '', text: 'Хочу научиться красиво двигаться' },
      { image: '', text: 'Ищу хобби после работы, чтобы отвлечься' },
      { image: '', text: 'Мечтаю сесть на шпагат' },
      { image: '', text: 'Хочу подготовиться к свадебному танцу' },
      { image: '', text: 'Нужна физическая нагрузка, но зал — это скучно' },
      { image: '', text: 'Хочу раскрепоститься' },
      { image: '', text: 'Дочь просит танцы уже полгода' },
      { image: '', text: 'Хочу похудеть, но ненавижу бегать' },
      { image: '', text: 'Ищу студию рядом с домом' },
      { image: '', text: 'Подруга ходит и в восторге, тоже хочу!' },
      { image: '', text: 'Хочу выступать на сцене' },
      { image: '', text: 'Нужно восстановиться после родов' },
    ],
    objections: [
      { myth: 'У меня нет чувства ритма', answer: 'Чувство ритма — навык, а не талант. После 3-4 занятий 90% учеников уже попадают в музыку.' },
      { myth: 'Танцы — это для молодых', answer: 'Нашей старшей ученице 62 года, и она занимается contemporary. Возраст — не ограничение.' },
      { myth: 'Это слишком дорого', answer: 'Одно занятие стоит от 450₽ — дешевле похода в кино. А эффект для здоровья и настроения — бесценный.' },
    ],
    advantages: [
      { title: '3 зала по 120 м²', text: 'Просторные залы с зеркалами в пол, паркетом и профессиональным звуком', image: 'https://images.unsplash.com/photo-1520732789276-a0ebed2eeabd?w=800&h=600&fit=crop&q=80' },
      { title: 'Группы до 12 чел', text: 'Индивидуальное внимание тренера. Каждый получает обратную связь', image: 'https://images.unsplash.com/photo-1556394890-c874aac332b1?w=800&h=600&fit=crop&q=80' },
      { title: 'Удобное расписание', text: 'Занятия с 7:00 до 22:00. Утренние, дневные и вечерние группы', image: 'https://images.unsplash.com/photo-1594383842626-fc43334e76b7?w=800&h=600&fit=crop&q=80' },
      { title: 'Бесплатная парковка', text: '15 мест прямо у входа. Метро «Парк Культуры» — 5 минут пешком', image: 'https://images.unsplash.com/photo-1596315458574-d99efaea3b3b?w=800&h=600&fit=crop&q=80' },
    ],
    director: {
      name: 'Елена Маркова',
      title: 'Основатель и художественный руководитель',
      description: 'Я создала Studio Energy, чтобы каждый человек мог найти свой танец. За 8 лет мы выпустили 2000+ учеников и получили 15 наград на чемпионатах.',
      image: 'https://images.unsplash.com/photo-1572894917339-f399d897571b?w=500&h=650&fit=crop&q=80',
      achievements: ['Чемпионка России по contemporary 2019', '2000+ выпускников', '15 наград на соревнованиях'],
    },
    contacts: {
      phone: '+7 (495) 123-45-67',
      email: 'hello@studio-energy.ru',
      address: 'Москва, ул. Остоженка, 25',
      telegram: 'studio_energy',
      vk: 'studio_energy_msk',
    },
    pricing: [
      { name: 'Пробное', price: '0 ₽', period: '', features: ['1 любое занятие', 'Знакомство со студией', 'Консультация тренера'], highlighted: false, category: 'trial' },
      { name: 'Разовое', price: '800 ₽', period: '/занятие', features: ['Любое направление', 'Без привязки к расписанию'], highlighted: false, category: 'single' },
      { name: 'Стандарт', price: '4 500 ₽', period: '/мес', features: ['8 занятий в месяц', 'Любые направления', 'Заморозка до 7 дней', 'Чат с тренером'], highlighted: true, category: 'monthly' },
      { name: 'Безлимит', price: '7 900 ₽', period: '/мес', features: ['Безлимитные посещения', 'Все направления', 'Приоритетная запись', 'Видеоразбор техники'], highlighted: false, category: 'unlimited' },
    ],
    reviews: [
      { name: 'Ольга М.', text: 'Ходим с подругой уже год! Алёна — невероятный тренер. Атмосфера как в семье.', source: 'VK', rating: 5 },
      { name: 'Дарья К.', text: 'Пришла на пробное и осталась. Теперь не представляю жизни без танцев!', source: 'Instagram', rating: 5 },
      { name: 'Максим П.', text: 'Жена затащила. Думал, буду как медведь. Через месяц сам не захотел уходить.', source: 'Google', rating: 5 },
      { name: 'Анастасия Р.', text: 'Лучшая студия! Залы шикарные, тренеры огонь, расписание удобное.', source: 'VK', rating: 5 },
      { name: 'Елена В.', text: 'Дочке 7 лет — обожает K-Pop группу! А я хожу на стретчинг в соседний зал.', source: 'VK', rating: 5 },
      { name: 'Ирина Б.', text: 'Реально села на шпагат за 4 месяца. Не верила, что получится.', source: 'Telegram', rating: 5 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504005511787-4762d6f15ac0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520732789276-a0ebed2eeabd?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485727749690-d091e8284ef3?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    ],
    quiz: {
      managerName: 'Елена Маркова',
      managerImage: 'https://images.unsplash.com/photo-1572894917339-f399d897571b?w=300&h=300&fit=crop&q=80',
      tips: ['Подберём направление под ваши цели', 'Первое занятие — бесплатно'],
      steps: [
        { question: 'Какая у вас цель?', options: ['Научиться танцевать', 'Похудеть', 'Раскрепоститься', 'Найти хобби', 'Подготовка к мероприятию'] },
        { question: 'Ваш опыт в танцах?', options: ['Полный ноль', 'Занимался(ась) раньше', 'Танцую давно'] },
        { question: 'Какой стиль привлекает?', options: ['Современный (Contemporary)', 'Женственный (High Heels)', 'Уличный (Hip-Hop)', 'Латина (Bachata)', 'Пока не знаю'] },
        { question: 'Удобное время?', options: ['Утро (7-12)', 'День (12-17)', 'Вечер (17-22)', 'Выходные'] },
        { question: 'Как часто готовы заниматься?', options: ['1 раз в неделю', '2-3 раза', 'Каждый день'] },
      ],
    },
    atmosphere: [
      { title: 'Зеркальный зал', description: 'Зеркала в пол, профессиональный звук', image: 'https://images.unsplash.com/photo-1520732789276-a0ebed2eeabd?w=900&h=600&fit=crop&q=80' },
      { title: 'Лаунж-зона', description: 'Мягкие диваны, кофе, общение после занятий', image: 'https://images.unsplash.com/photo-1556394890-c874aac332b1?w=900&h=600&fit=crop&q=80' },
      { title: 'Раздевалки', description: 'Индивидуальные шкафчики, фены, полотенца', image: 'https://images.unsplash.com/photo-1596315458574-d99efaea3b3b?w=900&h=600&fit=crop&q=80' },
      { title: 'Фотозона', description: 'Для красивых фото и видео после занятий', image: 'https://images.unsplash.com/photo-1594383842626-fc43334e76b7?w=900&h=600&fit=crop&q=80' },
    ],
    calculatorStages: [
      { status: 'Старт', description: 'Первые шаги в танце', tags: ['базовые движения', 'чувство ритма', 'координация'], achievement: 'Уверенно двигаетесь под музыку' },
      { status: '3 месяца', description: 'Уверенное владение базой', tags: ['связки', 'импровизация', 'выносливость'], achievement: 'Танцуете полную хореографию' },
      { status: '6 месяцев', description: 'Свой стиль', tags: ['артистизм', 'техника', 'свобода'], achievement: 'Первое выступление на концерте' },
      { status: '1 год', description: 'Продвинутый уровень', tags: ['сложные элементы', 'преподавание', 'соревнования'], achievement: 'Готовы к соревнованиям или преподаванию' },
    ],
    sectionTitles: {
      calculator: { title: 'Ваш путь в танце', subtitle: 'От первого шага до сцены', buttonText: 'Начать путь' },
      directions: { title: '8 направлений', subtitle: 'Найдите свой танец' },
      pricing: { title: 'Абонементы', subtitle: 'Первое занятие — бесплатно' },
    },
    directionsTabs: [
      { key: 'all', label: 'Все' },
      { key: 'dance', label: 'Танцы', category: 'dance' },
      { key: 'body', label: 'Растяжка', category: 'body' },
    ],
    blockVariants: {
      hero: 2, directions: 1, gallery: 3, instructors: 2,
      stories: 1, reviews: 2, director: 1, pricing: 1,
      faq: 1, objections: 2, requests: 1, advantages: 3, atmosphere: 1,
    },
  },
};

export default function DemoPage() {
  return (
    <div>
      <style>{`
        :root {
          --color-primary: #8b5cf6;
          --color-accent: #f472b6;
          --color-background: #0c0c0f;
          --color-surface: #18181b;
          --color-text: #ffffff;
        }
      `}</style>
      <TemplateApp
        initialConfig={DEMO_CONFIG}
        adminConfig={{
          apiUrl: '',
          projectId: 'demo-001',
          slug: 'studio-energy',
        }}
      />
    </div>
  );
}
