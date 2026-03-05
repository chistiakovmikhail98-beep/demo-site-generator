import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * HeroV1 — Dark Card + Image
 *
 * Two-column layout: dark card (left) with gradient blur orbs and
 * an image (right). Stacks vertically on mobile. Animated floating
 * text runs behind the content at very low opacity.
 */
export default function HeroV1({ data, editable, onDataChange, onCTAClick }: BlockProps<HeroData>) {
  const update = (patch: Partial<HeroData>) => onDataChange?.({ ...data, ...patch });

  const nicheWords: Record<string, string> = {
    dance: 'Dance \u2022 Movement \u2022 Rhythm \u2022 Energy',
    fitness: 'Fitness \u2022 Strength \u2022 Health \u2022 Energy',
    stretching: 'Stretching \u2022 Flexibility \u2022 Balance \u2022 Harmony',
    yoga: 'Yoga \u2022 Mindfulness \u2022 Balance \u2022 Peace',
    wellness: 'Wellness \u2022 Health \u2022 Balance \u2022 Restoration',
  };

  const marqueeText = `${data.brandName} \u2022 ${nicheWords[data.niche] || nicheWords.wellness} \u2022 `;

  return (
    <div className="relative min-h-screen flex items-center bg-[#0c0c0e] pt-20 pb-8 sm:pt-28 md:pt-36 lg:pt-40 md:pb-12 overflow-hidden">
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

      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none select-none flex flex-col gap-0 opacity-[0.04]">
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
          {/* --- Left: dark card --- */}
          <div className="bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center items-start shadow-xl border border-zinc-800/50 relative overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]">
            {/* Gradient orb */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

            {/* City badge */}
            {data.city && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 sm:mb-6 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase">
                <MapPin className="w-3 h-3" />
                <span>\u0433. {data.city}</span>
              </div>
            )}

            {/* Title */}
            <EditableText
              value={data.heroTitle || `\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c \u0432 ${data.brandName}`}
              onChange={(v) => update({ heroTitle: v })}
              editable={editable}
              as="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-1 sm:mb-2 tracking-tight"
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
                className="text-zinc-400 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 max-w-md leading-relaxed"
              />
            )}

            {/* Advantages */}
            {data.advantages.length > 0 && (
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 w-full">
                {data.advantages.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base md:text-lg leading-snug">
                    <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shrink-0 shadow-[0_0_6px_var(--color-primary)]" />
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
                {data.buttonText || '\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>

          {/* --- Right: image --- */}
          <div className="rounded-3xl sm:rounded-[2.5rem] overflow-hidden relative shadow-xl border border-zinc-800/50 group aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[560px]">
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

            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Quote overlay */}
            {data.heroQuote && (
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <EditableText
                    value={`\u00ab${data.heroQuote}\u00bb`}
                    onChange={(v) => update({ heroQuote: v.replace(/[\u00ab\u00bb]/g, '') })}
                    editable={editable}
                    as="p"
                    className="text-white font-bold italic text-sm sm:text-base lg:text-lg leading-tight"
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
