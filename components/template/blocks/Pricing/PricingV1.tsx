import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { PricingData, PricingPlanItem } from './types';
import EditableText from '../../ui/EditableText';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';
import Button from '../../Button';

/**
 * PricingV1 — Multi-Plan Grid + Premium Card
 *
 * 2+1 layout on lg: left col-span-2 grid of standard plan cards,
 * right col-span-1 premium/popular card highlighted with primary bg.
 * Single column stack on mobile.
 */
export default function PricingV1({ data, editable, onDataChange, onCTAClick }: BlockProps<PricingData>) {
  const update = (patch: Partial<PricingData>) => onDataChange?.({ ...data, ...patch });

  const premiumPlan = data.plans.find((p) => p.isPopular) || data.plans[data.plans.length - 1];
  const standardPlans = data.plans.filter((p) => p !== premiumPlan);

  const updatePlan = (id: string, patch: Partial<PricingPlanItem>) => {
    update({
      plans: data.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  return (
    <Section id="pricing" className="bg-[#0c0c0e]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <EditableText
          value={data.title || 'Абонементы'}
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

      {/* Grid: standard plans (left 2/3) + premium (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Standard plans */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {standardPlans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-white/[0.03] border border-zinc-800 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col hover:border-zinc-600 transition-colors"
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Хит
                </span>
              )}

              <EditableText
                value={plan.name}
                onChange={(v) => updatePlan(plan.id, { name: v })}
                editable={editable}
                as="h3"
                className="text-lg sm:text-xl font-semibold text-white mb-2"
              />

              <div className="flex items-baseline gap-1 mb-1">
                <EditableText
                  value={plan.price}
                  onChange={(v) => updatePlan(plan.id, { price: v })}
                  editable={editable}
                  as="span"
                  className="text-2xl sm:text-3xl font-black text-white"
                />
              </div>

              {plan.validity && (
                <span className="text-zinc-500 text-xs sm:text-sm mb-4">{plan.validity}</span>
              )}

              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2 mt-4 mb-6 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm sm:text-base">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => onCTAClick?.('quiz')}
                className="mt-auto"
              >
                Выбрать
              </Button>
            </div>
          ))}
        </div>

        {/* Premium card */}
        {premiumPlan && (
          <div className="lg:col-span-1 bg-primary rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 blur-[80px] rounded-full pointer-events-none" />

            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider mb-4 self-start">
              <Sparkles className="w-3 h-3" />
              Лучший выбор
            </span>

            <EditableText
              value={premiumPlan.name}
              onChange={(v) => updatePlan(premiumPlan.id, { name: v })}
              editable={editable}
              as="h3"
              className="text-xl sm:text-2xl font-bold text-white mb-3"
            />

            <div className="flex items-baseline gap-1 mb-1">
              <EditableText
                value={premiumPlan.price}
                onChange={(v) => updatePlan(premiumPlan.id, { price: v })}
                editable={editable}
                as="span"
                className="text-3xl sm:text-4xl font-black text-white"
              />
            </div>

            {premiumPlan.validity && (
              <span className="text-white/70 text-xs sm:text-sm mb-5">{premiumPlan.validity}</span>
            )}

            {premiumPlan.features && premiumPlan.features.length > 0 && (
              <ul className="space-y-2 mt-2 mb-6 flex-1">
                {premiumPlan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/90 text-sm sm:text-base">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => onCTAClick?.('quiz')}
              className="mt-auto"
            >
              Записаться
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
