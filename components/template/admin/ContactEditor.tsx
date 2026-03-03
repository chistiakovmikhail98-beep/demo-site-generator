import React from 'react';
import type { FooterData } from '../types';

const CONTACT_FIELDS: { key: keyof FooterData; label: string; placeholder: string; type?: string }[] = [
  { key: 'brandName', label: 'Название студии', placeholder: 'Фитнес-студия X' },
  { key: 'phone', label: 'Телефон', placeholder: '+7 999 123-45-67', type: 'tel' },
  { key: 'email', label: 'Email', placeholder: 'info@studio.ru', type: 'email' },
  { key: 'address', label: 'Адрес', placeholder: 'ул. Пушкина, 10' },
  { key: 'addressDetails', label: 'Доп. адрес', placeholder: '2 этаж, ТЦ Мега' },
  { key: 'telegram', label: 'Telegram', placeholder: '@studio' },
  { key: 'vk', label: 'ВКонтакте', placeholder: 'vk.com/studio' },
  { key: 'instagram', label: 'Instagram', placeholder: '@studio_fit' },
  { key: 'mapUrl', label: 'Ссылка на карту', placeholder: 'yandex.ru/maps/...' },
];

interface ContactEditorProps {
  contacts: FooterData;
  onChange: (contacts: FooterData) => void;
}

export default function ContactEditor({ contacts, onChange }: ContactEditorProps) {
  const updateField = (key: keyof FooterData, value: string) => {
    onChange({ ...contacts, [key]: value });
  };

  return (
    <div className="p-3 space-y-2">
      {CONTACT_FIELDS.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="text-[10px] text-zinc-500 font-medium block mb-0.5 uppercase tracking-wider">
            {label}
          </label>
          <input
            type={type || 'text'}
            value={(contacts[key] as string) || ''}
            onChange={(e) => updateField(key, e.target.value)}
            placeholder={placeholder}
            className="w-full h-8 px-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
