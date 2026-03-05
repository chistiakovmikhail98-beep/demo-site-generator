import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ObjectionsData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * ObjectionsV3 — Accordion Style
 *
 * Single column full width. Each myth/answer pair as an expandable row.
 * The myth is always shown; click to reveal the answer. Number badge
 * (01, 02...) on the left, arrow rotates on expand.
 */
export default function ObjectionsV3({ data, editable, onDataChange }: BlockProps<ObjectionsData>) {
  const update = (patch: Partial<ObjectionsData>) => onDataChange?.({ ...data, ...patch });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <Section id="objections" className="bg-[#0c0c0e]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Частые сомнения'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
          />
        )}
      </div>

      {/* Accordion rows */}
      <div className="space-y-2 sm:space-y-3">
        {data.pairs.map((pair, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-200 ${
                isOpen ? 'border border-zinc-700' : 'border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 text-left min-h-[44px]"
              >
                {/* Number badge */}
                <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold transition-colors duration-200 ${
                  isOpen
                    ? 'bg-primary text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {pad(idx)}
                </span>

                {/* Myth text */}
                <EditableText
                  value={pair.myth}
                  onChange={(v) => {
                    const next = [...data.pairs];
                    next[idx] = { ...pair, myth: v };
                    update({ pairs: next });
                  }}
                  editable={editable}
                  as="span"
                  className="text-sm sm:text-base md:text-lg font-medium text-white flex-1"
                />

                {/* Arrow */}
                <ChevronRight
                  className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-90 text-primary' : ''
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '500px' : '0px',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pl-[calc(1rem+2rem+0.75rem)] sm:pl-[calc(1.25rem+2.5rem+1rem)] md:pl-[calc(1.5rem+2.5rem+1rem)]">
                  <div className="border-l-2 border-primary/30 pl-4 sm:pl-5">
                    <EditableText
                      value={pair.answer}
                      onChange={(v) => {
                        const next = [...data.pairs];
                        next[idx] = { ...pair, answer: v };
                        update({ pairs: next });
                      }}
                      editable={editable}
                      as="p"
                      multiline
                      className="text-zinc-400 text-sm sm:text-base leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
