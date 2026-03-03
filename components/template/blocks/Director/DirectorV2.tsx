import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectorData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * DirectorV2 — Full-Width Banner
 *
 * Full-width background image with dark overlay. Content centered
 * over the image inside a glass card. Huge name text, title badge,
 * description in max-w-2xl, achievements as horizontal pills,
 * and a CTA button.
 */
export default function DirectorV2({ data, editable, onDataChange, onCTAClick, className = '' }: BlockProps<DirectorData>) {
  const update = (patch: Partial<DirectorData>) => onDataChange?.({ ...data, ...patch });

  const handleAchievementChange = (index: number, value: string) => {
    const next = [...data.achievements];
    next[index] = value;
    update({ achievements: next });
  };

  const hasImage = !isPlaceholder(data.image);

  return (
    <section
      id="director"
      className={`relative w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden ${className}`}
    >
      {/* Background image */}
      {hasImage ? (
        editable ? (
          <EditableImage
            src={data.image}
            alt={data.name}
            onImageChange={(v) => update({ image: v })}
            editable={editable}
            className="absolute inset-0 w-full h-full object-cover"
            containerClassName="absolute inset-0 w-full h-full"
          />
        ) : (
          <img
            src={data.image}
            alt={data.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <User className="w-24 h-24 sm:w-32 sm:h-32 text-zinc-700" />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />

      {/* Glass card content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 flex justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full text-center space-y-5 sm:space-y-6">
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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none uppercase tracking-tighter"
          />

          {/* Description */}
          <EditableText
            value={data.description}
            onChange={(v) => update({ description: v })}
            editable={editable}
            as="p"
            multiline
            className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          />

          {/* Achievements as horizontal pills */}
          {data.achievements.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2">
              {data.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs sm:text-sm text-zinc-200 font-medium"
                >
                  {editable ? (
                    <EditableText
                      value={achievement}
                      onChange={(v) => handleAchievementChange(i, v)}
                      editable={editable}
                      as="span"
                      className="text-xs sm:text-sm text-zinc-200 font-medium"
                    />
                  ) : (
                    achievement
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="pt-4 sm:pt-6">
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
    </section>
  );
}
