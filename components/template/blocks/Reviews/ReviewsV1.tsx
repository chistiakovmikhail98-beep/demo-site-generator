import React from 'react';
import { Star, MapPin } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ReviewsData } from './types';
import EditableText from '../../ui/EditableText';
import EditableList from '../../ui/EditableList';

/**
 * ReviewsV1 — Marquee Scroll
 *
 * Full-width horizontal marquee of review cards on a dark background.
 * Cards are white with name, star rating, source, and italic quote text.
 * CSS marquee animation (80s loop), hover pauses, gradient fade on edges.
 * In editable mode renders a static grid instead.
 */
export default function ReviewsV1({ data, editable, onDataChange, className = '' }: BlockProps<ReviewsData>) {
  const update = (patch: Partial<ReviewsData>) => onDataChange?.({ ...data, ...patch });
  const { reviews, title, subtitle } = data;

  if (!reviews || reviews.length === 0) return null;

  const handleReviewChange = (index: number, patch: Partial<ReviewsData['reviews'][0]>) => {
    if (!onDataChange) return;
    const updated = [...reviews];
    updated[index] = { ...updated[index], ...patch };
    update({ reviews: updated });
  };

  /* ---- Editable: static grid ---- */
  if (editable) {
    return (
      <div className={`w-full py-8 sm:py-12 md:py-16 bg-[var(--color-background,#0c0c0e)] ${className}`}>
        <div className="text-center px-4 mb-6 sm:mb-8">
          <EditableText
            value={title || 'Отзывы наших учеников'}
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
              className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto"
              placeholder="Добавить описание..."
            />
          )}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <EditableList
            items={reviews}
            onItemsChange={(items) => update({ reviews: items })}
            editable={editable}
            createNewItem={() => ({
              id: crypto.randomUUID?.() || String(Date.now()),
              name: 'Новый отзыв',
              text: 'Текст отзыва...',
              rating: 5,
              source: 'Яндекс Карты',
            })}
            minItems={1}
            maxItems={12}
            addButtonText="Добавить отзыв"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            renderItem={(review, i, onChange) => (
              <div key={review.id} className="bg-white rounded-2xl p-5 sm:p-8 flex flex-col gap-3 border border-zinc-100">
                <div className="flex justify-between items-start">
                  <div>
                    <EditableText
                      value={review.name}
                      onChange={(v) => onChange({ ...review, name: v })}
                      editable={editable}
                      as="h4"
                      className="font-bold text-zinc-900 text-base sm:text-lg"
                    />
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 mt-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <EditableText
                        value={review.source || 'Яндекс Карты'}
                        onChange={(v) => onChange({ ...review, source: v })}
                        editable={editable}
                        as="span"
                        className="underline decoration-primary/30 decoration-wavy underline-offset-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 cursor-pointer ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'}`}
                        onClick={() => onChange({ ...review, rating: s })}
                      />
                    ))}
                  </div>
                </div>
                <EditableText
                  value={review.text}
                  onChange={(v) => onChange({ ...review, text: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-zinc-600 leading-relaxed text-sm italic"
                />
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  /* ---- Public: marquee ---- */
  const marqueeReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <div className={`w-full py-8 sm:py-12 md:py-16 bg-[var(--color-background,#0c0c0e)] overflow-hidden ${className}`}>
      <style>{`
        @keyframes reviews-marquee {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .reviews-marquee-track {
          animation: reviews-marquee 80s linear infinite;
        }
        .reviews-marquee-container:hover .reviews-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Title */}
      {title && (
        <div className="text-center px-4 mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Marquee */}
      <div className="relative reviews-marquee-container">
        {/* Edge fade gradients */}
        <div className="absolute top-0 left-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-[#0c0c0e] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-[#0c0c0e] to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <div className="flex gap-4 sm:gap-6 reviews-marquee-track w-max px-2">
            {marqueeReviews.map((review, idx) => (
              <div
                key={idx}
                className="w-[85vw] sm:w-[280px] md:w-[400px] bg-white p-5 sm:p-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col gap-3 sm:gap-4 flex-shrink-0 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-base sm:text-lg">{review.name}</h4>
                    {review.source && (
                      <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="underline decoration-primary/30 decoration-wavy underline-offset-2">
                          {review.source}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed text-sm italic">
                  &laquo;{review.text}&raquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
