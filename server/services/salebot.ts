// Сервис интеграции с Salebot (чат-бот VK воронка)

import { supabase } from './supabase.js';

// === Конфигурация ===

const SALEBOT_API_KEY = process.env.SALEBOT_API_KEY || '';
const SALEBOT_BASE_URL = 'https://chatter.salebot.pro/api';
const SALEBOT_SUBSCRIPTION_TAG = process.env.SALEBOT_SUBSCRIPTION_TAG || 'demo_site';

export const USE_SALEBOT = !!SALEBOT_API_KEY;

if (!USE_SALEBOT) {
  console.warn('⚠️ SALEBOT_API_KEY не установлен — Salebot webhook отключён');
}

// === Интерфейсы ===

export interface SalebotWebhookPayload {
  id: number;
  client: {
    id: number;
    recepient: string;   // VK user_id
    client_type: string; // "vk"
    name: string;
    avatar: string;
    created_at?: string;
    tag: string;         // Тег подписной страницы
    group: string;
  };
  message: string;
  attachments: unknown[];
  message_id: number;    // ID блока в воронке Salebot
  project_id: number;    // ID проекта в Salebot
  is_input: number;      // 1 = от пользователя, 0 = от бота
  delivered: number;
  error_message: string | null;
}

export interface SalebotSession {
  id: string;
  salebot_client_id: string;
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

type SessionState = SalebotSession['state'];

// === Шаблоны сообщений ===

export const MESSAGES = {
  greeting: (name: string) =>
    `Привет, ${name}! 👋\n\n` +
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
    `🎉 Ваш демо-сайт готов!\n\nПосмотрите:`,

  completedRepeat: (url: string) =>
    `Ваш сайт уже готов! 🎉\n${url}\n\n` +
    `Хотите создать сайт для другой группы? Пришлите новую ссылку.`,

  failed:
    `😔 К сожалению, не удалось создать сайт.\n` +
    `Попробуйте прислать другую ссылку на группу ВК.`,

  retrying: (vkUrl: string) =>
    `Пробую снова с: ${vkUrl}\n⏳ Подождите 2-3 минуты...`,
};

// === Salebot API ===

async function salebotRequest(action: string, body: Record<string, unknown>): Promise<unknown> {
  const url = `${SALEBOT_BASE_URL}/${SALEBOT_API_KEY}/${action}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (response.status !== 200) {
    console.error(`❌ Salebot API error (${action}):`, result);
  }

  return result;
}

export interface SalebotButton {
  type: 'inline' | 'reply';
  text: string;
  url?: string;
  line?: number;
  index_in_line?: number;
}

export async function sendMessage(
  clientId: string | number,
  message: string,
  buttons?: SalebotButton[],
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      client_id: String(clientId),
      message,
    };

    if (buttons && buttons.length > 0) {
      body.buttons = {
        buttons: buttons.map((btn, i) => ({
          type: btn.type || 'inline',
          text: btn.text,
          url: btn.url,
          line: btn.line ?? 0,
          index_in_line: btn.index_in_line ?? i,
        })),
      };
    }

    await salebotRequest('message', body);
    console.log(`✅ Salebot: сообщение отправлено клиенту ${clientId}`);
    return true;
  } catch (error) {
    console.error(`❌ Salebot sendMessage error:`, error);
    return false;
  }
}

export async function saveVariables(
  clientId: string | number,
  variables: Record<string, string>,
): Promise<boolean> {
  try {
    await salebotRequest('save_variables', {
      client_id: String(clientId),
      variables,
    });
    return true;
  } catch (error) {
    console.error(`❌ Salebot saveVariables error:`, error);
    return false;
  }
}

// === Определение callback подписной страницы ===

export function isSubscriptionCallback(payload: SalebotWebhookPayload): boolean {
  // Проверяем тег клиента — он задаётся в воронке Salebot на подписной странице
  if (payload.client?.tag && payload.client.tag.includes(SALEBOT_SUBSCRIPTION_TAG)) {
    return true;
  }
  return false;
}

// === Валидация VK URL ===

export function extractVkUrl(text: string): string | null {
  // Ищем ссылку на VK группу в тексте сообщения
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
      // Нормализуем к полному URL
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      return url;
    }
  }

  return null;
}

// === Session CRUD (Supabase) ===

export async function getActiveSession(salebotClientId: string): Promise<SalebotSession | null> {
  const { data, error } = await supabase
    .from('salebot_sessions')
    .select('*')
    .eq('salebot_client_id', salebotClientId)
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

export async function getSessionByClientId(salebotClientId: string): Promise<SalebotSession | null> {
  // Получаем любую сессию (включая completed) для повторного использования
  const { data, error } = await supabase
    .from('salebot_sessions')
    .select('*')
    .eq('salebot_client_id', salebotClientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ getSessionByClientId error:', error);
    return null;
  }
  return data;
}

export async function createSession(payload: SalebotWebhookPayload): Promise<SalebotSession> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('salebot_sessions')
    .insert({
      salebot_client_id: String(payload.client.id),
      vk_user_id: payload.client.recepient || null,
      client_name: payload.client.name || null,
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
  updates: Partial<Pick<SalebotSession, 'state' | 'vk_url' | 'project_id' | 'deployed_url' | 'error_message' | 'retry_count'>>,
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
