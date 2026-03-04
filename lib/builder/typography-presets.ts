export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  /** Google Fonts URL for both fonts */
  googleFontsUrl: string;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'modern',
    name: 'Современный',
    description: 'Чистые геометрические формы',
    headingFont: "'DM Sans', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap',
  },
  {
    id: 'elegant',
    name: 'Элегантный',
    description: 'Классические засечки и утончённость',
    headingFont: "'DM Serif Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=DM+Serif+Display&display=swap',
  },
  {
    id: 'bold',
    name: 'Спортивный',
    description: 'Мощные заголовки, энергичный стиль',
    headingFont: "'Bebas Neue', sans-serif",
    bodyFont: "'Outfit', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap',
  },
  {
    id: 'friendly',
    name: 'Дружелюбный',
    description: 'Мягкие, округлые буквы',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  },
  {
    id: 'premium',
    name: 'Премиальный',
    description: 'Роскошные шрифты для элитных студий',
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Space Grotesk', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap',
  },
];

export function getTypographyPreset(id: string): TypographyPreset {
  return TYPOGRAPHY_PRESETS.find(t => t.id === id) || TYPOGRAPHY_PRESETS[0];
}
