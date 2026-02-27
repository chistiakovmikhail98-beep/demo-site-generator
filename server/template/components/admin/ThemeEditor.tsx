import React, { useRef } from 'react';

interface ThemeConfig {
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  fontFamily?: string;
}

const FONT_OPTIONS = [
  { value: 'manrope', label: 'Manrope' },
  { value: 'inter', label: 'Inter' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'playfair', label: 'Playfair Display' },
];

const COLOR_FIELDS: { key: keyof ThemeConfig['colorScheme']; label: string; desc: string }[] = [
  { key: 'primary', label: 'Основной', desc: 'Кнопки, ссылки, акценты' },
  { key: 'accent', label: 'Акцентный', desc: 'Hover-эффекты, выделения' },
  { key: 'background', label: 'Фон страницы', desc: 'Основной фон сайта' },
  { key: 'surface', label: 'Фон карточек', desc: 'Блоки, панели, карточки' },
  { key: 'text', label: 'Текст', desc: 'Основной цвет текста' },
];

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
}

export default function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateColor = (key: keyof ThemeConfig['colorScheme'], value: string) => {
    // Live preview — update CSS variables immediately
    document.documentElement.style.setProperty(`--color-${key}`, value);

    // Debounce state update to avoid excessive re-renders during color picker drag
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newTheme = {
        ...theme,
        colorScheme: { ...theme.colorScheme, [key]: value },
      };
      onChange(newTheme);
    }, 50);
  };

  const updateFont = (fontFamily: string) => {
    onChange({ ...theme, fontFamily });
  };

  return (
    <div className="p-3 space-y-3">
      {/* Colors */}
      {COLOR_FIELDS.map(({ key, label, desc }) => (
        <div key={key}>
          <div className="flex items-center gap-2.5 mb-1">
            <label className="text-xs text-zinc-300 font-medium flex-1">{label}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={theme.colorScheme[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-7 h-7 rounded-md border border-zinc-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={theme.colorScheme[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                    updateColor(key, v);
                  }
                }}
                className="w-20 h-7 px-2 bg-zinc-800 border border-zinc-600 rounded-md text-[11px] text-zinc-200 font-mono focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">{desc}</p>
        </div>
      ))}

      {/* Divider */}
      <div className="border-t border-zinc-700/50" />

      {/* Font */}
      <div>
        <label className="text-xs text-zinc-300 font-medium block mb-1.5">Шрифт</label>
        <select
          value={theme.fontFamily || 'manrope'}
          onChange={(e) => updateFont(e.target.value)}
          className="w-full h-8 px-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
