import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProjectBySlug } from '@/lib/db';
import TemplateApp from '@/components/template/App';
import type { SiteConfig } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project?.site_config) return { title: 'FitWebAI' };

  const config = project.site_config as SiteConfig;
  const b = config.brand;

  return {
    title: `${b.name} | ${b.tagline}`,
    description: b.heroDescription || b.tagline,
    openGraph: {
      title: `${b.name} | ${b.tagline}`,
      description: b.heroDescription || b.tagline,
      images: b.heroImage ? [b.heroImage] : [],
      type: 'website',
    },
  };
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project?.site_config) {
    notFound();
  }

  const config = project.site_config as SiteConfig;
  const apiUrl = process.env.PUBLIC_API_URL || `https://fitwebai.ru`;

  return (
    <TemplateApp
      initialConfig={config}
      adminConfig={{
        apiUrl,
        projectId: project.id,
        slug,
      }}
    />
  );
}
