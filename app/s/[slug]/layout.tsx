import { getProjectBySlug } from '@/lib/db';
import type { SiteConfig, ColorScheme } from '@/lib/types';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

function getDefaultColorScheme(): ColorScheme {
  return { primary: '#f43f5e', accent: '#fb7185', background: '#09090b', surface: '#18181b', text: '#f4f4f5' };
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

/** Always dark background — template is dark-only */
function getAdaptiveBackground(_primaryHex: string): { background: string; surface: string; text: string } {
  return { background: '#09090b', surface: '#18181b', text: '#f4f4f5' };
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
      `}</style>
      {children}
    </>
  );
}
