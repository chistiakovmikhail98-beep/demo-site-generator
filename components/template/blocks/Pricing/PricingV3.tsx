import React, { useState } from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { PricingData, PricingPlanItem } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';
import Button from '../../Button';

/**
 * PricingV3 — Interactive Tab Selector
 *
 * Single column centered layout. Plan names displayed as selectable pill tabs.
 * The selected plan is rendered in a large card below with name, big price,
 * features in a 2-column grid, "best value" text, and a CTA button.
 */
export default function PricingV3({ data, editable, onDataChange, onCTAClick }: BlockProps<PricingData>) {
  const update = (patch: Partial<PricingData>) => onDataChange?.({ ...data, ...patch });

  const [activeIdx, setActiveIdx] = useState(() => {
    const popIdx = data.plans.findIndex((p) => p.isPopular);
    return popIdx >= 0 ? popIdx : 0;
  });

  const activePlan = data.plans[activeIdx] || data.plans[0];
  if (!activePlan) return null;

  const updatePlan = (id: string, patch: Partial<PricingPlanItem>) => {
    update({
      plans: data.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  return (
    <Section id="pricing" className="bg-[#0c0c0e]">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <EditableText
          value={data.title || 'Выберите абонемент'}
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

      <div className="max-w-3xl mx-auto">
        {/* Tab row */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {data.plans.map((plan, idx) => (
            <button
              key={plan.id}
              onClick={() => setActiveIdx(idx)}
              className={`min-h-[44px] px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                idx === activeIdx
                  ? 'bg-primary text-white shadow-[0_0_20px_-5px_rgba(var(--color-primary-rgb),0.5)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>

        {/* Active plan card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Plan name + popular badge */}
            <div className="flex items-center gap-3 mb-4">
              <EditableText
                value={activePlan.name}
                onChange={(v) => updatePlan(activePlan.id, { name: v })}
                editable={editable}
                as="h3"
                className="text-xl sm:text-2xl font-bold text-white"
              />
              {activePlan.isPopular && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/20 text-primary text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  Хит
                </span>
              )}
            </div>

            {/* Big price */}
            <div className="mb-2">
              <EditableText
                value={activePlan.price}
                onChange={(v) => updatePlan(activePlan.id, { price: v })}
                editable={editable}
                as="span"
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white"
              />
            </div>

            {activePlan.validity && (
              <span className="text-zinc-500 text-sm sm:text-base block mb-6">
                {activePlan.validity}
              </span>
            )}

            {/* Features in 2-col grid */}
            {activePlan.features && activePlan.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
                {activePlan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-zinc-300 text-sm sm:text-base">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Best value text */}
            {activePlan.pricePerClass && (
              <p className="text-zinc-500 text-sm sm:text-base mb-6">
                Стоимость одного занятия — <span className="text-primary font-semibold">{activePlan.pricePerClass}</span>
              </p>
            )}

            {/* CTA */}
            <Button
              size="lg"
              fullWidth
              onClick={() => onCTAClick?.('quiz')}
            >
              Записаться
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
