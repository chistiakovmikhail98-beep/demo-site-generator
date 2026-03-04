'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SettingsTabProps {
  projectId: string;
  jwt: string;
  apiUrl: string;
  currentSlug: string;
}

export default function SettingsTab({ projectId, jwt, apiUrl, currentSlug }: SettingsTabProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isValid = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(slug);
  const isChanged = slug !== currentSlug;

  // Debounced availability check
  useEffect(() => {
    if (!isChanged || !isValid) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const base = apiUrl || '';
        const res = await fetch(`${base}/api/admin/${projectId}/settings?check=${slug}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAvailable(data.available);
        }
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, isChanged, isValid, projectId, jwt, apiUrl]);

  const handleSave = useCallback(async () => {
    if (!isValid || !isChanged || available === false) return;
    setSaving(true);
    setMessage('');

    try {
      const base = apiUrl || '';
      const res = await fetch(`${base}/api/admin/${projectId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        setMessage('Субдомен изменён! Перенаправление...');
        setTimeout(() => {
          window.location.href = `https://${slug}.fitwebai.ru?admin`;
        }, 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Ошибка');
      }
    } catch {
      setMessage('Ошибка соединения');
    } finally {
      setSaving(false);
    }
  }, [slug, isValid, isChanged, available, projectId, jwt, apiUrl]);

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Настройки сайта</h3>
        <p className="text-xs text-zinc-500">Управление субдоменом</p>
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
          Субдомен
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            maxLength={30}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-violet-500 transition-colors"
            placeholder="my-studio"
          />
          <span className="text-xs text-zinc-500 shrink-0">.fitwebai.ru</span>
        </div>

        {/* Status */}
        <div className="mt-2 min-h-[20px]">
          {!isValid && slug.length > 0 && (
            <p className="text-[11px] text-red-400">3-30 символов: a-z, 0-9, дефис</p>
          )}
          {isValid && isChanged && checking && (
            <p className="text-[11px] text-zinc-500">Проверка...</p>
          )}
          {isValid && isChanged && !checking && available === true && (
            <p className="text-[11px] text-emerald-400">Доступен</p>
          )}
          {isValid && isChanged && !checking && available === false && (
            <p className="text-[11px] text-red-400">Этот субдомен уже занят</p>
          )}
        </div>
      </div>

      {/* Current URL */}
      <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Текущий адрес</div>
        <div className="text-sm text-violet-400 font-mono">{currentSlug}.fitwebai.ru</div>
      </div>

      {message && (
        <div className={`text-xs px-3 py-2 rounded-lg ${
          message.includes('изменён') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !isValid || !isChanged || available === false || checking}
        className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Сохранение...' : 'Сменить субдомен'}
      </button>
    </div>
  );
}
