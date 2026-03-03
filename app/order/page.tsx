'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StepTimeline from '@/components/StepTimeline';

const PLANS = [
  {
    id: 'start',
    name: 'Старт',
    price: '4 900',
    period: 'разово',
    features: [
      'Готовый сайт на субдомене',
      'Админ-панель для редактирования',
      'Квиз с лидогенерацией',
      'Форма записи в футере',
      'Адаптивный дизайн (мобилки)',
      'SSL-сертификат',
    ],
    highlighted: false,
  },
  {
    id: 'business',
    name: 'Бизнес',
    price: '9 900',
    period: 'разово',
    features: [
      'Всё из тарифа "Старт"',
      'AI чат-бот на сайте',
      'SEO-оптимизация',
      'Подключение своего домена',
      'Интеграция с CRM',
      'Приоритетная поддержка',
    ],
    highlighted: true,
  },
];

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <OrderPageContent />
    </Suspense>
  );
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug') || 'studio-energy';
  const brandName = 'Studio Energy';

  const [selectedPlan, setSelectedPlan] = useState('business');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    router.push(`/order/success?slug=${slug}&plan=${selectedPlan}`);
  };

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-black">F</div>
          <span className="text-sm font-bold tracking-tight">FitWebAI — Оформление</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <StepTimeline currentStep={3} />

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Оформление заказа</h1>
          <p className="text-zinc-400 text-sm">
            Сайт для <span className="text-violet-400 font-semibold">{brandName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Plans */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Выберите тариф</h2>

            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-violet-500 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{plan.name}</span>
                      {plan.highlighted && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-bold rounded-full uppercase">
                          Популярный
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{plan.price} <span className="text-sm font-normal text-zinc-400">₽</span></div>
                    <div className="text-[10px] text-zinc-500">{plan.period}</div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <path
                          d="M3 8L7 12L13 4"
                          stroke={selectedPlan === plan.id ? '#8b5cf6' : '#52525b'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Radio indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-violet-500' : 'border-zinc-700'
                  }`}>
                    {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                  </div>
                  <span className={`text-xs font-medium ${
                    selectedPlan === plan.id ? 'text-violet-400' : 'text-zinc-500'
                  }`}>
                    {selectedPlan === plan.id ? 'Выбран' : 'Выбрать'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Payment form */}
          <div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Данные для оплаты</h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                    Имя
                  </label>
                  <input
                    type="text"
                    placeholder="Как к вам обращаться"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="для отправки доступов"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                {/* Order summary */}
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-zinc-400">Тариф "{currentPlan.name}"</span>
                    <span className="text-sm font-bold">{currentPlan.price} ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 mb-3">
                    <span>Сайт: {slug}.fitwebai.ru</span>
                    <span>{currentPlan.period}</span>
                  </div>
                  <div className="h-px bg-zinc-700 mb-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Итого</span>
                    <span className="text-xl font-black text-violet-400">{currentPlan.price} ₽</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || !form.name || !form.phone}
                  className="w-full py-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Обработка платежа...
                    </>
                  ) : (
                    <>
                      <LockIcon />
                      Оплатить {currentPlan.price} ₽
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <span className="text-[10px] text-zinc-600">Безопасная оплата</span>
                  <div className="flex gap-2 text-zinc-600">
                    <CardIcon />
                    <CardIcon2 />
                  </div>
                </div>
              </form>
            </div>

            {/* Guarantee */}
            <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                <path d="M10 2L3 5V10C3 14.5 6 17.5 10 19C14 17.5 17 14.5 17 10V5L10 2Z" stroke="#10b981" strokeWidth="1.5" />
                <path d="M7 10L9 12L13 8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-xs font-bold text-emerald-400 mb-0.5">7 дней бесплатно</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Попробуйте сайт и админку. Не понравится — вернём деньги без вопросов.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="24" height="16" viewBox="0 0 32 22" fill="none">
      <rect x="0.5" y="0.5" width="31" height="21" rx="3.5" stroke="currentColor" />
      <rect x="0" y="5" width="32" height="4" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function CardIcon2() {
  return (
    <svg width="24" height="16" viewBox="0 0 32 22" fill="none">
      <rect x="0.5" y="0.5" width="31" height="21" rx="3.5" stroke="currentColor" />
      <circle cx="12" cy="11" r="5" fill="currentColor" opacity="0.2" />
      <circle cx="20" cy="11" r="5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
