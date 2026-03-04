import React, { useState, useCallback, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ReviewsData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * ReviewsV3 — Spotlight Single Review
 *
 * Dark section showcasing one large review at a time, centered.
 * Giant decorative quote marks, large italic text, name + rating.
 * Navigation dots to switch between reviews with animated transitions.
 */
export default function ReviewsV3({ data, editable, onDataChange, className = '' }: BlockProps<ReviewsData>) {
  const update = (patch: Partial<ReviewsData>) => onDataChange?.({ ...data, ...patch });
  const { reviews, title, subtitle } = data;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Guard against empty array / out-of-bounds
  const safeIndex = reviews.length > 0 ? activeIndex % reviews.length : 0;
  const current = reviews[safeIndex];

  // Auto-advance every 6 seconds (only in non-editable mode)
  useEffect(() => {
    if (editable || reviews.length <= 1) return;
    const timer = setInterval(() => {
      goTo((safeIndex + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [safeIndex, editable, reviews.length]);

  const goTo = useCallback(
    (index: number) => {
      if (index === safeIndex || isTransitioning) return;
      setIsTransitioning(true);
      // Short fade-out, then switch, then fade-in
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 300);
    },
    [safeIndex, isTransitioning],
  );

  if (!reviews || reviews.length === 0) return null;

  return (
    <Section id="reviews" className={`bg-[var(--color-background,#0c0c0e)] ${className}`}>
      {/* Title */}
      <div className="text-center mb-8 sm:mb-12">
        <EditableText
          value={title || 'Отзывы'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight"
        />
        {(subtitle || editable) && (
          <EditableText
            value={subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto"
            placeholder="Добавить описание..."
          />
        )}
      </div>

      {/* Spotlight area */}
      <div className="max-w-3xl mx-auto text-center relative">
        {/* Decorative giant quote marks */}
        <Quote className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary/10 mx-auto mb-4 sm:mb-6 rotate-180" />

        {/* Review content with transition */}
        <div
          className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Review text */}
          {editable ? (
            <EditableText
              value={current.text}
              onChange={(v) => {
                const updated = [...reviews];
                updated[safeIndex] = { ...current, text: v };
                update({ reviews: updated });
              }}
              editable={editable}
              as="p"
              multiline
              className="text-lg sm:text-xl md:text-2xl text-zinc-200 italic leading-relaxed font-medium"
            />
          ) : (
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-200 italic leading-relaxed font-medium">
              &laquo;{current.text}&raquo;
            </p>
          )}

          {/* Name + stars */}
          <div className="mt-6 sm:mt-8 space-y-2">
            {editable ? (
              <EditableText
                value={current.name}
                onChange={(v) => {
                  const updated = [...reviews];
                  updated[safeIndex] = { ...current, name: v };
                  update({ reviews: updated });
                }}
                editable={editable}
                as="h4"
                className="font-bold text-white text-base sm:text-lg"
              />
            ) : (
              <h4 className="font-bold text-white text-base sm:text-lg">{current.name}</h4>
            )}

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    s <= (current.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-500'
                  } ${editable ? 'cursor-pointer' : ''}`}
                  onClick={
                    editable
                      ? () => {
                          const updated = [...reviews];
                          updated[safeIndex] = { ...current, rating: s };
                          update({ reviews: updated });
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            {current.source && (
              <p className="text-xs sm:text-sm text-zinc-400">{current.source}</p>
            )}
          </div>
        </div>

        {/* Closing decorative quote */}
        <Quote className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary/10 mx-auto mt-4 sm:mt-6" />
      </div>

      {/* Navigation dots */}
      {reviews.length > 1 && (
        <div className="flex justify-center gap-2 sm:gap-3 mt-8 sm:mt-10">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Отзыв ${i + 1}`}
              className={`min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:block transition-all duration-300 ${
                i === safeIndex
                  ? 'sm:w-8 sm:h-3 w-3 h-3 bg-primary rounded-full sm:rounded-full'
                  : 'sm:w-3 sm:h-3 w-3 h-3 bg-zinc-700 hover:bg-zinc-500 rounded-full'
              }`}
            >
              {/* Inner dot visible only on mobile for larger touch target wrapper */}
              <span className="sm:hidden block w-3 h-3 rounded-full" style={{ background: 'inherit' }} />
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
