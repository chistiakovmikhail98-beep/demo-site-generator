import React from 'react';
import { Star, Zap, Heart, Shield, Trophy, Sparkles } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AdvantagesData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  zap: Zap,
  heart: Heart,
  shield: Shield,
  trophy: Trophy,
  sparkles: Sparkles,
};

const FALLBACK_ICONS = [Star, Zap, Heart, Shield, Trophy, Sparkles];

/**
 * AdvantagesV2 — Icon Minimal Cards (Light theme)
 *
 * Light background section with clean white cards on a zinc-50 bg.
 * Each card shows a primary-colored icon circle (or image thumbnail),
 * bold title, and description text. Hover lifts with shadow and
 * subtle primary border.
 */
export default function AdvantagesV2({ data, editable, onDataChange }: BlockProps<AdvantagesData>) {
  const update = (patch: Partial<AdvantagesData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AdvantagesData['advantages'][0]>) => {
    const next = [...data.advantages];
    next[idx] = { ...next[idx], ...patch };
    update({ advantages: next });
  };

  const getIcon = (iconName?: string, idx: number = 0) => {
    if (iconName && ICON_MAP[iconName]) return ICON_MAP[iconName];
    return FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
  };

  return (
    <Section id="advantages" className="bg-zinc-50">
      {/* Title */}
      <div className="mb-8 sm:mb-10 md:mb-14">
        <EditableText
          value={data.title || 'Почему выбирают нас'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 uppercase tracking-tight leading-[0.95]"
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data.advantages.map((item, idx) => {
          const IconComponent = getIcon(item.icon, idx);
          const hasImage = item.image && !isPlaceholder(item.image);

          return (
            <div
              key={item.id || idx}
              className="group bg-white rounded-2xl p-6 sm:p-8 border border-zinc-100 cursor-default transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              {/* Icon or image */}
              <div className="mb-4 sm:mb-5">
                {hasImage ? (
                  editable ? (
                    <EditableImage
                      src={item.image!}
                      alt={item.title}
                      onImageChange={(v) => updateItem(idx, { image: v })}
                      editable={editable}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                      containerClassName="w-14 h-14 sm:w-16 sm:h-16"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                )}
              </div>

              {/* Title */}
              <EditableText
                value={item.title}
                onChange={(v) => updateItem(idx, { title: v })}
                editable={editable}
                as="h4"
                className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 leading-tight"
              />

              {/* Description */}
              <EditableText
                value={item.text}
                onChange={(v) => updateItem(idx, { text: v })}
                editable={editable}
                as="p"
                multiline
                className="text-sm text-zinc-500 leading-relaxed"
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
