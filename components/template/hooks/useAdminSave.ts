import { useState, useCallback, useRef } from 'react';
import type { SiteData, BlockConfig } from '../types';

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

interface AdminConfig {
  apiUrl: string;
  projectId: string;
  slug: string;
}

export interface AdminSave {
  saving: boolean;
  publishing: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  error: string | null;
  save: (data: SiteData, layout: BlockConfig[], theme: ThemeConfig) => Promise<boolean>;
  publish: () => Promise<boolean>;
  markChanged: () => void;
}

export function useAdminSave(jwt: string | null, config: AdminConfig | null): AdminSave {
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastPayloadRef = useRef<any>(null);

  const save = useCallback(
    async (data: SiteData, layout: BlockConfig[], theme: ThemeConfig): Promise<boolean> => {
      if (!jwt || !config) return false;

      setSaving(true);
      setError(null);

      try {
        const payload = {
          siteData: data,
          layout,
          theme,
          contacts: {
            phone: data.footer?.phone,
            email: data.footer?.email,
            address: data.footer?.address,
            telegram: data.footer?.telegram,
            vk: data.footer?.vk,
            instagram: data.footer?.instagram,
            mapUrl: data.footer?.mapUrl,
            mapCoords: data.footer?.mapCoords,
          },
        };
        lastPayloadRef.current = payload;

        const res = await fetch(`${config.apiUrl}/api/admin/${config.projectId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Ошибка сохранения' }));
          throw new Error(err.error || 'Ошибка сохранения');
        }

        setHasChanges(false);
        setLastSaved(new Date());
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [jwt, config]
  );

  const publish = useCallback(async (): Promise<boolean> => {
    if (!jwt || !config) return false;

    setPublishing(true);
    setError(null);

    try {
      const res = await fetch(`${config.apiUrl}/api/admin/${config.projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ошибка публикации' }));
        throw new Error(err.error || 'Ошибка публикации');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка публикации');
      return false;
    } finally {
      setPublishing(false);
    }
  }, [jwt, config]);

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  return { saving, publishing, hasChanges, lastSaved, error, save, publish, markChanged };
}
