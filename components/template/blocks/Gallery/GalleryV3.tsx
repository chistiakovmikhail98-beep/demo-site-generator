import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EditableImage from '../../ui/EditableImage';
import EditableText from '../../ui/EditableText';
import type { BlockProps } from '../../types';
import type { GalleryData } from './types';

const GalleryV3: React.FC<BlockProps<GalleryData>> = ({
  data,
  editable = false,
  onDataChange,
  className = '',
}) => {
  const { images, title, subtitle } = data;
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;

  const handleImageChange = (index: number, newSrc: string) => {
    if (!onDataChange) return;
    const updated = [...images];
    updated[index] = newSrc;
    onDataChange({ ...data, images: updated });
  };

  const goToPrev = () => {
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveIndex((activeIndex + 1) % images.length);
  };

  const selectImage = (index: number) => {
    setActiveIndex(index);
  };

  // Auto-scroll thumbnails to keep active one visible
  useEffect(() => {
    if (!thumbsRef.current) return;
    const container = thumbsRef.current;
    const activeThumb = container.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = activeThumb.getBoundingClientRect();

      if (thumbRect.left < containerRect.left || thumbRect.right > containerRect.right) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeIndex]);

  const progressPercent = images.length > 1
    ? ((activeIndex) / (images.length - 1)) * 100
    : 100;

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

        {/* Two-column layout on md+ */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6">
          {/* Main Image */}
          <div className="flex-1 min-w-0">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900">
              {editable ? (
                <EditableImage
                  src={images[activeIndex]}
                  alt={`Gallery ${activeIndex + 1}`}
                  onImageChange={(newSrc) => handleImageChange(activeIndex, newSrc)}
                  editable={editable}
                  className="w-full aspect-[4/3] sm:aspect-[3/2] object-cover"
                  containerClassName="w-full"
                />
              ) : (
                <img
                  src={images[activeIndex]}
                  alt={`Gallery ${activeIndex + 1}`}
                  className="w-full aspect-[4/3] sm:aspect-[3/2] object-cover transition-opacity duration-300"
                  loading="lazy"
                />
              )}

              {/* Counter badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
                {activeIndex + 1} / {images.length}
              </div>

              {/* Prev/Next arrows on main image (non-editable) */}
              {!editable && images.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="md:w-[200px] lg:w-[240px] flex-shrink-0">
            {/* Mobile: horizontal scroll row */}
            <div
              ref={thumbsRef}
              className="flex md:flex-wrap gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[500px] scrollbar-hide pb-2 md:pb-0"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {images.map((src, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => selectImage(i)}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-200 focus:outline-none ${
                      isActive
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 scale-[1.02]'
                        : 'opacity-60 hover:opacity-90'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    {editable ? (
                      <EditableImage
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        onImageChange={(newSrc) => handleImageChange(i, newSrc)}
                        editable={editable}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar utility */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default GalleryV3;
