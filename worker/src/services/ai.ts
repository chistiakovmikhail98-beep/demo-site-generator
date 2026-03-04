// AI content generation — Google Gemini API (direct)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveAiCost, saveTokenStats } from './supabase.js';

type Niche = 'fitness' | 'dance' | 'stretching' | 'yoga' | 'wellness';

const MODEL_ID = 'gemini-2.5-flash';
const PRICING = { input: 0.15, output: 0.60 }; // per 1M tokens (gemini-2.5-flash)

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

function trackUsage(
  usage: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } | undefined,
  projectId?: string,
  costType: string = 'content_generation'
) {
  if (!usage) return;
  const input = usage.promptTokenCount || 0;
  const output = usage.candidatesTokenCount || 0;
  const total = usage.totalTokenCount || 0;
  const cost = (input / 1_000_000) * PRICING.input + (output / 1_000_000) * PRICING.output;
  console.log(`Tokens: ${input} in + ${output} out = ${total} | ~$${cost.toFixed(4)}`);
  saveTokenStats(MODEL_ID, input, output, cost).catch(() => {});
  saveAiCost({ project_id: projectId, type: costType, model: MODEL_ID,
    input_tokens: input, output_tokens: output, total_tokens: total, cost_usd: cost,
    description: `${costType} via ${MODEL_ID}` }).catch(() => {});
}

export interface SiteConfig {
  meta: { projectId: string; slug: string; createdAt: string };
  brand: Record<string, any>;
  sections: Record<string, any>;
}

interface GenerateInput {
  name: string;
  niche: Niche;
  description?: string;
  imageUrls?: string[];
  colorScheme?: { primary: string; accent: string };
  projectId?: string;
}

export async function generateSiteConfig(input: GenerateInput): Promise<SiteConfig> {
  const { name, niche, description, imageUrls, colorScheme, projectId } = input;
  const ai = getGenAI();
  console.log(`AI generating config: ${MODEL_ID}`);

  const parts: any[] = [];

  if (imageUrls && imageUrls.length > 0) {
    const urlsToUse = imageUrls.slice(0, 10);
    console.log(`   Loading ${urlsToUse.length} photos for vision...`);
    for (const url of urlsToUse) {
      try { parts.push({ inlineData: await fetchImageAsBase64(url) }); } catch { /* skip */ }
    }
    parts.push({ text: `Analyse the studio photos. Extract features, atmosphere, style level.\n\n${buildUserPrompt(name, niche, description)}` });
  } else {
    parts.push({ text: buildUserPrompt(name, niche, description) });
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`AI generation attempt ${attempt}/3...`);
      const model = ai.getGenerativeModel({ model: MODEL_ID, systemInstruction: buildSystemPrompt(niche) });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 16000, responseMimeType: 'application/json' },
      });
      trackUsage(result.response.usageMetadata, projectId);

      let jsonStr = result.response.text().trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();
      if (!jsonStr.startsWith('{')) throw new Error('Response is not JSON');
      if (!jsonStr.endsWith('}')) {
        const lastBrace = jsonStr.lastIndexOf('}');
        if (lastBrace > 0) jsonStr = jsonStr.substring(0, lastBrace + 1);
      }
      const parsed = JSON.parse(jsonStr);
      if (!parsed.brand || !parsed.sections) throw new Error('Incomplete JSON');
      normalizeResponse(parsed.sections);
      console.log(`Config generated on attempt ${attempt}`);
      return {
        meta: { projectId: projectId || '', slug: generateSlug(name), createdAt: new Date().toISOString() },
        brand: parsed.brand,
        sections: { ...parsed.sections, colorScheme: colorScheme || parsed.sections.colorScheme },
      };
    } catch (err) {
      console.error(`Error (attempt ${attempt}/3):`, err);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000));
      else throw err;
    }
  }
  throw new Error('Failed to generate config');
}

export function detectNiche(name: string, description: string, posts: string[]): Niche {
  const text = `${name} ${description} ${posts.join(' ')}`.toLowerCase();
  const niches: Array<{ niche: Niche; keywords: string[]; weight: number }> = [
    { niche: 'dance', keywords: ['танц','dance','хореограф','балет','хип-хоп','pole dance','пилон','strip','тверк','k-pop','dancehall','контемп','бачата'], weight: 0 },
    { niche: 'stretching', keywords: ['растяж','stretch','шпагат','гибкост','стретчинг','пластик'], weight: 0 },
    { niche: 'yoga', keywords: ['йог','yoga','асан','медитац','пранаям','хатха','кундалини','виньяса'], weight: 0 },
    { niche: 'fitness', keywords: ['фитнес','fitness','тренажер','gym','тренировк','кроссфит','пилатес','зумба','табата'], weight: 0 },
    { niche: 'wellness', keywords: ['spa','спа','массаж','релакс','wellness','оздоров','детокс'], weight: 0 },
  ];
  for (const item of niches) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) { item.weight += 1; if (name.toLowerCase().includes(kw)) item.weight += 3; }
    }
  }
  const sorted = niches.sort((a, b) => b.weight - a.weight);
  const detected = sorted[0].weight > 0 ? sorted[0].niche : 'dance';
  console.log(`Niche detected: ${detected}`);
  return detected;
}

function generateSlug(name: string): string {
  const t: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
    'х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return name.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi,'').replace(/\s+/g,'-')
    .replace(/[а-яё]/g, (c: string) => t[c] || c).substring(0, 30);
}

function buildSystemPrompt(niche: Niche): string {
  const desc: Record<Niche,string> = {
    fitness:'Фитнес-студия — силовые тренировки, кардио',
    dance:'Танцевальная студия — различные направления танцев',
    stretching:'Студия растяжки — стретчинг, шпагат, гибкость',
    yoga:'Йога-студия — йога, медитация, дыхательные практики',
    wellness:'Wellness-центр — комплексный подход к здоровью',
  };
  return `Ты — ЛУЧШИЙ копирайтер для фитнес-индустрии. Генерируй УНИКАЛЬНЫЙ контент на РУССКОМ языке.
Ниша: ${desc[niche]}
СТИЛЬ: Короткие предложения. Повелительное наклонение. Цифры и факты. НЕ используй "Добро пожаловать".
Формат ответа — ТОЛЬКО валидный JSON без markdown-обёртки.`;
}

function buildUserPrompt(name: string, niche: Niche, description?: string): string {
  let text = `Название студии: ${name}\n`;
  if (description) text += `\nОписание:\n${description}\n`;
  text += `
Сгенерируй JSON для сайта студии:
{"brand":{"name":"${name}","tagline":"Слоган","niche":"${niche}","city":"Город","heroTitle":"Заголовок","heroSubtitle":"Акцент","heroDescription":"Описание","heroImage":"","heroQuote":""},
"sections":{"heroAdvantages":["...","...","..."],
"directions":[{"id":"dir-0","title":"...","image":"","description":"...","tags":["..."],"level":"Все уровни","duration":"60 мин","category":"${niche}","complexity":3,"buttonText":"Записаться"}],
"instructors":[{"name":"Имя Фамилия","image":"","specialties":["..."],"experience":"...","style":"..."}],
"stories":[{"beforeImg":"","afterImg":"","title":"...","description":"..."}],
"faq":[{"question":"?","answer":"..."}],
"requests":[{"image":"","text":"Запрос клиента"}],
"objections":[{"myth":"...","answer":"..."}],
"advantages":[{"title":"...","text":"...","image":""}],
"director":{"name":"Имя Фамилия","title":"Основатель","description":"...","image":"","achievements":["..."]},
"contacts":{"phone":"+7 (XXX) XXX-XX-XX","email":"","address":"","telegram":"","vk":""},
"pricing":[{"name":"...","price":"... руб","period":"/мес","features":["..."],"highlighted":false,"category":""}],
"reviews":[{"name":"Имя К.","text":"...","source":"VK","rating":5}],
"gallery":[],
"quiz":{"managerName":"Имя Фамилия","managerImage":"","tips":["..."],"steps":[{"question":"?","options":["...","...","..."]}]},
"atmosphere":[{"title":"...","description":"...","image":""}],
"calculatorStages":[{"status":"Этап физического развития","description":"...","tags":["навык1","навык2","навык3"],"achievement":"Результат"}],
"sectionTitles":{"calculator":{"title":"...","subtitle":"...","buttonText":"..."},"directions":{"title":"{count} направлений","subtitle":"..."},"pricing":{"title":"...","subtitle":"..."}},
"directionsTabs":[{"key":"all","label":"Все"},{"key":"group","label":"Групповые","category":"${niche}"}],
"blockVariants":{"hero":1,"directions":1,"gallery":1,"instructors":1,"stories":1,"reviews":1,"director":1,"pricing":1,"faq":1,"objections":1,"requests":1,"advantages":1,"atmosphere":1}}}
ТРЕБОВАНИЯ: directions:6-10, instructors:2-4, faq:5-6, requests:12, objections:3, advantages:4-6, pricing:4-6(один highlighted), reviews:6, quiz.steps:5-7, atmosphere:4, calculatorStages:4(ФИЗИЧЕСКИЙ прогресс!)
blockVariants: разнообразие 1-3. ОТВЕТЬ ТОЛЬКО JSON!`;
  return text;
}

function normalizeResponse(sec: any): void {
  if (Array.isArray(sec.instructors))
    sec.instructors = sec.instructors.map((i: any) => ({ name:i.name||'Имя Фамилия', image:i.image||i.photo||'', specialties:i.specialties||(i.specialization?[i.specialization]:[]), experience:i.experience||'', style:i.style||'' }));
  if (Array.isArray(sec.pricing))
    sec.pricing = sec.pricing.map((p: any) => ({ name:p.name||p.title||'', price:p.price||'', period:p.period||'', features:Array.isArray(p.features)?p.features:[], highlighted:p.highlighted||false, category:p.category||'' }));
  if (Array.isArray(sec.reviews))
    sec.reviews = sec.reviews.map((r: any) => ({ name:r.name||r.clientName||'', text:r.text||'', source:r.source||'', rating:r.rating||5 }));
  if (Array.isArray(sec.objections))
    sec.objections = sec.objections.map((o: any) => ({ myth:o.myth||o.objection||'', answer:o.answer||'' }));
  if (Array.isArray(sec.requests))
    sec.requests = sec.requests.map((r: any) => typeof r==='string'?{image:'',text:r}:{image:r.image||'',text:r.text||''});
  if (Array.isArray(sec.atmosphere))
    sec.atmosphere = sec.atmosphere.map((a: any) => typeof a==='string'?{title:a,description:'',image:''}:{title:a.title||'',description:a.description||'',image:a.image||''});
  if (sec.director && typeof sec.director==='object')
    sec.director = { name:sec.director.name||'Имя Фамилия', title:sec.director.title||sec.director.position||'', description:sec.director.description||sec.director.quote||'', image:sec.director.image||sec.director.photo||'', achievements:sec.director.achievements||[] };
  if (Array.isArray(sec.stories))
    sec.stories = sec.stories.map((s: any) => ({ beforeImg:s.beforeImg||'', afterImg:s.afterImg||'', title:s.title||s.clientName||'', description:s.description||s.story||'' }));
  if (Array.isArray(sec.advantages))
    sec.advantages = sec.advantages.map((a: any) => ({ title:a.title||'', text:a.text||a.description||'', image:a.image||'' }));
  if (sec.quiz?.steps)
    sec.quiz.steps = sec.quiz.steps.map((s: any) => ({ question:s.question||'', options:Array.isArray(s.options)?s.options:[] }));
  if (Array.isArray(sec.calculatorStages))
    sec.calculatorStages = sec.calculatorStages.map((s: any) => ({ status:s.status||s.title||'', description:s.description||'', tags:Array.isArray(s.tags)?s.tags:[], achievement:s.achievement||'' }));
  if (Array.isArray(sec.directions))
    sec.directions = sec.directions.map((d: any, i: number) => ({ id:d.id||`dir-${i}`, title:d.title||'', image:d.image||'', description:d.description||'', tags:Array.isArray(d.tags)?d.tags:[], level:d.level||'Все уровни', duration:d.duration||'60 мин', category:d.category||'all', complexity:d.complexity||3 }));
}
