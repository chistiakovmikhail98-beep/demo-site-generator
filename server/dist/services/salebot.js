// Сервис VK чат-бота (Senler webhook для подписки + VK API для сообщений)
import { supabase } from './supabase.js';
// === Конфигурация ===
const VK_GROUP_TOKEN = process.env.VK_GROUP_TOKEN || '';
const VK_CONFIRMATION_CODE = process.env.VK_CONFIRMATION_CODE || '';
const VK_SECRET_KEY = process.env.VK_SECRET_KEY || '';
const VK_API_VERSION = '5.199';
export const USE_VK_BOT = !!VK_GROUP_TOKEN;
if (!USE_VK_BOT) {
    console.warn('⚠️ VK_GROUP_TOKEN не установлен — VK бот отключён');
}
// === Шаблоны сообщений ===
// Формулы: BAB (greeting), Feature→Benefit (completed), PAS (failed)
// Tone: дружелюбный, на «вы», короткие абзацы, power words
export const MESSAGES = {
    // PAS + Social Proof: боль → цифры про сайт → CTA
    greeting: (_name) => `Здравствуйте! 👋\n\n` +
        `Знаете, что отличает студии, которые растут, от тех, что стоят на месте? Свой сайт.\n\n` +
        `Что даёт сайт вашей студии:\n` +
        `📊 Клиенты находят вас сами — через Яндекс и Google, бесплатно\n` +
        `📊 Работает 24/7 — принимает заявки, даже когда вы спите\n` +
        `📊 85% людей ищут услуги онлайн до первого звонка\n` +
        `📊 Окупается с первых 2-3 клиентов\n\n` +
        `А если подключить рекламу — окупаемость x3.\n\n` +
        `Хотите увидеть, как будет выглядеть ваш? Создам сайт за 3 минуты — бесплатно и без обязательств.\n\n` +
        `Пришлите ссылку на вашу группу ВК 👇`,
    // Micro-copy: дружелюбная подсказка + пример
    invalidUrl: `Не получилось распознать ссылку 🤔\n\n` +
        `Скопируйте адрес вашей группы прямо из ВК:\n` +
        `vk.com/название_группы\n\n` +
        `Например: vk.com/fitness_studio`,
    // Первое сообщение после получения URL — коротко и бодро
    processing: (_vkUrl) => `Отлично, принял! ⚡ Начинаю создание сайта...\n\n` +
        `Буду писать о каждом шаге — ждите обновлений 👇`,
    // Живые обновления прогресса — шлются по таймеру параллельно с генерацией
    // delaySec — через сколько секунд от старта отправить
    progressSteps: [
        { delaySec: 12, text: `🔍 Анализирую вашу группу ВК...` },
        { delaySec: 35, text: `📸 Нашёл фотографии — обрабатываю...` },
        { delaySec: 65, text: `✍️ Пишем продающие тексты для сайта...` },
        { delaySec: 100, text: `🎨 Собираю дизайн — подбираю цвета под ваш стиль...` },
        { delaySec: 135, text: `🚀 Почти готово — публикую сайт на домене...` },
    ],
    // Если пользователь пишет во время генерации
    stillProcessing: `Ещё работаю ⏳ Напишу сразу, как будет готово!`,
    // ДЕНЕЖНОЕ СООБЩЕНИЕ — оффер + цена + ссылка на сайт
    completed: (url) => `Ваш сайт готов! 🎉\n\n` +
        `👉 ${url}\n\n` +
        `Откройте — это реальный сайт с вашими фото и контактами, уже работает.\n\n` +
        `Разработка сайта — бесплатна. Мы берём только за хостинг и сопровождение: 2 000 р/мес.\n\n` +
        `Что входит в подписку:\n` +
        `✓ Ваш домен — клиенты найдут вас в Яндексе и Google\n` +
        `✓ Онлайн-запись и форма заявки\n` +
        `✓ Техподдержка и правки без ограничений\n` +
        `✓ Хостинг, SSL, скорость — всё включено\n\n` +
        `Подробнее о сервисе: https://fitwebai.ru\n\n` +
        `Напишите «Хочу подключить» — и мы всё настроим 💬`,
    // Повторный визит: коротко + возможность создать ещё
    completedRepeat: (url) => `Ваш сайт уже готов и работает:\n` +
        `👉 ${url}\n\n` +
        `Хотите создать для другой студии? Пришлите новую ссылку.`,
    // PAS: Problem (не получилось) → Agitation (причина) → Solution (попробуйте ещё)
    failed: `К сожалению, не получилось создать сайт 😔\n\n` +
        `Обычно это значит, что в группе мало информации — ` +
        `нет описания или фотографий.\n\n` +
        `Пришлите ссылку на другую группу или дополните текущую — попробую снова!`,
    // Коротко и бодро
    retrying: (_vkUrl) => `Пробую ещё раз! ⚡\n\n` +
        `Напишу через 2-3 минуты, когда будет готово.`,
};
// === VK API: отправка сообщений ===
export async function sendMessage(peerId, message, keyboard) {
    try {
        const params = {
            peer_id: String(peerId),
            message,
            random_id: String(Math.floor(Math.random() * 2147483647)),
            access_token: VK_GROUP_TOKEN,
            v: VK_API_VERSION,
        };
        if (keyboard) {
            params.keyboard = JSON.stringify(keyboard);
        }
        const response = await fetch('https://api.vk.com/method/messages.send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(params),
        });
        const result = await response.json();
        if (result.error) {
            console.error(`❌ VK messages.send error:`, result.error.error_msg);
            return false;
        }
        console.log(`✅ VK: сообщение отправлено пользователю ${peerId}`);
        return true;
    }
    catch (error) {
        console.error(`❌ VK sendMessage error:`, error);
        return false;
    }
}
// Кнопка "Открыть сайт"
export function makeSiteLinkKeyboard(url) {
    return {
        inline: true,
        buttons: [[
                {
                    action: {
                        type: 'open_link',
                        label: '🌐 Открыть сайт',
                        link: url,
                    },
                },
            ]],
    };
}
// === VK Callback API: проверка ===
export function getConfirmationCode() {
    return VK_CONFIRMATION_CODE;
}
export function validateSecret(secret) {
    if (!VK_SECRET_KEY)
        return true; // Если секрет не задан — пропускаем
    return secret === VK_SECRET_KEY;
}
// === Валидация VK URL ===
export function extractVkUrl(text) {
    const patterns = [
        /https?:\/\/(?:www\.)?vk\.com\/[a-zA-Z0-9._-]+/i,
        /https?:\/\/(?:www\.)?vk\.ru\/[a-zA-Z0-9._-]+/i,
        /(?:^|\s)vk\.com\/([a-zA-Z0-9._-]+)/i,
        /(?:^|\s)vk\.ru\/([a-zA-Z0-9._-]+)/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let url = match[0].trim();
            if (!url.startsWith('http')) {
                url = `https://${url}`;
            }
            return url;
        }
    }
    return null;
}
// === Получение имени пользователя VK ===
export async function getVkUserName(userId) {
    try {
        const response = await fetch(`https://api.vk.com/method/users.get?user_ids=${userId}&access_token=${VK_GROUP_TOKEN}&v=${VK_API_VERSION}`);
        const data = await response.json();
        if (data.response?.[0]) {
            return data.response[0].first_name;
        }
    }
    catch {
        // Не критично
    }
    return '';
}
// === Session CRUD (Supabase, таблица salebot_sessions) ===
export async function getActiveSession(vkUserId) {
    const { data, error } = await supabase
        .from('salebot_sessions')
        .select('*')
        .eq('salebot_client_id', vkUserId)
        .not('state', 'eq', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('❌ getActiveSession error:', error);
        return null;
    }
    return data;
}
export async function getSessionByUserId(vkUserId) {
    const { data, error } = await supabase
        .from('salebot_sessions')
        .select('*')
        .eq('salebot_client_id', vkUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('❌ getSessionByUserId error:', error);
        return null;
    }
    return data;
}
export async function createSession(vkUserId, name) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('salebot_sessions')
        .insert({
        salebot_client_id: vkUserId,
        vk_user_id: vkUserId,
        client_name: name || null,
        state: 'new',
        retry_count: 0,
        created_at: now,
        updated_at: now,
    })
        .select()
        .single();
    if (error)
        throw error;
    return data;
}
export async function updateSession(sessionId, updates) {
    const { error } = await supabase
        .from('salebot_sessions')
        .update({
        ...updates,
        updated_at: new Date().toISOString(),
    })
        .eq('id', sessionId);
    if (error) {
        console.error('❌ updateSession error:', error);
        throw error;
    }
}
