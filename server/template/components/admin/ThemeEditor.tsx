import React from 'react';

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

const COLOR_FIELDS: { key: keyof ThemeConfig['colorScheme']; label: string }[] = [
  { key: 'primary', label: 'Основной' },
  { key: 'accent', label: 'Акцентный' },
  { key: 'background', label: 'Фон' },
  { key: 'surface', label: 'Поверхность' },
  { key: 'text', label: 'Текст' },
];

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  onClose: () => void;
}

export default function ThemeEditor({ theme, onChange, onClose }: ThemeEditorProps) {
  const updateColor = (key: keyof ThemeConfig['colorScheme'], value: string) => {
    const newTheme = {
      ...theme,
      colorScheme: { ...theme.colorScheme, [key]: value },
    };
    onChange(newTheme);

    // Live preview — update CSS variables
    const cssVar = `--color-${key}`;
    document.documentElement.style.setProperty(cssVar, value);
  };

  const updateFont = (fontFamily: string) => {
    onChange({ ...theme, fontFamily });
  };

  return (
    <div className="fixed bottom-12 left-0 right-0 z-[9989] bg-zinc-900 border-t border-zinc-700 shadow-2xl">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Тема оформления</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Colors */}
        <div className="space-y-2.5 mb-4">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 w-24 shrink-0">{label}</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={theme.colorScheme[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="w-8 h-8 rounded-lg border border-zinc-600 cursor-pointer bg-transparent"
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
                  className="flex-1 h-8 px-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Font */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 w-24 shrink-0">Шрифт</label>
          <select
            value={theme.fontFamily || 'manrope'}
            onChange={(e) => updateFont(e.target.value)}
            className="flex-1 h-8 px-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
