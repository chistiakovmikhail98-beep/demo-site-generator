'use client';

import { useBuilderStore } from '@/lib/builder/store';

export default function StepRegister() {
  const regEmail = useBuilderStore(s => s.regEmail);
  const regPhone = useBuilderStore(s => s.regPhone);
  const studioPhone = useBuilderStore(s => s.studioInfo.phone);
  const setRegEmail = useBuilderStore(s => s.setRegEmail);
  const setRegPhone = useBuilderStore(s => s.setRegPhone);

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Регистрация</h1>
        <p className="text-zinc-400">Для доступа в админ-панель вашего сайта</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-rose-500/50"
            />
            <p className="mt-1 text-xs text-zinc-600">На этот email отправим данные для входа</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Телефон <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={regPhone || studioPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-rose-500/50"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Что вы получите:</h3>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Сайт на субдомене: вашастудия.fitwebai.ru
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Админ-панель для редактирования текстов и фото
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Приём заявок с уведомлениями в Telegram
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              SSL-сертификат и мобильная версия
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
