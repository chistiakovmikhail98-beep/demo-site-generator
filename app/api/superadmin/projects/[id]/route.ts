import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadmin, unauthorizedResponse } from '@/lib/superadmin-auth';
import { getProjectById, updateProjectFields, deleteProject, isSlugAvailable } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  const { id } = await params;
  try {
    const project = await getProjectById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    console.error('[superadmin/projects/id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  const { id } = await params;
  try {
    const body = await request.json();
    const { name, slug, status } = body;

    if (slug) {
      if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(slug)) {
        return NextResponse.json({ error: 'Slug: 3-30 символов, a-z, 0-9, дефис' }, { status: 400 });
      }
      const available = await isSlugAvailable(slug, id);
      if (!available) {
        return NextResponse.json({ error: 'Этот субдомен уже занят' }, { status: 409 });
      }
    }

    await updateProjectFields(id, { name, slug, status });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[superadmin/projects/id PATCH] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  const { id } = await params;
  try {
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[superadmin/projects/id DELETE] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
