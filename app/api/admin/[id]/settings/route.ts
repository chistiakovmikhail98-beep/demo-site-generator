import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isSlugAvailable, updateProjectSlug } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fitwebai-secret';

function verifyJwt(request: NextRequest, idOrSlug: string): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    return payload.projectId === idOrSlug || payload.slug === idOrSlug;
  } catch {
    return false;
  }
}

// GET — check slug availability
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!verifyJwt(request, id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('check');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const available = await isSlugAvailable(slug, id);
  return NextResponse.json({ available });
}

// PATCH — update slug
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!verifyJwt(request, id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug || !/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(slug)) {
      return NextResponse.json({ error: 'Slug: 3-30 символов, a-z, 0-9, дефис' }, { status: 400 });
    }

    const available = await isSlugAvailable(slug, id);
    if (!available) {
      return NextResponse.json({ error: 'Этот субдомен уже занят' }, { status: 409 });
    }

    await updateProjectSlug(id, slug);
    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error('[admin/settings] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
