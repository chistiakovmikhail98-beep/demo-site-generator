import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ReviewsData } from './types';
import EditableText from '../../ui/EditableText';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';

/**
 * ReviewsV2 — Card Grid
 *
 * Dark section with responsive grid of review cards.
 * Each card has a MessageCircle quote icon, review text,
 * name, star rating, and source. Fully editable.
 */
export default function ReviewsV2({ data, editable, onDataChange, className = '' }: BlockProps<ReviewsData>) {
  const update = (patch: Partial<ReviewsData>) => onDataChange?.({ ...data, ...patch });
  const { reviews, title, subtitle } = data;

  if (!reviews || reviews.length === 0) return null;

  const renderCard = (review: ReviewsData['reviews'][0], i: number, onChange?: (r: ReviewsData['reviews'][0]) => void) => {
    const isEdit = editable && onChange;

    return (
      <div
        key={review.id}
        className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 hover:border-zinc-700 transition-colors duration-300"
      >
        {/* Quote icon */}
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary/40" />

        {/* Review text */}
        {isEdit ? (
          <EditableText
            value={review.text}
            onChange={(v) => onChange({ ...review, text: v })}
            editable={editable}
            as="p"
            multiline
            className="text-zinc-300 text-sm sm:text-base leading-relaxed flex-1"
          />
        ) : (
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed flex-1">
            {review.text}
          </p>
        )}

        {/* Footer: name + stars + source */}
        <div className="pt-4 border-t border-zinc-700/50 space-y-2">
          <div className="flex items-center justify-between gap-3">
            {isEdit ? (
              <EditableText
                value={review.name}
                onChange={(v) => onChange({ ...review, name: v })}
                editable={editable}
                as="h4"
                className="font-bold text-white text-sm sm:text-base"
              />
            ) : (
              <h4 className="font-bold text-white text-sm sm:text-base">{review.name}</h4>
            )}

            <div className="flex gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    s <= (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-500'
                  } ${isEdit ? 'cursor-pointer' : ''}`}
                  onClick={isEdit ? () => onChange({ ...review, rating: s }) : undefined}
                />
              ))}
            </div>
          </div>

          {(review.source || isEdit) && (
            isEdit ? (
              <EditableText
                value={review.source || ''}
                onChange={(v) => onChange({ ...review, source: v })}
                editable={editable}
                as="span"
                className="text-xs text-zinc-400"
                placeholder="Источник (Яндекс Карты, 2ГИС...)"
              />
            ) : (
              review.source && (
                <span className="text-xs text-zinc-400">{review.source}</span>
              )
            )
          )}
        </div>
      </div>
    );
  };

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

      {/* Grid */}
      {editable ? (
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
          renderItem={(review, i, onChange) => renderCard(review, i, onChange)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((review, i) => renderCard(review, i))}
        </div>
      )}
    </Section>
  );
}
