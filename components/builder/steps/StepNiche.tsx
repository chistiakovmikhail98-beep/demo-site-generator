'use client';

import { useBuilderStore } from '@/lib/builder/store';
import { NICHE_PRESETS } from '@/lib/builder/niches';
import type { Niche } from '@/lib/types';

export default function StepNiche() {
  const niche = useBuilderStore(s => s.niche);
  const setNiche = useBuilderStore(s => s.setNiche);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Выберите тип студии</h1>
        <p className="text-zinc-400">Мы подберём контент и структуру сайта под вашу нишу</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NICHE_PRESETS.map((preset) => {
          const isSelected = niche === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setNiche(preset.id as Niche)}
              className={`
                group relative rounded-2xl border p-6 text-left transition-all
                ${isSelected
                  ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                }
              `}
            >
              <div className="mb-3 text-3xl">{preset.icon}</div>
              <h3 className="mb-1 text-lg font-semibold">{preset.name}</h3>
              <p className="text-sm text-zinc-400">{preset.description}</p>
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {niche && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">
            Предзаполненные направления: {getNichePreset(niche)?.defaultDirections.map(d => d.title).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function getNichePreset(niche: Niche) {
  return NICHE_PRESETS.find(n => n.id === niche);
}
