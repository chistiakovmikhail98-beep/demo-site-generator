import { getProjectBySlug } from '@/lib/db';
import type { SiteConfig, ColorScheme } from '@/lib/types';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

function getDefaultColorScheme(): ColorScheme {
  return { primary: '#ba000f', accent: '#ff4444', background: '#0c0c0f', surface: '#18181b', text: '#ffffff' };
}

/** Hex → "R, G, B" string for use in rgba() */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
}

/** If primary color is too dark (L < 30%), brighten to ~45% lightness */
function ensureBright(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l >= 0.3) return hex;
  // Brighten: scale RGB so lightness ≈ 0.45
  const factor = 0.45 / Math.max(l, 0.05);
  const clamp = (v: number) => Math.min(255, Math.round(v * factor * 255));
  const toHex2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex2(clamp(r))}${toHex2(clamp(g))}${toHex2(clamp(b))}`;
}

/** Compute adaptive background based on primary color lightness */
function getAdaptiveBackground(primaryHex: string): { background: string; surface: string; text: string } {
  const hex = primaryHex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }

  if (l * 100 > 45) {
    const bgH = h * 360;
    const bgS = Math.min(s * 100 * 0.15, 10);
    return {
      background: hslToHex(bgH, bgS, 96),
      surface: hslToHex(bgH, bgS, 92),
      text: '#1a1a1a',
    };
  }

  return { background: '#0c0c0f', surface: '#18181b', text: '#ffffff' };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default async function SiteLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  const defaults = getDefaultColorScheme();
  let colorScheme = defaults;

  if (project?.site_config) {
    const config = project.site_config as SiteConfig;
    const base = config.sections?.colorScheme || defaults;

    // Compute adaptive background
    const adaptive = getAdaptiveBackground(base.primary);
    const userExplicitBg = base.background &&
      base.background !== defaults.background &&
      base.background !== '#0c0c0f' &&
      base.background !== '#0c0c0e';

    colorScheme = {
      primary: ensureBright(base.primary),
      accent: base.accent,
      background: userExplicitBg ? base.background : adaptive.background,
      surface: userExplicitBg ? (base.surface || adaptive.surface) : adaptive.surface,
      text: userExplicitBg ? (base.text || adaptive.text) : adaptive.text,
    };
  }

  const isLight = colorScheme.text === '#1a1a1a';

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${colorScheme.primary};
          --color-primary-rgb: ${hexToRgb(colorScheme.primary)};
          --color-accent: ${colorScheme.accent};
          --color-background: ${colorScheme.background};
          --color-surface: ${colorScheme.surface};
          --color-text: ${colorScheme.text};
        }
        body { background-color: ${colorScheme.background} !important; color: ${colorScheme.text} !important; }
        ${isLight ? `
        .text-white { color: ${colorScheme.text} !important; }
        .text-zinc-50, .text-zinc-100, .text-zinc-200 { color: #27272a !important; }
        .text-zinc-300, .text-zinc-400 { color: #52525b !important; }
        .bg-zinc-900, .bg-zinc-950 { background-color: ${colorScheme.surface} !important; }
        .bg-zinc-800 { background-color: #e4e4e7 !important; }
        .border-zinc-700, .border-zinc-800 { border-color: #d4d4d8 !important; }
        .border-white\\/10, .border-white\\/20 { border-color: rgba(0,0,0,0.1) !important; }
        .bg-black\\/40, .bg-black\\/50 { background-color: rgba(255,255,255,0.7) !important; }
        ` : ''}
      `}</style>
      {children}
    </>
  );
}
