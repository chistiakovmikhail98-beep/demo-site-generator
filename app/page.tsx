'use client';

import React, { useState } from 'react';
import type { Niche } from '@/lib/types';

const NICHES: Array<{ id: Niche; name: string; icon: string; desc: string }> = [
  { id: 'dance', name: 'Танцы', icon: '💃', desc: 'Школы танцев, хореография' },
  { id: 'fitness', name: 'Фитнес', icon: '💪', desc: 'Тренажёры, групповые' },
  { id: 'stretching', name: 'Растяжка', icon: '🧘‍♀️', desc: 'Студии растяжки, шпагат' },
  { id: 'yoga', name: 'Йога', icon: '🕉️', desc: 'Студии йоги, медитация' },
  { id: 'wellness', name: 'Велнес', icon: '🌿', desc: 'ЛФК, пилатес, здоровье' },
];

export default function LandingPage() {
  const [niche, setNiche] = useState<Niche | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = niche && name.trim().length >= 2 && city.trim().length >= 2;

  const handleCreate = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/builder/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, name: name.trim(), city: city.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка создания');
      }

      const { slug } = await res.json();
      window.location.href = `https://${slug}.fitwebai.ru`;
    } catch (err: any) {
      setError(err.message || 'Что-то пошло не так');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-sm font-black tracking-tight">F</div>
          <span className="text-sm font-bold tracking-tight">FitWebAI</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Сайт для вашей студии
            <br />
            <span className="text-violet-400">за 10 секунд</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
            Выберите нишу, введите название — получите готовый сайт с дизайном, квизом и формой записи
          </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
          {/* Niche picker */}
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
            1. Выберите направление
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {NICHES.map((n) => (
              <button
                key={n.id}
                onClick={() => setNiche(n.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  niche === n.id
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <div className="text-xl mb-1">{n.icon}</div>
                <div className="text-xs font-bold">{n.name}</div>
                <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">{n.desc}</div>
              </button>
            ))}
          </div>

          {/* Name + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                2. Название студии
              </label>
              <input
                type="text"
                placeholder="Студия Энерджи"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                3. Город
              </label>
              <input
                type="text"
                placeholder="Москва"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!canSubmit || loading}
            className="w-full py-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Создаём сайт...
              </>
            ) : (
              'Создать сайт бесплатно'
            )}
          </button>

          <p className="text-[10px] text-zinc-600 text-center mt-3">
            Бесплатно. Без регистрации. Сайт будет готов через 10 секунд.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {[
            { title: 'Готовый дизайн', desc: 'Премиум-шаблон с 13 блоками, анимациями и тёмной темой' },
            { title: 'Квиз + заявки', desc: 'Встроенный квиз и формы записи — лиды сразу к вам' },
            { title: 'Редактируется', desc: 'Админка с визуальным редактором — меняйте всё без кода' },
          ].map((f, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
