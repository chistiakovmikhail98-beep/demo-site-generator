import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, queryOne, isSlugAvailable } from '@/lib/db';
import { builderToSiteConfig } from '@/lib/builder/to-site-config';
import { nanoid } from '@/lib/utils';
import type { BuilderState } from '@/lib/builder/store';

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
    const body = await request.json() as BuilderState;

    if (!body.studioInfo?.name || !body.niche) {
      return NextResponse.json({ error: 'Укажите название студии и нишу' }, { status: 400 });
    }

    // Generate SiteConfig from builder state
    const config = builderToSiteConfig(body);
    let slug = config.meta.slug;

    // Ensure slug is unique
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

    // Update config with final slug
    config.meta.slug = slug;

    // Generate password
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    const projectId = nanoid(10);

    // Insert into projects
    await pool.query(
      `INSERT INTO projects (id, name, slug, niche, status, site_config, edit_password_hash, edit_password_plain, email, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        projectId,
        body.studioInfo.name,
        slug,
        body.niche,
        JSON.stringify(config),
        passwordHash,
        password,
        body.regEmail || body.studioInfo.email || '',
        body.regPhone || body.studioInfo.phone || '',
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
