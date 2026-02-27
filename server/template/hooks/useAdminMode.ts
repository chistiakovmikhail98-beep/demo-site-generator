import { useState, useEffect, useCallback } from 'react';

interface AdminConfig {
  apiUrl: string;
  projectId: string;
  slug: string;
}

function getAdminConfig(): AdminConfig | null {
  const cfg = (window as any).__ADMIN_CONFIG__;
  if (!cfg || !cfg.apiUrl || !cfg.projectId) return null;
  return cfg;
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

export function useAdminMode(): AdminMode {
  const [editMode, setEditMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState<string | null>(null);
  const [config] = useState<AdminConfig | null>(getAdminConfig);

  const storageKey = config ? `admin_jwt_${config.projectId}` : '';

  // Check for saved JWT or ?admin param on mount
  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const savedJwt = localStorage.getItem(storageKey);

    if (savedJwt) {
      // Validate saved JWT
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
            // If ?admin in URL, show login
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

    // No saved JWT — check if ?admin in URL
    if (params.has('admin')) {
      setShowLogin(true);
    }
    setLoading(false);
  }, [config, storageKey]);

  const login = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      if (!config) return { success: false, error: 'Admin config not found' };

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
