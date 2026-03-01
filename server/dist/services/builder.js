import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
// downloadImage больше не нужен — используем URL напрямую из Supabase CDN
const execAsync = promisify(exec);
// Путь к шаблону (внутри server/template)
// Используем process.cwd() для Railway — там рабочая директория /app
const TEMPLATE_DIR = path.join(process.cwd(), 'template');
const BUILDS_DIR = path.join(process.cwd(), 'builds');
export async function buildSite(projectId, config, uploadedFiles) {
    const buildDir = path.join(BUILDS_DIR, projectId);
    console.log(`📁 Template dir: ${TEMPLATE_DIR}`);
    console.log(`📁 Build dir: ${buildDir}`);
    console.log(`📷 Uploaded files: ${uploadedFiles?.length || 0}`);
    // Создаём директорию для сборки
    await fs.mkdir(buildDir, { recursive: true });
    // Копируем шаблон
    await copyDirectory(TEMPLATE_DIR, buildDir);
    // Используем URL фото напрямую из Supabase CDN (НЕ скачиваем в билд!)
    // Это уменьшает размер билда с ~20MB до ~500KB
    if (uploadedFiles && uploadedFiles.length > 0) {
        console.log(`📷 Используем ${uploadedFiles.length} фото напрямую из Supabase CDN`);
        // Подставляем URL фото в конфиг (без скачивания)
        config = applyUploadedPhotos(config, uploadedFiles);
    }
    // Генерируем constants.tsx с новыми данными
    await generateConstants(buildDir, config);
    // Обновляем index.html
    await updateIndexHtml(buildDir, config);
    // Обновляем vite.config.ts
    await updateViteConfig(buildDir);
    // Устанавливаем зависимости и собираем
    console.log(`📦 Установка зависимостей для ${projectId}...`);
    await execAsync('npm install', { cwd: buildDir });
    console.log(`🔨 Сборка проекта ${projectId}...`);
    await execAsync('npm run build', { cwd: buildDir });
    const distPath = path.join(buildDir, 'dist');
    console.log(`✅ Сборка завершена: ${distPath}`);
    return distPath;
}
async function copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        // Пропускаем node_modules и dist
        if (['node_modules', 'dist', '.git'].includes(entry.name))
            continue;
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        }
        else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
async function generateConstants(buildDir, config) {
    const s = config.sections;
    const b = config.brand;
    const d = s.director || { name: '', title: '', description: '', image: '', achievements: [] };
    const content = `import {
  Heart, Zap, Sparkles, Target,
  ShieldCheck, Activity, Users, Star, GraduationCap, Award
} from 'lucide-react';
import { NavItem, Direction, Instructor, Story, Advantage } from './types';

// Автоматически сгенерировано для: ${config.brand.name}

// === BRAND CONFIG (используется в Header, Hero, Director, Calculator) ===
export const BRAND_CONFIG = {
  name: '${esc(b.name)}',
  tagline: '${esc(b.tagline)}',
  niche: '${b.niche}',
  city: '${esc(b.city || '')}',
  logo: '${esc(b.logo || '')}',
  // Hero
  heroTitle: '${esc(b.heroTitle || b.name)}',
  heroSubtitle: '${esc(b.heroSubtitle || b.tagline)}',
  heroDescription: '${esc(b.heroDescription || '')}',
  heroImage: '${esc(b.heroImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800')}',
  heroQuote: '${esc(b.heroQuote || '')}',
};

// === DIRECTOR CONFIG ===
export const DIRECTOR_CONFIG = {
  name: '${esc(d.name)}',
  title: '${esc(d.title)}',
  description: '${esc(d.description)}',
  image: '${esc(d.image)}',
  achievements: [${(d.achievements || []).map(a => `'${esc(a)}'`).join(', ')}],
};

// Показывать Calculator для всех ниш (включая dance)
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
${(s.heroAdvantages || []).map(a => `  '${esc(a)}'`).join(',\n')}
];

export const DIRECTIONS: Direction[] = [
${(s.directions || []).map((d, i) => `  {
    id: '${esc(d.id || `dir-${i}`)}',
    title: '${esc(d.title)}',
    image: '${esc(d.image)}',
    description: '${esc(d.description)}',
    tags: [${(d.tags || []).map(t => `'${esc(t)}'`).join(', ')}],
    level: '${esc(d.level)}',
    duration: '${esc(d.duration)}',
    category: '${d.category}',
    complexity: ${d.complexity || 3}${d.buttonText ? `,\n    buttonText: '${esc(d.buttonText)}'` : ''}
  }`).join(',\n')}
];

export const INSTRUCTORS: Instructor[] = [
${(s.instructors || []).map((inst, i) => `  {
    id: ${i + 1},
    name: '${esc(inst.name)}',
    image: '${esc(inst.image)}',
    specialties: [${(inst.specialties || []).map(sp => `'${esc(sp)}'`).join(', ')}],
    experience: '${esc(inst.experience)}',
    style: '${esc(inst.style)}'
  }`).join(',\n')}
];

export const STORIES: Story[] = [
${(s.stories || []).map((st, i) => `  {
    id: ${i + 1},
    beforeImg: '${esc(st.beforeImg)}',
    afterImg: '${esc(st.afterImg)}',
    title: '${esc(st.title)}',
    description: '${esc(st.description)}'
  }`).join(',\n')}
];

export const FAQ_ITEMS = [
${(s.faq || []).map(f => `  {
    question: '${esc(f.question)}',
    answer: '${esc(f.answer)}'
  }`).join(',\n')}
];

export const REQUESTS_ROW_1 = [
${(s.requests || []).slice(0, 4).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const REQUESTS_ROW_2 = [
${(s.requests || []).slice(4, 8).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const REQUESTS_ROW_3 = [
${(s.requests || []).slice(8, 12).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const OBJECTIONS_PAIRS = [
${(s.objections || []).map(o => `  {
    myth: "${esc(o.myth)}",
    answer: "${esc(o.answer)}"
  }`).join(',\n')}
];

export const ADVANTAGES_GRID: Advantage[] = [
${(s.advantages || []).map(a => `  {
    title: "${esc(a.title)}",
    text: "${esc(a.text)}",
    image: '${esc(a.image)}'
  }`).join(',\n')}
];

// === CONTACTS ===
export const CONTACTS = {
  phone: '${esc(s.contacts?.phone || '+7 (XXX) XXX-XX-XX')}',
  email: '${esc(s.contacts?.email || '')}',
  address: '${esc(s.contacts?.address || '')}',
  addressDetails: '${esc(s.contacts?.addressDetails || '')}',
  telegram: '${esc(s.contacts?.telegram || '')}',
  whatsapp: '${esc(s.contacts?.whatsapp || '')}',
  vk: '${esc(s.contacts?.vk || '')}',
  instagram: '${esc(s.contacts?.instagram || '')}',
  mapUrl: '${esc(s.contacts?.mapUrl || '')}',
  mapCoords: '${esc(s.contacts?.mapCoords || '')}',
};

// === PRICING ===
export const PRICING = [
${(s.pricing || []).map(p => `  {
    name: '${esc(p.name)}',
    price: '${esc(p.price)}',
    period: '${esc(p.period || '')}',
    features: [${p.features.map(f => `'${esc(f)}'`).join(', ')}],
    highlighted: ${p.highlighted || false},
    category: '${esc(p.category || '')}'
  }`).join(',\n')}
];

// === REVIEWS ===
export const REVIEWS = [
${(s.reviews || []).map(r => `  {
    name: '${esc(r.name)}',
    text: '${esc(r.text)}',
    source: '${esc(r.source || '')}',
    rating: ${r.rating || 5}
  }`).join(',\n')}
];

// === GALLERY ===
export const GALLERY = [
${(s.gallery || []).map(url => `  '${esc(url)}'`).join(',\n')}
];

// === QUIZ CONFIG ===
export const QUIZ_CONFIG = {
  managerName: '${esc(s.quiz?.managerName || 'Имя Фамилия')}',
  managerImage: '${esc(s.quiz?.managerImage || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200')}',
  tips: [${(s.quiz?.tips || []).map(t => `'${esc(t)}'`).join(', ')}],
  steps: [
${(s.quiz?.steps || []).map(step => `    {
      question: '${esc(step.question)}',
      options: [${(step.options || []).map(o => `'${esc(o)}'`).join(', ')}]
    }`).join(',\n')}
  ]
};

// === ATMOSPHERE ===
export const ATMOSPHERE = [
${(s.atmosphere || []).map(a => `  {
    title: '${esc(a.title)}',
    description: '${esc(a.description)}',
    image: '${esc(a.image)}'
  }`).join(',\n')}
];

// === CALCULATOR STAGES (по нише) ===
export const CALCULATOR_STAGES = ${jsonToSingleQuote(s.calculatorStages || getDefaultCalculatorStages(b.niche))};

// === SECTION TITLES (динамические заголовки секций) ===
export const SECTION_TITLES = ${jsonToSingleQuote(s.sectionTitles || getDefaultSectionTitles(b.niche, s.directions?.length || 10))};

// === DIRECTIONS TABS (табы для фильтрации направлений) ===
export const DIRECTIONS_TABS = ${jsonToSingleQuote(s.directionsTabs || getDefaultDirectionsTabs())};

// === COLOR SCHEME (цветовая схема) ===
export const COLOR_SCHEME = ${jsonToSingleQuote(s.colorScheme || getDefaultColorScheme())};

// === AI CHAT CONFIG (конфигурация чата с AI) ===
export const AI_CHAT_CONFIG = {
  managerName: DIRECTOR_CONFIG.name,
  managerImage: DIRECTOR_CONFIG.image,
  managerTitle: '${esc(d?.title || 'Основатель')}',
  managerExpertise: '${esc(getExpertiseByNiche(b.niche))}',
  welcomeMessage: \`Здравствуйте! Я \${DIRECTOR_CONFIG.name}, ${esc(d?.title?.toLowerCase() || 'основатель')} \${BRAND_CONFIG.name}. Рада, что вы интересуетесь! Чем могу помочь? 😊\`,
  responseTime: 'Отвечаю в течение пары минут',
  placeholderText: 'Задайте вопрос...',
};

// === BLOCK VARIANTS (визуальные варианты блоков, выбранные AI) ===
export const BLOCK_VARIANTS: Record<string, number> = ${jsonToSingleQuote(getBlockVariants(s))};
`;
    await fs.writeFile(path.join(buildDir, 'constants.tsx'), content);
}
function esc(str) {
    if (!str)
        return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
/** JSON.stringify → single-quoted JS object (safe: escapes ' in values first) */
function jsonToSingleQuote(data) {
    return JSON.stringify(data, null, 2)
        .replace(/'/g, "\\'") // escape existing single quotes in values
        .replace(/"/g, "'"); // then replace JSON double quotes with single quotes
}
async function updateIndexHtml(buildDir, config) {
    const indexPath = path.join(buildDir, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    // Обновляем title
    html = html.replace(/<title>.*?<\/title>/, `<title>${config.brand.name} | ${config.brand.tagline}</title>`);
    // Обновляем meta description
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(config.brand.tagline)}">`);
    // Обновляем цветовую схему в tailwind.config
    // Базовая схема из конфига или дефолтная
    const baseColorScheme = config.sections.colorScheme || getDefaultColorScheme();
    const defaultScheme = getDefaultColorScheme();
    // Вычисляем адаптивный фон на основе primary цвета
    const adaptiveBg = getAdaptiveBackground(baseColorScheme.primary);
    // Проверяем, выбрал ли пользователь фон явно (отличается от дефолтного чёрного)
    const userExplicitlySetBackground = baseColorScheme.background &&
        baseColorScheme.background !== defaultScheme.background &&
        baseColorScheme.background !== '#0c0c0f' &&
        baseColorScheme.background !== '#0c0c0e';
    // Финальная цветовая схема:
    // - Если пользователь явно выбрал фон → используем его выбор
    // - Иначе → используем адаптивный фон
    const colorScheme = {
        primary: baseColorScheme.primary,
        accent: baseColorScheme.accent,
        background: userExplicitlySetBackground ? baseColorScheme.background : adaptiveBg.background,
        surface: userExplicitlySetBackground ? (baseColorScheme.surface || adaptiveBg.surface) : adaptiveBg.surface,
        text: userExplicitlySetBackground ? (baseColorScheme.text || adaptiveBg.text) : adaptiveBg.text,
    };
    console.log(`🎨 Цветовая схема: primary=${colorScheme.primary}, bg=${colorScheme.background} (явный выбор: ${userExplicitlySetBackground}, адаптивный: ${adaptiveBg.background})`);
    // Заменяем tailwind.config с динамическими цветами
    const tailwindConfigRegex = /tailwind\.config\s*=\s*\{[\s\S]*?\}\s*\}\s*<\/script>/;
    const newTailwindConfig = `tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Manrope', 'sans-serif'],
            },
            colors: {
              background: '${colorScheme.background}',
              surface: '${colorScheme.surface}',
              primary: '${colorScheme.primary}',
              accent: '${colorScheme.accent}',
              foreground: '${colorScheme.text}',
              'muted-foreground': '${colorScheme.text === '#1a1a1a' ? '#52525b' : '#a1a1aa'}',
              grayNoble: '#4b5563',
            },
            boxShadow: {
              'glow': '0 0 20px -5px ${colorScheme.primary}50',
            }
          }
        }
      }
    </script>`;
    html = html.replace(tailwindConfigRegex, newTailwindConfig);
    // Обновляем цвета скроллбара в style
    const scrollbarStyleRegex = /::-webkit-scrollbar-thumb\s*\{[\s\S]*?\}/g;
    html = html.replace(scrollbarStyleRegex, (match) => {
        return `::-webkit-scrollbar-thumb {
        background: ${colorScheme.primary};
      }`;
    });
    // Определяем, светлый ли фон (для адаптации текстовых цветов)
    const isLightBackground = colorScheme.text === '#1a1a1a';
    // Добавляем CSS переменные и стили для динамических цветов
    const dynamicStyles = `
      /* CSS переменные для цветовой схемы */
      :root {
        --color-background: ${colorScheme.background};
        --color-surface: ${colorScheme.surface};
        --color-primary: ${colorScheme.primary};
        --color-accent: ${colorScheme.accent};
        --color-text: ${colorScheme.text};
      }

      /* Фон страницы */
      body, html {
        background-color: ${colorScheme.background} !important;
      }

      /* Основной цвет текста */
      body {
        color: ${colorScheme.text} !important;
      }

      ${isLightBackground ? `
      /* === Адаптация для светлого фона === */

      /* Текстовые цвета */
      .text-white { color: ${colorScheme.text} !important; }
      .text-zinc-50, .text-zinc-100, .text-zinc-200 { color: #27272a !important; }
      .text-zinc-300, .text-zinc-400 { color: #52525b !important; }
      .text-zinc-500 { color: #71717a !important; }

      /* Фоны секций */
      .bg-zinc-900, .bg-zinc-950 { background-color: ${colorScheme.surface} !important; }
      .bg-zinc-800 { background-color: #e4e4e7 !important; }
      .bg-zinc-900\\/90, .bg-zinc-950\\/90 { background-color: ${colorScheme.surface}ee !important; }

      /* Границы */
      .border-zinc-700, .border-zinc-800 { border-color: #d4d4d8 !important; }
      .border-white\\/10, .border-white\\/20 { border-color: rgba(0,0,0,0.1) !important; }

      /* Header на светлом фоне */
      header.bg-transparent { background-color: transparent !important; }
      header .text-zinc-900 { color: #18181b !important; }
      header .text-zinc-600, header .text-zinc-400 { color: #52525b !important; }

      /* Карточки и блоки */
      .bg-black\\/40, .bg-black\\/50 { background-color: rgba(255,255,255,0.7) !important; }
      .backdrop-blur-md { backdrop-filter: blur(12px); }

      /* Скроллбар */
      ::-webkit-scrollbar-track { background: ${colorScheme.background}; }
      ` : ''}

      /* Radar chart gradient */
      .radar-gradient-start { stop-color: ${colorScheme.primary}; stop-opacity: 0.8; }
      .radar-gradient-end { stop-color: ${colorScheme.accent}; stop-opacity: 0.4; }
      .radar-chart svg { filter: drop-shadow(0 0 25px ${colorScheme.primary}40); }

      /* Stroke and fill using primary color */
      .stroke-primary { stroke: ${colorScheme.primary}; }
      .fill-primary { fill: ${colorScheme.primary}; }

      /* Background classes */
      .bg-background { background-color: ${colorScheme.background}; }
      .bg-surface { background-color: ${colorScheme.surface}; }
      .bg-primary { background-color: ${colorScheme.primary}; }
      .bg-accent { background-color: ${colorScheme.accent}; }

      /* Text colors */
      .text-primary { color: ${colorScheme.primary}; }
      .text-accent { color: ${colorScheme.accent}; }
      .text-foreground { color: ${colorScheme.text}; }
      .text-muted-foreground { color: ${colorScheme.text === '#1a1a1a' ? '#52525b' : '#a1a1aa'}; }

      /* Border colors */
      .border-primary { border-color: ${colorScheme.primary}; }

      /* Glow shadow */
      .shadow-glow { box-shadow: 0 0 20px -5px ${colorScheme.primary}50; }
  `;
    // Вставляем стили перед закрывающим </style>
    html = html.replace(/<\/style>/i, `${dynamicStyles}\n    </style>`);
    // Inject __ADMIN_CONFIG__ for client-side admin panel
    const apiUrl = process.env.PUBLIC_API_URL || (process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${process.env.PORT || 3000}`);
    const projectId = config.meta.projectId;
    const slug = config.meta.slug;
    const adminScript = `<script>window.__ADMIN_CONFIG__={apiUrl:"${apiUrl}",projectId:"${projectId}",slug:"${slug}"}</script>`;
    html = html.replace('</head>', `  ${adminScript}\n  </head>`);
    await fs.writeFile(indexPath, html);
}
function getDefaultCalculatorStages(niche) {
    const stagesByNiche = {
        fitness: [
            { status: 'Адаптация', description: 'Тело привыкает к нагрузкам. Улучшается выносливость и общее самочувствие.', tags: ['Выносливость', 'Тонус', 'Привычка'], achievement: 'Регулярные тренировки стали частью жизни' },
            { status: 'Прогресс', description: 'Видимые изменения в теле. Мышцы укрепляются, жировая прослойка уменьшается.', tags: ['Сила', 'Рельеф', 'Энергия'], achievement: 'Первые видимые результаты в зеркале' },
            { status: 'Трансформация', description: 'Тело работает как слаженный механизм. Вы сильнее, выносливее, увереннее.', tags: ['Мощь', 'Форма', 'Уверенность'], achievement: 'Полная трансформация тела и духа' },
            { status: 'Мастерство', description: 'Фитнес стал образом жизни. Вы достигли своих целей и ставите новые.', tags: ['Lifestyle', 'Цели', 'Развитие'], achievement: 'Спорт навсегда стал частью вас' }
        ],
        dance: [
            { status: 'Раскрепощение', description: 'Уходит скованность, появляется уверенность в движениях. Вы начинаете чувствовать ритм.', tags: ['Ритм', 'Свобода', 'Уверенность'], achievement: 'Первый танец без стеснения' },
            { status: 'Пластика', description: 'Движения становятся плавными и естественными. Тело слушается вас.', tags: ['Грация', 'Координация', 'Стиль'], achievement: 'Красивая пластика в каждом движении' },
            { status: 'Артистизм', description: 'Вы не просто танцуете — вы выражаете себя. Каждый танец — история.', tags: ['Эмоции', 'Харизма', 'Творчество'], achievement: 'Танец стал способом самовыражения' },
            { status: 'Сцена', description: 'Готовность к выступлениям. Вы танцуете с душой и вдохновляете других.', tags: ['Performance', 'Вдохновение', 'Мастерство'], achievement: 'Уверенное выступление на сцене' }
        ],
        stretching: [
            { status: 'Снятие зажимов', description: 'Уходят привычные боли и напряжение. Тело начинает расслабляться.', tags: ['Релаксация', 'Снятие боли', 'Дыхание'], achievement: 'Первый день без боли в спине' },
            { status: 'Осознанное тело', description: 'Возвращается естественная мобильность. Тело становится послушным.', tags: ['Мобильность', 'Осанка', 'Гибкость'], achievement: 'Привычка держать спину ровно' },
            { status: 'Глубокая растяжка', description: 'Мышцы и связки становятся эластичными. Шпагат всё ближе.', tags: ['Эластичность', 'Шпагат', 'Лёгкость'], achievement: 'Видимый прогресс в растяжке' },
            { status: 'Полная гибкость', description: 'Тело гибкое и здоровое. Вы двигаетесь легко и свободно.', tags: ['Свобода', 'Здоровье', 'Гармония'], achievement: 'Шпагат и полная свобода движений' }
        ],
        yoga: [
            { status: 'Присутствие', description: 'Учитесь быть здесь и сейчас. Дыхание становится осознанным.', tags: ['Дыхание', 'Осознанность', 'Покой'], achievement: 'Первая медитация без отвлечений' },
            { status: 'Баланс', description: 'Тело и ум находят равновесие. Стресс отступает.', tags: ['Равновесие', 'Спокойствие', 'Гармония'], achievement: 'Внутренний покой в любой ситуации' },
            { status: 'Глубина', description: 'Практика становится глубокой и трансформирующей.', tags: ['Трансформация', 'Сила', 'Ясность'], achievement: 'Сложные асаны даются легко' },
            { status: 'Единство', description: 'Йога — это ваш путь. Гармония тела, ума и духа.', tags: ['Целостность', 'Мудрость', 'Свет'], achievement: 'Йога стала образом жизни' }
        ],
        wellness: [
            { status: 'Перезагрузка', description: 'Организм начинает восстанавливаться. Уходит накопленная усталость.', tags: ['Отдых', 'Детокс', 'Восстановление'], achievement: 'Глубокий здоровый сон' },
            { status: 'Обновление', description: 'Энергия возвращается. Тело чувствует себя моложе.', tags: ['Энергия', 'Молодость', 'Сияние'], achievement: 'Заметное улучшение самочувствия' },
            { status: 'Расцвет', description: 'Здоровье и красота изнутри. Вы сияете.', tags: ['Красота', 'Здоровье', 'Гармония'], achievement: 'Комплименты от окружающих' },
            { status: 'Гармония', description: 'Полный баланс тела и духа. Wellness — ваш стиль жизни.', tags: ['Баланс', 'Lifestyle', 'Благополучие'], achievement: 'Полная гармония и благополучие' }
        ]
    };
    return stagesByNiche[niche] || stagesByNiche.fitness;
}
function getDefaultSectionTitles(niche, directionsCount) {
    const nicheTexts = {
        dance: { calcTitle: 'Как раскрывается талант', calcSubtitle: 'Трансформация через танец', calcButton: 'Начать танцевать' },
        fitness: { calcTitle: 'Как меняется тело', calcSubtitle: 'Трансформация через тренировки', calcButton: 'Начать тренироваться' },
        stretching: { calcTitle: 'Как меняется тело', calcSubtitle: 'Трансформация через растяжку', calcButton: 'Начать путь к гибкости' },
        yoga: { calcTitle: 'Путь к гармонии', calcSubtitle: 'Трансформация через практику', calcButton: 'Начать практику' },
        wellness: { calcTitle: 'Путь к здоровью', calcSubtitle: 'Комплексная трансформация', calcButton: 'Начать путь к здоровью' },
    };
    const texts = nicheTexts[niche] || nicheTexts.fitness;
    return {
        calculator: {
            title: texts.calcTitle,
            subtitle: texts.calcSubtitle,
            buttonText: texts.calcButton
        },
        directions: {
            title: `${directionsCount} направлений`,
            subtitle: 'в одной студии'
        },
        pricing: {
            title: 'Прозрачные цены',
            subtitle: 'без скрытых платежей'
        }
    };
}
function getDefaultDirectionsTabs() {
    return [
        { key: 'all', label: 'Все' },
        { key: 'group', label: 'Групповые', category: 'dance' },
        { key: 'personal', label: 'Индивидуальные', category: 'body' },
        { key: 'recovery', label: 'Восстановление', category: 'beginner' },
        { key: 'special', label: 'Специальные', category: 'special' },
        { key: 'wellness', label: 'Wellness', category: 'wellness' },
        { key: 'online', label: 'Онлайн', category: 'online' }
    ];
}
/** Возвращает варианты блоков (AI или дефолтные) */
function getBlockVariants(sections) {
    const defaults = {
        hero: 1,
        directions: 1,
        gallery: 1,
        instructors: 1,
        stories: 1,
        reviews: 1,
        director: 1,
        pricing: 1,
        faq: 1,
        objections: 1,
        requests: 1,
        advantages: 1,
        atmosphere: 1,
    };
    if (!sections.blockVariants)
        return defaults;
    // Merge AI-selected variants with defaults, clamp to 1-3
    const result = { ...defaults };
    for (const [key, val] of Object.entries(sections.blockVariants)) {
        if (key in result && typeof val === 'number' && val >= 1 && val <= 3) {
            result[key] = val;
        }
    }
    return result;
}
function getDefaultColorScheme() {
    return {
        primary: '#ba000f',
        accent: '#ff4444',
        background: '#0c0c0f',
        surface: '#18181b',
        text: '#ffffff'
    };
}
/**
 * Вычисляет адаптивный фон на основе яркости primary цвета
 * - Если primary светлый (L > 50) → светлый приглушённый фон на основе primary
 * - Если primary тёмный → чёрный фон
 */
function getAdaptiveBackground(primaryHex) {
    // Парсим hex в RGB
    const hex = primaryHex.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    // Конвертируем в HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    const lightness = l * 100;
    // Если primary достаточно светлый (L > 45), используем светлый фон
    if (lightness > 45) {
        // Создаём очень светлый приглушённый фон на основе hue primary цвета
        const bgH = h * 360;
        const bgS = Math.min(s * 100 * 0.15, 10); // Очень низкая насыщенность
        const bgL = 96; // Очень светлый
        const surfaceL = 92; // Чуть темнее для surface
        return {
            background: hslToHex(bgH, bgS, bgL),
            surface: hslToHex(bgH, bgS, surfaceL),
            text: '#1a1a1a' // Тёмный текст на светлом фоне
        };
    }
    // Тёмный primary → чёрный фон
    return {
        background: '#0c0c0f',
        surface: '#18181b',
        text: '#ffffff'
    };
}
/**
 * Конвертирует HSL в HEX
 */
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }
    const toHex = (n) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function getExpertiseByNiche(niche) {
    const expertiseByNiche = {
        dance: 'Эксперт по танцам',
        fitness: 'Фитнес-эксперт',
        stretching: 'Эксперт по растяжке',
        yoga: 'Инструктор йоги',
        wellness: 'Эксперт по здоровому образу жизни',
    };
    return expertiseByNiche[niche] || 'Эксперт';
}
async function updateViteConfig(buildDir) {
    const viteConfigPath = path.join(buildDir, 'vite.config.ts');
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
});
`;
    await fs.writeFile(viteConfigPath, viteConfig);
}
/**
 * Подставляет реальные URL загруженных фото в конфиг сайта
 * на основе типа блока (hero, gallery, instructors, etc.)
 */
function applyUploadedPhotos(config, files) {
    // Группируем файлы по типу блока
    const byBlock = {
        hero: [],
        directions: [],
        instructors: [],
        stories: [],
        advantages: [],
        director: [],
        gallery: [],
        atmosphere: [],
        quiz: [],
        requests: [],
    };
    for (const file of files) {
        byBlock[file.block].push(file);
    }
    // Сортируем по order внутри каждого блока
    for (const block of Object.keys(byBlock)) {
        byBlock[block].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    // Функция для получения URL — используем Supabase CDN напрямую!
    const getUrl = (file) => {
        // file.path уже содержит публичный Supabase URL
        // Формат: https://xxx.supabase.co/storage/v1/object/public/project-images/...
        if (file.path.startsWith('http')) {
            return file.path; // Публичный URL из Supabase
        }
        // Fallback для локальных файлов (старые записи)
        return `/images/${file.filename}`;
    };
    // === Hero ===
    if (byBlock.hero.length > 0) {
        config.brand.heroImage = getUrl(byBlock.hero[0]);
        console.log(`🖼️ Hero: ${config.brand.heroImage}`);
    }
    // === Director ===
    if (byBlock.director.length > 0) {
        config.sections.director.image = getUrl(byBlock.director[0]);
        console.log(`🖼️ Director: ${config.sections.director.image}`);
    }
    // === Gallery ===
    if (byBlock.gallery.length > 0) {
        config.sections.gallery = byBlock.gallery.map(f => getUrl(f));
        console.log(`🖼️ Gallery: ${config.sections.gallery.length} фото`);
    }
    // === Directions ===
    if (byBlock.directions.length > 0 && config.sections.directions) {
        byBlock.directions.forEach((file, i) => {
            if (config.sections.directions[i]) {
                config.sections.directions[i].image = getUrl(file);
            }
        });
        console.log(`🖼️ Directions: ${byBlock.directions.length} фото`);
    }
    // === Instructors ===
    if (byBlock.instructors.length > 0 && config.sections.instructors) {
        byBlock.instructors.forEach((file, i) => {
            if (config.sections.instructors[i]) {
                config.sections.instructors[i].image = getUrl(file);
            }
        });
        console.log(`🖼️ Instructors: ${byBlock.instructors.length} фото`);
    }
    // === Stories (before/after) ===
    // Чётные индексы = before, нечётные = after
    if (byBlock.stories.length > 0 && config.sections.stories) {
        for (let i = 0; i < byBlock.stories.length; i += 2) {
            const storyIdx = Math.floor(i / 2);
            if (config.sections.stories[storyIdx]) {
                if (byBlock.stories[i]) {
                    config.sections.stories[storyIdx].beforeImg = getUrl(byBlock.stories[i]);
                }
                if (byBlock.stories[i + 1]) {
                    config.sections.stories[storyIdx].afterImg = getUrl(byBlock.stories[i + 1]);
                }
            }
        }
        console.log(`🖼️ Stories: ${byBlock.stories.length} фото`);
    }
    // === Advantages ===
    if (byBlock.advantages.length > 0 && config.sections.advantages) {
        byBlock.advantages.forEach((file, i) => {
            if (config.sections.advantages[i]) {
                config.sections.advantages[i].image = getUrl(file);
            }
        });
        console.log(`🖼️ Advantages: ${byBlock.advantages.length} фото`);
    }
    // === Atmosphere ===
    if (byBlock.atmosphere.length > 0 && config.sections.atmosphere) {
        byBlock.atmosphere.forEach((file, i) => {
            if (config.sections.atmosphere[i]) {
                config.sections.atmosphere[i].image = getUrl(file);
            }
        });
        console.log(`🖼️ Atmosphere: ${byBlock.atmosphere.length} фото`);
    }
    // === Quiz (avatar менеджера) ===
    if (byBlock.quiz.length > 0 && config.sections.quiz) {
        config.sections.quiz.managerImage = getUrl(byBlock.quiz[0]);
        console.log(`🖼️ Quiz manager: ${config.sections.quiz.managerImage}`);
    }
    // === Requests ===
    if (byBlock.requests.length > 0 && config.sections.requests) {
        byBlock.requests.forEach((file, i) => {
            if (config.sections.requests[i]) {
                config.sections.requests[i].image = getUrl(file);
            }
        });
        console.log(`🖼️ Requests: ${byBlock.requests.length} фото`);
    }
    return config;
}
