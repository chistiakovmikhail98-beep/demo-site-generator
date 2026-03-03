import React from 'react';
import { Quote, User } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectorData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';

/**
 * DirectorV3 — Side-by-Side Modern
 *
 * Two-column on md: content left, photo right.
 * Content has decorative quote marks, large italic quote from description,
 * achievements as vertical numbered list (01, 02, 03...).
 * Photo with rounded corners and accent-colored border.
 * Clean, minimal design.
 */
export default function DirectorV3({ data, editable, onDataChange, className = '' }: BlockProps<DirectorData>) {
  const update = (patch: Partial<DirectorData>) => onDataChange?.({ ...data, ...patch });

  const handleAchievementChange = (index: number, value: string) => {
    const next = [...data.achievements];
    next[index] = value;
    update({ achievements: next });
  };

  return (
    <Section id="director" className={`bg-zinc-900 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

        {/* Content — left */}
        <div className="space-y-6 sm:space-y-8 order-2 md:order-1">
          {/* Title badge */}
          <div className="inline-block px-3 sm:px-4 py-1.5 border border-primary/30 bg-primary/10 rounded-full text-[10px] sm:text-xs font-bold tracking-widest text-accent uppercase">
            {editable ? (
              <EditableText
                value={data.title}
                onChange={(v) => update({ title: v })}
                editable={editable}
                as="span"
                className="text-[10px] sm:text-xs font-bold tracking-widest text-accent uppercase"
              />
            ) : (
              data.title
            )}
          </div>

          {/* Name */}
          <EditableText
            value={data.name}
            onChange={(v) => update({ name: v })}
            editable={editable}
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tighter"
          />

          {/* Decorative quote + description */}
          <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/30">
            <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mb-2 sm:mb-3 rotate-180" />
            <EditableText
              value={data.description}
              onChange={(v) => update({ description: v })}
              editable={editable}
              as="p"
              multiline
              className="text-base sm:text-lg md:text-xl text-zinc-300 italic leading-relaxed font-medium"
            />
            <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mt-2 sm:mt-3 ml-auto" />
          </div>

          {/* Achievements as numbered vertical list */}
          {data.achievements.length > 0 && (
            <div className="space-y-3 sm:space-y-4 pt-2">
              {data.achievements.map((achievement, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  <span className="text-primary font-black text-lg sm:text-xl tabular-nums shrink-0 w-7 sm:w-8 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="pt-0.5 sm:pt-1 border-t border-zinc-800 flex-1">
                    <EditableText
                      value={achievement}
                      onChange={(v) => handleAchievementChange(i, v)}
                      editable={editable}
                      as="p"
                      className="text-zinc-300 text-xs sm:text-sm leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo — right */}
        <div className="relative order-1 md:order-2">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl aspect-[3/4]">
            {isPlaceholder(data.image) ? (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <User className="w-16 h-16 sm:w-24 sm:h-24 text-zinc-700" />
              </div>
            ) : editable ? (
              <EditableImage
                src={data.image}
                alt={data.name}
                onImageChange={(v) => update({ image: v })}
                editable={editable}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            ) : (
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                loading="lazy"
              />
            )}
          </div>

          {/* Subtle glow behind photo */}
          <div className="absolute -inset-4 bg-primary/5 blur-[60px] rounded-full pointer-events-none -z-10" />
        </div>
      </div>
    </Section>
  );
}
