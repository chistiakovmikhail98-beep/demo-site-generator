import React from 'react';
import type { FooterData } from '../../types';

const CONTACT_FIELDS: { key: keyof FooterData; label: string; placeholder: string; type?: string }[] = [
  { key: 'phone', label: 'Телефон', placeholder: '+7 999 123-45-67', type: 'tel' },
  { key: 'email', label: 'Email', placeholder: 'info@studio.ru', type: 'email' },
  { key: 'address', label: 'Адрес', placeholder: 'ул. Пушкина, 10' },
  { key: 'telegram', label: 'Telegram', placeholder: '@studio' },
  { key: 'vk', label: 'ВКонтакте', placeholder: 'vk.com/studio' },
  { key: 'instagram', label: 'Instagram', placeholder: '@studio_fit' },
  { key: 'mapUrl', label: 'Ссылка на карту', placeholder: 'yandex.ru/maps/...' },
];

interface ContactEditorProps {
  contacts: FooterData;
  onChange: (contacts: FooterData) => void;
  onClose: () => void;
}

export default function ContactEditor({ contacts, onChange, onClose }: ContactEditorProps) {
  const updateField = (key: keyof FooterData, value: string) => {
    onChange({ ...contacts, [key]: value });
  };

  return (
    <div className="fixed bottom-12 left-0 right-0 z-[9989] bg-zinc-900 border-t border-zinc-700 shadow-2xl">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Контактные данные</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-2.5">
          {CONTACT_FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 w-24 shrink-0">{label}</label>
              <input
                type={type || 'text'}
                value={(contacts[key] as string) || ''}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={placeholder}
                className="flex-1 h-8 px-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
