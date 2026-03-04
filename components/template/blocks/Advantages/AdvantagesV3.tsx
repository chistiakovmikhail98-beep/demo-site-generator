import React from 'react';
import { Star, Zap, Heart, Shield, Trophy, Sparkles } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AdvantagesData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

const FALLBACK_ICONS = [Star, Zap, Heart, Shield, Trophy, Sparkles];

/**
 * AdvantagesV3 — Bento Grid
 *
 * Dark asymmetric bento layout. First two items span wider columns;
 * remaining items fill a standard grid. Cards with images get a
 * gradient overlay; cards without images show icon + text content.
 * On mobile, all cards stack single-column.
 */
export default function AdvantagesV3({ data, editable, onDataChange }: BlockProps<AdvantagesData>) {
  const update = (patch: Partial<AdvantagesData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AdvantagesData['advantages'][0]>) => {
    const next = [...data.advantages];
    next[idx] = { ...next[idx], ...patch };
    update({ advantages: next });
  };

  // Bento col-span patterns: item 0 = 2 cols, item 1 = 1 col, rest = 1 col each
  const getColSpan = (idx: number): string => {
    if (idx === 0) return 'md:col-span-2';
    return 'md:col-span-1';
  };

  // First item gets taller min-height
  const getMinHeight = (idx: number): string => {
    if (idx === 0) return 'min-h-[240px] sm:min-h-[280px] md:min-h-[320px]';
    if (idx === 1) return 'min-h-[240px] sm:min-h-[280px] md:min-h-[320px]';
    return 'min-h-[200px] sm:min-h-[220px]';
  };

  return (
    <Section id="advantages" className="bg-[var(--color-background,#0c0c0e)]">
      {/* Title */}
      <div className="mb-8 sm:mb-10 md:mb-14">
        <EditableText
          value={data.title || 'Почему выбирают нас'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 max-w-lg"
          />
        )}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {data.advantages.map((item, idx) => {
          const hasImage = item.image && !isPlaceholder(item.image);
          const IconComponent = FALLBACK_ICONS[idx % FALLBACK_ICONS.length];

          return (
            <div
              key={item.id || idx}
              className={`group relative ${getColSpan(idx)} ${getMinHeight(idx)} bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:border-zinc-700`}
            >
              {/* Image background (for cards with images) */}
              {hasImage ? (
                <>
                  {editable ? (
                    <EditableImage
                      src={item.image!}
                      alt={item.title}
                      onImageChange={(v) => updateItem(idx, { image: v })}
                      editable={editable}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      containerClassName="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                  {/* Gradient overlay for image cards */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-all duration-300" />
                </>
              ) : (
                /* Subtle gradient for non-image cards */
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              )}

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6 md:p-8">
                {/* Icon (only for non-image cards) */}
                {!hasImage && (
                  <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                )}

                <EditableText
                  value={item.title}
                  onChange={(v) => updateItem(idx, { title: v })}
                  editable={editable}
                  as="h4"
                  className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight mb-1.5 sm:mb-2"
                />

                <EditableText
                  value={item.text}
                  onChange={(v) => updateItem(idx, { text: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
