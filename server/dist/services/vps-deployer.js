/**
 * VPSDeployer - деплой статических сайтов на VPS
 *
 * Структура на сервере:
 * /var/www/sites/
 * ├── studio-yoga/dist/
 * ├── dance-club/dist/
 * └── ...
 *
 * URL формат: https://demo.yourdomain.ru/studio-yoga/
 *
 * Требования:
 * - SSH ключ для подключения к VPS
 * - rsync на локальной машине и VPS
 * - nginx настроен для subdirectories
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
const execAsync = promisify(exec);
// Конфигурация VPS из переменных окружения
const VPS_HOST = process.env.VPS_HOST || ''; // user@server.com
const VPS_SSH_KEY_CONTENT = process.env.VPS_SSH_KEY || ''; // Содержимое SSH ключа (base64 или plain)
const VPS_SITES_DIR = process.env.VPS_SITES_DIR || '/var/www/sites';
const VPS_DOMAIN = process.env.VPS_DOMAIN || ''; // demo.yourdomain.ru
// Путь к временному файлу ключа (создаётся при первом использовании)
let sshKeyPath = null;
/**
 * Инициализирует SSH ключ из переменной окружения
 * Записывает ключ во временный файл с правильными правами
 */
async function ensureSSHKey() {
    if (sshKeyPath)
        return sshKeyPath;
    if (!VPS_SSH_KEY_CONTENT)
        return null;
    try {
        // Декодируем ключ (поддерживаем base64 и plain text)
        let keyContent = VPS_SSH_KEY_CONTENT;
        // Если ключ в base64 (не начинается с -----BEGIN)
        if (!keyContent.includes('-----BEGIN')) {
            try {
                keyContent = Buffer.from(keyContent, 'base64').toString('utf-8');
            }
            catch {
                // Не base64, используем как есть
            }
        }
        // Заменяем \n на реальные переносы строк (если ключ передан одной строкой)
        keyContent = keyContent.replace(/\\n/g, '\n');
        // Убедимся что ключ заканчивается переводом строки
        if (!keyContent.endsWith('\n')) {
            keyContent += '\n';
        }
        // Создаём временный файл
        const tmpDir = os.tmpdir();
        sshKeyPath = path.join(tmpDir, 'vps_deploy_key');
        await fs.writeFile(sshKeyPath, keyContent, { mode: 0o600 });
        console.log('🔑 SSH ключ инициализирован');
        return sshKeyPath;
    }
    catch (error) {
        console.error('❌ Ошибка инициализации SSH ключа:', error);
        return null;
    }
}
/**
 * Проверяет доступность VPS
 */
export async function checkVPSConnection() {
    if (!VPS_HOST) {
        console.warn('⚠️ VPS_HOST не настроен');
        return false;
    }
    try {
        const keyPath = await ensureSSHKey();
        const sshOptions = keyPath
            ? `-i "${keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10`
            : '-o StrictHostKeyChecking=no -o ConnectTimeout=10';
        await execAsync(`ssh ${sshOptions} ${VPS_HOST} "echo ok"`);
        return true;
    }
    catch (error) {
        console.error('❌ VPS недоступен:', error);
        return false;
    }
}
/**
 * Деплоит собранный сайт на VPS
 *
 * @param projectId - ID проекта
 * @param buildPath - Путь к папке с собранным сайтом (dist/)
 * @param slug - Slug для URL (будет использоваться как папка)
 */
export async function deployToVPS(projectId, buildPath, slug) {
    const startTime = Date.now();
    // Проверяем конфигурацию
    if (!VPS_HOST) {
        return {
            success: false,
            error: 'VPS_HOST не настроен. Установите переменные окружения.',
        };
    }
    if (!VPS_DOMAIN) {
        return {
            success: false,
            error: 'VPS_DOMAIN не настроен.',
        };
    }
    // Проверяем существование папки сборки
    try {
        await fs.access(buildPath);
    }
    catch {
        return {
            success: false,
            error: `Папка сборки не найдена: ${buildPath}`,
        };
    }
    // Нормализуем slug (только латиница, цифры, дефис)
    const safeSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        || projectId;
    const remotePath = `${VPS_SITES_DIR}/${safeSlug}`;
    console.log(`🚀 Деплой на VPS: ${safeSlug}`);
    console.log(`   Локальный путь: ${buildPath}`);
    console.log(`   Удалённый путь: ${remotePath}`);
    try {
        // Получаем путь к SSH ключу
        const keyPath = await ensureSSHKey();
        // SSH опции
        const sshOptions = keyPath
            ? `-e "ssh -i '${keyPath}' -o StrictHostKeyChecking=no"`
            : '-e "ssh -o StrictHostKeyChecking=no"';
        // 1. Создаём директорию на VPS
        const mkdirCommand = keyPath
            ? `ssh -i "${keyPath}" -o StrictHostKeyChecking=no ${VPS_HOST} "mkdir -p ${remotePath}"`
            : `ssh -o StrictHostKeyChecking=no ${VPS_HOST} "mkdir -p ${remotePath}"`;
        console.log('   📁 Создание директории...');
        await execAsync(mkdirCommand);
        // 2. Синхронизируем файлы через rsync
        // --delete удаляет старые файлы, -avz сжимает и показывает прогресс
        const rsyncCommand = `rsync -avz --delete ${sshOptions} "${buildPath}/" "${VPS_HOST}:${remotePath}/"`;
        console.log('   📤 Загрузка файлов...');
        const { stdout, stderr } = await execAsync(rsyncCommand, {
            timeout: 300000, // 5 минут таймаут
        });
        if (stderr && !stderr.includes('Warning')) {
            console.warn('   ⚠️ rsync warnings:', stderr);
        }
        // Считаем загруженные файлы из вывода rsync
        const fileCount = (stdout.match(/\n/g) || []).length;
        console.log(`   ✅ Загружено ~${fileCount} файлов`);
        const duration = Date.now() - startTime;
        const url = `https://${VPS_DOMAIN}/${safeSlug}/`;
        console.log(`✅ Деплой завершён за ${(duration / 1000).toFixed(1)}с: ${url}`);
        return {
            success: true,
            url,
            duration,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Ошибка деплоя:', errorMessage);
        return {
            success: false,
            error: errorMessage,
            duration: Date.now() - startTime,
        };
    }
}
/**
 * Удаляет сайт с VPS
 */
export async function deleteFromVPS(slug) {
    if (!VPS_HOST)
        return false;
    const safeSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (!safeSlug)
        return false;
    const remotePath = `${VPS_SITES_DIR}/${safeSlug}`;
    try {
        const keyPath = await ensureSSHKey();
        const rmCommand = keyPath
            ? `ssh -i "${keyPath}" -o StrictHostKeyChecking=no ${VPS_HOST} "rm -rf ${remotePath}"`
            : `ssh -o StrictHostKeyChecking=no ${VPS_HOST} "rm -rf ${remotePath}"`;
        await execAsync(rmCommand);
        console.log(`🗑️ Удалён с VPS: ${safeSlug}`);
        return true;
    }
    catch (error) {
        console.error('❌ Ошибка удаления с VPS:', error);
        return false;
    }
}
/**
 * Получает список сайтов на VPS
 */
export async function listVPSSites() {
    if (!VPS_HOST)
        return [];
    try {
        const keyPath = await ensureSSHKey();
        const lsCommand = keyPath
            ? `ssh -i "${keyPath}" -o StrictHostKeyChecking=no ${VPS_HOST} "ls -1 ${VPS_SITES_DIR}"`
            : `ssh -o StrictHostKeyChecking=no ${VPS_HOST} "ls -1 ${VPS_SITES_DIR}"`;
        const { stdout } = await execAsync(lsCommand);
        return stdout.trim().split('\n').filter(Boolean);
    }
    catch (error) {
        console.error('❌ Ошибка получения списка сайтов:', error);
        return [];
    }
}
/**
 * Показывает содержимое папки сайта на VPS
 */
export async function inspectVPSSite(slug) {
    if (!VPS_HOST)
        return { files: [], nginxConfig: '' };
    try {
        const keyPath = await ensureSSHKey();
        const sshOpts = keyPath
            ? `-i "${keyPath}" -o StrictHostKeyChecking=no`
            : '-o StrictHostKeyChecking=no';
        const { stdout: files } = await execAsync(`ssh ${sshOpts} ${VPS_HOST} "ls -laR ${VPS_SITES_DIR}/${slug}/ 2>/dev/null | head -50"`);
        let nginxConfig = '';
        try {
            const { stdout } = await execAsync(`ssh ${sshOpts} ${VPS_HOST} "cat /etc/nginx/sites-enabled/${VPS_DOMAIN} 2>/dev/null || cat /etc/nginx/sites-enabled/default 2>/dev/null || echo 'nginx config not found'"`);
            nginxConfig = stdout;
        }
        catch {
            nginxConfig = 'не удалось прочитать';
        }
        return { files: files.trim().split('\n'), nginxConfig };
    }
    catch (error) {
        return { files: [String(error)], nginxConfig: '' };
    }
}
/**
 * Проверяет, настроен ли VPS деплой
 */
export function isVPSConfigured() {
    return !!(VPS_HOST && VPS_DOMAIN && VPS_SSH_KEY_CONTENT);
}
/**
 * Возвращает конфигурацию VPS (без секретов)
 */
export function getVPSConfig() {
    return {
        configured: isVPSConfigured(),
        host: VPS_HOST ? VPS_HOST.split('@')[1] || VPS_HOST : '',
        domain: VPS_DOMAIN,
        sitesDir: VPS_SITES_DIR,
        hasSSHKey: !!VPS_SSH_KEY_CONTENT,
    };
}
/**
 * Исправляет nginx конфиг на VPS (заменяет alias на root)
 */
export async function fixNginxConfig() {
    if (!VPS_HOST)
        return { success: false, message: 'VPS не настроен' };
    try {
        const keyPath = await ensureSSHKey();
        const sshOpts = keyPath
            ? `-i "${keyPath}" -o StrictHostKeyChecking=no`
            : '-o StrictHostKeyChecking=no';
        const domain = VPS_DOMAIN;
        // Конфиг nginx (используем base64 для безопасной передачи)
        const nginxConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain} www.${domain};

    ssl_certificate /etc/ssl/fitwebai/fullchain.crt;
    ssl_certificate_key /etc/ssl/fitwebai/fitwebai.key;

    root /var/www/sites;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
`;
        const b64 = Buffer.from(nginxConfig).toString('base64');
        await execAsync(`ssh ${sshOpts} ${VPS_HOST} "echo '${b64}' | base64 -d > /etc/nginx/sites-enabled/${domain} && nginx -t && systemctl reload nginx"`);
        return { success: true, message: 'Nginx конфиг обновлён и перезагружен' };
    }
    catch (error) {
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
// === NGINX Config Helper ===
/**
 * Генерирует nginx конфиг для subdirectories
 * (Для справки - настраивается один раз на VPS)
 */
export function generateNginxConfig(domain) {
    return `# Nginx config для демо-сайтов
# Файл: /etc/nginx/sites-available/${domain}

server {
    listen 80;
    listen [::]:80;
    server_name ${domain};

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain};

    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    root /var/www/sites;
    index index.html;

    # Главная страница - редирект на админку или список
    location = / {
        return 302 /admin/;
    }

    # Статические сайты в субдиректориях
    location ~ ^/([a-z0-9-]+)(/.*)?$ {
        alias /var/www/sites/$1$2;
        try_files $uri $uri/ /index.html;

        # Кеширование статики
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
`;
}
