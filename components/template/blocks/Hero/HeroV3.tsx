import React from 'react';
import { MapPin, ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * HeroV3 — Grid Background + Gradient Orbs (Premium)
 *
 * CSS grid-line pattern background with floating gradient orbs.
 * Split layout: content left, image right on lg. Features logo badge,
 * title, subtitle, dual buttons, metrics row, and a floating glass card.
 */
export default function HeroV3({ data, editable, onDataChange, onCTAClick }: BlockProps<HeroData>) {
  const update = (patch: Partial<HeroData>) => onDataChange?.({ ...data, ...patch });

  const metrics = [
    { icon: Zap, value: '98%', label: 'довольных клиентов' },
    { icon: Clock, value: '7 лет', label: 'на рынке' },
    { icon: TrendingUp, value: '1 200+', label: 'выпускников' },
  ];

  return (
    <div className="relative min-h-screen flex items-center bg-[var(--color-background,#09090b)] pt-20 pb-8 sm:pt-28 md:pt-36 lg:pt-40 md:pb-12 overflow-hidden">
      {/* --- CSS grid-line pattern --- */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.3) 59px, rgba(255,255,255,0.3) 60px),' +
            'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.3) 59px, rgba(255,255,255,0.3) 60px)',
        }}
      />

      {/* --- Gradient orbs --- */}
      <div className="glow-orb top-20 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-primary/25" />
      <div className="glow-orb bottom-20 right-10 w-60 h-60 sm:w-80 sm:h-80 bg-accent/15" />
      <div className="glow-orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/8" />

      {/* --- Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* --- Left: text content --- */}
          <div className="flex flex-col items-start">
            {/* Logo badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm rounded-xl">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-black text-xs sm:text-sm">
                  {data.brandName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 tracking-wide">
                {data.brandName}
              </span>
              {data.city && (
                <>
                  <span className="text-zinc-600">|</span>
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] sm:text-xs text-zinc-400">{data.city}</span>
                </>
              )}
            </div>

            {/* Title */}
            <EditableText
              value={data.heroTitle || `Добро пожаловать в ${data.brandName}`}
              onChange={(v) => update({ heroTitle: v })}
              editable={editable}
              as="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-zinc-100 leading-[1.05] tracking-tight"
            />

            {data.heroSubtitle && (
              <EditableText
                value={data.heroSubtitle}
                onChange={(v) => update({ heroSubtitle: v })}
                editable={editable}
                as="p"
                className="mt-3 sm:mt-5 text-base sm:text-lg md:text-xl text-zinc-200 max-w-lg leading-relaxed"
              />
            )}

            {data.heroDescription && (
              <EditableText
                value={data.heroDescription}
                onChange={(v) => update({ heroDescription: v })}
                editable={editable}
                as="p"
                multiline
                className="mt-3 text-sm sm:text-base text-zinc-300 max-w-md leading-relaxed"
              />
            )}

            {/* Advantages (inline list) */}
            {data.advantages.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 sm:mt-6">
                {data.advantages.map((text, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.5)]" />
                    {text}
                  </span>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={() => onCTAClick?.('quiz')}
                className="w-full sm:w-auto"
              >
                {data.buttonText || 'Начать'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onCTAClick?.('directions')}
                className="w-full sm:w-auto text-zinc-300 hover:text-white"
              >
                Подробнее
              </Button>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-14 w-full max-w-md">
              {metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col items-start">
                  <m.icon className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-zinc-100 leading-none">
                    {m.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 leading-tight">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* --- Right: image with floating card --- */}
          <div className="relative mt-6 lg:mt-0">
            {/* Image container */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-zinc-800 group aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]">
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
            </div>

            {/* Floating glass card */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 lg:-bottom-8 lg:-left-8 z-20 max-w-[240px] sm:max-w-[280px]">
              <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs sm:text-sm leading-tight">
                      {data.brandName}
                    </p>
                    <p className="text-zinc-400 text-[10px] sm:text-xs">
                      {data.niche === 'dance' ? 'Танцевальная студия' :
                       data.niche === 'fitness' ? 'Фитнес-студия' :
                       data.niche === 'stretching' ? 'Студия растяжки' :
                       data.niche === 'yoga' ? 'Йога-студия' :
                       'Велнес-студия'}
                    </p>
                  </div>
                </div>
                {data.heroQuote && (
                  <p className="text-zinc-300 text-[11px] sm:text-xs italic leading-snug border-t border-white/10 pt-2 sm:pt-3">
                    &laquo;{data.heroQuote}&raquo;
                  </p>
                )}
                {!data.heroQuote && data.advantages[0] && (
                  <p className="text-zinc-300 text-[11px] sm:text-xs leading-snug border-t border-white/10 pt-2 sm:pt-3">
                    {data.advantages[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Decorative ring */}
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-20 h-20 sm:w-28 sm:h-28 border-2 border-primary/15 rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
