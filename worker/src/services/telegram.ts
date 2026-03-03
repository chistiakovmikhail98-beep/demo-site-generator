// Telegram notification service

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

interface AdminContact {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkUrl?: string;
}

interface SiteNotificationData {
  siteName: string;
  siteUrl: string;
  vkGroupUrl: string;
  groupPhone?: string;
  groupEmail?: string;
  groupAddress?: string;
  groupSite?: string;
  admins?: AdminContact[];
  editPassword?: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

export async function notifyNewSite(data: SiteNotificationData): Promise<void> {
  const lines: string[] = [
    '🎉 <b>Новый сайт создан!</b>',
    '',
    `📌 <b>Название:</b> ${escapeHtml(data.siteName)}`,
    `🌐 <b>Сайт:</b> ${data.siteUrl}`,
    `📱 <b>VK группа:</b> ${data.vkGroupUrl}`,
  ];

  if (data.groupPhone || data.groupEmail || data.groupAddress || data.groupSite) {
    lines.push('', '📋 <b>Контакты студии:</b>');
    if (data.groupPhone) lines.push(`📞 Телефон: ${escapeHtml(data.groupPhone)}`);
    if (data.groupEmail) lines.push(`✉️ Email: ${escapeHtml(data.groupEmail)}`);
    if (data.groupAddress) lines.push(`📍 Адрес: ${escapeHtml(data.groupAddress)}`);
    if (data.groupSite) lines.push(`🔗 Сайт: ${data.groupSite}`);
  }

  if (data.admins && data.admins.length > 0) {
    lines.push('', '👥 <b>Контакты:</b>');
    for (const admin of data.admins) {
      const parts: string[] = [];
      if (admin.name) parts.push(escapeHtml(admin.name));
      if (admin.role) parts.push(`(${escapeHtml(admin.role)})`);
      const info: string[] = [];
      if (admin.vkUrl) info.push(`VK: ${admin.vkUrl}`);
      if (admin.phone) info.push(`📞 ${escapeHtml(admin.phone)}`);
      if (admin.email) info.push(`✉️ ${escapeHtml(admin.email)}`);
      if (parts.length > 0 || info.length > 0) {
        lines.push(`• ${parts.join(' ')}: ${info.join(', ')}`);
      }
    }
  }

  if (data.editPassword) {
    lines.push('', `🔑 <b>Пароль для редактирования:</b> <code>${data.editPassword}</code>`);
    lines.push(`📝 Для входа: ${data.siteUrl}?admin`);
  }

  // Outreach template
  const shortName = data.siteName.includes('|') ? data.siteName.split('|')[0].trim() : data.siteName;
  lines.push(
    '', '━━━━━━━━━━━━━━━━━━━━━━',
    '📋 <b>Шаблон для рассылки:</b>',
    '━━━━━━━━━━━━━━━━━━━━━━', '',
    `<code>Здравствуйте! Сделали прототип сайта для вашей студии «${shortName}» на основе группы ВК - посмотрите:\n${data.siteUrl}\n\nЭто прототип - можно скорректировать под вас. Само создание бесплатно, работаем по подписке за совсем небольшую сумму в месяц.\n\nТакие сайты приносят от 30 заявок/мес уже из поиска и карт - если интересно, расскажу подробнее 🙌</code>`
  );

  await sendTelegramMessage(lines.join('\n'));
}
