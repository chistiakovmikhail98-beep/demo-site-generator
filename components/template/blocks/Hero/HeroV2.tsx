import React from 'react';
import { MapPin, ChevronDown, Sparkles, Users, Award } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * HeroV2 — Full-Screen Background Overlay (Premium)
 *
 * Full-viewport background image with multi-layer gradient scrim.
 * Centered content: city badge, bold title with text-shadow, subtitle, dual CTAs.
 * Advantage pills with primary accent. Stats bar at bottom with glass effect.
 * Animated scroll indicator.
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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[var(--color-background,#09090b)]">
      {/* --- Animated scroll-bounce --- */}
      <style>{`
        @keyframes hero-v2-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .hero-v2-bounce { animation: hero-v2-bounce 2s ease-in-out infinite; }
      `}</style>

      {/* --- Background image --- */}
      <div className="absolute inset-0 z-0">
        {isPlaceholder(data.heroImage) ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
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
        {/* Multi-layer gradient scrim — ensures text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background,#09090b)]/85 via-[var(--color-background,#09090b)]/40 to-[var(--color-background,#09090b)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background,#09090b)]/50 to-transparent" />
        {/* Subtle primary tint for mood */}
        <div className="absolute inset-0 bg-primary/5" />
      </div>

      {/* --- Centered content --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-32 sm:pb-40">
        {/* City badge */}
        {data.city && (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 mb-5 sm:mb-8 border border-white/15 bg-white/10 backdrop-blur-md rounded-xl text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white uppercase">
            <MapPin className="w-3 h-3 text-primary" />
            <span>г. {data.city}</span>
          </div>
        )}

        {/* Title — with text-shadow for readability */}
        <EditableText
          value={data.heroTitle || `Добро пожаловать в ${data.brandName}`}
          onChange={(v) => update({ heroTitle: v })}
          editable={editable}
          as="h1"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-5xl text-shadow-hero"
        />

        {data.heroSubtitle && (
          <EditableText
            value={data.heroSubtitle}
            onChange={(v) => update({ heroSubtitle: v })}
            editable={editable}
            as="p"
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-100 max-w-2xl leading-relaxed text-shadow-sm"
          />
        )}

        {data.heroDescription && (
          <EditableText
            value={data.heroDescription}
            onChange={(v) => update({ heroDescription: v })}
            editable={editable}
            as="p"
            multiline
            className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-200 max-w-xl leading-relaxed text-shadow-sm"
          />
        )}

        {/* Dual buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto">
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
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
          >
            Направления
          </Button>
        </div>

        {/* Advantages (compact pills) */}
        {data.advantages.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 max-w-2xl">
            {data.advantages.slice(0, 4).map((text, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/15 border border-primary/30 backdrop-blur-sm rounded-xl text-xs sm:text-sm text-white whitespace-nowrap"
              >
                {text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* --- Stats row (bottom) --- */}
      <div className="relative z-10 w-full border-t border-white/10 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center py-4 sm:py-6">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1 sm:mb-2" />
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-300 mt-0.5 sm:mt-1 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Scroll indicator --- */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 hero-v2-bounce hidden sm:flex flex-col items-center gap-1">
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">листайте</span>
        <ChevronDown className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
  );
}
