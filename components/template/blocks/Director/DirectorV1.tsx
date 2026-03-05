import React from 'react';
import { Check, User, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectorData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';
import Button from '../../Button';

/**
 * DirectorV1 — Photo + Achievements Grid
 *
 * Two-column layout on large screens: photo (col-span-5) on the left,
 * content (col-span-7) on the right. Photo has aspect-[3/4] with rounded
 * corners and border. Content includes title badge, bold name, description,
 * 2-col achievements grid with Check icons, and a CTA button.
 */
export default function DirectorV1({ data, editable, onDataChange, onCTAClick, className = '' }: BlockProps<DirectorData>) {
  const update = (patch: Partial<DirectorData>) => onDataChange?.({ ...data, ...patch });

  const halfPoint = Math.ceil(data.achievements.length / 2);
  const col1 = data.achievements.slice(0, halfPoint);
  const col2 = data.achievements.slice(halfPoint);

  const handleAchievementChange = (index: number, value: string) => {
    const next = [...data.achievements];
    next[index] = value;
    update({ achievements: next });
  };

  return (
    <Section id="director" className={`bg-[#09090b] ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-20 items-center">

        {/* Photo */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
          <div className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-2 border-zinc-800 shadow-2xl aspect-[3/4]">
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
                className="w-full h-full object-cover transition-all duration-700"
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Title badge */}
          <div>
            <div className="inline-block px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 border border-primary/30 bg-primary/10 rounded-full text-[10px] sm:text-xs font-bold tracking-widest text-accent uppercase">
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
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-none uppercase tracking-tighter"
            />
          </div>

          {/* Description */}
          <EditableText
            value={data.description}
            onChange={(v) => update({ description: v })}
            editable={editable}
            as="p"
            multiline
            className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
          />

          {/* Achievements 2-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Column 1 */}
            <div className="space-y-3 sm:space-y-4">
              {col1.map((achievement, i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <Check className="text-primary shrink-0 w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
                  <EditableText
                    value={achievement}
                    onChange={(v) => handleAchievementChange(i, v)}
                    editable={editable}
                    as="p"
                    className="text-zinc-300 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-3 sm:space-y-4">
              {col2.map((achievement, i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <Check className="text-primary shrink-0 w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
                  <EditableText
                    value={achievement}
                    onChange={(v) => handleAchievementChange(halfPoint + i, v)}
                    editable={editable}
                    as="p"
                    className="text-zinc-300 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6 sm:pt-8 border-t border-zinc-800">
            <Button
              size="lg"
              onClick={() => onCTAClick?.('quiz')}
              className="w-full sm:w-auto"
            >
              Записаться
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
