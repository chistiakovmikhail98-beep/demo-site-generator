import React from 'react';
import { MessageCircleQuestion, CheckCircle2 } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ObjectionsData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * ObjectionsV1 — Myth/Answer Cards
 *
 * Responsive grid: 1 col mobile, 3 cols on md+. Each card shows a myth
 * (italic, muted) with a question icon, a gradient divider, and the
 * answer (brighter, medium weight) with a checkmark icon.
 */
export default function ObjectionsV1({ data, editable, onDataChange }: BlockProps<ObjectionsData>) {
  const update = (patch: Partial<ObjectionsData>) => onDataChange?.({ ...data, ...patch });

  return (
    <Section id="objections" className="bg-[var(--color-background,#09090b)]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Мифы и реальность'}
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data.pairs.map((pair, idx) => (
          <div
            key={idx}
            className="bg-[#18181b] border border-zinc-700/50 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col hover:border-zinc-700 transition-colors"
          >
            {/* Myth */}
            <div className="flex items-start gap-3 mb-4 sm:mb-5">
              <MessageCircleQuestion className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <EditableText
                value={pair.myth}
                onChange={(v) => {
                  const next = [...data.pairs];
                  next[idx] = { ...pair, myth: v };
                  update({ pairs: next });
                }}
                editable={editable}
                as="p"
                multiline
                className="text-zinc-300 text-sm sm:text-base italic leading-relaxed"
              />
            </div>

            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-4 sm:mb-5" />

            {/* Answer */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
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
                className="text-zinc-200 text-sm sm:text-base font-medium leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
