import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { FAQData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * FAQV2 — Full-Width Accordion
 *
 * Single column centered layout, max-w-3xl. Title centered above.
 * Numbered questions (01, 02...) with ChevronDown that rotates on open.
 * Smooth expand/collapse transitions.
 */
export default function FAQV2({ data, editable, onDataChange }: BlockProps<FAQData>) {
  const update = (patch: Partial<FAQData>) => onDataChange?.({ ...data, ...patch });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <Section id="faq" className="bg-[#0c0c0e]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Вопросы и ответы'}
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

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        {data.items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-colors hover:border-zinc-700"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 text-left min-h-[44px]"
              >
                {/* Number */}
                <span className="text-primary/40 font-black text-lg sm:text-xl shrink-0 w-8 text-center select-none">
                  {pad(idx)}
                </span>

                <EditableText
                  value={item.question}
                  onChange={(v) => {
                    const next = [...data.items];
                    next[idx] = { ...item, question: v };
                    update({ items: next });
                  }}
                  editable={editable}
                  as="span"
                  className="text-sm sm:text-base md:text-lg font-medium text-white flex-1"
                />

                <ChevronDown
                  className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '500px' : '0px',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pl-[calc(1rem+2rem+0.75rem)] sm:pl-[calc(1.25rem+2rem+1rem)] md:pl-[calc(1.5rem+2rem+1rem)]">
                  <EditableText
                    value={item.answer}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[idx] = { ...item, answer: v };
                      update({ items: next });
                    }}
                    editable={editable}
                    as="p"
                    multiline
                    className="text-zinc-400 text-sm sm:text-base leading-relaxed"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
