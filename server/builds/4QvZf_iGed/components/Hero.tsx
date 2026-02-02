import React from 'react';
import Button from './Button';
import { HERO_ADVANTAGES, BRAND_CONFIG } from '../constants';

const Hero: React.FC = () => {
  // Текст для бегущей строки на основе ниши
  const getMarqueeText = () => {
    const nicheWords: Record<string, string> = {
      dance: 'Dance • Movement • Rhythm • Energy',
      fitness: 'Fitness • Strength • Health • Energy',
      stretching: 'Stretching • Flexibility • Balance • Harmony',
      yoga: 'Yoga • Mindfulness • Balance • Peace',
      wellness: 'Wellness • Health • Balance • Restoration',
    };
    return `${BRAND_CONFIG.name} • ${nicheWords[BRAND_CONFIG.niche] || nicheWords.wellness} • `;
  };

  const marqueeText = getMarqueeText();

  return (
    <div className="relative min-h-screen flex items-center bg-background pt-28 pb-8 md:pt-40 md:pb-12 overflow-hidden">

      <style>{`
        @keyframes float-text {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float-text-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-float-text {
          animation: float-text 25s linear infinite;
          will-change: transform;
        }
        .animate-float-text-reverse {
          animation: float-text-reverse 25s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none select-none flex flex-col gap-0 opacity-20">
        <div className="whitespace-nowrap flex animate-float-text">
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            {marqueeText}
          </span>
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            {marqueeText}
          </span>
        </div>
        <div className="whitespace-nowrap flex animate-float-text-reverse">
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            Care • Health • Balance • Restoration •
          </span>
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            Care • Health • Balance • Restoration •
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[600px]">

          <div className="bg-surface rounded-[2.5rem] p-8 sm:p-10 md:p-14 flex flex-col justify-center items-start shadow-xl border border-zinc-800/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

             {BRAND_CONFIG.city && (
               <div className="inline-block px-4 py-1.5 mb-8 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest text-accent uppercase">
                г. {BRAND_CONFIG.city}
              </div>
             )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              {BRAND_CONFIG.heroTitle || BRAND_CONFIG.name}
              {BRAND_CONFIG.heroSubtitle && (
                <>
                  <br />
                  <span className="text-primary italic">{BRAND_CONFIG.heroSubtitle}</span>
                </>
              )}
            </h1>

            {BRAND_CONFIG.heroDescription && (
              <p className="text-zinc-400 text-lg mb-8 max-w-md">
                {BRAND_CONFIG.heroDescription}
              </p>
            )}

            <ul className="space-y-3 mb-10">
              {HERO_ADVANTAGES.map((text, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-300 text-base md:text-lg leading-tight">
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 shadow-[0_0_5px_#9d174d]"></div>
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" onClick={() => window.location.href='#quiz'} className="bg-primary hover:bg-accent">
                Записаться
              </Button>
            </div>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden h-[300px] sm:h-[400px] lg:h-full relative shadow-xl border border-zinc-800/50 group">
            <img
              src={BRAND_CONFIG.heroImage}
              alt={BRAND_CONFIG.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {BRAND_CONFIG.heroQuote && (
              <div className="absolute bottom-10 left-10 right-10">
                   <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                       <p className="text-white font-bold italic text-lg leading-tight">
                          «{BRAND_CONFIG.heroQuote}»
                       </p>
                   </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
