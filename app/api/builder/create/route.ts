import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, isSlugAvailable } from '@/lib/db';
import { builderToSiteConfig } from '@/lib/builder/to-site-config';
import { nanoid } from '@/lib/utils';
import { getDefaultBlocks } from '@/lib/builder/block-definitions';
import type { BuilderState } from '@/lib/builder/store';
import type { Niche } from '@/lib/types';

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Support both minimal input { niche, name, city } and full BuilderState
    const isMinimal = body.name && !body.studioInfo;

    let builderState: BuilderState;

    if (isMinimal) {
      const { niche, name, city } = body as { niche: Niche; name: string; city: string };
      if (!niche || !name) {
        return NextResponse.json({ error: 'Укажите название и нишу' }, { status: 400 });
      }
      builderState = {
        step: 0,
        niche,
        selectedBlocks: getDefaultBlocks(),
        blockVariants: {},
        studioInfo: {
          name, city: city || '', phone: '', email: '', address: '', description: '',
          telegram: '', vk: '', instagram: '', whatsapp: '',
        },
        heroTitle: '',
        heroSubtitle: '',
        pricingInfo: '',
        colorPresetId: 'neon-rose',
        customColors: null,
        typographyPresetId: 'modern',
        regEmail: '',
        regPhone: '',
        existingProjectSlug: null,
        existingProjectId: null,
        createdProjectSlug: null,
        createdPassword: null,
      };
    } else {
      builderState = body as BuilderState;
      if (!builderState.studioInfo?.name || !builderState.niche) {
        return NextResponse.json({ error: 'Укажите название студии и нишу' }, { status: 400 });
      }
    }

    const config = builderToSiteConfig(builderState);
    let slug = config.meta.slug;

    let available = await isSlugAvailable(slug);
    let attempt = 0;
    while (!available && attempt < 10) {
      attempt++;
      slug = `${config.meta.slug}-${attempt}`;
      available = await isSlugAvailable(slug);
    }
    if (!available) {
      slug = `studio-${nanoid(6).toLowerCase()}`;
    }

    config.meta.slug = slug;

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    const projectId = nanoid(10);

    await pool.query(
      `INSERT INTO projects (id, name, slug, niche, status, site_config, edit_password_hash, edit_password_plain, email, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        projectId,
        builderState.studioInfo.name,
        slug,
        builderState.niche,
        JSON.stringify(config),
        passwordHash,
        password,
        builderState.regEmail || builderState.studioInfo.email || '',
        builderState.regPhone || builderState.studioInfo.phone || '',
      ]
    );

    return NextResponse.json({
      projectId,
      slug,
      password,
      url: `https://${slug}.fitwebai.ru`,
    });
  } catch (err) {
    console.error('[builder/create] error:', err);
    return NextResponse.json({ error: 'Ошибка создания проекта' }, { status: 500 });
  }
}
