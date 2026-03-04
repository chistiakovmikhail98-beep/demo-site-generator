export interface BriefQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'phone' | 'email';
  placeholder: string;
  required?: boolean;
}

export interface BriefSection {
  id: string;
  title: string;
  description: string;
  questions: BriefQuestion[];
}

/** Brief sections — studio info first, then optional block-specific questions */
export const BRIEF_SECTIONS: BriefSection[] = [
  {
    id: 'studio',
    title: 'О студии',
    description: 'Базовая информация о вашей студии',
    questions: [
      { id: 'name', label: 'Название студии', type: 'text', placeholder: 'Например: Dance Lab', required: true },
      { id: 'city', label: 'Город', type: 'text', placeholder: 'Например: Москва', required: true },
      { id: 'address', label: 'Адрес', type: 'text', placeholder: 'ул. Примерная, 42' },
      { id: 'phone', label: 'Телефон', type: 'phone', placeholder: '+7 (999) 123-45-67' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'studio@example.com' },
      { id: 'description', label: 'Коротко о студии (1-2 предложения)', type: 'textarea', placeholder: 'Чем ваша студия уникальна? Что отличает вас от конкурентов?' },
    ],
  },
  {
    id: 'social',
    title: 'Соцсети и мессенджеры',
    description: 'Ссылки на ваши соцсети',
    questions: [
      { id: 'telegram', label: 'Telegram', type: 'text', placeholder: '@yourstudio или https://t.me/yourstudio' },
      { id: 'vk', label: 'VK', type: 'text', placeholder: 'https://vk.com/yourstudio' },
      { id: 'instagram', label: 'Instagram', type: 'text', placeholder: '@yourstudio' },
      { id: 'whatsapp', label: 'WhatsApp', type: 'phone', placeholder: '+7 (999) 123-45-67' },
    ],
  },
  {
    id: 'hero',
    title: 'Главный экран',
    description: 'Текст, который увидят посетители первым',
    questions: [
      { id: 'heroTitle', label: 'Заголовок (если хотите свой)', type: 'text', placeholder: 'Оставьте пустым — подберём автоматически' },
      { id: 'heroSubtitle', label: 'Подзаголовок', type: 'text', placeholder: 'Необязательно' },
    ],
  },
  {
    id: 'pricing',
    title: 'Тарифы',
    description: 'Расскажите о ваших абонементах',
    questions: [
      { id: 'pricingInfo', label: 'Ваши тарифы (перечислите)', type: 'textarea', placeholder: 'Например:\n- Разовое: 800₽\n- 4 занятия: 2800₽\n- 8 занятий: 4800₽\n- Безлимит: 6000₽' },
    ],
  },
];

export function getBriefSection(id: string): BriefSection | undefined {
  return BRIEF_SECTIONS.find(s => s.id === id);
}
