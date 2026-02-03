import fs from 'fs/promises';
import path from 'path';

// Транслитерация кириллицы в латиницу
function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya',
  };
  return text.split('').map(char => map[char] || char).join('');
}

// Читаем токен динамически (не при загрузке модуля)
function getVercelToken(): string {
  return process.env.VERCEL_TOKEN || '';
}

const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || '';

// Диагностика при старте
const token = getVercelToken();
const customDomainValue = process.env.CUSTOM_DOMAIN || '';
console.log(`🔐 VERCEL_TOKEN: ${token ? `${token.slice(0, 10)}... (${token.length} символов)` : 'НЕ УСТАНОВЛЕН'}`);
console.log(`🌐 CUSTOM_DOMAIN: ${customDomainValue || 'НЕ УСТАНОВЛЕН'}`);

interface VercelDeployment {
  id: string;
  url: string;
  readyState: string;
}

export async function deployToVercel(
  projectId: string,
  buildPath: string,
  slug: string
): Promise<string> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) {
    console.warn('⚠️ VERCEL_TOKEN не установлен. Используем локальный превью.');
    // Возвращаем URL для локального превью
    return `http://127.0.0.1:3001/preview/${projectId}/dist/`;
  }

  console.log(`🚀 Деплой ${projectId} на Vercel...`);

  // Санитизируем slug для Vercel (lowercase, без пробелов, без спец. символов)
  const sanitizedSlug = transliterate(slug)  // сначала транслитерируем кириллицу
    .toLowerCase()
    .replace(/\s+/g, '-')           // пробелы → дефисы
    .replace(/[^a-z0-9\-_.]/g, '')  // только буквы, цифры, - _ .
    .replace(/--+/g, '-')           // убираем двойные дефисы
    .replace(/^-|-$/g, '')          // убираем дефисы в начале и конце
    .slice(0, 50);                   // ограничиваем длину

  console.log(`📝 Slug: "${slug}" → "${sanitizedSlug}"`);

  const projectName = `demo-${sanitizedSlug}-${projectId.slice(0, 5).toLowerCase()}`;

  // Создаём vercel.json
  const vercelConfig = {
    name: projectName,
    version: 2,
    builds: [{ src: '**/*', use: '@vercel/static' }],
  };

  await fs.writeFile(
    path.join(buildPath, 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );

  let deployedUrl: string | null = null;

  // Пробуем только через API (CLI не работает на Railway)
  console.log(`🔧 Деплой ${projectId} через Vercel API...`);

  // Используем Vercel API напрямую
  try {
    deployedUrl = await deployToVercelAPI(buildPath, sanitizedSlug);
    console.log(`✅ API деплой успешен: ${deployedUrl}`);
  } catch (apiError) {
    console.error('❌ API деплой не сработал:', apiError);

    // Fallback: возвращаем URL через API сервера
    const baseUrl = process.env.API_BASE_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null)
      || 'http://localhost:3001';
    return `${baseUrl}/preview/${projectId}/dist/`;
  }

  // Отключаем Deployment Protection для публичного доступа
  await disableDeploymentProtection(projectName);

  // Если есть кастомный домен — привязываем субдомен
  // ВАЖНО: используем sanitizedSlug, а не slug, и проверяем что он не пустой
  if (CUSTOM_DOMAIN && deployedUrl && sanitizedSlug && sanitizedSlug.length >= 3) {
    const subdomain = `${sanitizedSlug}.${CUSTOM_DOMAIN}`;

    // ЗАЩИТА: не создаём alias на основной домен!
    if (subdomain === CUSTOM_DOMAIN || subdomain === `.${CUSTOM_DOMAIN}`) {
      console.warn(`⚠️ Попытка создать alias на основной домен заблокирована!`);
    } else {
      const customUrl = await assignCustomDomain(deployedUrl, subdomain);
      if (customUrl) {
        console.log(`🌐 Кастомный домен: ${customUrl}`);
        return customUrl;
      }
    }
  } else if (CUSTOM_DOMAIN && (!sanitizedSlug || sanitizedSlug.length < 3)) {
    console.warn(`⚠️ Slug слишком короткий ("${sanitizedSlug}"), субдомен не создаётся`);
  }

  return deployedUrl;
}

// Метод через Vercel API напрямую (без CLI)
export async function deployToVercelAPI(
  buildPath: string,
  slug: string
): Promise<string> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN не установлен');
  }

  console.log(`📤 API деплой: собираем файлы из ${buildPath}...`);

  // Собираем файлы для загрузки
  const files = await collectFiles(buildPath);
  console.log(`📤 Собрано ${files.length} файлов`);

  const projectName = `demo-${slug}`;

  // Создаём деплоймент
  console.log(`📤 Отправляем запрос на Vercel API для ${projectName}...`);
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files,
      projectSettings: {
        framework: null, // статический сайт
      },
      target: 'production',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ API ответ: ${response.status} - ${error.slice(0, 500)}`);
    throw new Error(`Vercel API error (${response.status}): ${error.slice(0, 300)}`);
  }

  const deployment: VercelDeployment = await response.json();
  console.log(`📤 Deployment создан: ${deployment.id}, URL: ${deployment.url}`);

  // Ждём готовности
  let ready = false;
  let attempts = 0;
  while (!ready && attempts < 60) {
    await sleep(2000);

    const statusRes = await fetch(
      `https://api.vercel.com/v13/deployments/${deployment.id}`,
      {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      }
    );

    const status: VercelDeployment = await statusRes.json();
    console.log(`📤 Статус деплоя: ${status.readyState} (попытка ${attempts + 1}/60)`);

    if (status.readyState === 'READY') {
      ready = true;
    } else if (status.readyState === 'ERROR') {
      throw new Error('Деплой завершился с ошибкой');
    }

    attempts++;
  }

  if (!ready) {
    throw new Error('Таймаут ожидания деплоя');
  }

  return `https://${deployment.url}`;
}

async function collectFiles(
  dir: string,
  base = ''
): Promise<Array<{ file: string; data: string }>> {
  const files: Array<{ file: string; data: string }> = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, relativePath)));
    } else {
      const content = await fs.readFile(fullPath);
      files.push({
        file: relativePath,
        data: content.toString('base64'),
      });
    }
  }

  return files;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Отключение Deployment Protection для публичного доступа
async function disableDeploymentProtection(projectName: string): Promise<void> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) return;

  try {
    console.log(`🔓 Отключаем Deployment Protection для ${projectName}...`);

    const response = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssoProtection: null,
      }),
    });

    if (response.ok) {
      console.log(`✅ Deployment Protection отключена`);
    } else {
      const error = await response.text();
      console.error(`⚠️ Не удалось отключить защиту: ${error}`);
    }
  } catch (err) {
    console.error('Ошибка отключения защиты:', err);
  }
}

// Привязка кастомного субдомена к деплою (с retry)
async function assignCustomDomain(deploymentUrl: string, subdomain: string): Promise<string | null> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN не установлен для создания alias');
    return null;
  }

  const deploymentHost = deploymentUrl.replace('https://', '').replace('http://', '');
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔗 Привязываем ${subdomain} к ${deploymentHost}... (попытка ${attempt}/${maxRetries})`);

    try {
      // Создаём alias через Vercel API
      const response = await fetch('https://api.vercel.com/v2/deployments/' + encodeURIComponent(deploymentHost) + '/aliases', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: subdomain,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Alias создан:`, data);
        return `https://${subdomain}`;
      } else {
        const error = await response.text();
        console.error(`⚠️ Попытка ${attempt}: Ошибка API: ${error}`);

        if (attempt < maxRetries) {
          // Ждём перед следующей попыткой
          await sleep(1000 * attempt);
        }
      }
    } catch (err) {
      console.error(`⚠️ Попытка ${attempt}: Ошибка сети:`, err);
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
    }
  }

  console.error(`❌ Не удалось создать alias ${subdomain} после ${maxRetries} попыток`);
  return null;
}
