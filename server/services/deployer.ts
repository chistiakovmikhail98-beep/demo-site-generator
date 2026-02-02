import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Читаем токен динамически (не при загрузке модуля)
function getVercelToken(): string {
  return process.env.VERCEL_TOKEN || '';
}

const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || '';

// Диагностика при старте
const token = getVercelToken();
console.log(`🔐 VERCEL_TOKEN env: "${process.env.VERCEL_TOKEN}"`);
console.log(`🔐 VERCEL_TOKEN: ${token ? `${token.slice(0, 10)}... (${token.length} символов)` : 'НЕ УСТАНОВЛЕН'}`);

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

  try {
    // Используем Vercel CLI для деплоя
    // Санитизируем slug для Vercel (lowercase, без пробелов, без спец. символов)
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')           // пробелы → дефисы
      .replace(/[^a-z0-9\-_.]/g, '')  // только буквы, цифры, - _ .
      .replace(/---+/g, '-')          // убираем тройные дефисы
      .slice(0, 50);                   // ограничиваем длину

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

    // Деплоим через CLI
    const { stdout } = await execAsync(
      `npx vercel deploy --prod --token=${VERCEL_TOKEN} --yes`,
      { cwd: buildPath }
    );

    // Извлекаем URL из вывода
    const urlMatch = stdout.match(/https:\/\/[\w\-]+\.vercel\.app/);
    let deployedUrl = urlMatch ? urlMatch[0] : await getLatestDeploymentUrl(projectName);

    console.log(`✅ Деплой успешен: ${deployedUrl}`);

    // Отключаем Deployment Protection для публичного доступа
    await disableDeploymentProtection(projectName);

    // Если есть кастомный домен — привязываем субдомен
    if (CUSTOM_DOMAIN && deployedUrl) {
      const subdomain = `${slug}.${CUSTOM_DOMAIN}`;
      const customUrl = await assignCustomDomain(deployedUrl, subdomain);
      if (customUrl) {
        console.log(`🌐 Кастомный домен: ${customUrl}`);
        return customUrl;
      }
    }

    return deployedUrl;
  } catch (error) {
    console.error('Ошибка деплоя:', error);

    // Fallback: возвращаем URL через API сервера
    const baseUrl = process.env.API_BASE_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null)
      || 'http://localhost:3001';
    return `${baseUrl}/preview/${projectId}/dist/`;
  }
}

async function getLatestDeploymentUrl(projectName: string): Promise<string> {
  const VERCEL_TOKEN = getVercelToken();
  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    if (data.deployments && data.deployments.length > 0) {
      return `https://${data.deployments[0].url}`;
    }
  } catch (err) {
    console.error('Ошибка получения URL деплоя:', err);
  }

  return `https://${projectName}.vercel.app`;
}

// Альтернативный метод через Vercel API напрямую (без CLI)
export async function deployToVercelAPI(
  projectId: string,
  buildPath: string,
  slug: string
): Promise<string> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN не установлен');
  }

  // Собираем файлы для загрузки
  const files = await collectFiles(buildPath);

  // Создаём деплоймент
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `demo-${slug}`,
      files,
      projectSettings: {
        framework: null, // статический сайт
      },
      target: 'production',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  const deployment: VercelDeployment = await response.json();

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
    if (status.readyState === 'READY') {
      ready = true;
    } else if (status.readyState === 'ERROR') {
      throw new Error('Деплой завершился с ошибкой');
    }

    attempts++;
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

// Привязка кастомного субдомена к деплою
async function assignCustomDomain(deploymentUrl: string, subdomain: string): Promise<string | null> {
  const VERCEL_TOKEN = getVercelToken();
  if (!VERCEL_TOKEN) return null;

  try {
    // Извлекаем deployment ID из URL (например demo-flexbody-abc12.vercel.app)
    const deploymentHost = deploymentUrl.replace('https://', '').replace('http://', '');

    console.log(`🔗 Привязываем ${subdomain} к ${deploymentHost}...`);

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
      console.error(`⚠️ Ошибка создания alias: ${error}`);

      // Пробуем альтернативный метод через CLI
      try {
        await execAsync(`npx vercel alias ${deploymentUrl} ${subdomain} --token=${VERCEL_TOKEN}`);
        return `https://${subdomain}`;
      } catch (cliError) {
        console.error('CLI alias тоже не сработал:', cliError);
      }
    }
  } catch (err) {
    console.error('Ошибка привязки домена:', err);
  }

  return null;
}
