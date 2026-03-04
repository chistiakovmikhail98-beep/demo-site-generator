import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { FAQData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * FAQV3 — Chat-Style Q&A
 *
 * Dark bg, max-w-2xl centered. Questions as "user" message bubbles
 * (right-aligned, primary bg) and answers as "bot" message bubbles
 * (left-aligned, zinc-900 bg with avatar). Click a question to toggle
 * answer visibility.
 */
export default function FAQV3({ data, editable, onDataChange }: BlockProps<FAQData>) {
  const update = (patch: Partial<FAQData>) => onDataChange?.({ ...data, ...patch });
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <Section id="faq" className="bg-[var(--color-background,#09090b)]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Есть вопросы?'}
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
            className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
          />
        )}
      </div>

      {/* Chat bubbles */}
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
        {data.items.map((item, idx) => {
          const isOpen = openSet.has(idx);
          return (
            <div key={idx} className="space-y-2 sm:space-y-3">
              {/* Question — user bubble (right) */}
              <div className="flex justify-end">
                <button
                  onClick={() => toggle(idx)}
                  className="max-w-[85%] sm:max-w-[75%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 sm:py-4 text-left min-h-[44px] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  <EditableText
                    value={item.question}
                    onChange={(v) => {
                      const next = [...data.items];
                      next[idx] = { ...item, question: v };
                      update({ items: next });
                    }}
                    editable={editable}
                    as="span"
                    className="text-sm sm:text-base font-medium leading-snug"
                  />
                </button>
              </div>

              {/* Answer — bot bubble (left) */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '500px' : '0px',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Bot avatar */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>

                  <div className="max-w-[85%] sm:max-w-[75%] bg-zinc-900 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4">
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
                      className="text-zinc-300 text-sm sm:text-base leading-relaxed"
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
