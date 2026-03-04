import React, { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { InstructorsData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import Section from '../../Section';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * InstructorsV3 — Carousel + Quotes
 *
 * Two-column layout on desktop: large instructor image on the left,
 * detailed content on the right with specialty pills, experience,
 * and a quote card. Prev/Next navigation with dot indicators.
 */
const InstructorsV3: React.FC<BlockProps<InstructorsData> & { variant?: never }> = ({
  data,
  editable = false,
  onDataChange,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const update = (patch: Partial<InstructorsData>) => onDataChange?.({ ...data, ...patch });

  const instructors = data.instructors;
  const count = instructors.length;

  if (count === 0) return null;

  const current = instructors[activeIndex];

  const updateCurrent = (patch: Record<string, unknown>) => {
    const updated = [...instructors];
    updated[activeIndex] = { ...updated[activeIndex], ...patch };
    update({ instructors: updated });
  };

  const goTo = (index: number) => {
    if (index < 0) setActiveIndex(count - 1);
    else if (index >= count) setActiveIndex(0);
    else setActiveIndex(index);
  };

  return (
    <Section id="instructors" className={`bg-[var(--color-background,#0c0c0e)] ${className}`}>
      {/* Header */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <EditableText
          value={data.title || 'Наши тренеры'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-500 max-w-xl"
            placeholder="Описание команды..."
          />
        )}
      </div>

      {/* Main content: 2-column on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Left: instructor image */}
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900">
          {isPlaceholder(current.image) ? (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <User className="w-16 h-16 sm:w-20 sm:h-20 text-zinc-700" />
            </div>
          ) : editable ? (
            <EditableImage
              src={current.image}
              alt={current.name}
              onImageChange={(v) => updateCurrent({ image: v })}
              editable={editable}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
          ) : (
            <img
              src={current.image}
              alt={current.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Counter badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-zinc-300 font-medium">
            {activeIndex + 1} / {count}
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-col justify-center">
          {/* Category label */}
          {current.style && (
            <EditableText
              value={current.style}
              onChange={(v) => updateCurrent({ style: v })}
              editable={editable}
              as="span"
              className="inline-block text-primary text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4"
            />
          )}

          {/* Name */}
          <EditableText
            value={current.name}
            onChange={(v) => updateCurrent({ name: v })}
            editable={editable}
            as="h3"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-5"
          />

          {/* Specialty pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
            {current.specialties.map((spec, sIdx) => (
              <span
                key={sIdx}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs sm:text-sm text-zinc-300 font-medium"
              >
                {editable ? (
                  <EditableText
                    value={spec}
                    onChange={(v) => {
                      const newSpecs = [...current.specialties];
                      newSpecs[sIdx] = v;
                      updateCurrent({ specialties: newSpecs });
                    }}
                    editable={editable}
                    as="span"
                    className="inline text-zinc-300"
                  />
                ) : (
                  spec
                )}
              </span>
            ))}
          </div>

          {/* Experience */}
          <EditableText
            value={`Опыт: ${current.experience}`}
            onChange={(v) => updateCurrent({ experience: v.replace(/^Опыт:\s*/, '') })}
            editable={editable}
            as="p"
            className="text-zinc-400 text-sm sm:text-base mb-5 sm:mb-6"
          />

          {/* Quote */}
          {(current.quote || editable) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
              <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-2 sm:mb-3" />
              <EditableText
                value={current.quote || ''}
                onChange={(v) => updateCurrent({ quote: v })}
                editable={editable}
                as="p"
                multiline
                className="text-zinc-300 text-sm sm:text-base italic leading-relaxed"
                placeholder="Цитата тренера..."
              />
            </div>
          )}

          {/* Navigation */}
          {count > 1 && (
            <div className="flex items-center gap-4">
              {/* Prev / Next buttons */}
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                aria-label="Предыдущий"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="w-11 h-11 sm:w-12 sm:h-12 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                aria-label="Следующий"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-2 ml-2">
                {instructors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="min-h-[44px] min-w-[28px] flex items-center justify-center"
                    aria-label={`Тренер ${i + 1}`}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        i === activeIndex
                          ? 'w-8 h-2 bg-primary'
                          : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export default InstructorsV3;
