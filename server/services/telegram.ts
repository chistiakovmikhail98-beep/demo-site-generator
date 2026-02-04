// Сервис для отправки уведомлений в Telegram

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8352409395:AAER_ra9X8TuY7jeVOSbCl2BzbEo-_erwpI';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '505056467';

interface AdminContact {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkId?: number;
  vkUrl?: string;
}

interface SiteNotificationData {
  siteName: string;
  siteUrl: string;
  vkGroupUrl: string;
  admins?: AdminContact[];
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error('❌ Telegram API error:', result.description);
      return false;
    }

    console.log('✅ Telegram уведомление отправлено');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    return false;
  }
}

// Отправка уведомления о новом сайте
export async function notifyNewSite(data: SiteNotificationData): Promise<void> {
  const lines: string[] = [
    '🎉 <b>Новый сайт создан!</b>',
    '',
    `📌 <b>Название:</b> ${escapeHtml(data.siteName)}`,
    `🌐 <b>Сайт:</b> ${data.siteUrl}`,
    `📱 <b>VK группа:</b> ${data.vkGroupUrl}`,
  ];

  // Добавляем информацию об админах
  if (data.admins && data.admins.length > 0) {
    lines.push('');
    lines.push('👥 <b>Контакты:</b>');

    for (const admin of data.admins) {
      const adminParts: string[] = [];

      if (admin.name) {
        adminParts.push(escapeHtml(admin.name));
      }
      if (admin.role) {
        adminParts.push(`(${escapeHtml(admin.role)})`);
      }

      const contactInfo: string[] = [];
      if (admin.vkUrl) {
        contactInfo.push(`VK: ${admin.vkUrl}`);
      }
      if (admin.phone) {
        contactInfo.push(`📞 ${escapeHtml(admin.phone)}`);
      }
      if (admin.email) {
        contactInfo.push(`✉️ ${escapeHtml(admin.email)}`);
      }

      if (adminParts.length > 0 || contactInfo.length > 0) {
        const adminLine = adminParts.length > 0
          ? `• ${adminParts.join(' ')}: ${contactInfo.join(', ')}`
          : `• ${contactInfo.join(', ')}`;
        lines.push(adminLine);
      }
    }
  }

  const message = lines.join('\n');
  await sendTelegramMessage(message);
}

// Экранирование HTML спецсимволов
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
