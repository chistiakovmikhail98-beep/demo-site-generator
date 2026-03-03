'use client';

import React from 'react';
import Link from 'next/link';
import StepTimeline from '@/components/StepTimeline';

export default function SimPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-black">F</div>
          <span className="text-sm font-bold tracking-tight">FitWebAI — Симуляция клиентского пути</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <StepTimeline currentStep={0} />

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Шаг 1: VK-рассылка</h1>
          <p className="text-zinc-400 text-sm">Владелец студии получает сообщение в ВК с готовым демо-сайтом</p>
        </div>

        {/* VK Message mockup */}
        <div className="max-w-md mx-auto">
          {/* VK Chat header */}
          <div className="bg-[#222222] rounded-t-2xl px-4 py-3 flex items-center gap-3 border border-zinc-800 border-b-0">
            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center font-bold text-sm">FW</div>
            <div>
              <div className="text-sm font-semibold">FitWebAI</div>
              <div className="text-[10px] text-zinc-500">был(а) в сети 2 мин. назад</div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-[#191919] px-4 py-6 space-y-4 border-x border-zinc-800 min-h-[420px]">
            {/* Message 1 — Text */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">FW</div>
              <div className="bg-[#2d2d2e] rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                <p className="text-[13px] leading-relaxed">
                  Здравствуйте! Мы в FitWebAI создаём сайты для фитнес-студий на основе данных из вашей группы ВК.
                </p>
                <p className="text-[13px] leading-relaxed mt-2">
                  Посмотрите, что получилось для <span className="font-bold text-violet-400">Studio Energy</span> — это готовый демо-сайт с вашими фото и текстами:
                </p>
              </div>
            </div>

            {/* Message 2 — Card preview */}
            <div className="flex gap-2">
              <div className="w-7 shrink-0" /> {/* Spacer for avatar */}
              <div className="bg-[#2d2d2e] rounded-2xl rounded-tl-md overflow-hidden max-w-[85%]">
                {/* Preview card */}
                <div className="bg-gradient-to-br from-violet-600/30 via-zinc-900 to-pink-600/20 p-6 text-center">
                  <div className="text-3xl font-black tracking-tighter mb-1">Studio Energy</div>
                  <div className="text-xs text-zinc-400 mb-3">Танцуй. Чувствуй. Живи.</div>
                  <div className="flex justify-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">8 направлений</span>
                    <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full">12 тренеров</span>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-zinc-800">
                  <div className="text-[11px] text-zinc-500 mb-1">studio-energy.fitwebai.ru</div>
                  <div className="text-sm font-semibold">Демо-сайт для вашей студии</div>
                </div>
              </div>
            </div>

            {/* Message 3 — CTA */}
            <div className="flex gap-2">
              <div className="w-7 shrink-0" />
              <div className="bg-[#2d2d2e] rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                <p className="text-[13px] leading-relaxed">
                  Нравится? Мы можем запустить его за 24 часа. Первые 7 дней — бесплатно!
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center">
              <span className="text-[10px] text-zinc-600">сегодня в 14:32</span>
            </div>
          </div>

          {/* VK Input bar */}
          <div className="bg-[#222222] rounded-b-2xl px-4 py-3 flex items-center gap-3 border border-zinc-800 border-t-0">
            <div className="flex-1 bg-[#2d2d2e] rounded-full px-4 py-2 text-sm text-zinc-600">
              Написать сообщение...
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-zinc-400 text-sm mb-4">Клиент нажимает на карточку и попадает на сайт:</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40"
          >
            Открыть демо-сайт
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
