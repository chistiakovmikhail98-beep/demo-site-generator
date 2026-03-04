import React from 'react';
import { Camera } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AtmosphereData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

/**
 * AtmosphereV2 — Simple Photo Grid
 *
 * Clean, minimal grid of atmosphere cards. Each card shows an
 * aspect-[4/3] image with a rounded-2xl frame, a gradient overlay
 * anchoring the title at the bottom, and a hover effect that scales
 * the image and reveals the description text.
 */
export default function AtmosphereV2({ data, editable, onDataChange }: BlockProps<AtmosphereData>) {
  const update = (patch: Partial<AtmosphereData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AtmosphereData['items'][0]>) => {
    const next = [...data.items];
    next[idx] = { ...next[idx], ...patch };
    update({ items: next });
  };

  const items = data.items ?? [];

  if (items.length === 0) return null;

  return (
    <Section id="atmosphere" className="bg-[var(--color-background,#09090b)]">
      {/* Header */}
      <div className="mb-8 sm:mb-10 md:mb-14">
        <EditableText
          value={data.title || 'Атмосфера'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-lg"
            placeholder="Добавить описание..."
          />
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-default shadow-lg hover:shadow-2xl transition-shadow duration-500"
          >
            {/* Image */}
            {isPlaceholder(item.image) ? (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                <Camera className="w-10 h-10 text-zinc-700" />
              </div>
            ) : editable ? (
              <EditableImage
                src={item.image}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6">
              <EditableText
                value={item.title}
                onChange={(v) => updateItem(idx, { title: v })}
                editable={editable}
                as="h4"
                className="text-white font-bold text-base sm:text-lg md:text-xl leading-tight mb-1"
              />

              <div className="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <EditableText
                  value={item.description}
                  onChange={(v) => updateItem(idx, { description: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-zinc-300 text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
