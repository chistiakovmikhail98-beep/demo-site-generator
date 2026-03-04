import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { RequestsData } from './types';
import EditableText from '../../ui/EditableText';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';
import Button from '../../Button';

/**
 * RequestsV2 — Pill Cloud
 *
 * Centered cloud of request pills with flex-wrap layout.
 * Each pill has an optional inline thumbnail and text.
 * Hover activates primary border/text. Alternating text sizes
 * give an organic, varied appearance.
 */
export default function RequestsV2({ data, editable, onDataChange, onCTAClick }: BlockProps<RequestsData>) {
  const update = (patch: Partial<RequestsData>) => onDataChange?.({ ...data, ...patch });

  const allItems = data.rows.flat();
  const sizeClasses = ['text-xs', 'text-sm', 'text-xs', 'text-sm', 'text-xs'];

  return (
    <Section id="requests" className="bg-[var(--color-background,#09090b)]">
      {/* Title */}
      <div className="text-center mb-8 sm:mb-10 md:mb-14">
        <EditableText
          value={data.title || 'С какими запросами приходят'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto"
          />
        )}
      </div>

      {/* Pill cloud */}
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:gap-4 mb-10 sm:mb-14">
        {allItems.map((item, idx) => {
          const sizeClass = sizeClasses[idx % sizeClasses.length];
          return (
            <div
              key={`${item.text}-${idx}`}
              className={`group flex items-center gap-2 bg-zinc-900 border border-zinc-700/50 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 cursor-default transition-all duration-300 hover:border-primary hover:text-primary ${sizeClass}`}
            >
              {item.image && !isPlaceholder(item.image) ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                  loading="lazy"
                />
              ) : (
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-primary transition-colors duration-300 shrink-0" />
              )}
              <span className="text-zinc-300 group-hover:text-primary font-medium whitespace-nowrap transition-colors duration-300">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => onCTAClick?.('quiz')}
          className="w-full sm:w-auto"
        >
          <EditableText
            value={data.buttonText || 'Подобрать программу'}
            onChange={(v) => update({ buttonText: v })}
            editable={editable}
            as="span"
          />
        </Button>
      </div>
    </Section>
  );
}
