import React from 'react';
import { MapPin, Sparkles, Users, Award } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * HeroV2 — Split Layout (Premium)
 *
 * Left: solid dark background with all text content (always readable).
 * Right: hero image in a contained rounded container (never a background).
 * Bottom: stats bar with glass effect.
 * Mobile: image on top, text below — both on solid backgrounds.
 */
export default function HeroV2({ data, editable, onDataChange, onCTAClick }: BlockProps<HeroData>) {
  const update = (patch: Partial<HeroData>) => onDataChange?.({ ...data, ...patch });

  const defaultStats = [
    { value: '500+', label: 'учеников' },
    { value: '10+', label: 'лет опыта' },
    { value: '15+', label: 'направлений' },
  ];
  const statIcons = [Users, Award, Sparkles];
  const heroStats = data.heroStats && data.heroStats.length > 0 ? data.heroStats : defaultStats;
  const stats = heroStats.slice(0, 3).map((s, i) => ({ icon: statIcons[i] || Sparkles, ...s }));

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--color-background,#09090b)]">
      {/* Decorative glow orb */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/15 top-1/4 right-0 translate-x-1/2" />

      {/* --- Main content area --- */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-20 pb-8 sm:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* === LEFT: Text content on solid background === */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              {/* City badge */}
              {data.city && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 sm:mb-6 section-badge">
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
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight"
              />

              {/* Subtitle */}
              {data.heroSubtitle && (
                <EditableText
                  value={data.heroSubtitle}
                  onChange={(v) => update({ heroSubtitle: v })}
                  editable={editable}
                  as="p"
                  className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl text-zinc-300 max-w-lg leading-relaxed"
                />
              )}

              {/* Description */}
              {data.heroDescription && (
                <EditableText
                  value={data.heroDescription}
                  onChange={(v) => update({ heroDescription: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed"
                />
              )}

              {/* Advantage pills */}
              {data.advantages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5 sm:mt-6">
                  {data.advantages.slice(0, 4).map((text, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-lg text-xs sm:text-sm text-zinc-200 whitespace-nowrap"
                    >
                      {text}
                    </span>
                  ))}
                </div>
              )}

              {/* Dual buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
                <Button
                  size="lg"
                  onClick={() => onCTAClick?.('quiz')}
                  className="w-full sm:w-auto"
                >
                  {data.buttonText || 'Записаться'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onCTAClick?.('directions')}
                  className="w-full sm:w-auto"
                >
                  Направления
                </Button>
              </div>
            </div>

            {/* === RIGHT: Hero image in contained block === */}
            <div className="lg:col-span-5 order-1 lg:order-2 relative">
              <div className="image-contained rounded-2xl sm:rounded-3xl aspect-[4/5] sm:aspect-[3/4] lg:aspect-[3/4] lg:min-h-[520px] shadow-2xl shadow-black/40">
                {isPlaceholder(data.heroImage) ? (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
                ) : editable ? (
                  <EditableImage
                    src={data.heroImage}
                    alt={data.brandName}
                    onImageChange={(v) => update({ heroImage: v })}
                    editable={editable}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <img
                    src={data.heroImage}
                    alt={data.brandName}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                )}
              </div>

              {/* Floating glass quote (optional) */}
              {data.heroQuote && (
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 max-w-[280px] sm:max-w-xs glass rounded-xl p-3 sm:p-4 z-20">
                  <p className="text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
                    &laquo;{data.heroQuote}&raquo;
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* --- Stats bar (bottom) --- */}
      <div className="relative z-10 w-full border-t border-white/10 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center py-4 sm:py-6">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1 sm:mb-2" />
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
