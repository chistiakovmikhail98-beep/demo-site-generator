import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { RequestsData } from './types';
import EditableText from '../../ui/EditableText';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * RequestsV1 — Marquee Rows
 *
 * Full-width layout (no Section wrapper) with 3 rows of marquee-scrolling pills.
 * Row 2 scrolls in reverse direction. Each pill shows an optional thumbnail and text.
 * Triple duplication ensures seamless infinite scroll on any screen width.
 */
export default function RequestsV1({ data, editable, onDataChange, onCTAClick }: BlockProps<RequestsData>) {
  const update = (patch: Partial<RequestsData>) => onDataChange?.({ ...data, ...patch });

  const allItems = data.rows.flat();
  const third = Math.ceil(allItems.length / 3);
  const row1 = allItems.slice(0, third);
  const row2 = allItems.slice(third, third * 2);
  const row3 = allItems.slice(third * 2);

  return (
    <section className="relative bg-[var(--color-background,#0c0c0e)] py-12 sm:py-16 md:py-24 overflow-hidden">
      <style>{`
        @keyframes requests-v1-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes requests-v1-marquee-reverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0%); }
        }
        .requests-v1-scroll {
          animation: requests-v1-marquee 60s linear infinite;
          will-change: transform;
        }
        .requests-v1-scroll-reverse {
          animation: requests-v1-marquee-reverse 60s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 md:mb-16 text-center">
        <EditableText
          value={data.title || 'С какими запросами приходят в студию'}
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
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-xl mx-auto"
          />
        )}
      </div>

      {/* Marquee rows */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 mb-10 sm:mb-14 md:mb-16">
        {[row1, row2, row3].map((row, rowIdx) => (
          <div key={rowIdx} className="flex overflow-hidden py-1 sm:py-2">
            <div className={`flex gap-3 sm:gap-4 md:gap-6 px-1.5 sm:px-3 w-max ${rowIdx === 1 ? 'requests-v1-scroll-reverse' : 'requests-v1-scroll'}`}>
              {/* Triple duplication for seamless infinite scroll */}
              {[...row, ...row, ...row].map((item, idx) => (
                <div
                  key={`${item.text}-${idx}`}
                  className="flex items-center gap-2 sm:gap-3 bg-zinc-800/80 border border-zinc-700/50 rounded-full py-3 px-4 sm:px-5 shadow-lg hover:scale-105 transition-transform duration-300 shrink-0"
                >
                  {isPlaceholder(item.image) ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-zinc-700 shrink-0 flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt=""
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-zinc-700 shrink-0"
                      loading="lazy"
                    />
                  )}
                  <span className="text-zinc-200 font-bold whitespace-nowrap text-xs sm:text-sm">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center px-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onCTAClick?.('quiz')}
          className="w-full sm:w-auto font-bold px-8 sm:px-10"
        >
          <EditableText
            value={data.buttonText || 'Подобрать программу'}
            onChange={(v) => update({ buttonText: v })}
            editable={editable}
            as="span"
          />
        </Button>
      </div>
    </section>
  );
}
