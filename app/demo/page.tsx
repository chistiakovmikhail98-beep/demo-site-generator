import TemplateApp from '@/components/template/App';
import type { SiteConfig } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FitWebAI — Демо сайт танцевальной студии',
};

const DEMO_CONFIG: SiteConfig = {
  meta: { projectId: 'demo-001', slug: 'studio-impuls', createdAt: '2026-03-03T10:00:00Z' },
  brand: {
    name: 'Студия Импульс',
    tagline: 'Танцуй свободно. Чувствуй музыку.',
    niche: 'dance',
    city: 'Москва',
    heroTitle: 'Раскрой свою энергию через движение',
    heroSubtitle: '8 направлений танца в одной студии',
    heroDescription: 'Авторские программы от хореографов с опытом 10+ лет. Первое занятие — бесплатно.',
    heroImage: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=1400&h=900&fit=crop&q=80',
    heroQuote: 'Танец — это разговор между телом и душой',
    logo: '',
  },
  sections: {
    colorScheme: {
      primary: '#e11d48',
      accent: '#f472b6',
      background: '#0a0a0a',
      surface: '#171717',
      text: '#ffffff',
    },
    heroAdvantages: ['3 зала по 120 м²', 'Группы до 12 человек', '98% довольных учеников'],
    directions: [
      {
        id: 'dir-0', title: 'Современный танец',
        image: 'https://images.unsplash.com/photo-1690267364312-447c41773aaf?w=800&h=600&fit=crop&q=80',
        description: 'Современная хореография с элементами импровизации. Развитие пластики, чувства тела и свободы самовыражения.',
        tags: ['пластика', 'импровизация'], level: 'Средний', duration: '75 мин', category: 'dance', complexity: 3, buttonText: 'Записаться',
      },
      {
        id: 'dir-1', title: 'Танец на каблуках',
        image: 'https://images.unsplash.com/photo-1457972899686-77aec5e247ce?w=800&h=600&fit=crop&q=80',
        description: 'Женственная хореография на каблуках. Раскрепощение, уверенность в себе и невероятная грация.',
        tags: ['женственность', 'раскрепощение'], level: 'Начинающий', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться',
      },
      {
        id: 'dir-2', title: 'Хип-хоп',
        image: 'https://images.unsplash.com/photo-1546528377-9049abbac32f?w=800&h=600&fit=crop&q=80',
        description: 'Уличные стили: поппинг, локинг, брейкинг. Энергия, драйв и свобода движения.',
        tags: ['уличный стиль', 'энергия'], level: 'Все уровни', duration: '60 мин', category: 'dance', complexity: 3, buttonText: 'Записаться',
      },
      {
        id: 'dir-3', title: 'Растяжка',
        image: 'https://images.unsplash.com/photo-1599447292325-2cffaa79bcbb?w=800&h=600&fit=crop&q=80',
        description: 'Глубокая растяжка для гибкости и красивых линий тела. Путь к шпагату и лёгкости.',
        tags: ['шпагат', 'гибкость'], level: 'Все уровни', duration: '60 мин', category: 'body', complexity: 1, buttonText: 'Записаться',
      },
      {
        id: 'dir-4', title: 'Танец на пилоне',
        image: 'https://images.unsplash.com/photo-1746201609209-7b73d9686bf6?w=800&h=600&fit=crop&q=80',
        description: 'Акробатика на пилоне — это сила, грация и уверенность. Красивое и мощное направление.',
        tags: ['сила', 'грация'], level: 'Начинающий', duration: '75 мин', category: 'dance', complexity: 4, buttonText: 'Записаться',
      },
      {
        id: 'dir-5', title: 'Бачата',
        image: 'https://images.unsplash.com/photo-1631621583172-07809906e675?w=800&h=600&fit=crop&q=80',
        description: 'Латиноамериканский парный танец. Чувственность, ритм и магия прикосновений.',
        tags: ['латина', 'парный танец'], level: 'Все уровни', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться',
      },
      {
        id: 'dir-6', title: 'К-поп',
        image: 'https://images.unsplash.com/photo-1605961641200-6a3152269ed0?w=800&h=600&fit=crop&q=80',
        description: 'Хореография в стиле корейских айдолов. Синхронность, харизма и яркие постановки.',
        tags: ['группа', 'синхрон'], level: 'Начинающий', duration: '60 мин', category: 'dance', complexity: 2, buttonText: 'Записаться',
      },
      {
        id: 'dir-7', title: 'Дэнсхолл',
        image: 'https://images.unsplash.com/photo-1596247851352-5b908d61c6fc?w=800&h=600&fit=crop&q=80',
        description: 'Ямайский танцевальный стиль. Свобода движения, зажигательный ритм и позитивная энергия.',
        tags: ['свобода', 'ритм'], level: 'Средний', duration: '60 мин', category: 'dance', complexity: 3, buttonText: 'Записаться',
      },
    ],
    instructors: [
      {
        name: 'Алёна Волкова',
        image: 'https://images.unsplash.com/photo-1550874296-8c8769b8ebef?w=600&h=600&fit=crop&q=80',
        specialties: ['Современный танец', 'Растяжка'],
        experience: '8 лет преподавания',
        style: 'Мягкий подход, внимание к каждому ученику',
      },
      {
        name: 'Дмитрий Орлов',
        image: 'https://images.unsplash.com/photo-1587310739623-cada8eb45266?w=600&h=600&fit=crop&q=80',
        specialties: ['Хип-хоп', 'Дэнсхолл'],
        experience: '12 лет на сцене',
        style: 'Энергичный, мотивирующий',
      },
      {
        name: 'Камила Ренатова',
        image: 'https://images.unsplash.com/photo-1608857924365-4d5ffdf5657e?w=600&h=600&fit=crop&q=80',
        specialties: ['Танец на каблуках', 'Танец на пилоне'],
        experience: '6 лет',
        style: 'Раскрепощение через движение',
      },
    ],
    stories: [
      {
        beforeImg: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=500&h=700&fit=crop&q=80',
        afterImg: 'https://images.unsplash.com/photo-1690267590629-2fe06a978cd5?w=500&h=700&fit=crop&q=80',
        title: 'Мария, 28 лет',
        description: 'За 3 месяца села на шпагат и полюбила своё тело. Теперь танцую 4 раза в неделю!',
      },
      {
        beforeImg: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&h=700&fit=crop&q=80',
        afterImg: 'https://images.unsplash.com/photo-1686172164206-0783f2886ec7?w=500&h=700&fit=crop&q=80',
        title: 'Анна, 35 лет',
        description: 'Пришла зажатая, боялась двигаться. Через полгода выступила на отчётном концерте.',
      },
    ],
    faq: [
      { question: 'Нужен ли опыт для начала занятий?', answer: 'Нет! У нас есть группы для абсолютных новичков. Тренер адаптирует программу под ваш уровень.' },
      { question: 'Что взять на первое занятие?', answer: 'Удобную спортивную одежду, чистую сменную обувь и воду. Для растяжки — носки.' },
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
      { image: '', text: 'Хочу раскрепоститься и чувствовать себя увереннее' },
      { image: '', text: 'Дочь просит на танцы уже полгода' },
      { image: '', text: 'Хочу похудеть, но ненавижу бегать' },
      { image: '', text: 'Ищу студию рядом с домом' },
      { image: '', text: 'Подруга ходит и в восторге — тоже хочу!' },
      { image: '', text: 'Хочу выступать на сцене' },
      { image: '', text: 'Нужно восстановиться после родов' },
    ],
    objections: [
      { myth: 'У меня нет чувства ритма — мне не дано', answer: 'Чувство ритма — навык, а не врождённый талант. После 3–4 занятий 90% учеников уже уверенно попадают в музыку.' },
      { myth: 'Танцы — это для молодых, я уже не в том возрасте', answer: 'Нашей старшей ученице 62 года, и она занимается современным танцем. Возраст — не ограничение, а преимущество опыта.' },
      { myth: 'Это слишком дорого для хобби', answer: 'Одно занятие стоит от 450 ₽ — дешевле похода в кино. А эффект для здоровья и настроения — бесценный.' },
    ],
    advantages: [
      { title: '3 зала по 120 м²', text: 'Просторные залы с зеркалами в пол, профессиональным паркетом и качественным звуком', image: 'https://images.unsplash.com/photo-1558905566-ddbeb2fc2c2f?w=800&h=600&fit=crop&q=80' },
      { title: 'Группы до 12 человек', text: 'Индивидуальное внимание тренера к каждому ученику. Никто не остаётся без обратной связи', image: 'https://images.unsplash.com/photo-1602827114685-efbb2717da9f?w=800&h=600&fit=crop&q=80' },
      { title: 'Удобное расписание', text: 'Занятия с 7:00 до 22:00 каждый день. Утренние, дневные и вечерние группы', image: 'https://images.unsplash.com/photo-1595775556780-0c8afe6cd36f?w=800&h=600&fit=crop&q=80' },
      { title: 'Бесплатная парковка', text: '15 мест прямо у входа. Метро «Парк Культуры» — 5 минут пешком', image: 'https://images.unsplash.com/photo-1597075958693-75173d1c837f?w=800&h=600&fit=crop&q=80' },
    ],
    director: {
      name: 'Елена Маркова',
      title: 'Основатель и художественный руководитель',
      description: 'Я создала Студию Импульс, чтобы каждый человек мог найти свой танец. За 8 лет мы выпустили более 2000 учеников, завоевали 15 наград на чемпионатах и стали одной из лучших студий Москвы.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=650&fit=crop&q=80',
      achievements: ['Чемпионка России по современному танцу 2019', 'Более 2000 выпускников', '15 наград на соревнованиях'],
    },
    contacts: {
      phone: '+7 (495) 123-45-67',
      email: 'hello@studio-impuls.ru',
      address: 'Москва, ул. Остоженка, 25',
      telegram: 'studio_impuls',
      vk: 'studio_impuls_msk',
    },
    pricing: [
      { name: 'Пробное', price: '0 ₽', period: '', features: ['1 любое занятие', 'Знакомство со студией', 'Консультация тренера'], highlighted: false, category: 'trial' },
      { name: 'Разовое', price: '800 ₽', period: '/занятие', features: ['Любое направление', 'Без привязки к расписанию'], highlighted: false, category: 'single' },
      { name: 'Стандарт', price: '4 500 ₽', period: '/мес', features: ['8 занятий в месяц', 'Любые направления', 'Заморозка до 7 дней', 'Чат с тренером'], highlighted: true, category: 'monthly' },
      { name: 'Безлимит', price: '7 900 ₽', period: '/мес', features: ['Безлимитные посещения', 'Все направления', 'Приоритетная запись', 'Видеоразбор техники'], highlighted: false, category: 'unlimited' },
    ],
    reviews: [
      { name: 'Ольга М.', text: 'Ходим с подругой уже год! Алёна — невероятный тренер. Атмосфера как в семье, всегда ждёшь следующего занятия.', source: 'ВКонтакте', rating: 5 },
      { name: 'Дарья К.', text: 'Пришла на пробное и осталась. Теперь не представляю жизни без танцев — это мой главный антистресс!', source: 'Яндекс', rating: 5 },
      { name: 'Максим П.', text: 'Жена затащила. Думал, буду как медведь. Через месяц сам не захотел уходить — подсел на хип-хоп!', source: 'Гугл', rating: 4 },
      { name: 'Анастасия Р.', text: 'Лучшая студия в районе! Залы шикарные, тренеры профессиональные, расписание удобное.', source: 'ВКонтакте', rating: 5 },
      { name: 'Елена В.', text: 'Дочке 7 лет — обожает К-поп группу! А я хожу на растяжку в соседний зал. Семейное хобби!', source: 'ВКонтакте', rating: 4 },
      { name: 'Ирина Б.', text: 'Реально села на шпагат за 4 месяца. Не верила, что получится — а теперь горжусь собой.', source: 'Телеграм', rating: 5 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558905566-ddbeb2fc2c2f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1690267364312-447c41773aaf?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546528377-9049abbac32f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605961641200-6a3152269ed0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602827114685-efbb2717da9f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1690267590629-2fe06a978cd5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1631621583172-07809906e675?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595775556780-0c8afe6cd36f?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1746201609209-7b73d9686bf6?w=800&h=600&fit=crop&q=80',
    ],
    quiz: {
      managerName: 'Елена Маркова',
      managerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&q=80',
      tips: ['Подберём направление под ваши цели', 'Первое занятие — бесплатно'],
      steps: [
        { question: 'Какая у вас цель?', options: ['Научиться танцевать', 'Похудеть', 'Раскрепоститься', 'Найти хобби', 'Подготовка к мероприятию'] },
        { question: 'Ваш опыт в танцах?', options: ['Полный ноль', 'Занимался(ась) раньше', 'Танцую давно'] },
        { question: 'Какой стиль привлекает?', options: ['Современный танец', 'Танец на каблуках', 'Хип-хоп', 'Бачата', 'Пока не знаю — хочу попробовать'] },
        { question: 'Удобное время?', options: ['Утро (7–12)', 'День (12–17)', 'Вечер (17–22)', 'Выходные'] },
        { question: 'Как часто готовы заниматься?', options: ['1 раз в неделю', '2–3 раза', 'Каждый день'] },
      ],
    },
    atmosphere: [
      { title: 'Зеркальный зал', description: 'Зеркала в пол, профессиональный звук, тёплое освещение', image: 'https://images.unsplash.com/photo-1558905566-ddbeb2fc2c2f?w=900&h=600&fit=crop&q=80' },
      { title: 'Лаунж-зона', description: 'Мягкие диваны, кофе и чай — общение после занятий', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=600&fit=crop&q=80' },
      { title: 'Раздевалки', description: 'Индивидуальные шкафчики, фены, чистые полотенца', image: 'https://images.unsplash.com/photo-1596315458574-d99efaea3b3b?w=900&h=600&fit=crop&q=80' },
      { title: 'Сцена', description: 'Отчётные концерты и выступления каждый сезон', image: 'https://images.unsplash.com/photo-1595775556780-0c8afe6cd36f?w=900&h=600&fit=crop&q=80' },
    ],
    calculatorStages: [
      { status: 'Раскрепощение', description: 'Уходит скованность, появляется уверенность в движениях. Вы начинаете чувствовать ритм.', tags: ['ритм', 'свобода', 'уверенность'], achievement: 'Первый танец без стеснения' },
      { status: 'Пластика', description: 'Движения становятся плавными и естественными. Тело слушается вас.', tags: ['грация', 'координация', 'стиль'], achievement: 'Красивая пластика в каждом движении' },
      { status: 'Артистизм', description: 'Вы не просто танцуете — вы выражаете себя. Каждый танец — история.', tags: ['эмоции', 'харизма', 'творчество'], achievement: 'Танец стал способом самовыражения' },
      { status: 'Сцена', description: 'Готовность к выступлениям. Вы танцуете с душой и вдохновляете других.', tags: ['выступление', 'вдохновение', 'мастерство'], achievement: 'Уверенное выступление на сцене' },
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
          --color-primary: #e11d48;
          --color-accent: #f472b6;
          --color-background: #0a0a0a;
          --color-surface: #171717;
          --color-text: #ffffff;
        }
      `}</style>
      <TemplateApp
        initialConfig={DEMO_CONFIG}
        adminConfig={{
          apiUrl: '',
          projectId: 'demo-001',
          slug: 'studio-impuls',
        }}
      />
    </div>
  );
}
