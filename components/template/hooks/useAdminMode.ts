import { useState, useEffect, useCallback } from 'react';

export interface AdminConfig {
  apiUrl: string;
  projectId: string;
  slug: string;
}

export interface AdminMode {
  editMode: boolean;
  showLogin: boolean;
  loading: boolean;
  jwt: string | null;
  config: AdminConfig | null;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setShowLogin: (show: boolean) => void;
}

/**
 * Admin mode hook.
 * Accepts optional adminConfig prop (Next.js SSR path).
 * Falls back to window.__ADMIN_CONFIG__ (legacy Vite path).
 */
export function useAdminMode(adminConfig?: AdminConfig | null): AdminMode {
  const [editMode, setEditMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState<string | null>(null);

  const [config] = useState<AdminConfig | null>(() => {
    if (adminConfig) return adminConfig;
    if (typeof window !== 'undefined') {
      const cfg = (window as any).__ADMIN_CONFIG__;
      if (cfg?.apiUrl && cfg?.projectId) return cfg;
    }
    return null;
  });

  const storageKey = config ? `admin_jwt_${config.projectId}` : '';

  // Check for saved JWT or ?admin param on mount
  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);

    // DEV MODE: ?admin&dev skips API auth
    const isDev = process.env.NODE_ENV === 'development';
    if (params.has('admin') && params.has('dev') && isDev) {
      setEditMode(true);
      setJwt('dev-token');
      setLoading(false);
      return;
    }

    const savedJwt = localStorage.getItem(storageKey);

    if (savedJwt) {
      fetch(`${config.apiUrl}/api/admin/${config.projectId}/verify`, {
        headers: { Authorization: `Bearer ${savedJwt}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setEditMode(true);
            setJwt(savedJwt);
          } else {
            localStorage.removeItem(storageKey);
            if (params.has('admin')) setShowLogin(true);
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem(storageKey);
          setLoading(false);
        });
      return;
    }

    if (params.has('admin')) {
      setShowLogin(true);
    }
    setLoading(false);
  }, [config, storageKey]);

  const login = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      if (!config) return { success: false, error: 'Конфигурация администратора не найдена' };

      try {
        const res = await fetch(`${config.apiUrl}/api/admin/${config.projectId}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) {
          return { success: false, error: 'Неверный пароль' };
        }

        const data = await res.json();
        localStorage.setItem(storageKey, data.token);
        setJwt(data.token);
        setEditMode(true);
        setShowLogin(false);
        return { success: true };
      } catch {
        return { success: false, error: 'Ошибка соединения' };
      }
    },
    [config, storageKey]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey);
    setJwt(null);
    setEditMode(false);
  }, [storageKey]);

  return { editMode, showLogin, loading, jwt, config, login, logout, setShowLogin };
}
