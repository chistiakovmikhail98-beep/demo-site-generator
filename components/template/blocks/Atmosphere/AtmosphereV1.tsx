import React, { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { AtmosphereData } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';

/**
 * AtmosphereV1 — Scroll-Driven Sticky
 *
 * Full-height sticky scroll section. On desktop the layout splits into
 * a 45% text panel (step number, title, description, CTA) and a 55%
 * crossfading fullscreen image area. On mobile the image fills the
 * viewport with a gradient overlay and text anchored to the bottom.
 * Scroll position drives the active step.
 */
export default function AtmosphereV1({ data, editable, onDataChange }: BlockProps<AtmosphereData>) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<AtmosphereData>) => onDataChange?.({ ...data, ...patch });

  const updateItem = (idx: number, patch: Partial<AtmosphereData['items'][0]>) => {
    const next = [...data.items];
    next[idx] = { ...next[idx], ...patch };
    update({ items: next });
  };

  const items = data.items ?? [];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || items.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const trackLength = rect.height - window.innerHeight;
      if (trackLength <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / trackLength));
      const index = Math.min(Math.floor(progress * items.length), items.length - 1);
      setActiveStep(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-[var(--color-background,#0c0c0e)] relative" id="atmosphere">
      <div ref={containerRef} className="relative h-[350vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="w-full h-full lg:max-w-7xl lg:mx-auto lg:px-4 lg:h-[85vh] flex items-center justify-center">
            <div className="w-full h-full bg-zinc-900 lg:rounded-[2rem] overflow-hidden shadow-2xl relative flex border-0 lg:border lg:border-zinc-800/50">

              {/* --- Text panel --- */}
              <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent z-20 lg:static lg:w-[45%] lg:h-full lg:bg-none lg:p-0 lg:pl-12 lg:pr-8 lg:py-14 flex flex-col pointer-events-none lg:pointer-events-auto">
                {/* Desktop heading */}
                <div className="hidden lg:block mb-auto">
                  <EditableText
                    value={data.title || 'Атмосфера студии'}
                    onChange={(v) => update({ title: v })}
                    editable={editable}
                    as="h2"
                    className="text-3xl xl:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]"
                  />
                  {(data.subtitle || editable) && (
                    <EditableText
                      value={data.subtitle || ''}
                      onChange={(v) => update({ subtitle: v })}
                      editable={editable}
                      as="p"
                      className="mt-3 text-sm xl:text-base text-zinc-400 max-w-md"
                      placeholder="Добавить описание..."
                    />
                  )}
                </div>

                {/* Step content (crossfade) */}
                <div className="relative h-[180px] lg:h-[280px] flex items-end lg:block">
                  {items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`absolute inset-0 flex flex-col justify-end lg:justify-center transition-all duration-500 ease-out ${
                        activeStep === idx
                          ? 'opacity-100 translate-y-0 delay-100'
                          : 'opacity-0 translate-y-4 lg:translate-y-8 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-5">
                        <div
                          className={`w-8 h-8 lg:w-11 lg:h-11 rounded-full border flex items-center justify-center text-sm lg:text-lg font-bold transition-colors duration-300 ${
                            activeStep === idx
                              ? 'bg-primary border-primary text-white'
                              : 'border-zinc-700 text-zinc-600'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {/* Mobile-only compact heading */}
                        <EditableText
                          value={data.title || 'Атмосфера'}
                          onChange={(v) => update({ title: v })}
                          editable={editable}
                          as="h2"
                          className="lg:hidden text-base font-black text-white uppercase tracking-tight"
                        />
                      </div>

                      <EditableText
                        value={item.title}
                        onChange={(v) => updateItem(idx, { title: v })}
                        editable={editable}
                        as="h3"
                        className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 lg:mb-4 leading-tight"
                      />
                      <EditableText
                        value={item.description}
                        onChange={(v) => updateItem(idx, { description: v })}
                        editable={editable}
                        as="p"
                        multiline
                        className="text-sm lg:text-base text-zinc-300 lg:text-zinc-400 leading-relaxed mb-4 lg:mb-6 max-w-md"
                      />
                      <div className="pointer-events-auto">
                        <Button
                          size="sm"
                          onClick={() => {
                            document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="lg:h-12 lg:px-6 shadow-lg shadow-primary/20"
                        >
                          Записаться
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress dots */}
                <div className="mt-auto hidden lg:flex gap-2 pt-6">
                  {items.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        activeStep === idx ? 'w-10 bg-primary' : 'w-4 bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* --- Image panel --- */}
              <div className="absolute inset-0 z-0 lg:static lg:w-[55%] lg:h-full">
                {items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      activeStep === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'
                    }`}
                  >
                    {isPlaceholder(item.image) ? (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    ) : editable ? (
                      <EditableImage
                        src={item.image}
                        alt={item.title}
                        onImageChange={(v) => updateItem(idx, { image: v })}
                        editable={editable}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t lg:from-black/70 lg:via-transparent lg:to-transparent pointer-events-none" />

                    {/* Step label badge */}
                    <div className="absolute top-5 right-5 lg:bottom-8 lg:left-8 lg:top-auto lg:right-auto z-20">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span className="text-white font-medium tracking-wide text-xs">{`${idx + 1} / ${items.length}`}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
