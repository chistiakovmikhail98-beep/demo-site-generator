import React from 'react';
import { Star } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AdvantagesData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

/**
 * AdvantagesV1 — Photo Cards with Overlay
 *
 * Grid of cards with full background images and gradient overlays.
 * Title sits at the bottom; description reveals on hover with a
 * translate-y transition. Image scales subtly on hover.
 */
export default function AdvantagesV1({ data, editable, onDataChange }: BlockProps<AdvantagesData>) {
  const update = (patch: Partial<AdvantagesData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AdvantagesData['advantages'][0]>) => {
    const next = [...data.advantages];
    next[idx] = { ...next[idx], ...patch };
    update({ advantages: next });
  };

  return (
    <Section id="advantages" className="bg-[var(--color-background,#09090b)]">
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
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-lg"
          />
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data.advantages.map((item, idx) => (
          <div
            key={item.id || idx}
            className="group relative aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden cursor-default shadow-lg hover:shadow-2xl transition-shadow duration-500"
          >
            {/* Background image */}
            {isPlaceholder(item.image) ? (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-700" />
            ) : editable ? (
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

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all duration-300" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6 md:p-8">
              {/* Icon badge */}
              {!item.image || isPlaceholder(item.image) ? (
                <div className="mb-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              ) : null}

              <EditableText
                value={item.title}
                onChange={(v) => updateItem(idx, { title: v })}
                editable={editable}
                as="h4"
                className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight mb-1 sm:mb-2"
              />

              <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <EditableText
                  value={item.text}
                  onChange={(v) => updateItem(idx, { text: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
