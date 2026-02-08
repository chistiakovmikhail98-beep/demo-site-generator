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

// === Интерфейсы ===

// VK Callback API payload
export interface VkCallbackPayload {
  type: 'confirmation' | 'message_new' | string;
  group_id: number;
  secret?: string;
  event_id?: string;
  v?: string;
  object?: {
    message?: {
      id: number;
      date: number;
      peer_id: number;
      from_id: number;
      text: string;
      random_id: number;
      attachments: unknown[];
      payload?: string;
    };
    client_info?: {
      button_actions: string[];
      keyboard: boolean;
      inline_keyboard: boolean;
    };
  };
}

// Senler webhook payload (подписка)
export interface SenlerWebhookPayload {
  // Формат настраивается в Senler через шаблоны
  // Минимально нужно: vk_user_id
  vk_user_id?: string | number;
  user_id?: string | number;
  name?: string;
  [key: string]: unknown;
}

// Сессия бота (та же таблица salebot_sessions)
export interface BotSession {
  id: string;
  salebot_client_id: string;  // Используем как vk_user_id
  vk_user_id: string | null;
  client_name: string | null;
  state: 'new' | 'awaiting_url' | 'processing' | 'completed' | 'failed';
  vk_url: string | null;
  project_id: string | null;
  deployed_url: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

type SessionState = BotSession['state'];

// === Шаблоны сообщений ===

export const MESSAGES = {
  greeting: (name: string) =>
    `Привет${name ? ', ' + name : ''}! 👋\n\n` +
    `Я создам бесплатный демо-сайт для вашей студии за 2-3 минуты.\n\n` +
    `Отправьте мне ссылку на вашу группу ВКонтакте 👇`,

  invalidUrl:
    `Не могу распознать ссылку на группу ВК.\n\n` +
    `Пришлите в формате:\nvk.com/your_group`,

  processing: (vkUrl: string) =>
    `Отлично! Начинаю создание сайта по группе:\n${vkUrl}\n\n` +
    `⏳ Это займёт 2-3 минуты. Я напишу, когда будет готово!`,

  stillProcessing:
    `⏳ Ваш сайт ещё создаётся, подождите пару минут...`,

  completed: (url: string) =>
    `🎉 Ваш демо-сайт готов!\n\nПосмотрите: ${url}`,

  completedRepeat: (url: string) =>
    `Ваш сайт уже готов! 🎉\n${url}\n\n` +
    `Хотите создать сайт для другой группы? Пришлите новую ссылку.`,

  failed:
    `😔 К сожалению, не удалось создать сайт.\n` +
    `Попробуйте прислать другую ссылку на группу ВК.`,

  retrying: (vkUrl: string) =>
    `Пробую снова с: ${vkUrl}\n⏳ Подождите 2-3 минуты...`,
};

// === VK API: отправка сообщений ===

export async function sendMessage(
  peerId: number | string,
  message: string,
  keyboard?: VkKeyboard,
): Promise<boolean> {
  try {
    const params: Record<string, string> = {
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

    const result = await response.json() as { response?: number; error?: { error_code: number; error_msg: string } };

    if (result.error) {
      console.error(`❌ VK messages.send error:`, result.error.error_msg);
      return false;
    }

    console.log(`✅ VK: сообщение отправлено пользователю ${peerId}`);
    return true;
  } catch (error) {
    console.error(`❌ VK sendMessage error:`, error);
    return false;
  }
}

// VK Keyboard
export interface VkKeyboard {
  one_time?: boolean;
  inline?: boolean;
  buttons: VkKeyboardButton[][];
}

export interface VkKeyboardButton {
  action: {
    type: 'text' | 'open_link' | 'location' | 'vkpay';
    label?: string;
    link?: string;
    payload?: string;
  };
  color?: 'primary' | 'secondary' | 'positive' | 'negative';
}

// Кнопка "Открыть сайт"
export function makeSiteLinkKeyboard(url: string): VkKeyboard {
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

export function getConfirmationCode(): string {
  return VK_CONFIRMATION_CODE;
}

export function validateSecret(secret?: string): boolean {
  if (!VK_SECRET_KEY) return true; // Если секрет не задан — пропускаем
  return secret === VK_SECRET_KEY;
}

// === Валидация VK URL ===

export function extractVkUrl(text: string): string | null {
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

export async function getVkUserName(userId: number | string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${userId}&access_token=${VK_GROUP_TOKEN}&v=${VK_API_VERSION}`,
    );
    const data = await response.json() as { response?: Array<{ first_name: string; last_name: string }> };
    if (data.response?.[0]) {
      return data.response[0].first_name;
    }
  } catch {
    // Не критично
  }
  return '';
}

// === Session CRUD (Supabase, таблица salebot_sessions) ===

export async function getActiveSession(vkUserId: string): Promise<BotSession | null> {
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

export async function getSessionByUserId(vkUserId: string): Promise<BotSession | null> {
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

export async function createSession(vkUserId: string, name?: string): Promise<BotSession> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('salebot_sessions')
    .insert({
      salebot_client_id: vkUserId,
      vk_user_id: vkUserId,
      client_name: name || null,
      state: 'new' as SessionState,
      retry_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<BotSession, 'state' | 'vk_url' | 'project_id' | 'deployed_url' | 'error_message' | 'retry_count'>>,
): Promise<void> {
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
