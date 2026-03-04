'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StepTimeline from '@/components/StepTimeline';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'studio-energy';
  const plan = searchParams.get('plan') || 'business';
  const planName = plan === 'managed' ? 'Через нас' : plan === 'monthly' ? 'Месяц' : plan === 'yearly' ? 'Год' : 'Сам';

  const siteUrl = `${slug}.fitwebai.ru`;
  const adminUrl = `https://${siteUrl}?admin`;

  // Try to get password from builder store (localStorage)
  let password = 'SE-2026-xK7m9p';
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('fitwebai-builder') || '{}');
      if (stored?.state?.createdPassword) {
        password = stored.state.createdPassword;
      }
    } catch { /* ignore */ }
  }

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-black">F</div>
          <span className="text-sm font-bold tracking-tight">FitWebAI — Готово!</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepTimeline currentStep={4} />

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/20 animate-in zoom-in">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Оплата прошла!</h1>
          <p className="text-zinc-400 text-sm">
            Тариф "{planName}" активирован. Ваш сайт уже работает.
          </p>
        </div>

        {/* Credentials card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-5">Данные для входа</h2>

          {/* Site URL */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Адрес сайта
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm font-mono text-violet-400">
                {siteUrl}
              </div>
              <button
                onClick={() => copyToClipboard(`https://${siteUrl}`, 'url')}
                className="shrink-0 h-11 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
              >
                {copiedField === 'url' ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Пароль для админки
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm font-mono text-emerald-400">
                {password}
              </div>
              <button
                onClick={() => copyToClipboard(password, 'password')}
                className="shrink-0 h-11 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
              >
                {copiedField === 'password' ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Admin link */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Вход в админку
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm font-mono text-zinc-300 truncate">
                {siteUrl}?admin
              </div>
              <button
                onClick={() => copyToClipboard(`https://${siteUrl}?admin`, 'admin')}
                className="shrink-0 h-11 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
              >
                {copiedField === 'admin' ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-5">Как начать</h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold mb-0.5">Войдите в админку</p>
                <p className="text-xs text-zinc-400">Откройте сайт, нажмите кнопку редактирования (карандаш внизу справа) и введите пароль</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div>
                <p className="text-sm font-semibold mb-0.5">Отредактируйте контент</p>
                <p className="text-xs text-zinc-400">Нажимайте на любой текст или фото для редактирования. Используйте панель справа для управления блоками, темой и контактами</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div>
                <p className="text-sm font-semibold mb-0.5">Опубликуйте</p>
                <p className="text-xs text-zinc-400">Нажмите "Опубликовать" — изменения появятся на сайте мгновенно. Заявки с квиза и формы будут во вкладке "Заявки"</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40"
          >
            Войти в админку
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-xs text-zinc-600">
            Данные для входа также отправлены на ваш email и в Telegram
          </p>
        </div>
      </div>
    </div>
  );
}
