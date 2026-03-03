// Color extraction from avatar images using sharp

import sharp from 'sharp';

export interface ColorScheme {
  primary: string;
  accent: string;
}

interface HSL { h: number; s: number; l: number; }
interface RGB { r: number; g: number; b: number; }

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export async function extractColorsFromUrl(imageUrl: string): Promise<ColorScheme> {
  console.log(`🎨 Извлечение цветов из: ${imageUrl}`);

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return extractColorsFromBuffer(buffer);
}

async function extractColorsFromBuffer(imageBuffer: Buffer): Promise<ColorScheme> {
  const { data, info } = await sharp(imageBuffer)
    .resize(100, 100, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorBuckets: Record<string, { h: number; s: number; l: number; count: number; satScore: number }> = {};
  const channels = info.channels;

  for (let i = 0; i < data.length; i += channels) {
    const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (hsl.l < 5 || hsl.l > 95) continue;

    const hBucket = Math.round(hsl.h / 15) * 15;
    const sBucket = Math.round(hsl.s / 20) * 20;
    const lBucket = Math.round(hsl.l / 20) * 20;
    const key = `${hBucket}-${sBucket}-${lBucket}`;
    const satScore = hsl.s * (hsl.l > 20 && hsl.l < 80 ? 1.5 : 1);

    if (!colorBuckets[key]) {
      colorBuckets[key] = { h: hBucket, s: sBucket, l: lBucket, count: 0, satScore: 0 };
    }
    colorBuckets[key].count++;
    colorBuckets[key].satScore += satScore;
  }

  const sortedColors = Object.values(colorBuckets)
    .filter(c => c.s >= 15)
    .sort((a, b) => (b.count * b.satScore) - (a.count * a.satScore));

  if (sortedColors.length === 0) {
    return { primary: '#7c3aed', accent: '#a78bfa' };
  }

  const pc = sortedColors[0];
  const primaryRgb = hslToRgb(pc.h, Math.max(pc.s, 60), Math.min(Math.max(pc.l, 35), 55));
  const primaryHex = rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  const contrastColor = sortedColors.find(c => Math.abs(c.h - pc.h) > 30);
  let accentHex: string;
  if (contrastColor) {
    const accentRgb = hslToRgb(contrastColor.h, Math.max(contrastColor.s, 50), Math.min(Math.max(contrastColor.l, 50), 70));
    accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
  } else {
    const accentRgb = hslToRgb(pc.h, Math.max(pc.s - 10, 40), Math.min(pc.l + 20, 75));
    accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
  }

  console.log(`🎨 Результат: primary=${primaryHex}, accent=${accentHex}`);
  return { primary: primaryHex, accent: accentHex };
}
