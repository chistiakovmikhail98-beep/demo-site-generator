import type { SiteConfig, Niche } from '../types';
import type { BuilderState, StudioInfo } from './store';
import { COLOR_PALETTES } from './color-palettes';
import { getDefaultBlocks } from './block-definitions';

/**
 * Reverse-convert SiteConfig (from DB) → BuilderState (for the builder wizard).
 * Used when a client clicks "Доработать" on a demo site generated from VK.
 */
export function siteConfigToBuilderState(config: SiteConfig): Partial<BuilderState> {
  const niche: Niche = config.brand.niche || 'dance';

  // Studio info from contacts + brand
  const contacts = config.sections.contacts || {};
  const studioInfo: StudioInfo = {
    name: config.brand.name || '',
    city: config.brand.city || '',
    phone: contacts.phone || '',
    email: contacts.email || '',
    address: contacts.address || '',
    description: config.brand.heroDescription || '',
    telegram: contacts.telegram || '',
    vk: contacts.vk || '',
    instagram: contacts.instagram || '',
    whatsapp: contacts.whatsapp || '',
  };

  // Match color scheme to a preset, or use custom colors
  const cs = config.sections.colorScheme;
  let colorPresetId = 'neon-rose';
  let customColors: { primary: string; accent: string } | null = null;

  if (cs?.primary) {
    const matchedPalette = COLOR_PALETTES.find(
      (p) => p.colorScheme.primary.toLowerCase() === cs.primary.toLowerCase()
        && p.colorScheme.accent.toLowerCase() === cs.accent.toLowerCase()
    );
    if (matchedPalette) {
      colorPresetId = matchedPalette.id;
    } else {
      colorPresetId = 'custom';
      customColors = { primary: cs.primary, accent: cs.accent };
    }
  }

  // Block variants from config
  const blockVariants: Record<string, 1 | 2 | 3> = {};
  if (config.sections.blockVariants) {
    for (const [key, val] of Object.entries(config.sections.blockVariants)) {
      blockVariants[key] = val;
    }
  }

  // Selected blocks: use blockVariants keys if available, otherwise defaults
  const selectedBlocks = Object.keys(blockVariants).length > 0
    ? Object.keys(blockVariants)
    : getDefaultBlocks();

  // Pricing back to text
  const pricingInfo = (config.sections.pricing || [])
    .map((p) => `${p.name} — ${p.price}${p.period ? ` / ${p.period}` : ''}`)
    .join('\n');

  return {
    step: 1, // skip niche selection, start at blocks
    niche,
    selectedBlocks,
    blockVariants,
    studioInfo,
    heroTitle: config.brand.heroTitle || '',
    heroSubtitle: config.brand.heroSubtitle || '',
    pricingInfo,
    colorPresetId,
    customColors,
    typographyPresetId: 'modern',
    regEmail: '',
    regPhone: '',
    createdProjectSlug: null,
    createdPassword: null,
  };
}
