import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadImage } from './supabase.js';
const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    // Копируем/скачиваем загруженные фото в public/images/ и подставляем URL в конфиг
    if (uploadedFiles && uploadedFiles.length > 0) {
        const imagesDir = path.join(buildDir, 'public', 'images');
        await fs.mkdir(imagesDir, { recursive: true });
        // Скачиваем/копируем все фото
        for (const file of uploadedFiles) {
            const destPath = path.join(imagesDir, file.filename);
            try {
                // Проверяем, является ли путь URL-ом (Supabase Storage)
                if (file.path.includes('project-images/')) {
                    // Скачиваем через Supabase SDK (работает с приватным bucket)
                    const buffer = await downloadImage(file.path);
                    await fs.writeFile(destPath, buffer);
                    console.log(`📷 Скачано из Storage: ${file.filename} (${file.block})`);
                }
                else if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
                    // Другой URL — скачиваем через fetch
                    const response = await fetch(file.path);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const buffer = Buffer.from(await response.arrayBuffer());
                    await fs.writeFile(destPath, buffer);
                    console.log(`📷 Скачано по URL: ${file.filename} (${file.block})`);
                }
                else {
                    // Локальный файл — копируем
                    await fs.copyFile(file.path, destPath);
                    console.log(`📷 Скопировано: ${file.filename} (${file.block})`);
                }
            }
            catch (err) {
                console.error(`❌ Ошибка загрузки ${file.filename}:`, err);
            }
        }
        // Подставляем реальные URL фото в конфиг
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
    const d = s.director;
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
  achievements: [${d.achievements.map(a => `'${esc(a)}'`).join(', ')}],
};

// Показывать Calculator только для fitness/yoga/stretching/wellness (НЕ для dance)
export const SHOW_CALCULATOR = ${['fitness', 'yoga', 'stretching', 'wellness'].includes(b.niche)};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'О студии', href: '#director' },
  { label: 'Результаты', href: '#progress-timeline' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#footer' },
];

export const HERO_ADVANTAGES = [
${s.heroAdvantages.map(a => `  '${esc(a)}'`).join(',\n')}
];

export const DIRECTIONS: Direction[] = [
${s.directions.map((d, i) => `  {
    id: '${esc(d.id || `dir-${i}`)}',
    title: '${esc(d.title)}',
    image: '${esc(d.image)}',
    description: '${esc(d.description)}',
    tags: [${d.tags.map(t => `'${esc(t)}'`).join(', ')}],
    level: '${esc(d.level)}',
    duration: '${esc(d.duration)}',
    category: '${d.category}',
    complexity: ${d.complexity || 3}${d.buttonText ? `,\n    buttonText: '${esc(d.buttonText)}'` : ''}
  }`).join(',\n')}
];

export const INSTRUCTORS: Instructor[] = [
${s.instructors.map((inst, i) => `  {
    id: ${i + 1},
    name: '${esc(inst.name)}',
    image: '${esc(inst.image)}',
    specialties: [${inst.specialties.map(sp => `'${esc(sp)}'`).join(', ')}],
    experience: '${esc(inst.experience)}',
    style: '${esc(inst.style)}'
  }`).join(',\n')}
];

export const STORIES: Story[] = [
${s.stories.map((st, i) => `  {
    id: ${i + 1},
    beforeImg: '${esc(st.beforeImg)}',
    afterImg: '${esc(st.afterImg)}',
    title: '${esc(st.title)}',
    description: '${esc(st.description)}'
  }`).join(',\n')}
];

export const FAQ_ITEMS = [
${s.faq.map(f => `  {
    question: '${esc(f.question)}',
    answer: '${esc(f.answer)}'
  }`).join(',\n')}
];

export const REQUESTS_ROW_1 = [
${s.requests.slice(0, 4).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const REQUESTS_ROW_2 = [
${s.requests.slice(4, 8).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const REQUESTS_ROW_3 = [
${s.requests.slice(8, 12).map(r => `  { image: '${esc(r.image)}', text: '${esc(r.text)}' }`).join(',\n')}
];

export const OBJECTIONS_PAIRS = [
${s.objections.map(o => `  {
    myth: "${esc(o.myth)}",
    answer: "${esc(o.answer)}"
  }`).join(',\n')}
];

export const ADVANTAGES_GRID: Advantage[] = [
${s.advantages.map(a => `  {
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
      options: [${step.options.map(o => `'${esc(o)}'`).join(', ')}]
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
export const CALCULATOR_STAGES = ${JSON.stringify(s.calculatorStages || getDefaultCalculatorStages(b.niche), null, 2).replace(/"/g, "'")};

// === SECTION TITLES (динамические заголовки секций) ===
export const SECTION_TITLES = ${JSON.stringify(s.sectionTitles || getDefaultSectionTitles(b.niche, s.directions?.length || 10), null, 2).replace(/"/g, "'")};

// === DIRECTIONS TABS (табы для фильтрации направлений) ===
export const DIRECTIONS_TABS = ${JSON.stringify(s.directionsTabs || getDefaultDirectionsTabs(), null, 2).replace(/"/g, "'")};

// === COLOR SCHEME (цветовая схема) ===
export const COLOR_SCHEME = ${JSON.stringify(s.colorScheme || getDefaultColorScheme(), null, 2).replace(/"/g, "'")};

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
`;
    await fs.writeFile(path.join(buildDir, 'constants.tsx'), content);
}
function esc(str) {
    if (!str)
        return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
async function updateIndexHtml(buildDir, config) {
    const indexPath = path.join(buildDir, 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    // Обновляем title
    html = html.replace(/<title>.*?<\/title>/, `<title>${config.brand.name} | ${config.brand.tagline}</title>`);
    // Обновляем meta description
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(config.brand.tagline)}">`);
    // Обновляем цветовую схему в tailwind.config
    const colorScheme = config.sections.colorScheme || getDefaultColorScheme();
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
function getDefaultColorScheme() {
    return {
        primary: '#ba000f',
        accent: '#ff4444',
        background: '#0c0c0f',
        surface: '#18181b',
        text: '#ffffff'
    };
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
  base: '/',
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
    // Функция для получения URL (абсолютный путь для Vercel)
    const getUrl = (file) => `/images/${file.filename}`;
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
