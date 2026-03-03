'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import DemoBanner from './DemoBanner';
import HeaderNew from './layout/Header';
import FooterNew from './layout/Footer';
import FloatingChat from './FloatingChat';
import BlockRenderer from './BlockRenderer';
import AdminToolbar from './AdminToolbar';
import LoginForm from './admin/LoginForm';
import { ToastProvider } from './ui/Toast';
import { useAdminMode } from './hooks/useAdminMode';
import { useAdminSave } from './hooks/useAdminSave';
import { configToSiteData } from '@/lib/config-to-sitedata';
import type { SiteConfig, AdminConfig } from '@/lib/types';
import type { SiteData, BlockConfig, FooterData } from './types';
import type { AiChatConfig } from './AiChat';

interface ThemeConfig {
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  fontFamily?: string;
}

interface TemplateAppProps {
  initialConfig: SiteConfig;
  adminConfig?: AdminConfig;
}

/** Extract initial theme from CSS variables (set by layout.tsx) */
function getInitialTheme(colorScheme?: SiteConfig['sections']['colorScheme']): ThemeConfig {
  // If colorScheme is in the config, use it directly
  if (colorScheme?.primary) {
    return {
      colorScheme: {
        primary: colorScheme.primary,
        accent: colorScheme.accent || '#ff4444',
        background: colorScheme.background || '#0c0c0f',
        surface: colorScheme.surface || '#18181b',
        text: colorScheme.text || '#ffffff',
      },
      fontFamily: 'manrope',
    };
  }

  // Fallback: read CSS variables
  if (typeof document !== 'undefined') {
    const style = getComputedStyle(document.documentElement);
    return {
      colorScheme: {
        primary: style.getPropertyValue('--color-primary').trim() || '#ba000f',
        accent: style.getPropertyValue('--color-accent').trim() || '#ff4444',
        background: style.getPropertyValue('--color-background').trim() || '#0c0c0f',
        surface: style.getPropertyValue('--color-surface').trim() || '#18181b',
        text: style.getPropertyValue('--color-text').trim() || '#ffffff',
      },
      fontFamily: 'manrope',
    };
  }

  return {
    colorScheme: {
      primary: '#ba000f',
      accent: '#ff4444',
      background: '#0c0c0f',
      surface: '#18181b',
      text: '#ffffff',
    },
    fontFamily: 'manrope',
  };
}

export default function TemplateApp({ initialConfig, adminConfig }: TemplateAppProps) {
  // Convert SiteConfig → SiteData once
  const initialSiteData = useMemo(() => configToSiteData(initialConfig), [initialConfig]);

  const admin = useAdminMode(adminConfig);
  const adminSave = useAdminSave(admin.jwt, admin.config);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [data, setData] = useState<SiteData>(initialSiteData);
  const [layout, setLayout] = useState<BlockConfig[]>(initialSiteData.layout);
  const [theme, setTheme] = useState<ThemeConfig>(() => getInitialTheme(initialConfig.sections.colorScheme));
  const [preview, setPreview] = useState(false);

  // Sort layout by order, filter visible
  const visibleBlocks = [...layout]
    .sort((a, b) => a.order - b.order)
    .filter((block) => block.visible !== false);

  const isEditing = admin.editMode && !preview;

  // Build chat config from site data
  const chatConfig = useMemo((): AiChatConfig => {
    const dir = initialConfig.sections.director;
    const niche = initialConfig.brand.niche;
    const expertiseMap: Record<string, string> = {
      dance: 'Эксперт по танцам', fitness: 'Фитнес-эксперт',
      stretching: 'Эксперт по растяжке', yoga: 'Инструктор йоги',
      wellness: 'Эксперт по здоровому образу жизни',
    };
    const pricingInfo = (initialConfig.sections.pricing || []).slice(0, 4)
      .map(p => `${p.name}: ${p.price}`).join(', ');

    return {
      managerName: dir?.name || data.brand.name,
      managerImage: dir?.image || '',
      managerTitle: dir?.title || 'Основатель',
      managerExpertise: expertiseMap[niche] || 'Эксперт',
      welcomeMessage: `Здравствуйте! Я ${dir?.name || ''}, ${(dir?.title || 'основатель').toLowerCase()} ${data.brand.name}. Рада, что вы интересуетесь! Чем могу помочь?`,
      responseTime: 'Отвечаю в течение пары минут',
      placeholderText: 'Задайте вопрос...',
      brandName: data.brand.name,
      brandNiche: niche,
      brandCity: data.brand.city,
      pricingInfo,
      contactPhone: data.footer.phone,
    };
  }, [initialConfig, data.brand, data.footer.phone]);

  // beforeunload protection
  useEffect(() => {
    if (!adminSave.hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [adminSave.hasChanges]);

  // Block data change handler
  const handleBlockDataChange = useCallback(
    (blockType: string, newBlockData: any) => {
      setData((prev) => ({ ...prev, [blockType]: newBlockData }));
      adminSave.markChanged();
    },
    [adminSave]
  );

  // Layout change handler
  const handleLayoutChange = useCallback(
    (newLayout: BlockConfig[]) => {
      setLayout(newLayout);
      adminSave.markChanged();
    },
    [adminSave]
  );

  // Theme change handler
  const handleThemeChange = useCallback(
    (newTheme: ThemeConfig) => {
      setTheme(newTheme);
      adminSave.markChanged();
    },
    [adminSave]
  );

  // Contacts change handler
  const handleContactsChange = useCallback(
    (contacts: FooterData) => {
      setData((prev) => ({
        ...prev,
        footer: contacts,
        header: { ...prev.header, brandName: contacts.brandName || prev.header.brandName },
      }));
      adminSave.markChanged();
    },
    [adminSave]
  );

  // Variant change from BlockRenderer edit wrapper
  const handleVariantChange = useCallback(
    (type: string, variant: 1 | 2 | 3) => {
      setLayout((prev) =>
        prev.map((b) => (b.type === type ? { ...b, variant } : b))
      );
      adminSave.markChanged();
    },
    [adminSave]
  );

  return (
    <ToastProvider>
      <div
        className={`min-h-screen bg-[#0c0c0e] text-zinc-100 font-sans selection:bg-primary/30 selection:text-white transition-[padding] duration-300 ${
          admin.editMode ? 'lg:pr-80 pb-14 lg:pb-0' : ''
        }`}
      >
        {admin.editMode && (
          <style>{`
            @media (min-width: 1024px) {
              header { right: 20rem !important; }
            }
          `}</style>
        )}

        {!admin.editMode && <DemoBanner brandName={data.brand.name} phone={data.footer.phone} />}

        <HeaderNew data={data.header} />

        <main>
          {visibleBlocks.map((blockConfig, index) => (
            <BlockRenderer
              key={`${blockConfig.type}-${blockConfig.variant}-${index}`}
              config={blockConfig}
              data={(data as any)[blockConfig.type]}
              editable={isEditing}
              onDataChange={(d: any) => handleBlockDataChange(blockConfig.type, d)}
              onVariantChange={(v: 1 | 2 | 3) => handleVariantChange(blockConfig.type, v)}
              quizAnswersUpdate={
                blockConfig.type === 'quiz' ? setQuizAnswers : undefined
              }
            />
          ))}
        </main>

        <FooterNew data={data.footer} />

        {!admin.editMode && <FloatingChat answers={quizAnswers} chatConfig={chatConfig} />}

        {/* Login form */}
        {admin.showLogin && (
          <LoginForm
            onLogin={admin.login}
            onClose={() => admin.setShowLogin(false)}
          />
        )}

        {/* Edit button */}
        {!admin.editMode && !admin.showLogin && admin.config && (
          <button
            onClick={() => admin.setShowLogin(true)}
            className="fixed bottom-4 right-4 z-50 w-11 h-11 bg-zinc-800/90 hover:bg-primary text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30 group"
            title="Редактировать сайт"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:scale-110">
              <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Admin toolbar */}
        {admin.editMode && (
          <AdminToolbar
            siteData={data}
            layout={layout}
            theme={theme}
            adminSave={adminSave}
            onLayoutChange={handleLayoutChange}
            onThemeChange={handleThemeChange}
            onContactsChange={handleContactsChange}
            onLogout={admin.logout}
            preview={preview}
            onPreviewToggle={() => setPreview((p) => !p)}
            projectId={admin.config?.projectId}
            jwt={admin.jwt}
            apiUrl={admin.config?.apiUrl}
          />
        )}
      </div>
    </ToastProvider>
  );
}
