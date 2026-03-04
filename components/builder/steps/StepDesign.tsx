'use client';

import { useBuilderStore } from '@/lib/builder/store';
import { COLOR_PALETTES, getPaletteGroups } from '@/lib/builder/color-palettes';
import { TYPOGRAPHY_PRESETS } from '@/lib/builder/typography-presets';

export default function StepDesign() {
  const colorPresetId = useBuilderStore(s => s.colorPresetId);
  const typographyPresetId = useBuilderStore(s => s.typographyPresetId);
  const customColors = useBuilderStore(s => s.customColors);
  const setColorPreset = useBuilderStore(s => s.setColorPreset);
  const setCustomColors = useBuilderStore(s => s.setCustomColors);
  const setTypographyPreset = useBuilderStore(s => s.setTypographyPreset);

  const groups = getPaletteGroups();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Дизайн</h1>
        <p className="text-zinc-400">Выберите цветовую палитру и стиль шрифтов</p>
      </div>

      {/* Color Palettes */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Цветовая палитра</h2>

        {groups.map((group) => (
          <div key={group} className="mb-6">
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">{group}</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {COLOR_PALETTES.filter(p => p.group === group).map((palette) => {
                const isSelected = colorPresetId === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => setColorPreset(palette.id)}
                    className={`
                      group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all
                      ${isSelected
                        ? 'border-white/30 bg-white/5 shadow-lg'
                        : 'border-zinc-800 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="flex gap-1">
                      <div
                        className="h-8 w-8 rounded-full border border-white/10"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div
                        className="h-8 w-8 rounded-full border border-white/10"
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300">{palette.name}</span>
                    {isSelected && (
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-black">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom colors */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">Свои цвета</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Основной:</span>
              <input
                type="color"
                value={customColors?.primary || '#f43f5e'}
                onChange={(e) => setCustomColors({
                  primary: e.target.value,
                  accent: customColors?.accent || '#fb7185',
                })}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Акцент:</span>
              <input
                type="color"
                value={customColors?.accent || '#fb7185'}
                onChange={(e) => setCustomColors({
                  primary: customColors?.primary || '#f43f5e',
                  accent: e.target.value,
                })}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Типографика</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPOGRAPHY_PRESETS.map((preset) => {
            const isSelected = typographyPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setTypographyPreset(preset.id)}
                className={`
                  rounded-xl border p-4 text-left transition-all
                  ${isSelected
                    ? 'border-rose-500/50 bg-rose-500/10'
                    : 'border-zinc-800 hover:border-zinc-700'
                  }
                `}
              >
                <div className="mb-2 text-2xl font-bold" style={{ fontFamily: preset.headingFont }}>
                  Aa
                </div>
                <h3 className="font-semibold">{preset.name}</h3>
                <p className="text-sm text-zinc-500">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live preview bar */}
      {colorPresetId !== 'custom' && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-sm text-zinc-500">Предпросмотр:</span>
          {(() => {
            const p = COLOR_PALETTES.find(p => p.id === colorPresetId);
            if (!p) return null;
            return (
              <>
                <button
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: p.primary }}
                >
                  Записаться
                </button>
                <button
                  className="rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
                  style={{ borderColor: p.accent, color: p.accent }}
                >
                  Подробнее
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
