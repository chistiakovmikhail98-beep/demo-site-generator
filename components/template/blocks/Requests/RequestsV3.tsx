import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { RequestsData } from './types';
import EditableText from '../../ui/EditableText';
import { isPlaceholder } from '../../PlaceholderImg';
import Section from '../../Section';
import Button from '../../Button';

/**
 * RequestsV3 — Grid with Icons
 *
 * Responsive grid of request cards. Each card has a centered thumbnail
 * (or fallback icon) and text below. Hover lifts the card with a
 * background transition. Clean, structured layout.
 */
export default function RequestsV3({ data, editable, onDataChange, onCTAClick }: BlockProps<RequestsData>) {
  const update = (patch: Partial<RequestsData>) => onDataChange?.({ ...data, ...patch });

  const allItems = data.rows.flat();

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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
        {allItems.map((item, idx) => (
          <div
            key={`${item.text}-${idx}`}
            className="group bg-zinc-900 border border-zinc-700/50 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center cursor-default transition-all duration-300 hover:bg-zinc-800"
          >
            {item.image && !isPlaceholder(item.image) ? (
              <img
                src={item.image}
                alt=""
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mb-3 border-2 border-zinc-700 group-hover:border-primary transition-colors duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-800 group-hover:bg-primary/10 border-2 border-zinc-700 group-hover:border-primary flex items-center justify-center mb-3 transition-all duration-300">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 group-hover:text-primary transition-colors duration-300" />
              </div>
            )}
            <span className="text-zinc-300 group-hover:text-white text-xs sm:text-sm font-medium leading-snug transition-colors duration-300">
              {item.text}
            </span>
          </div>
        ))}
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
