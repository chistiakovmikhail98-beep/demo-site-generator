import React from 'react';
import Section from './Section';
import Button from './Button';
import { Star, Check, Activity } from 'lucide-react';
import { PRICING, BRAND_CONFIG } from '../constants';

const Pricing: React.FC = () => {
  // Находим выделенный тариф
  const highlightedPlan = PRICING.find(p => p.highlighted);
  // Остальные тарифы
  const regularPlans = PRICING.filter(p => !p.highlighted);

  return (
    <Section id="pricing" className="bg-zinc-50">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tight">
          Инвестиция в <span className="text-primary italic">здоровье</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* Основные тарифы */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
             <div className="flex items-center gap-3 mb-6 border-b border-zinc-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="text-primary w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Тарифы {BRAND_CONFIG.name}</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularPlans.slice(0, 4).map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-50 rounded-2xl flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-800 font-bold">{plan.name}</span>
                      <span className="text-zinc-900 font-black">{plan.price}</span>
                    </div>
                    {plan.period && (
                      <span className="text-zinc-500 text-xs mb-2">{plan.period}</span>
                    )}
                    {plan.features.length > 0 && (
                      <ul className="text-xs text-zinc-500 space-y-1">
                        {plan.features.slice(0, 2).map((f, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
             </div>
          </div>

          {/* Дополнительные тарифы (если есть больше 4) */}
          {regularPlans.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularPlans.slice(4).map((plan, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
                  <h3 className="text-lg font-bold text-zinc-900 mb-4 uppercase tracking-tight">{plan.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-black text-zinc-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-zinc-500 text-sm">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Выделенный тариф (если есть) */}
        {highlightedPlan ? (
          <div className="bg-primary rounded-[2rem] p-8 md:p-10 flex flex-col justify-between shadow-xl shadow-primary/20 text-white min-h-[400px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
                 <Activity className="w-5 h-5 text-white" />
                 <span className="text-xs font-bold uppercase tracking-widest">Лучший выбор</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 leading-tight uppercase italic tracking-tighter">{highlightedPlan.name}</h3>
              <div className="mb-6">
                <span className="text-white font-black text-4xl">{highlightedPlan.price}</span>
                {highlightedPlan.period && (
                  <span className="text-red-200 text-lg ml-2">{highlightedPlan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {highlightedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-red-100">
                    <Check className="w-5 h-5 text-white shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="relative z-10 bg-white !text-primary hover:bg-zinc-100 shadow-2xl w-full rounded-full font-bold text-lg h-14"
              onClick={() => window.location.href='#footer'}
            >
              Записаться
            </Button>
          </div>
        ) : (
          // Fallback если нет выделенного тарифа
          <div className="bg-primary rounded-[2rem] p-8 md:p-10 flex flex-col justify-between shadow-xl shadow-primary/20 text-white min-h-[400px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
                 <Activity className="w-5 h-5 text-white" />
                 <span className="text-xs font-bold uppercase tracking-widest">Пробное занятие</span>
              </div>
              <h3 className="text-3xl font-bold mb-6 leading-tight uppercase italic tracking-tighter">Начните сегодня</h3>
              <p className="text-red-100 opacity-95 leading-relaxed mb-8 text-lg font-medium">
                Запишитесь на первое занятие и почувствуйте разницу уже после первого визита.
              </p>
            </div>

            <Button
              className="relative z-10 bg-white !text-primary hover:bg-zinc-100 shadow-2xl w-full rounded-full font-bold text-lg h-14"
              onClick={() => window.location.href='#footer'}
            >
              Записаться на занятие
            </Button>
          </div>
        )}

      </div>
    </Section>
  );
};

export default Pricing;
