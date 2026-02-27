import React, { useState, useCallback } from 'react';
import DemoBanner from './components/DemoBanner';
import HeaderNew from './components/layout/Header';
import FooterNew from './components/layout/Footer';
import FloatingChat from './components/FloatingChat';
import BlockRenderer from './components/BlockRenderer';
import AdminToolbar from './components/AdminToolbar';
import LoginForm from './components/admin/LoginForm';
import { siteData as initialSiteData } from './data';
import { useAdminMode } from './hooks/useAdminMode';
import { useAdminSave } from './hooks/useAdminSave';
import type { SiteData, BlockConfig, FooterData } from './types';

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

// Extract initial theme from CSS variables (set by builder.ts)
function getInitialTheme(): ThemeConfig {
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

function App() {
  const admin = useAdminMode();
  const adminSave = useAdminSave(admin.jwt, admin.config);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [data, setData] = useState<SiteData>(initialSiteData);
  const [layout, setLayout] = useState<BlockConfig[]>(initialSiteData.layout);
  const [theme, setTheme] = useState<ThemeConfig>(getInitialTheme);
  const [preview, setPreview] = useState(false);

  // Sort layout by order, filter visible
  const visibleBlocks = [...layout]
    .sort((a, b) => a.order - b.order)
    .filter((block) => block.visible !== false);

  const isEditing = admin.editMode && !preview;

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
    <div className={`min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-primary/30 selection:text-white ${admin.editMode ? 'pb-14' : ''}`}>
      <DemoBanner />
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
      <FloatingChat answers={quizAnswers} />

      {/* Login form */}
      {admin.showLogin && (
        <LoginForm
          onLogin={admin.login}
          onClose={() => admin.setShowLogin(false)}
        />
      )}

      {/* Edit button (visible when not in edit mode, on ?admin pages or always at bottom) */}
      {!admin.editMode && !admin.showLogin && admin.config && (
        <button
          onClick={() => admin.setShowLogin(true)}
          className="fixed bottom-4 right-4 z-50 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100"
          title="Редактировать сайт"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
        />
      )}
    </div>
  );
}

export default App;
