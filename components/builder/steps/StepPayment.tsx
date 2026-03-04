'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/lib/builder/store';

const PLANS = [
  {
    id: 'monthly',
    name: 'Месяц',
    price: '3 000 ₽',
    priceNum: 3000,
    period: '/мес',
    features: ['Сайт на субдомене', 'Админ-панель', 'SSL-сертификат', 'Мобильная версия', 'Заявки в Telegram'],
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Год',
    price: '30 000 ₽',
    priceNum: 30000,
    period: '/год',
    features: ['Всё из месячного', 'Скидка 17%', 'Приоритетная поддержка', 'Свой домен (скоро)'],
    popular: true,
    badge: 'Выгодно',
  },
];

export default function StepPayment() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studioInfo = useBuilderStore(s => s.studioInfo);
  const regEmail = useBuilderStore(s => s.regEmail);
  const createdProjectSlug = useBuilderStore(s => s.createdProjectSlug);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // First create the project if not created yet
      let slug = createdProjectSlug;
      if (!slug) {
        const state = useBuilderStore.getState();
        const res = await fetch('/api/builder/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Ошибка создания' }));
          throw new Error(err.error || 'Ошибка создания проекта');
        }
        const data = await res.json();
        slug = data.slug;
        useBuilderStore.getState().setCreatedProject(data.slug, data.password);
      }

      // Create payment
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          plan: selectedPlan,
          email: regEmail,
        }),
      });

      if (!payRes.ok) {
        const err = await payRes.json().catch(() => ({ error: 'Ошибка оплаты' }));
        throw new Error(err.error || 'Ошибка создания платежа');
      }

      const payData = await payRes.json();
      if (payData.confirmationUrl) {
        window.location.href = payData.confirmationUrl;
      } else {
        // Demo mode — redirect to success
        window.location.href = `/order/success?slug=${slug}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Оплата</h1>
        <p className="text-zinc-400">
          Выберите тарифный план для <strong className="text-white">{studioInfo.name || 'вашего сайта'}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative rounded-2xl border p-6 text-left transition-all
                ${isSelected
                  ? 'border-rose-500/50 bg-rose-500/5 shadow-lg shadow-rose-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }
              `}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className={`
          mt-6 w-full rounded-xl bg-rose-500 px-6 py-4 text-lg font-bold text-white
          transition-all hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        {loading ? 'Обработка...' : `Оплатить ${PLANS.find(p => p.id === selectedPlan)?.price}`}
      </button>

      <p className="mt-3 text-center text-xs text-zinc-600">
        Безопасная оплата через ЮKassa. Автопродление можно отключить в любой момент.
      </p>
    </div>
  );
}
