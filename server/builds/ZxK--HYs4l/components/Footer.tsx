import React from 'react';
import Section from './Section';
import Button from './Button';
import { MapPin, Phone, Send, Instagram, Mail, ExternalLink } from 'lucide-react';
import { CONTACTS, BRAND_CONFIG } from '../constants';

const Footer: React.FC = () => {
  // Генерируем ссылки на соцсети
  const telegramLink = CONTACTS.telegram?.startsWith('@')
    ? `https://t.me/${CONTACTS.telegram.slice(1)}`
    : CONTACTS.telegram || '#';
  const vkLink = CONTACTS.vk || '#';
  const instagramLink = CONTACTS.instagram || '#';
  const mapUrl = CONTACTS.mapUrl || '#';

  return (
    <footer id="footer" className="bg-[#121215] border-t border-zinc-900 text-zinc-200">
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tighter">
              Твое тело <br/>
              <span className="text-primary italic">заслуживает заботы!</span>
            </h2>
            <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
              Оставьте заявку на первичную диагностику. Мы поможем вам вернуть радость движения и жизнь без боли.
            </p>

            <form className="space-y-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <div>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm">
                  <input type="radio" name="messenger" className="accent-primary" defaultChecked /> Telegram
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-sm">
                  <input type="radio" name="messenger" className="accent-primary" /> WhatsApp
                </label>
              </div>

              <Button size="lg" fullWidth className="mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-accent">
                Записаться на диагностику
              </Button>
              <p className="text-[10px] text-zinc-600 mt-4 text-center leading-tight">
                Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
              </p>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
               <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-widest">Контакты</h3>
               <div className="space-y-6 mb-8">
                  {CONTACTS.address && (
                    <div className="flex items-start gap-4">
                      <MapPin className="text-primary shrink-0 w-6 h-6" />
                      <div>
                        <p className="text-white font-bold text-lg">{CONTACTS.address}</p>
                        {CONTACTS.addressDetails && (
                          <p className="text-zinc-500 text-sm">{CONTACTS.addressDetails}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {CONTACTS.phone && (
                    <div className="flex items-center gap-4">
                      <Phone className="text-primary shrink-0 w-6 h-6" />
                      <div>
                          <p className="text-white font-bold">{CONTACTS.phone}</p>
                          <p className="text-zinc-500 text-xs">Администратор студии</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-6 border-t border-zinc-800 mt-8">
                    {CONTACTS.telegram && (
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300">
                        <Send className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {CONTACTS.vk && (
                      <a href={vkLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300">
                        <div className="w-5 h-5 text-white flex items-center justify-center font-bold text-xs">VK</div>
                      </a>
                    )}
                    {CONTACTS.instagram && (
                      <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800 rounded-full hover:bg-primary transition-all duration-300">
                        <Instagram className="w-5 h-5 text-white" />
                      </a>
                    )}
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider ml-2">Мы в соцсетях</span>
                  </div>
               </div>

               {/* Map Section */}
               {CONTACTS.mapCoords && (
                 <div className="mt-auto flex flex-col gap-3">
                     <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-inner h-48 md:h-64 relative group">
                        <iframe
                          src={`https://yandex.ru/map-widget/v1/?ll=${CONTACTS.mapCoords}&z=18`}
                          width="100%"
                          height="100%"
                          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                          allowFullScreen={true}
                          loading="lazy"
                          className="group-hover:filter-none transition-all duration-500"
                        ></iframe>
                     </div>

                     {CONTACTS.mapUrl && (
                       <div className="flex gap-2">
                           <a
                             href={CONTACTS.mapUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-zinc-700"
                           >
                             <span>Открыть на карте</span>
                             <ExternalLink className="w-3 h-3" />
                           </a>
                       </div>
                     )}
                 </div>
               )}
            </div>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-zinc-900 text-zinc-600 text-sm font-medium">
          © {new Date().getFullYear()} {BRAND_CONFIG.name}. <br className="md:hidden" /> Все права защищены.
        </div>
      </Section>
    </footer>
  );
};

export default Footer;
