import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { PricingData, PricingPlanItem } from './types';
import EditableText from '../../ui/EditableText';
import Section from '../../Section';
import Button from '../../Button';

/**
 * PricingV2 — 3-Card Columns
 *
 * Responsive grid: 1 col mobile, 2 col sm, 3 col lg.
 * Dark cards with border. Featured/popular card uses primary bg.
 * Each card: name, price, features list with Check icons, full-width button.
 */
export default function PricingV2({ data, editable, onDataChange, onCTAClick }: BlockProps<PricingData>) {
  const update = (patch: Partial<PricingData>) => onDataChange?.({ ...data, ...patch });

  const updatePlan = (id: string, patch: Partial<PricingPlanItem>) => {
    update({
      plans: data.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  return (
    <Section id="pricing" className="bg-[var(--color-background,#0c0c0e)]">
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
            className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
          />
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {data.plans.map((plan) => {
          const isFeatured = plan.isPopular;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col transition-all duration-300 ${
                isFeatured
                  ? 'bg-gradient-to-br from-primary to-accent text-zinc-900 shadow-[0_0_40px_-10px_rgba(var(--color-primary-rgb),0.4)] scale-[1.02]'
                  : 'bg-zinc-900 border border-zinc-700/50 shadow-lg shadow-black/20 hover:border-zinc-600 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300'
              }`}
            >
              {/* Popular badge */}
              {isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-white text-zinc-900 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  Популярный
                </span>
              )}

              {/* Name */}
              <EditableText
                value={plan.name}
                onChange={(v) => updatePlan(plan.id, { name: v })}
                editable={editable}
                as="h3"
                className={`text-lg sm:text-xl font-semibold mb-3 ${
                  isFeatured ? 'text-zinc-900' : 'text-white'
                }`}
              />

              {/* Price */}
              <div className="mb-1">
                <EditableText
                  value={plan.price}
                  onChange={(v) => updatePlan(plan.id, { price: v })}
                  editable={editable}
                  as="span"
                  className={`text-3xl sm:text-4xl font-black ${
                    isFeatured ? 'text-zinc-900' : 'text-white'
                  }`}
                />
              </div>

              {plan.validity && (
                <span className={`text-xs sm:text-sm mb-5 ${isFeatured ? 'text-zinc-900/60' : 'text-zinc-400'}`}>
                  {plan.validity}
                </span>
              )}

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2.5 mt-3 mb-6 flex-1">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm sm:text-base ${
                        isFeatured ? 'text-zinc-900/80' : 'text-zinc-300'
                      }`}
                    >
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isFeatured ? 'text-zinc-900' : 'text-primary'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <Button
                variant={isFeatured ? 'secondary' : 'primary'}
                size="md"
                fullWidth
                onClick={() => onCTAClick?.('quiz')}
                className="mt-auto"
              >
                Выбрать
              </Button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
