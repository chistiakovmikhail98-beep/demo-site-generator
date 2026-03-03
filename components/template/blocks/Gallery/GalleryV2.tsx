import React, { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import EditableImage from '../../ui/EditableImage';
import EditableText from '../../ui/EditableText';
import type { BlockProps } from '../../types';
import type { GalleryData } from './types';

const GalleryV2: React.FC<BlockProps<GalleryData>> = ({
  data,
  editable = false,
  onDataChange,
  className = '',
}) => {
  const { images, title, subtitle } = data;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageChange = (index: number, newSrc: string) => {
    if (!onDataChange) return;
    const updated = [...images];
    updated[index] = newSrc;
    onDataChange({ ...data, images: updated });
  };

  const openLightbox = (index: number) => {
    if (editable) return;
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxIndex, goToPrev, goToNext]);

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {(title || editable) && (
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <EditableText
              value={title || 'Галерея'}
              onChange={(v) => onDataChange?.({ ...data, title: v })}
              editable={editable}
              as="h2"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
            />
            {(subtitle || editable) && (
              <EditableText
                value={subtitle || ''}
                onChange={(v) => onDataChange?.({ ...data, subtitle: v })}
                editable={editable}
                as="p"
                className="mt-2 sm:mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto"
                placeholder="Добавить описание..."
              />
            )}
          </div>
        )}

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {images.map((src, i) => {
            const isFirst = i === 0;
            return (
              <div
                key={i}
                className={`relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl ${
                  isFirst ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'
                }`}
                onClick={() => openLightbox(i)}
              >
                {editable ? (
                  <EditableImage
                    src={src}
                    alt={`Галерея ${i + 1}`}
                    onImageChange={(newSrc) => handleImageChange(i, newSrc)}
                    editable={editable}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <>
                    <img
                      src={src}
                      alt={`Галерея ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Hover overlay with ZoomIn */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm sm:text-base font-medium z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div
            className="relative w-full max-w-4xl px-4 sm:px-12 flex-1 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`Галерея ${lightboxIndex + 1}`}
              className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg sm:rounded-xl select-none"
              draggable={false}
            />

            {/* Prev arrow */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Next arrow */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Dot navigation */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1 py-4 flex-wrap max-w-md px-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`Перейти к фото ${i + 1}`}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      i === lightboxIndex
                        ? 'w-3 h-3 bg-primary'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GalleryV2;
