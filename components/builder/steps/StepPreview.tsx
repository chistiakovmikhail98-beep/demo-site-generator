'use client';

import { useMemo, useState, useEffect } from 'react';
import { useBuilderStore } from '@/lib/builder/store';
import { builderToSiteConfig } from '@/lib/builder/to-site-config';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/components/template/App'), { ssr: false });

export default function StepPreview() {
  const state = useBuilderStore();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const config = useMemo(() => {
    try {
      return builderToSiteConfig(state);
    } catch {
      return null;
    }
  }, [state]);

  // Apply CSS vars for the preview
  useEffect(() => {
    if (!config?.sections.colorScheme) return;
    const cs = config.sections.colorScheme;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', cs.primary);
    root.style.setProperty('--color-accent', cs.accent);
    root.style.setProperty('--color-background', cs.background);
    root.style.setProperty('--color-surface', cs.surface);
    root.style.setProperty('--color-text', cs.text);

    return () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-surface');
      root.style.removeProperty('--color-text');
    };
  }, [config]);

  if (!config) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Заполните предыдущие шаги для предпросмотра</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-2">
        <button
          onClick={() => setDevice('desktop')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            device === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Десктоп
        </button>
        <button
          onClick={() => setDevice('mobile')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            device === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Мобильный
        </button>
      </div>

      {/* Preview frame */}
      <div className="flex-1 overflow-auto bg-zinc-900 p-4">
        <div
          className={`
            mx-auto overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all
            ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}
          `}
          style={{ minHeight: '600px' }}
        >
          <App initialConfig={config} />
        </div>
      </div>
    </div>
  );
}
