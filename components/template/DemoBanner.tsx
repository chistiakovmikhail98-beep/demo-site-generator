'use client';

import React, { useState } from 'react';
import { Send, X, CheckCircle } from 'lucide-react';

interface DemoBannerProps {
  brandName?: string;
  phone?: string;
  slug?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ brandName = '', phone = '', slug }) => {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', messenger: 'telegram' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          messenger: formData.messenger,
          studio_name: brandName,
          studio_phone: phone,
          source_url: window.location.href,
        }),
      });

      setFormSubmitted(true);
    } catch (err) {
      console.error('Ошибка отправки заявки:', err);
      // Show success anyway so user can proceed to order
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-primary/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-wider">
                Демо
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-tight truncate max-w-[40vw] sm:max-w-[200px] md:max-w-none">
              {brandName}
            </span>

            <button
              onClick={() => setShowForm(true)}
              className="ml-2 px-3 py-1 bg-primary hover:bg-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Заказать сайт</span>
              <span className="sm:hidden">Заявка</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
              <span className="text-[10px] text-zinc-400 font-medium">
                FitWebAI
              </span>
            </div>
          </div>

          <div className="text-[9px] text-zinc-500 text-center md:ml-4 md:pl-4 md:border-l md:border-white/10">
            Фото и тексты взяты из вашей группы ВК — это пример, финальный контент может отличаться
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => { setShowForm(false); setFormSubmitted(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Спасибо за заявку!</h3>
                <p className="text-zinc-400 mb-4">Хотите получить сайт прямо сейчас? Оформите за 2 минуты:</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={`/order?slug=${encodeURIComponent(slug || brandName.toLowerCase().replace(/\s+/g, '-'))}&brand=${encodeURIComponent(brandName)}`}
                    className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                  >
                    Перейти к оформлению &rarr;
                  </a>
                  <button
                    onClick={() => { setShowForm(false); setFormSubmitted(false); }}
                    className="px-6 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Хотите такой же сайт?
                </h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Оставьте заявку — мы создадим уникальный сайт для вашей студии
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-zinc-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="+7 (900) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let body = digits;
                      if (digits.length > 0 && ['7', '8'].includes(digits[0])) body = digits.slice(1);
                      body = body.slice(0, 10);
                      let formatted = '+7';
                      if (body.length > 0) formatted += ` (${body.slice(0, 3)}`;
                      if (body.length >= 3) formatted += `) ${body.slice(3, 6)}`;
                      if (body.length >= 6) formatted += `-${body.slice(6, 8)}`;
                      if (body.length >= 8) formatted += `-${body.slice(8, 10)}`;
                      setFormData(prev => ({ ...prev, phone: formatted }));
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-zinc-500"
                    required
                  />

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm">
                      <input type="radio" name="messenger" checked={formData.messenger === 'telegram'} onChange={() => setFormData(prev => ({ ...prev, messenger: 'telegram' }))} className="accent-primary" />
                      Telegram
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm">
                      <input type="radio" name="messenger" checked={formData.messenger === 'whatsapp'} onChange={() => setFormData(prev => ({ ...prev, messenger: 'whatsapp' }))} className="accent-primary" />
                      WhatsApp
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary hover:bg-accent text-white font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                  </button>

                  <p className="text-[10px] text-zinc-600 text-center">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DemoBanner;
