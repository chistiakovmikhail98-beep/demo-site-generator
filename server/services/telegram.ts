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
  groupPhone?: string;    // Телефон группы ВК
  groupEmail?: string;    // Email группы
  groupAddress?: string;  // Адрес
  groupSite?: string;     // Сайт студии
  admins?: AdminContact[];
  editPassword?: string;  // Пароль для редактирования сайта
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

  // Контакты группы
  if (data.groupPhone || data.groupEmail || data.groupAddress || data.groupSite) {
    lines.push('');
    lines.push('📋 <b>Контакты студии:</b>');
    if (data.groupPhone) lines.push(`📞 Телефон: ${escapeHtml(data.groupPhone)}`);
    if (data.groupEmail) lines.push(`✉️ Email: ${escapeHtml(data.groupEmail)}`);
    if (data.groupAddress) lines.push(`📍 Адрес: ${escapeHtml(data.groupAddress)}`);
    if (data.groupSite) lines.push(`🔗 Сайт: ${data.groupSite}`);
  }

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

  // Пароль для редактирования
  if (data.editPassword) {
    lines.push('');
    lines.push(`🔑 <b>Пароль для редактирования:</b> <code>${data.editPassword}</code>`);
    lines.push(`📝 Для входа: ${data.siteUrl}?admin`);
  }

  // Добавляем готовый шаблон для рассылки
  // Извлекаем короткое название студии (до " | " или первое слово)
  const shortName = data.siteName.includes('|')
    ? data.siteName.split('|')[0].trim()
    : data.siteName;

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📋 <b>Шаблон для рассылки:</b>');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`<code>Здравствуйте! Сделали прототип сайта для вашей студии «${shortName}» на основе группы ВК - посмотрите:
${data.siteUrl}

Это прототип - можно скорректировать под вас. Само создание бесплатно, работаем по подписке за совсем небольшую сумму в месяц.

Такие сайты приносят от 30 заявок/мес уже из поиска и карт - если интересно, расскажу подробнее 🙌</code>`);

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
