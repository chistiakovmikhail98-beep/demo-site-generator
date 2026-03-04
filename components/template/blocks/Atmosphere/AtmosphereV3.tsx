import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AtmosphereData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * AtmosphereV3 — Fullscreen Slider
 *
 * Single-item carousel that fills the full viewport width.
 * Each slide shows a tall image (min 60vh on mobile, 70vh on desktop)
 * with a content overlay at the bottom. Prev/Next arrow buttons and
 * dot indicators provide navigation with 44px minimum touch targets.
 * Auto-advances every 5 seconds when not in editable mode.
 */
export default function AtmosphereV3({ data, editable, onDataChange }: BlockProps<AtmosphereData>) {
  const [active, setActive] = useState(0);

  const update = (patch: Partial<AtmosphereData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AtmosphereData['items'][0]>) => {
    const next = [...data.items];
    next[idx] = { ...next[idx], ...patch };
    update({ items: next });
  };

  const items = data.items ?? [];

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      setActive((index + items.length) % items.length);
    },
    [items.length],
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  // Auto-advance every 5s (non-editable only)
  useEffect(() => {
    if (editable || items.length <= 1) return;
    const timer = setInterval(() => goNext(), 5000);
    return () => clearInterval(timer);
  }, [editable, items.length, goNext]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full bg-[var(--color-background,#0c0c0e)] overflow-hidden" id="atmosphere">
      {/* Title bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8">
        <EditableText
          value={data.title || 'Атмосфера'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-400 max-w-lg"
            placeholder="Добавить описание..."
          />
        )}
      </div>

      {/* Slides */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh]">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              active === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Image */}
            {isPlaceholder(item.image) ? (
              <div className="w-full h-full min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-br from-zinc-800 to-zinc-900" />
            ) : editable ? (
              <EditableImage
                src={item.image}
                alt={item.title}
                onImageChange={(v) => updateItem(idx, { image: v })}
                editable={editable}
                className="w-full h-full min-h-[60vh] sm:min-h-[70vh] object-cover"
                containerClassName="w-full h-full min-h-[60vh] sm:min-h-[70vh]"
              />
            ) : (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full min-h-[60vh] sm:min-h-[70vh] object-cover"
                loading="lazy"
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-8 md:p-12 lg:p-16">
              <div className="max-w-3xl">
                <EditableText
                  value={item.title}
                  onChange={(v) => updateItem(idx, { title: v })}
                  editable={editable}
                  as="h3"
                  className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight"
                />
                <EditableText
                  value={item.description}
                  onChange={(v) => updateItem(idx, { description: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-xl"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Prev/Next buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Предыдущий слайд"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Следующий слайд"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-5 sm:py-6 min-h-[44px]">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Перейти к слайду ${idx + 1}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active === idx
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
