import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * HeroV1 — Dark Card + Image (Premium)
 *
 * Two-column layout: dark elevated card (left) with gradient glow orbs
 * and an image (right) with gradient overlay + quote. Stacks on mobile.
 * Background marquee text at ultra-low opacity for depth.
 */
export default function HeroV1({ data, editable, onDataChange, onCTAClick }: BlockProps<HeroData>) {
  const update = (patch: Partial<HeroData>) => onDataChange?.({ ...data, ...patch });

  const nicheWords: Record<string, string> = {
    dance: 'Танец \u2022 Движение \u2022 Ритм \u2022 Энергия',
    fitness: 'Фитнес \u2022 Сила \u2022 Здоровье \u2022 Энергия',
    stretching: 'Растяжка \u2022 Гибкость \u2022 Баланс \u2022 Гармония',
    yoga: 'Йога \u2022 Осознанность \u2022 Баланс \u2022 Покой',
    wellness: 'Велнес \u2022 Здоровье \u2022 Баланс \u2022 Восстановление',
  };

  const marqueeText = `${data.brandName} \u2022 ${nicheWords[data.niche] || nicheWords.wellness} \u2022 `;

  return (
    <div className="relative min-h-screen flex items-center bg-[var(--color-background,#09090b)] pt-20 pb-8 sm:pt-28 md:pt-36 lg:pt-40 md:pb-12 overflow-hidden">
      {/* --- Floating marquee text background --- */}
      <style>{`
        @keyframes hero-v1-float {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hero-v1-float-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .hero-v1-marquee { animation: hero-v1-float 30s linear infinite; will-change: transform; }
        .hero-v1-marquee-rev { animation: hero-v1-float-rev 30s linear infinite; will-change: transform; }
      `}</style>

      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none select-none flex flex-col gap-0 opacity-[0.03]">
        <div className="whitespace-nowrap flex hero-v1-marquee">
          <span className="text-[14vw] font-black text-white uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            {marqueeText}
          </span>
          <span className="text-[14vw] font-black text-white uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            {marqueeText}
          </span>
        </div>
        <div className="whitespace-nowrap flex hero-v1-marquee-rev">
          <span className="text-[14vw] font-black text-white uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            {marqueeText}
          </span>
          <span className="text-[14vw] font-black text-white uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            {marqueeText}
          </span>
        </div>
      </div>

      {/* --- Main content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* --- Left: dark card (elevated surface) --- */}
          <div className="bg-[var(--color-surface,#18181b)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center items-start shadow-2xl shadow-black/40 border border-zinc-800 relative overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]">
            {/* Gradient orbs */}
            <div className="glow-orb top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/15" />
            <div className="glow-orb bottom-0 left-0 w-32 h-32 bg-accent/10" />

            {/* City badge */}
            {data.city && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 sm:mb-6 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-xl text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase">
                <MapPin className="w-3 h-3" />
                <span>г. {data.city}</span>
              </div>
            )}

            {/* Title */}
            <EditableText
              value={data.heroTitle || `Добро пожаловать в ${data.brandName}`}
              onChange={(v) => update({ heroTitle: v })}
              editable={editable}
              as="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 leading-[1.1] mb-1 sm:mb-2 tracking-tight"
            />

            {data.heroSubtitle && (
              <EditableText
                value={data.heroSubtitle}
                onChange={(v) => update({ heroSubtitle: v })}
                editable={editable}
                as="span"
                className="block text-primary italic text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-5"
              />
            )}

            {data.heroDescription && (
              <EditableText
                value={data.heroDescription}
                onChange={(v) => update({ heroDescription: v })}
                editable={editable}
                as="p"
                multiline
                className="text-zinc-300 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 max-w-md leading-relaxed"
              />
            )}

            {/* Advantages */}
            {data.advantages.length > 0 && (
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 w-full">
                {data.advantages.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base md:text-lg leading-snug">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shrink-0 shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]" />
                    <EditableText
                      value={text}
                      onChange={(v) => {
                        const next = [...data.advantages];
                        next[idx] = v;
                        update({ advantages: next });
                      }}
                      editable={editable}
                      as="span"
                      className="inline"
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-auto">
              <Button
                size="lg"
                onClick={() => onCTAClick?.('quiz')}
                className="w-full sm:w-auto"
              >
                {data.buttonText || 'Записаться'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>

          {/* --- Right: image --- */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-2xl shadow-black/40 border border-zinc-800 group aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[560px]">
            {isPlaceholder(data.heroImage) ? (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 transition-transform duration-700 group-hover:scale-105" />
            ) : editable ? (
              <EditableImage
                src={data.heroImage}
                alt={data.brandName}
                onImageChange={(v) => update({ heroImage: v })}
                editable={editable}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                containerClassName="w-full h-full"
              />
            ) : (
              <img
                src={data.heroImage}
                alt={data.brandName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            )}

            {/* Gradient overlay — stronger for readability */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[var(--color-background,#09090b)]/60 via-[var(--color-background,#09090b)]/20 to-transparent pointer-events-none" />

            {/* Quote overlay with glass */}
            {data.heroQuote && (
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <EditableText
                    value={`\u00ab${data.heroQuote}\u00bb`}
                    onChange={(v) => update({ heroQuote: v.replace(/[\u00ab\u00bb]/g, '') })}
                    editable={editable}
                    as="p"
                    className="text-white font-bold italic text-sm sm:text-base lg:text-lg leading-tight text-shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
