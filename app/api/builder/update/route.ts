import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug, updateProjectConfig } from '@/lib/db';
import { builderToSiteConfig } from '@/lib/builder/to-site-config';
import type { BuilderState } from '@/lib/builder/store';

export async function POST(request: NextRequest) {
  try {
    const { slug, builderState } = await request.json() as {
      slug: string;
      builderState: BuilderState;
    };

    if (!slug || !builderState) {
      return NextResponse.json({ error: 'slug and builderState required' }, { status: 400 });
    }

    const project = await getProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate new config from builder state
    const newConfig = builderToSiteConfig(builderState);

    // Preserve existing data from VK parsing that the builder doesn't manage
    const oldConfig = typeof project.site_config === 'string'
      ? JSON.parse(project.site_config)
      : project.site_config;

    // Keep the original project ID and slug
    newConfig.meta.projectId = project.id;
    newConfig.meta.slug = project.slug || slug;
    newConfig.meta.createdAt = oldConfig.meta?.createdAt || newConfig.meta.createdAt;

    // Preserve VK-parsed photos: hero image, directions, gallery, instructors, etc.
    if (oldConfig.brand?.heroImage && !newConfig.brand.heroImage) {
      newConfig.brand.heroImage = oldConfig.brand.heroImage;
    }
    if (oldConfig.brand?.logo && !newConfig.brand.logo) {
      newConfig.brand.logo = oldConfig.brand.logo;
    }

    // Preserve directions images
    if (oldConfig.sections?.directions?.length && newConfig.sections.directions?.length) {
      for (let i = 0; i < newConfig.sections.directions.length; i++) {
        if (!newConfig.sections.directions[i].image && oldConfig.sections.directions[i]?.image) {
          newConfig.sections.directions[i].image = oldConfig.sections.directions[i].image;
        }
      }
    }

    // Preserve gallery
    if (oldConfig.sections?.gallery?.length && (!newConfig.sections.gallery || newConfig.sections.gallery.length === 0)) {
      newConfig.sections.gallery = oldConfig.sections.gallery;
    }

    // Preserve instructors
    if (oldConfig.sections?.instructors?.length && (!newConfig.sections.instructors || newConfig.sections.instructors.length === 0)) {
      newConfig.sections.instructors = oldConfig.sections.instructors;
    }

    // Preserve reviews
    if (oldConfig.sections?.reviews?.length && (!newConfig.sections.reviews || newConfig.sections.reviews.length === 0)) {
      newConfig.sections.reviews = oldConfig.sections.reviews;
    }

    // Preserve stories
    if (oldConfig.sections?.stories?.length && (!newConfig.sections.stories || newConfig.sections.stories.length === 0)) {
      newConfig.sections.stories = oldConfig.sections.stories;
    }

    // Preserve atmosphere
    if (oldConfig.sections?.atmosphere?.length && (!newConfig.sections.atmosphere || newConfig.sections.atmosphere.length === 0)) {
      newConfig.sections.atmosphere = oldConfig.sections.atmosphere;
    }

    // Preserve director
    if (oldConfig.sections?.director?.name && !newConfig.sections.director.name) {
      newConfig.sections.director = oldConfig.sections.director;
    }

    // Preserve advantages images
    if (oldConfig.sections?.advantages?.length && newConfig.sections.advantages?.length) {
      for (let i = 0; i < newConfig.sections.advantages.length; i++) {
        if (!newConfig.sections.advantages[i].image && oldConfig.sections.advantages[i]?.image) {
          newConfig.sections.advantages[i].image = oldConfig.sections.advantages[i].image;
        }
      }
    }

    // Preserve section titles from AI
    if (oldConfig.sections?.sectionTitles && (!newConfig.sections.sectionTitles || Object.keys(newConfig.sections.sectionTitles).length === 0)) {
      newConfig.sections.sectionTitles = oldConfig.sections.sectionTitles;
    }

    // Preserve requests images
    if (oldConfig.sections?.requests?.length && newConfig.sections.requests?.length) {
      for (let i = 0; i < newConfig.sections.requests.length; i++) {
        if (!newConfig.sections.requests[i].image && oldConfig.sections.requests[i]?.image) {
          newConfig.sections.requests[i].image = oldConfig.sections.requests[i].image;
        }
      }
    }

    await updateProjectConfig(project.id, newConfig);

    return NextResponse.json({ slug: project.slug || slug, updated: true });
  } catch (err) {
    console.error('[builder/update] error:', err);
    return NextResponse.json({ error: 'Ошибка обновления проекта' }, { status: 500 });
  }
}
