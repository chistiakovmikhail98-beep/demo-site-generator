import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/db';
import { siteConfigToBuilderState } from '@/lib/builder/from-site-config';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  if (!project || !project.site_config) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const config = typeof project.site_config === 'string'
    ? JSON.parse(project.site_config)
    : project.site_config;

  const builderState = siteConfigToBuilderState(config);

  return NextResponse.json({
    builderState,
    projectId: project.id,
    slug: project.slug || config.meta?.slug,
  });
}
