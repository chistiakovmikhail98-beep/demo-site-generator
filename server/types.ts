// Типы для генерируемых сайтов фитнес-студий

export type Niche = 'fitness' | 'dance' | 'stretching' | 'yoga' | 'wellness';
export type DirectionCategory = 'dance' | 'body' | 'beginner' | 'special' | 'wellness' | 'online';

export interface SiteConfig {
  meta: {
    projectId: string;
    slug: string;
    createdAt: string;
  };

  brand: {
    name: string;
    tagline: string;
    niche: Niche;
    city?: string;
    logo?: string;
    // Hero секция
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    heroImage?: string;
    heroQuote?: string;
  };

  sections: {
    // Hero преимущества (3 строки)
    heroAdvantages: string[];

    // Направления занятий
    directions: Direction[];

    // Инструкторы
    instructors: Instructor[];

    // Истории успеха (до/после)
    stories: Story[];

    // FAQ
    faq: FaqItem[];

    // Запросы клиентов (для бегущей строки)
    requests: RequestItem[];

    // Возражения и ответы
    objections: Objection[];

    // Преимущества студии
    advantages: Advantage[];

    // Информация о директоре/основателе
    director: Director;

    // Контакты
    contacts: Contacts;

    // === НОВЫЕ СЕКЦИИ ===

    // Цены и тарифы
    pricing: PricingPlan[];

    // Отзывы клиентов
    reviews: Review[];

    // Галерея изображений (6-8 URL)
    gallery: string[];

    // Квиз конфигурация
    quiz: QuizConfig;

    // Атмосфера студии (4 шага)
    atmosphere: AtmosphereStep[];

    // Тексты для калькулятора прогресса (по нише)
    calculatorStages?: CalculatorStage[];

    // === ЗАГОЛОВКИ И НАСТРОЙКИ ===

    // Динамические заголовки секций
    sectionTitles?: SectionTitles;

    // Табы для фильтрации направлений
    directionsTabs?: DirectionTab[];

    // Цветовая схема
    colorScheme?: ColorScheme;
  };
}

export interface Direction {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
  category: DirectionCategory;
  complexity?: number;
  buttonText?: string;
}

export interface Instructor {
  name: string;
  image: string;
  specialties: string[];
  experience: string;
  style: string;
}

export interface Story {
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RequestItem {
  image: string;
  text: string;
}

export interface Objection {
  myth: string;
  answer: string;
}

export interface Advantage {
  title: string;
  text: string;
  image: string;
}

export interface Director {
  name: string;
  title: string;
  description: string;
  achievements: string[];
  image: string;
}

export interface Contacts {
  phone?: string;
  email?: string;
  address?: string;
  addressDetails?: string; // Дополнительно (этаж, ТЦ и т.д.)
  telegram?: string;
  whatsapp?: string;
  vk?: string;
  instagram?: string;
  mapUrl?: string; // Ссылка на Яндекс/Google карты
  mapCoords?: string; // Координаты для iframe
}

// === НОВЫЕ ТИПЫ ДЛЯ ПОЛНОЙ ГЕНЕРАЦИИ ===

export interface PricingPlan {
  name: string;           // Название тарифа "Разовое занятие"
  price: string;          // Цена "1000 ₽"
  period?: string;        // "за занятие" / "в месяц"
  features: string[];     // Что входит
  highlighted?: boolean;  // Выделенный тариф
  category?: string;      // Категория (групповые, персональные, абонементы)
}

export interface Review {
  name: string;           // Имя клиента "Анна К."
  text: string;           // Текст отзыва
  source?: string;        // "Яндекс Карты" / "ВКонтакте" / "Google"
  rating?: number;        // 1-5 звёзд
  date?: string;          // Дата отзыва
}

export interface QuizStep {
  question: string;
  options: string[];
}

export interface QuizConfig {
  managerName: string;    // Имя менеджера "Анна"
  managerImage: string;   // Аватар менеджера
  tips: string[];         // Подсказки для каждого шага
  steps: QuizStep[];      // Шаги квиза
}

export interface AtmosphereStep {
  title: string;
  description: string;
  image: string;
}

export interface CalculatorStage {
  status: string;         // "Снятие зажимов"
  description: string;    // Описание этапа
  tags: string[];         // Теги
  achievement: string;    // Главный результат
}

// Заголовки секций (для динамизации)
export interface SectionTitles {
  calculator: {
    title: string;        // "Как меняется тело"
    subtitle: string;     // "Трансформация через системный подход"
    buttonText: string;   // "Начать путь к здоровью"
  };
  directions: {
    title: string;        // "12 направлений"
    subtitle: string;     // "в одной студии"
  };
  pricing: {
    title: string;        // "Прозрачные цены"
    subtitle: string;     // "без скрытых платежей"
  };
}

// Таб категории для Directions
export interface DirectionTab {
  key: string;            // 'all' | 'group' | 'personal' | ...
  label: string;          // 'Все' | 'Групповые' | ...
  category?: string;      // DirectionCategory для фильтрации
}

// Цветовая схема
export interface ColorScheme {
  primary: string;        // Основной цвет "#ba000f"
  accent: string;         // Акцентный "#ff4444"
  background: string;     // Фон "#0c0c0f"
  surface: string;        // Поверхность "#18181b"
  text: string;           // Текст "#ffffff"
}

// Модели AI
export type AIModel = 'deepseek' | 'gpt4o-mini' | 'sonnet';

// Шрифты
export type FontFamily = 'manrope' | 'inter' | 'montserrat' | 'roboto' | 'playfair';

// Типы блоков для загрузки фото
export type PhotoBlockType =
  | 'hero'           // Главное изображение Hero секции
  | 'directions'     // Изображения направлений
  | 'instructors'    // Фото инструкторов
  | 'stories'        // До/После (истории успеха)
  | 'advantages'     // Преимущества студии
  | 'director'       // Фото директора/основателя
  | 'gallery'        // Галерея студии
  | 'atmosphere'     // Атмосфера студии (4 шага)
  | 'quiz'           // Аватар менеджера квиза
  | 'requests';      // Изображения запросов клиентов

// Загруженный файл с metadata
export interface UploadedFile {
  path: string;           // Полный путь к файлу на сервере
  filename: string;       // Имя файла (для URL)
  block: PhotoBlockType;  // К какому блоку относится
  label?: string;         // Описание (опционально)
  order?: number;         // Порядок в блоке (для множественных фото)
}

// Контакт администратора ВК
export interface VkAdmin {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkUrl?: string;
  vkId?: number;
}

// Статус проекта
export interface Project {
  id: string;
  name: string;
  niche: Niche;
  status: 'pending' | 'processing' | 'building' | 'deploying' | 'completed' | 'failed';
  uploadedFiles: UploadedFile[];
  description?: string;
  colorScheme?: ColorScheme;
  aiModel?: AIModel;
  fontFamily?: FontFamily;
  siteConfig?: SiteConfig;
  deployedUrl?: string;
  error?: string;
  // VK данные для CRM
  vkGroupUrl?: string;
  vkAdmins?: VkAdmin[];
  createdAt: string;
  updatedAt: string;
}
