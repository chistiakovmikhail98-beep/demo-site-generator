import React, { useState, useEffect, useCallback } from 'react';
import type { SiteData, BlockConfig } from './types';
import type { AdminSave } from './hooks/useAdminSave';
import { useToast } from './ui/Toast';
import BlockManager from './admin/BlockManager';
import ThemeEditor from './admin/ThemeEditor';
import ContactEditor from './admin/ContactEditor';
import LeadsTab from './admin/LeadsTab';
import SettingsTab from './admin/SettingsTab';
import PublishModal from './admin/PublishModal';

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
  projectId?: string;
  jwt?: string | null;
  apiUrl?: string;
  slug?: string;
}

type Panel = 'blocks' | 'theme' | 'contacts' | 'leads' | 'settings' | null;

const PANEL_LABELS: Record<string, string> = {
  blocks: 'Блоки',
  theme: 'Тема',
  contacts: 'Контакты',
  leads: 'Заявки',
  settings: 'Настройки',
};

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
  projectId,
  jwt,
  apiUrl,
  slug,
}: AdminToolbarProps) {
  const [activePanel, setActivePanel] = useState<Panel>('blocks');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const { toast } = useToast();

  const togglePanel = (panel: Panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleSave = useCallback(async () => {
    const ok = await adminSave.save(siteData, layout, theme);
    if (ok) {
      toast('Черновик сохранён', 'success');
    } else {
      toast(adminSave.error || 'Ошибка сохранения', 'error');
    }
  }, [adminSave, siteData, layout, theme, toast]);

  const handlePublish = async () => {
    const saved = await adminSave.save(siteData, layout, theme);
    if (!saved) {
      toast('Не удалось сохранить перед публикацией', 'error');
      setShowPublishModal(false);
      return;
    }
    const ok = await adminSave.publish();
    setShowPublishModal(false);
    if (ok) {
      toast('Сайт опубликован! Обновите страницу через минуту.', 'success');
    } else {
      toast(adminSave.error || 'Ошибка публикации', 'error');
    }
  };

  // ── Ctrl+S keyboard shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (adminSave.hasChanges && !adminSave.saving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [adminSave.hasChanges, adminSave.saving, handleSave]);

  // Format last saved time
  const lastSavedText = adminSave.lastSaved
    ? `Сохранено в ${adminSave.lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    : null;

  // Shared panel content
  const panelContent = (
    <>
      {activePanel === 'blocks' && (
        <BlockManager layout={layout} onChange={onLayoutChange} />
      )}
      {activePanel === 'theme' && (
        <ThemeEditor theme={theme} onChange={onThemeChange} />
      )}
      {activePanel === 'contacts' && (
        <ContactEditor contacts={siteData.footer} onChange={onContactsChange} />
      )}
      {activePanel === 'leads' && projectId && jwt && (
        <LeadsTab projectId={projectId} jwt={jwt} apiUrl={apiUrl || ''} />
      )}
      {activePanel === 'settings' && projectId && jwt && slug && (
        <SettingsTab projectId={projectId} jwt={jwt} apiUrl={apiUrl || ''} currentSlug={slug} />
      )}
      {!activePanel && (
        <div className="p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800 flex items-center justify-center">
            <EditIcon />
          </div>
          <p className="text-sm text-zinc-300 font-medium mb-2">Редактируйте сайт</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Нажмите на текст или фото на сайте.
            Панели выше — блоки, тема, контакты.
          </p>
          <div className="mt-4 text-[10px] text-zinc-600">
            Ctrl+S — сохранить
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ========== DESKTOP: Right sidebar (w-80 = 320px) ========== */}
      <div className="hidden lg:flex fixed top-0 right-0 bottom-0 w-80 z-[9990] bg-zinc-950 border-l border-zinc-700 flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-white tracking-tight">Редактор</span>
          <div className="flex-1" />
          <button
            onClick={onPreviewToggle}
            className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-colors ${
              preview
                ? 'bg-primary/20 text-primary'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={preview ? 'Вернуться к редактированию' : 'Посмотреть как видит посетитель'}
          >
            <EyeIcon />
            {preview ? 'Назад' : 'Превью'}
          </button>
          <button
            onClick={onLogout}
            className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
            title="Выйти из редактора"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Tab navigation — no uppercase, clean look */}
        <div className="flex border-b border-zinc-800 shrink-0">
          <SidebarTab
            icon={<BlocksIcon />}
            label="Блоки"
            active={activePanel === 'blocks'}
            onClick={() => togglePanel('blocks')}
          />
          <SidebarTab
            icon={<PaletteIcon />}
            label="Тема"
            active={activePanel === 'theme'}
            onClick={() => togglePanel('theme')}
          />
          <SidebarTab
            icon={<PhoneIcon />}
            label="Контакты"
            active={activePanel === 'contacts'}
            onClick={() => togglePanel('contacts')}
          />
          <SidebarTab
            icon={<LeadsIcon />}
            label="Заявки"
            active={activePanel === 'leads'}
            onClick={() => togglePanel('leads')}
          />
          <SidebarTab
            icon={<SettingsIcon />}
            label="Настр."
            active={activePanel === 'settings'}
            onClick={() => togglePanel('settings')}
          />
        </div>

        {/* Panel content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {panelContent}
        </div>

        {/* Footer: status + actions */}
        <div className="border-t border-zinc-800 p-3 space-y-2 shrink-0 bg-zinc-950">
          {/* Status line */}
          <div className="flex items-center gap-1.5 px-1 min-h-[18px]">
            {adminSave.hasChanges ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] text-amber-400">Есть изменения</span>
                <span className="text-[10px] text-zinc-600 ml-auto">Ctrl+S</span>
              </>
            ) : lastSavedText ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-zinc-500">{lastSavedText}</span>
              </>
            ) : null}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={adminSave.saving || !adminSave.hasChanges}
            className="w-full h-10 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-zinc-700"
          >
            {adminSave.saving ? (
              <>
                <Spinner />
                Сохранение...
              </>
            ) : (
              <>
                <SaveIcon />
                Сохранить черновик
              </>
            )}
          </button>

          {/* Publish */}
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={adminSave.publishing}
            className="w-full h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {adminSave.publishing ? (
              <>
                <Spinner />
                Публикация...
              </>
            ) : (
              <>
                <UploadIcon />
                Опубликовать
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========== MOBILE: Bottom bar ========== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-zinc-950 border-t border-zinc-700">
        <div className="px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
          <MobileTab icon={<BlocksIcon />} label="Блоки" active={activePanel === 'blocks'} onClick={() => togglePanel('blocks')} />
          <MobileTab icon={<PaletteIcon />} label="Тема" active={activePanel === 'theme'} onClick={() => togglePanel('theme')} />
          <MobileTab icon={<PhoneIcon />} label="Конт." active={activePanel === 'contacts'} onClick={() => togglePanel('contacts')} />
          <MobileTab icon={<LeadsIcon />} label="Заявки" active={activePanel === 'leads'} onClick={() => togglePanel('leads')} />
          <MobileTab icon={<SettingsIcon />} label="Настр." active={activePanel === 'settings'} onClick={() => togglePanel('settings')} />

          <div className="w-px h-6 bg-zinc-700 mx-0.5 shrink-0" />

          <MobileTab icon={<EyeIcon />} label={preview ? 'Ред.' : 'Вид'} onClick={onPreviewToggle} />

          <div className="flex-1" />

          {adminSave.hasChanges && <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mr-1" />}

          <button
            onClick={handleSave}
            disabled={adminSave.saving || !adminSave.hasChanges}
            className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-35 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 border border-zinc-700"
          >
            <SaveIcon />
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            disabled={adminSave.publishing}
            className="h-8 px-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <UploadIcon />
          </button>

          <button
            onClick={onLogout}
            className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
            title="Выйти"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* ========== MOBILE: Panel overlay ========== */}
      {activePanel && (
        <div className="lg:hidden fixed bottom-12 left-0 right-0 z-[9989] max-h-[70vh] overflow-y-auto bg-zinc-950 border-t border-zinc-700 shadow-2xl overscroll-contain">
          <div className="sticky top-0 z-10 bg-zinc-950 flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">{PANEL_LABELS[activePanel]}</h3>
            <button
              onClick={() => setActivePanel(null)}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          {panelContent}
        </div>
      )}

      {/* ========== Publish modal ========== */}
      {showPublishModal && (
        <PublishModal
          onConfirm={handlePublish}
          onCancel={() => setShowPublishModal(false)}
          publishing={adminSave.publishing}
        />
      )}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SidebarTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
        active
          ? 'border-primary text-primary bg-primary/5'
          : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-2 flex items-center gap-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
        active ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Icons ──────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-zinc-400" />
    </svg>
  );
}

function BlocksIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3C2.448 14 2 13.552 2 13V3C2 2.448 2.448 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 11L14 8L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 8C9.657 8 11 6.657 11 5C11 3.343 9.657 2 8 2C6.343 2 5 3.343 5 5C5 6.657 6.343 8 8 8Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 14C3 11.239 5.239 9 8 9C10.761 9 13 11.239 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1V3M8 13V15M1 8H3M13 8H15M3.05 3.05L4.46 4.46M11.54 11.54L12.95 12.95M12.95 3.05L11.54 4.46M4.46 11.54L3.05 12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
