import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { ObjectionsData } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';

/**
 * ObjectionsV2 — Before/After Toggle
 *
 * Single column cards centered (max-w-2xl). Each card has a "myth" side
 * (red-tinted, X icon) and an "answer" side (green-tinted, Check icon).
 * Click to flip between them with a smooth opacity transition.
 */
export default function ObjectionsV2({ data, editable, onDataChange }: BlockProps<ObjectionsData>) {
  const update = (patch: Partial<ObjectionsData>) => onDataChange?.({ ...data, ...patch });
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setFlippedSet((prev) => {
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
    <Section id="objections" className="bg-[var(--color-background,#0c0c0e)]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Развеиваем мифы'}
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

      {/* Cards */}
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
        {data.pairs.map((pair, idx) => {
          const isFlipped = flippedSet.has(idx);
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className="w-full text-left min-h-[44px] relative rounded-2xl overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Myth side */}
              <div
                className={`p-5 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300 ${
                  isFlipped
                    ? 'opacity-0 absolute inset-0 pointer-events-none'
                    : 'opacity-100 relative'
                } bg-red-950/20 border-red-900/30`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-red-400/60 font-bold mb-1 block">
                      Миф
                    </span>
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
                      className="text-zinc-200 text-sm sm:text-base md:text-lg leading-relaxed"
                    />
                  </div>
                </div>
                <p className="text-zinc-600 text-xs sm:text-sm mt-3 text-right">
                  Нажмите, чтобы узнать правду
                </p>
              </div>

              {/* Answer side */}
              <div
                className={`p-5 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300 ${
                  isFlipped
                    ? 'opacity-100 relative'
                    : 'opacity-0 absolute inset-0 pointer-events-none'
                } bg-emerald-950/20 border-emerald-900/30`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-emerald-400/60 font-bold mb-1 block">
                      Правда
                    </span>
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
                      className="text-zinc-200 text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                    />
                  </div>
                </div>
                <p className="text-zinc-600 text-xs sm:text-sm mt-3 text-right">
                  Нажмите, чтобы вернуться
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
