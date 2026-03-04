import type { ColorScheme } from './types';

/**
 * 5 curated color presets for dance/fitness studios.
 * Based on research of 50+ premium dance studio websites,
 * Material Design dark theme guidelines, and WCAG 2.1 contrast ratios.
 *
 * Each preset follows the 60-30-10 rule:
 * - 60% dark background (zinc-950 #09090b)
 * - 30% text hierarchy (zinc-100 → zinc-500)
 * - 10% accent color (primary + accent)
 */

export interface ColorPreset extends ColorScheme {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  bestFor: string[];
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'neon-rose',
    name: 'Neon Rose',
    nameRu: 'Неоновая роза',
    description: 'Энергичный, страстный, женственный. Идеален для танцевальных студий.',
    bestFor: ['dance', 'stretching', 'wellness'],
    primary: '#f43f5e',   // rose-500
    accent: '#fb7185',    // rose-400
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    text: '#f4f4f5',       // zinc-100
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    nameRu: 'Электрический фиолет',
    description: 'Креативный, артистичный, ночной. Для хип-хопа и модерна.',
    bestFor: ['dance', 'fitness'],
    primary: '#8b5cf6',   // violet-500
    accent: '#a78bfa',    // violet-400
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    text: '#f4f4f5',       // zinc-100
  },
  {
    id: 'gold-luxe',
    name: 'Gold Luxe',
    nameRu: 'Золотой люкс',
    description: 'Роскошный, элитный, классический. Для премиум-студий и бальных танцев.',
    bestFor: ['dance', 'wellness'],
    primary: '#f59e0b',   // amber-500
    accent: '#fbbf24',    // amber-400
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    text: '#fafafa',       // zinc-50 (warmer white for gold theme)
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    nameRu: 'Кибер циан',
    description: 'Современный, свежий, технологичный. Для фитнес-танцев и zumba.',
    bestFor: ['fitness', 'dance'],
    primary: '#06b6d4',   // cyan-500
    accent: '#22d3ee',    // cyan-400
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    text: '#f4f4f5',       // zinc-100
  },
  {
    id: 'emerald-flow',
    name: 'Emerald Flow',
    nameRu: 'Изумрудный поток',
    description: 'Здоровье, гармония, баланс. Для йога-танцев и стретчинга.',
    bestFor: ['yoga', 'stretching', 'wellness'],
    primary: '#10b981',   // emerald-500
    accent: '#34d399',    // emerald-400
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    text: '#f4f4f5',       // zinc-100
  },
];

/** Get preset by ID, fallback to neon-rose */
export function getPresetById(id: string): ColorPreset {
  return COLOR_PRESETS.find(p => p.id === id) || COLOR_PRESETS[0];
}

/** Get best preset for a niche */
export function getPresetForNiche(niche: string): ColorPreset {
  const match = COLOR_PRESETS.find(p => p.bestFor[0] === niche);
  return match || COLOR_PRESETS[0];
}

/** Convert preset to ColorScheme (strips extra fields) */
export function presetToColorScheme(preset: ColorPreset): ColorScheme {
  return {
    primary: preset.primary,
    accent: preset.accent,
    background: preset.background,
    surface: preset.surface,
    text: preset.text,
  };
}
