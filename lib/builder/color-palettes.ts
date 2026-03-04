export interface ColorPalette {
  id: string;
  name: string;
  group: string;
  primary: string;
  accent: string;
  /** CSS vars applied to the site */
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  // === Modern ===
  {
    id: 'neon-rose', name: 'Неоновая роза', group: 'Современные',
    primary: '#f43f5e', accent: '#fb7185',
    colorScheme: { primary: '#f43f5e', accent: '#fb7185', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'electric-violet', name: 'Электрический фиолет', group: 'Современные',
    primary: '#8b5cf6', accent: '#a78bfa',
    colorScheme: { primary: '#8b5cf6', accent: '#a78bfa', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'cyber-cyan', name: 'Кибер циан', group: 'Современные',
    primary: '#06b6d4', accent: '#22d3ee',
    colorScheme: { primary: '#06b6d4', accent: '#22d3ee', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'coral-navy', name: 'Коралл и индиго', group: 'Современные',
    primary: '#f97316', accent: '#fb923c',
    colorScheme: { primary: '#f97316', accent: '#fb923c', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'mint-charcoal', name: 'Мятный', group: 'Современные',
    primary: '#2dd4bf', accent: '#5eead4',
    colorScheme: { primary: '#2dd4bf', accent: '#5eead4', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'sky-blue', name: 'Небесный', group: 'Современные',
    primary: '#38bdf8', accent: '#7dd3fc',
    colorScheme: { primary: '#38bdf8', accent: '#7dd3fc', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  // === Elegant ===
  {
    id: 'gold-luxe', name: 'Золотой люкс', group: 'Элегантные',
    primary: '#f59e0b', accent: '#fbbf24',
    colorScheme: { primary: '#f59e0b', accent: '#fbbf24', background: '#09090b', surface: '#18181b', text: '#fafafa' },
  },
  {
    id: 'burgundy-gold', name: 'Бургунди и золото', group: 'Элегантные',
    primary: '#be123c', accent: '#d4a574',
    colorScheme: { primary: '#be123c', accent: '#d4a574', background: '#09090b', surface: '#18181b', text: '#fafafa' },
  },
  {
    id: 'plum-champagne', name: 'Слива и шампань', group: 'Элегантные',
    primary: '#a855f7', accent: '#e8c9a0',
    colorScheme: { primary: '#a855f7', accent: '#e8c9a0', background: '#09090b', surface: '#18181b', text: '#fafafa' },
  },
  {
    id: 'navy-blush', name: 'Индиго и румянец', group: 'Элегантные',
    primary: '#6366f1', accent: '#fda4af',
    colorScheme: { primary: '#6366f1', accent: '#fda4af', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  // === Energetic ===
  {
    id: 'electric-lime', name: 'Электрик лайм', group: 'Энергичные',
    primary: '#84cc16', accent: '#a3e635',
    colorScheme: { primary: '#84cc16', accent: '#a3e635', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'sunset-orange', name: 'Закатный', group: 'Энергичные',
    primary: '#ef4444', accent: '#f97316',
    colorScheme: { primary: '#ef4444', accent: '#f97316', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'magenta-cyan', name: 'Маджента и циан', group: 'Энергичные',
    primary: '#ec4899', accent: '#06b6d4',
    colorScheme: { primary: '#ec4899', accent: '#06b6d4', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'amber-purple', name: 'Янтарь и пурпур', group: 'Энергичные',
    primary: '#f59e0b', accent: '#8b5cf6',
    colorScheme: { primary: '#f59e0b', accent: '#8b5cf6', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  // === Natural ===
  {
    id: 'emerald-flow', name: 'Изумрудный', group: 'Натуральные',
    primary: '#10b981', accent: '#34d399',
    colorScheme: { primary: '#10b981', accent: '#34d399', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'sage-blush', name: 'Шалфей и румянец', group: 'Натуральные',
    primary: '#86efac', accent: '#fda4af',
    colorScheme: { primary: '#86efac', accent: '#fda4af', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'olive-sand', name: 'Олива и песок', group: 'Натуральные',
    primary: '#a3e635', accent: '#d4a574',
    colorScheme: { primary: '#a3e635', accent: '#d4a574', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'dusty-rose', name: 'Пыльная роза', group: 'Натуральные',
    primary: '#f9a8d4', accent: '#fda4af',
    colorScheme: { primary: '#f9a8d4', accent: '#fda4af', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  // === Minimal ===
  {
    id: 'mono-white', name: 'Монохром', group: 'Минималистичные',
    primary: '#e4e4e7', accent: '#a1a1aa',
    colorScheme: { primary: '#e4e4e7', accent: '#a1a1aa', background: '#09090b', surface: '#18181b', text: '#f4f4f5' },
  },
  {
    id: 'warm-gray', name: 'Тёплый серый', group: 'Минималистичные',
    primary: '#d6d3d1', accent: '#a8a29e',
    colorScheme: { primary: '#d6d3d1', accent: '#a8a29e', background: '#0c0a09', surface: '#1c1917', text: '#fafaf9' },
  },
];

export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id);
}

export function getPaletteGroups(): string[] {
  return [...new Set(COLOR_PALETTES.map(p => p.group))];
}
