import React, { useState, useCallback } from 'react';
import { MapPin, Phone, Send, Instagram, ExternalLink, CheckCircle } from 'lucide-react';
import type { FooterData } from '../types';
import Section from '../Section';
import Button from '../Button';

interface Props {
  data: FooterData;
  editable?: boolean;
}

/** Format phone to +7 (XXX) XXX-XX-XX */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4) return raw;
  const d = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
  if (d.length === 11) {
    return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return raw;
}

export default function Footer({ data }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', messenger: 'telegram' });

  const set = useCallback(
    (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    try {
      // Extract slug from URL (subdomain or path)
      const host = window.location.hostname;
      const parts = host.split('.');
      const slug = parts.length >= 3 ? parts[0] : window.location.pathname.split('/s/')[1]?.split('/')[0] || '';

      const res = await fetch('/api/site-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          source: 'footer',
          slug,
          source_url: window.location.href,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Show success for UX even on network error
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve social links
  const telegramLink = data.telegram?.startsWith('@')
    ? `https://t.me/${data.telegram.slice(1)}`
    : data.telegram || '#';
  const vkLink = data.vk || '#';
  const instagramLink = data.instagram || '#';

  return (
    <footer id="footer" className="bg-[#121215] border-t border-zinc-900 text-zinc-200">
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-16 lg:mb-20">

          {/* ---- Left: heading + form ---- */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-tighter leading-[1.1]">
              Запишитесь <br />
              <span className="text-primary italic">на занятие!</span>
            </h2>
            <p className="text-zinc-400 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed max-w-md">
              Оставьте заявку и мы свяжемся с вами для подбора удобного времени.
            </p>

            {submitted ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center max-w-md">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4 animate-in zoom-in duration-300" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Спасибо за заявку!</h3>
                <p className="text-zinc-400 text-sm sm:text-base">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form className="space-y-3 sm:space-y-4 max-w-md" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-white text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600"
                  required
                />
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-white text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600"
                  required
                />

                {/* Messenger radio */}
                <div className="flex gap-4 sm:gap-6 flex-wrap py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm min-h-[44px]">
                    <input
                      type="radio"
                      name="messenger"
                      checked={form.messenger === 'telegram'}
                      onChange={() => set({ messenger: 'telegram' })}
                      className="accent-primary w-4 h-4"
                    />
                    Telegram
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm min-h-[44px]">
                    <input
                      type="radio"
                      name="messenger"
                      checked={form.messenger === 'whatsapp'}
                      onChange={() => set({ messenger: 'whatsapp' })}
                      className="accent-primary w-4 h-4"
                    />
                    WhatsApp
                  </label>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-2 shadow-xl shadow-primary/20"
                  disabled={submitting}
                >
                  {submitting ? 'Отправка...' : 'Записаться'}
                </Button>

                <p className="text-[10px] text-zinc-600 text-center leading-tight pt-2">
                  Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                </p>
              </form>
            )}
          </div>

          {/* ---- Right: contact card ---- */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 uppercase tracking-widest">
                Контакты
              </h3>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {/* Address */}
                {data.address && (
                  <div className="flex items-start gap-3 sm:gap-4">
                    <MapPin className="text-primary shrink-0 w-5 h-5 sm:w-6 sm:h-6 mt-0.5" />
                    <div>
                      <p className="text-white font-bold text-base sm:text-lg">{data.address}</p>
                      {(data as any).addressDetails && (
                        <p className="text-zinc-500 text-xs sm:text-sm">{(data as any).addressDetails}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {data.phone && (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Phone className="text-primary shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                    <div>
                      <a href={`tel:${data.phone.replace(/\D/g, '')}`} className="text-white font-bold text-base sm:text-lg hover:text-primary transition-colors">
                        {formatPhone(data.phone)}
                      </a>
                      <p className="text-zinc-500 text-xs">Администратор</p>
                    </div>
                  </div>
                )}

                {/* Social links */}
                {(data.telegram || data.vk || data.instagram) && (
                  <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-zinc-800">
                    {data.telegram && (
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Telegram"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {data.vk && (
                      <a
                        href={vkLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="VK"
                      >
                        <span className="w-5 h-5 text-white flex items-center justify-center font-bold text-xs">VK</span>
                      </a>
                    )}
                    {data.instagram && (
                      <a
                        href={instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                    )}
                    <span className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-wider ml-1 sm:ml-2">
                      Мы в соцсетях
                    </span>
                  </div>
                )}
              </div>

              {/* Yandex Map */}
              {data.mapCoords && (
                <div className="mt-auto flex flex-col gap-2 sm:gap-3">
                  <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-800 shadow-inner h-40 sm:h-48 md:h-64 relative group">
                    <iframe
                      src={`https://yandex.ru/map-widget/v1/?ll=${data.mapCoords}&z=16`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                      allowFullScreen
                      loading="lazy"
                      title="Карта"
                    />
                  </div>

                  {data.mapUrl && (
                    <a
                      href={data.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider min-h-[44px] py-3 rounded-xl transition-all border border-zinc-700"
                    >
                      <span>Открыть на карте</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="text-center pt-6 sm:pt-8 border-t border-zinc-900 text-zinc-600 text-xs sm:text-sm font-medium">
          &copy; {new Date().getFullYear()} {data.brandName}. <br className="sm:hidden" /> Все права защищены.
        </div>
      </Section>
    </footer>
  );
}
