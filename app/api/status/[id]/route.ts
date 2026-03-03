import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    status: project.status,
    slug: project.site_config?.meta?.slug || project.slug,
    deployedUrl: project.deployed_url,
    error: project.error,
  });
}
