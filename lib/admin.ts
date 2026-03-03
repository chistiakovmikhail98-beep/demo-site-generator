import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { SiteConfig } from './types';
import { supabase } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

interface JwtPayload {
  projectId: string;
  slug: string;
}

export function createJwt(projectId: string, slug: string): string {
  return jwt.sign({ projectId, slug } as JwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function loginAdmin(
  projectId: string,
  password: string
): Promise<{ token: string; projectName: string; slug: string } | null> {
  if (!supabase) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('name, site_config, edit_password_hash')
    .eq('id', projectId)
    .single();

  if (!project?.edit_password_hash) return null;

  const valid = await bcrypt.compare(password, project.edit_password_hash);
  if (!valid) return null;

  const slug = (project.site_config as any)?.meta?.slug || projectId;
  const token = createJwt(projectId, slug);

  return { token, projectName: project.name, slug };
}

export async function verifyAdminAccess(
  projectId: string,
  token: string
): Promise<{ valid: boolean; projectName?: string; slug?: string }> {
  const payload = verifyJwt(token);
  if (!payload || payload.projectId !== projectId) return { valid: false };

  if (!supabase) return { valid: false };

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single();

  if (!project) return { valid: false };

  return { valid: true, projectName: project.name, slug: payload.slug };
}

export interface AdminSavePayload {
  siteData: Record<string, any>;
  layout: Array<{ type: string; variant: 1 | 2 | 3; visible: boolean; order: number }>;
  theme: {
    colorScheme: { primary: string; accent: string; background: string; surface: string; text: string };
    fontFamily?: string;
  };
  contacts: {
    phone?: string; email?: string; address?: string; addressDetails?: string;
    telegram?: string; vk?: string; instagram?: string; mapUrl?: string; mapCoords?: string;
  };
}

function layoutToVariants(layout: AdminSavePayload['layout']): Record<string, 1 | 2 | 3> {
  const variants: Record<string, 1 | 2 | 3> = {};
  for (const block of layout) variants[block.type] = block.variant;
  return variants;
}

/** Convert admin-edited SiteData back to SiteConfig */
export function siteDataToConfig(existing: SiteConfig, payload: AdminSavePayload): SiteConfig {
  const { siteData, layout, theme, contacts } = payload;

  return {
    ...existing,
    brand: {
      ...existing.brand,
      name: siteData.brand?.name || existing.brand.name,
      tagline: siteData.brand?.tagline || existing.brand.tagline,
      heroTitle: siteData.hero?.heroTitle || existing.brand.heroTitle,
      heroSubtitle: siteData.hero?.heroSubtitle || existing.brand.heroSubtitle,
      heroDescription: siteData.hero?.heroDescription || existing.brand.heroDescription,
      heroQuote: siteData.hero?.heroQuote || existing.brand.heroQuote,
    },
    sections: {
      ...existing.sections,
      heroAdvantages: siteData.hero?.advantages || existing.sections.heroAdvantages,
      directions: (siteData.directions?.directions || existing.sections.directions).map((d: any) => ({
        id: d.id, title: d.title, image: d.image, description: d.description,
        tags: d.tags || [], level: d.level || '', duration: d.duration || '',
        category: d.category || 'body', complexity: d.complexity, buttonText: d.buttonText,
      })),
      instructors: (siteData.instructors?.instructors || existing.sections.instructors).map((i: any) => ({
        name: i.name, image: i.image, specialties: i.specialties || [],
        experience: i.experience || '', style: i.style || '',
      })),
      stories: (siteData.stories?.stories || existing.sections.stories).map((s: any) => ({
        beforeImg: s.beforeImg, afterImg: s.afterImg, title: s.title, description: s.description,
      })),
      faq: (siteData.faq?.items || existing.sections.faq).map((f: any) => ({
        question: f.question, answer: f.answer,
      })),
      requests: (siteData.requests?.rows || existing.sections.requests)
        .flat().map((r: any) => ({ text: r.text, image: r.image || '' })),
      objections: (siteData.objections?.pairs || existing.sections.objections).map((o: any) => ({
        myth: o.myth, answer: o.answer,
      })),
      advantages: (siteData.advantages?.advantages || existing.sections.advantages).map((a: any) => ({
        title: a.title, text: a.text, image: a.image,
      })),
      director: siteData.director ? {
        name: siteData.director.name, title: siteData.director.title,
        description: siteData.director.description, achievements: siteData.director.achievements || [],
        image: siteData.director.image,
      } : existing.sections.director,
      contacts: { ...existing.sections.contacts, ...contacts },
      pricing: (siteData.pricing?.plans || existing.sections.pricing).map((p: any) => ({
        name: p.name, price: p.price, period: p.validity || p.period || '',
        features: p.features || [], highlighted: p.isPopular || p.highlighted || false,
        category: p.targetAudience || p.category || '',
      })),
      reviews: (siteData.reviews?.reviews || existing.sections.reviews).map((r: any) => ({
        name: r.name, text: r.text, source: r.source, rating: r.rating,
      })),
      gallery: siteData.gallery?.images || existing.sections.gallery,
      quiz: siteData.quiz ? {
        managerName: siteData.quiz.managerName, managerImage: siteData.quiz.managerImage,
        tips: siteData.quiz.tips || [],
        steps: (siteData.quiz.steps || []).map((s: any) => ({ question: s.question, options: s.options })),
      } : existing.sections.quiz,
      atmosphere: (siteData.atmosphere?.items || existing.sections.atmosphere).map((a: any) => ({
        title: a.title, description: a.description, image: a.image,
      })),
      sectionTitles: {
        ...existing.sections.sectionTitles,
        directions: {
          title: siteData.directions?.title || existing.sections.sectionTitles?.directions?.title || 'Направления',
          subtitle: siteData.directions?.subtitle || existing.sections.sectionTitles?.directions?.subtitle || '',
        },
        pricing: {
          title: siteData.pricing?.title || existing.sections.sectionTitles?.pricing?.title || 'Тарифы',
          subtitle: siteData.pricing?.subtitle || existing.sections.sectionTitles?.pricing?.subtitle || '',
        },
        calculator: existing.sections.sectionTitles?.calculator || { title: 'Как меняется тело', subtitle: 'Трансформация', buttonText: 'Начать' },
      },
      blockVariants: layoutToVariants(layout),
      colorScheme: theme.colorScheme,
    },
  };
}

/** Save admin edits — just update SiteConfig in Supabase (instant!) */
export async function saveAdminEdits(projectId: string, payload: AdminSavePayload): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: project } = await supabase
    .from('projects')
    .select('site_config')
    .eq('id', projectId)
    .single();

  if (!project?.site_config) throw new Error('Project not found');

  const updatedConfig = siteDataToConfig(project.site_config as unknown as SiteConfig, payload);

  const { error } = await supabase
    .from('projects')
    .update({ site_config: updatedConfig as any, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) throw new Error(error.message);
}
