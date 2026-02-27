import React, { useState } from 'react';
import type { SiteData, BlockConfig } from '../types';
import type { AdminSave } from '../hooks/useAdminSave';
import BlockManager from './admin/BlockManager';
import ThemeEditor from './admin/ThemeEditor';
import ContactEditor from './admin/ContactEditor';

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

interface AdminToolbarProps {
  siteData: SiteData;
  layout: BlockConfig[];
  theme: ThemeConfig;
  adminSave: AdminSave;
  onLayoutChange: (layout: BlockConfig[]) => void;
  onThemeChange: (theme: ThemeConfig) => void;
  onContactsChange: (contacts: SiteData['footer']) => void;
  onLogout: () => void;
  preview: boolean;
  onPreviewToggle: () => void;
}

type Panel = 'blocks' | 'theme' | 'contacts' | null;

export default function AdminToolbar({
  siteData,
  layout,
  theme,
  adminSave,
  onLayoutChange,
  onThemeChange,
  onContactsChange,
  onLogout,
  preview,
  onPreviewToggle,
}: AdminToolbarProps) {
  const [activePanel, setActivePanel] = useState<Panel>(null);

  const togglePanel = (panel: Panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleSave = () => {
    adminSave.save(siteData, layout, theme);
  };

  const handlePublish = () => {
    if (confirm('Опубликовать изменения? Сайт будет пересобран и обновлён.')) {
      adminSave.save(siteData, layout, theme).then((saved) => {
        if (saved) adminSave.publish();
      });
    }
  };

  return (
    <>
      {/* Slide-up panels */}
      {activePanel === 'blocks' && (
        <BlockManager
          layout={layout}
          onChange={onLayoutChange}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'theme' && (
        <ThemeEditor
          theme={theme}
          onChange={onThemeChange}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'contacts' && (
        <ContactEditor
          contacts={siteData.footer}
          onChange={onContactsChange}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-[9990] bg-zinc-900/95 backdrop-blur-md border-t border-zinc-700">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {/* Edit mode label */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-lg shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary whitespace-nowrap">Редактор</span>
          </div>

          {/* Buttons */}
          <ToolbarButton
            icon={<BlocksIcon />}
            label="Блоки"
            active={activePanel === 'blocks'}
            onClick={() => togglePanel('blocks')}
          />
          <ToolbarButton
            icon={<PaletteIcon />}
            label="Тема"
            active={activePanel === 'theme'}
            onClick={() => togglePanel('theme')}
          />
          <ToolbarButton
            icon={<PhoneIcon />}
            label="Контакты"
            active={activePanel === 'contacts'}
            onClick={() => togglePanel('contacts')}
          />

          <div className="w-px h-6 bg-zinc-700 mx-1 shrink-0" />

          <ToolbarButton
            icon={<EyeIcon />}
            label={preview ? 'Редактор' : 'Превью'}
            onClick={onPreviewToggle}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status */}
          {adminSave.hasChanges && (
            <span className="text-xs text-amber-400 whitespace-nowrap hidden sm:block">Несохранённые изменения</span>
          )}
          {adminSave.saving && (
            <span className="text-xs text-blue-400 whitespace-nowrap">Сохранение...</span>
          )}
          {adminSave.publishing && (
            <span className="text-xs text-purple-400 whitespace-nowrap">Публикация...</span>
          )}
          {adminSave.error && (
            <span className="text-xs text-red-400 whitespace-nowrap">{adminSave.error}</span>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={adminSave.saving || !adminSave.hasChanges}
            className="h-9 px-3 sm:px-4 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <SaveIcon />
            <span className="hidden sm:inline">Сохранить</span>
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={adminSave.publishing}
            className="h-9 px-3 sm:px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <UploadIcon />
            <span className="hidden sm:inline">Опубликовать</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors shrink-0"
            title="Выйти"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </>
  );
}

// --- Toolbar sub-components ---

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${
        active
          ? 'bg-primary/20 text-primary'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// --- Icons ---
function BlocksIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11 13H3C2.448 13 2 12.552 2 12V2C2 1.448 2.448 1 3 1H9L12 4V12C12 12.552 11.552 13 11 13Z" stroke="currentColor" strokeWidth="1.3" />
      <rect x="5" y="8" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 9V2M7 2L4 5M7 2L10 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 9V11C2 11.552 2.448 12 3 12H11C11.552 12 12 11.552 12 11V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3C2.448 14 2 13.552 2 13V3C2 2.448 2.448 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 11L14 8L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
