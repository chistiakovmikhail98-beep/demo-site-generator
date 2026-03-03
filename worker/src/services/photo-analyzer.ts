// Photo analysis via Google Gemini Vision (direct API)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveAiCost } from './supabase.js';

const VISION_MODEL = 'gemini-2.0-flash';
const PRICING = { input: 0.075, output: 0.30 };

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  const data = Buffer.from(buffer).toString('base64');
  const mimeType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0];
  return { mimeType, data };
}

export type PhotoCategory = 'hero' | 'gallery' | 'instructors' | 'atmosphere' | 'stories' | 'skip';

export interface AnalyzedPhoto {
  url: string;
  category: PhotoCategory;
  confidence: number;
  description?: string;
  isChild?: boolean;
  isGroup?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

export function prefilterPhotos(
  photos: Array<{ url: string; width?: number; height?: number }>
): Array<{ url: string; width?: number; height?: number }> {
  return photos.filter(p => {
    if (p.width && p.width < 400) return false;
    if (p.height && p.height < 400) return false;
    if (p.width && p.height) {
      const ratio = p.width / p.height;
      if (ratio < 0.3 || ratio > 3) return false;
    }
    return true;
  });
}

async function analyzeBatch(
  photos: Array<{ url: string }>,
  niche: string
): Promise<Array<{ category: PhotoCategory; confidence: number; description: string; isChild: boolean; isGroup: boolean; quality: string }>> {
  const ai = getGenAI();

  const nicheContext: Record<string, string> = {
    dance: 'dance studio', fitness: 'fitness gym',
    stretching: 'stretching studio', yoga: 'yoga studio', wellness: 'SPA/wellness center',
  };

  const parts: any[] = [];

  // Download each image and attach as base64
  let loadedCount = 0;
  for (const photo of photos) {
    try {
      const imgData = await fetchImageAsBase64(photo.url);
      parts.push({ inlineData: imgData });
      loadedCount++;
    } catch {
      // If image fails to load, add a text placeholder to keep indexing
      parts.push({ text: '[image failed to load]' });
    }
  }

  parts.push({
    text: `Analyse ${photos.length} photos for a ${nicheContext[niche] || 'fitness studio'} website.

For EACH photo determine:
- category: hero (main banner - beautiful wide shot), instructors (trainer portrait), gallery (classes in session), atmosphere (interior/space), skip (not suitable)
- confidence: 0-1
- isChild: true/false
- isGroup: true/false
- quality: high/medium/low
- description: 5-10 words in Russian

Answer is a JSON array (one object per photo, in same order):
[{"category":"gallery","confidence":0.9,"isChild":false,"isGroup":true,"quality":"high","description":"групповое занятие по йоге"}]

JSON ONLY!`,
  });

  try {
    const model = ai.getGenerativeModel({ model: VISION_MODEL });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    });

    const usage = result.response.usageMetadata;
    if (usage) {
      const input = usage.promptTokenCount || 0;
      const output = usage.candidatesTokenCount || 0;
      const cost = (input / 1_000_000) * PRICING.input + (output / 1_000_000) * PRICING.output;
      console.log(`Photo batch: ${input} in + ${output} out | ~$${cost.toFixed(4)}`);
    }

    let text = result.response.text().trim();
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Batch analysis error:', err);
    return photos.map(() => ({
      category: 'gallery' as PhotoCategory,
      confidence: 0.3,
      description: 'Ошибка анализа',
      isChild: false,
      isGroup: false,
      quality: 'medium',
    }));
  }
}

export async function analyzePhotos(
  photos: Array<{ url: string; width?: number; height?: number }>,
  niche: string = 'fitness',
  limit: number = 25,
  projectId?: string
): Promise<{ photos: AnalyzedPhoto[]; totalCost: number }> {
  const filtered = prefilterPhotos(photos).slice(0, limit);
  console.log(`Analyzing ${filtered.length} photos (from ${photos.length})...`);

  const results: AnalyzedPhoto[] = [];
  const batchSize = 8;

  for (let i = 0; i < filtered.length; i += batchSize) {
    const batch = filtered.slice(i, i + batchSize);
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} photos`);

    const analysis = await analyzeBatch(batch, niche);

    for (let j = 0; j < batch.length; j++) {
      const a = analysis[j] || { category: 'gallery', confidence: 0.3, description: '', isChild: false, isGroup: false, quality: 'medium' };
      results.push({
        url: batch[j].url,
        category: a.category as PhotoCategory,
        confidence: a.confidence,
        description: a.description,
        isChild: a.isChild,
        isGroup: a.isGroup,
        quality: a.quality as 'high' | 'medium' | 'low',
      });
    }

    if (i + batchSize < filtered.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`Analysis done: ${results.length} photos`);
  return { photos: results, totalCost: 0 };
}

export function distributePhotos(analyzed: AnalyzedPhoto[]): {
  hero: AnalyzedPhoto[];
  gallery: AnalyzedPhoto[];
  instructors: AnalyzedPhoto[];
  atmosphere: AnalyzedPhoto[];
} {
  const valid = analyzed
    .filter(p => p.category !== 'skip' && p.quality !== 'low')
    .sort((a, b) => b.confidence - a.confidence);

  const result = {
    hero: [] as AnalyzedPhoto[],
    gallery: [] as AnalyzedPhoto[],
    instructors: [] as AnalyzedPhoto[],
    atmosphere: [] as AnalyzedPhoto[],
  };

  for (const photo of valid) {
    switch (photo.category) {
      case 'hero':
        if (result.hero.length < 3) result.hero.push(photo);
        else result.gallery.push(photo);
        break;
      case 'instructors':
        if (result.instructors.length < 6) result.instructors.push(photo);
        else result.gallery.push(photo);
        break;
      case 'atmosphere':
        if (result.atmosphere.length < 8) result.atmosphere.push(photo);
        else result.gallery.push(photo);
        break;
      default:
        result.gallery.push(photo);
    }
  }

  if (result.hero.length === 0 && result.gallery.length > 0) {
    const best = result.gallery.shift();
    if (best) result.hero.push(best);
  }

  return result;
}
