import React, { useState, useCallback } from 'react';
import Section from '../../Section';
import Button from '../../Button';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import Carousel from '../../ui/Carousel';
import { isPlaceholder } from '../../PlaceholderImg';
import { Clock, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectionsData, DirectionItem } from './types';

export default function DirectionsV3({ data, editable, onDataChange, onCTAClick }: BlockProps<DirectionsData>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const directions = data.directions;
  const current = directions[activeIndex] || directions[0];
  const total = directions.length;

  const goTo = useCallback((idx: number) => {
    const clamped = ((idx % total) + total) % total;
    setActiveIndex(clamped);
  }, [total]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const updateCurrent = (updated: DirectionItem) => {
    if (!onDataChange) return;
    const dirs = [...directions];
    dirs[activeIndex] = updated;
    onDataChange({ ...data, directions: dirs });
  };

  if (!current) return null;

  const placeholder = isPlaceholder(current.image);

  return (
    <Section id="directions" className="bg-[var(--color-background,#0c0c0e)]">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <EditableText
          value={data.title}
          onChange={v => onDataChange?.({ ...data, title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] mb-3 sm:mb-4"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={v => onDataChange?.({ ...data, subtitle: v })}
            editable={editable}
            as="p"
            className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto"
          />
        )}
      </div>

      {/* Main Content: 2 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* LEFT: Image with navigation overlay */}
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
            {editable ? (
              <EditableImage
                src={current.image || ''}
                alt={current.title}
                onImageChange={src => updateCurrent({ ...current, image: src })}
                editable
                className="w-full h-full object-cover"
              />
            ) : placeholder ? (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400 font-bold text-lg uppercase tracking-wider text-center px-8">
                  {current.title}
                </span>
              </div>
            ) : (
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Prev/Next buttons on image */}
          {total > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors duration-300 z-10"
                aria-label="Предыдущее направление"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors duration-300 z-10"
                aria-label="Следующее направление"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Counter badge */}
          {total > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full z-10">
              {activeIndex + 1} / {total}
            </div>
          )}
        </div>

        {/* RIGHT: Content */}
        <div className="flex flex-col justify-center">
          {/* Category label */}
          {current.category && (
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4">
              {current.category}
            </span>
          )}

          {/* Title */}
          <EditableText
            value={current.title}
            onChange={v => updateCurrent({ ...current, title: v })}
            editable={editable}
            as="h3"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-4 sm:mb-6"
          />

          {/* Description */}
          <EditableText
            value={current.description}
            onChange={v => updateCurrent({ ...current, description: v })}
            editable={editable}
            as="p"
            multiline
            className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6 sm:mb-8"
          />

          {/* Metrics */}
          <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Duration */}
            <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900 rounded-xl px-4 py-3 sm:px-5 sm:py-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">Длительность</p>
                <EditableText
                  value={current.duration}
                  onChange={v => updateCurrent({ ...current, duration: v })}
                  editable={editable}
                  as="p"
                  className="text-sm sm:text-base text-white font-bold"
                />
              </div>
            </div>

            {/* Calories */}
            {current.calories && (
              <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900 rounded-xl px-4 py-3 sm:px-5 sm:py-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">Калории</p>
                  <EditableText
                    value={current.calories}
                    onChange={v => updateCurrent({ ...current, calories: v })}
                    editable={editable}
                    as="p"
                    className="text-sm sm:text-base text-white font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {current.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {current.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-zinc-900 text-zinc-300 text-xs sm:text-sm rounded-full border border-zinc-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            className="rounded-2xl uppercase tracking-wide font-bold w-full sm:w-auto"
            onClick={() => onCTAClick?.('direction-signup')}
          >
            {current.buttonText || 'Записаться на занятие'}
          </Button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {total > 1 && (
        <div className="mt-8 sm:mt-12">
          <Carousel
            showDots={false}
            showArrows={false}
            peek
            gap={12}
            itemClassName="w-16 sm:w-20 md:w-24"
            onSlideChange={goTo}
          >
            {directions.map((dir, i) => {
              const thumbPlaceholder = isPlaceholder(dir.image);
              const isActive = i === activeIndex;

              return (
                <button
                  key={dir.id}
                  onClick={() => goTo(i)}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden
                    transition-all duration-300 flex-shrink-0
                    ${isActive
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#0c0c0e] scale-105'
                      : 'opacity-50 hover:opacity-80'
                    }
                  `}
                  aria-label={dir.title}
                >
                  {thumbPlaceholder ? (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-400 font-bold text-[7px] sm:text-[8px] uppercase text-center leading-tight px-1">
                        {dir.title.slice(0, 10)}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={dir.image}
                      alt={dir.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              );
            })}
          </Carousel>
        </div>
      )}
    </Section>
  );
}
