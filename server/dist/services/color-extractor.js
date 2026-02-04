/**
 * ColorExtractor - извлечение доминантных цветов из изображений
 *
 * Используется для автоматического подбора цветовой схемы сайта
 * на основе аватарки VK группы или логотипа.
 */
import sharp from 'sharp';
// === Конвертеры цветов ===
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}
function rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
/**
 * Извлекает доминантные цвета из изображения
 * @param imageBuffer - Buffer с изображением
 * @returns Цветовая схема
 */
export async function extractColorsFromBuffer(imageBuffer) {
    // Используем sharp для получения raw pixel data
    const { data, info } = await sharp(imageBuffer)
        .resize(100, 100, { fit: 'cover' }) // Уменьшаем для скорости
        .raw()
        .toBuffer({ resolveWithObject: true });
    // Собираем цвета с их насыщенностью (k-means кластеризация)
    const colorBuckets = {};
    const channels = info.channels;
    for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hsl = rgbToHsl(r, g, b);
        // Пропускаем чёрные и белые
        if (hsl.l < 5 || hsl.l > 95)
            continue;
        // Квантизируем в HSL пространстве
        const hBucket = Math.round(hsl.h / 15) * 15;
        const sBucket = Math.round(hsl.s / 20) * 20;
        const lBucket = Math.round(hsl.l / 20) * 20;
        const key = `${hBucket}-${sBucket}-${lBucket}`;
        // Очки за насыщенность (цвета с l 20-80% получают бонус)
        const satScore = hsl.s * (hsl.l > 20 && hsl.l < 80 ? 1.5 : 1);
        if (!colorBuckets[key]) {
            colorBuckets[key] = { h: hBucket, s: sBucket, l: lBucket, count: 0, satScore: 0 };
        }
        colorBuckets[key].count++;
        colorBuckets[key].satScore += satScore;
    }
    // Сортируем по (частота × насыщенность)
    const sortedColors = Object.values(colorBuckets)
        .filter(c => c.s >= 15) // Минимальная насыщенность 15%
        .sort((a, b) => (b.count * b.satScore) - (a.count * a.satScore));
    // Если нет насыщенных цветов - фоллбэк
    if (sortedColors.length === 0) {
        const fallbackColors = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
        if (fallbackColors.length > 0) {
            const c = fallbackColors[0];
            const rgb = hslToRgb(c.h, Math.max(c.s, 50), Math.min(Math.max(c.l, 40), 60));
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            return { primary: hex, accent: hex };
        }
        // Дефолтные цвета
        return { primary: '#7c3aed', accent: '#a78bfa' };
    }
    // Primary: самый частый насыщенный цвет
    const primaryColor = sortedColors[0];
    // Бустим насыщенность до минимум 60% для primary
    const boostedSat = Math.max(primaryColor.s, 60);
    const boostedL = Math.min(Math.max(primaryColor.l, 35), 55);
    const primaryRgb = hslToRgb(primaryColor.h, boostedSat, boostedL);
    const primaryHex = rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    // Accent: контрастный цвет или более светлая версия primary
    let accentHex;
    const contrastColor = sortedColors.find(c => Math.abs(c.h - primaryColor.h) > 30);
    if (contrastColor) {
        const accentRgb = hslToRgb(contrastColor.h, Math.max(contrastColor.s, 50), Math.min(Math.max(contrastColor.l, 50), 70));
        accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
    }
    else {
        // Делаем светлее primary
        const accentRgb = hslToRgb(primaryColor.h, Math.max(primaryColor.s - 10, 40), Math.min(primaryColor.l + 20, 75));
        accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
    }
    return { primary: primaryHex, accent: accentHex };
}
/**
 * Извлекает цвета из изображения по URL
 * @param imageUrl - URL изображения
 * @returns Цветовая схема
 */
export async function extractColorsFromUrl(imageUrl) {
    console.log(`🎨 Извлечение цветов из: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const colors = await extractColorsFromBuffer(buffer);
    console.log(`🎨 Результат: primary=${colors.primary}, accent=${colors.accent}`);
    return colors;
}
/**
 * Генерирует полную цветовую палитру на основе primary цвета
 */
export function generatePalette(primary) {
    // Парсим hex в RGB
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);
    const hsl = rgbToHsl(r, g, b);
    // Accent: более светлый
    const accentRgb = hslToRgb(hsl.h, Math.max(hsl.s - 10, 40), Math.min(hsl.l + 15, 75));
    const accent = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
    // Background: очень светлый
    const bgRgb = hslToRgb(hsl.h, Math.min(hsl.s, 15), 97);
    const background = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
    // Text: тёмный с оттенком primary
    const textRgb = hslToRgb(hsl.h, Math.min(hsl.s, 20), 15);
    const text = rgbToHex(textRgb.r, textRgb.g, textRgb.b);
    // Muted: серый с оттенком
    const mutedRgb = hslToRgb(hsl.h, Math.min(hsl.s, 10), 60);
    const muted = rgbToHex(mutedRgb.r, mutedRgb.g, mutedRgb.b);
    return { primary, accent, background, text, muted };
}
