import React from 'react';
import EditableImage from '../../ui/EditableImage';
import EditableText from '../../ui/EditableText';
import type { BlockProps } from '../../types';
import type { GalleryData } from './types';

const GalleryV1: React.FC<BlockProps<GalleryData>> = ({
  data,
  editable = false,
  onDataChange,
  className = '',
}) => {
  const { images, title, subtitle } = data;

  if (!images || images.length === 0) return null;

  const handleImageChange = (index: number, newSrc: string) => {
    if (!onDataChange) return;
    const updated = [...images];
    updated[index] = newSrc;
    onDataChange({ ...data, images: updated });
  };

  // In editable mode, show a static grid so images can be clicked/edited
  if (editable) {
    return (
      <div className={`w-full py-8 sm:py-12 ${className}`}>
        {/* Title */}
        {(title || editable) && (
          <div className="text-center px-4 mb-6 sm:mb-8">
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
                className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto"
                placeholder="Добавить описание..."
              />
            )}
          </div>
        )}

        {/* Static editable grid */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((src, i) => (
              <EditableImage
                key={i}
                src={src}
                alt={`Галерея ${i + 1}`}
                onImageChange={(newSrc) => handleImageChange(i, newSrc)}
                editable={editable}
                className="w-full aspect-[3/2] object-cover rounded-2xl"
                containerClassName="rounded-2xl overflow-hidden"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quadruple images for seamless infinite loop
  const marqueeImages = [...images, ...images, ...images, ...images];

  return (
    <div className={`w-full py-8 sm:py-12 md:py-16 overflow-hidden ${className}`}>
      <style>{`
        @keyframes gallery-marquee {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .gallery-marquee-track {
          animation: gallery-marquee 60s linear infinite;
        }
        .gallery-marquee-container:hover .gallery-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Title */}
      {title && (
        <div className="text-center px-4 mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Marquee */}
      <div className="gallery-marquee-container">
        <div className="gallery-marquee-track flex gap-4 sm:gap-6 w-max px-2">
          {marqueeImages.map((src, idx) => (
            <div
              key={idx}
              className="w-[85vw] sm:w-[300px] md:w-[450px] aspect-[3/2] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex-shrink-0 relative group"
            >
              <img
                src={src}
                alt={`Галерея ${(idx % images.length) + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryV1;
