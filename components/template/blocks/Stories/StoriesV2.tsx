import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { StoriesData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import Section from '../../Section';
import Button from '../../Button';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * StoriesV2 — Full-Width Slider
 *
 * One story at a time, full-width. Two-column image layout on md+
 * (before left, after right). Large title, description, navigation
 * arrows and dots. Smooth transition between stories.
 */
const StoriesV2: React.FC<BlockProps<StoriesData> & { variant?: never }> = ({
  data,
  editable = false,
  onDataChange,
  onCTAClick,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const update = (patch: Partial<StoriesData>) => onDataChange?.({ ...data, ...patch });

  const stories = data.stories;
  const count = stories.length;

  if (count === 0) return null;

  const current = stories[activeIndex];

  const updateCurrent = (patch: Record<string, unknown>) => {
    const updated = [...stories];
    updated[activeIndex] = { ...updated[activeIndex], ...patch };
    update({ stories: updated });
  };

  const goTo = (index: number) => {
    if (index < 0) setActiveIndex(count - 1);
    else if (index >= count) setActiveIndex(0);
    else setActiveIndex(index);
  };

  return (
    <Section id="stories" className={`bg-[var(--color-background,#09090b)] ${className}`}>
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 md:mb-12">
        <EditableText
          value={data.title || 'Истории успеха'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto"
            placeholder="Описание секции..."
          />
        )}
      </div>

      {/* Slider content */}
      <div className="relative">
        {/* Image pair: 2-col on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Before */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden">
            {isPlaceholder(current.beforeImg) ? (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
            ) : editable ? (
              <EditableImage
                src={current.beforeImg}
                alt="До"
                onImageChange={(v) => updateCurrent({ beforeImg: v })}
                editable={editable}
                className="w-full h-full object-cover grayscale"
                containerClassName="w-full h-full"
              />
            ) : (
              <img
                src={current.beforeImg}
                alt="До"
                className="w-full h-full object-cover grayscale transition-all duration-500"
                loading="lazy"
              />
            )}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm text-zinc-200 rounded-full font-semibold uppercase tracking-wider">
              До
            </div>
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* After */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden">
            {isPlaceholder(current.afterImg) ? (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
            ) : editable ? (
              <EditableImage
                src={current.afterImg}
                alt="После"
                onImageChange={(v) => updateCurrent({ afterImg: v })}
                editable={editable}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            ) : (
              <img
                src={current.afterImg}
                alt="После"
                className="w-full h-full object-cover transition-all duration-500"
                loading="lazy"
              />
            )}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm text-white rounded-full font-semibold uppercase tracking-wider">
              После
            </div>
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <EditableText
            value={current.title}
            onChange={(v) => updateCurrent({ title: v })}
            editable={editable}
            as="h3"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4"
          />
          <EditableText
            value={current.description}
            onChange={(v) => updateCurrent({ description: v })}
            editable={editable}
            as="p"
            multiline
            className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6"
          />
          <Button
            onClick={() => onCTAClick?.('quiz')}
            size="lg"
            className="w-full sm:w-auto"
          >
            Хочу такой результат
          </Button>
        </div>

        {/* Navigation */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-4">
            {/* Prev */}
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-zinc-900 border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
              aria-label="Предыдущая история"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {stories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="min-h-[44px] min-w-[28px] flex items-center justify-center"
                  aria-label={`История ${i + 1}`}
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

            {/* Next */}
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-zinc-900 border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
              aria-label="Следующая история"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
};

export default StoriesV2;
