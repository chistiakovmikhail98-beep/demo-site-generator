import React from 'react';
import { Star } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AdvantagesData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

/**
 * AdvantagesV1 — Photo Cards (Contained)
 *
 * Grid of cards with contained images on top and text below on
 * a solid dark background. No text over images. Description always visible.
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
            className="group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Contained image — NO text on it */}
            <div className="aspect-[4/3] overflow-hidden">
              {isPlaceholder(item.image) ? (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-700" />
              ) : editable ? (
                <EditableImage
                  src={item.image!}
                  alt={item.title}
                  onImageChange={(v) => updateItem(idx, { image: v })}
                  editable={editable}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  containerClassName="w-full h-full"
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              )}
            </div>

            {/* Text content — on solid background, always readable */}
            <div className="p-5 sm:p-6">
              {/* Icon badge (shown when no image) */}
              {(!item.image || isPlaceholder(item.image)) && (
                <div className="mb-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              )}

              <EditableText
                value={item.title}
                onChange={(v) => updateItem(idx, { title: v })}
                editable={editable}
                as="h4"
                className="text-white font-bold text-lg sm:text-xl leading-tight mb-2"
              />

              <EditableText
                value={item.text}
                onChange={(v) => updateItem(idx, { text: v })}
                editable={editable}
                as="p"
                multiline
                className="text-zinc-300 text-sm leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
