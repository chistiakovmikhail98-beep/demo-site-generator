import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { FAQData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * FAQV1 — Sidebar + Accordion
 *
 * Two-column on md+: title/subtitle sticky on the left (col-span-4),
 * accordion items on the right (col-span-8). Full-width stack on mobile.
 * Cards use bg-[#121215] with border, expand with smooth max-h transition.
 */
export default function FAQV1({ data, editable, onDataChange }: BlockProps<FAQData>) {
  const update = (patch: Partial<FAQData>) => onDataChange?.({ ...data, ...patch });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <Section id="faq" className="bg-[#0c0c0e]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16">
        {/* Left: title sidebar */}
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <EditableText
              value={data.title || 'Частые вопросы'}
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
                className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Right: accordion */}
        <div className="md:col-span-8 space-y-3 sm:space-y-4">
          {data.items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden transition-colors hover:border-zinc-700"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left min-h-[44px]"
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
                    className="text-sm sm:text-base md:text-lg font-medium text-white flex-1"
                  />
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 transition-colors group-hover:bg-zinc-700">
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4 text-zinc-400" />
                    )}
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '2000px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
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
      </div>
    </Section>
  );
}
