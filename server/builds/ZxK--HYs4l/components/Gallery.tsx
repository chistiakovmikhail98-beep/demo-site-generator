import React from 'react';
import { GALLERY, BRAND_CONFIG } from '../constants';

// Используем динамические изображения из constants
const IMAGES = GALLERY;

const Gallery: React.FC = () => {
  return (
    <div className="w-full bg-zinc-50 py-10 overflow-hidden">
      <style>{`
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          animation: marquee-right 60s linear infinite;
        }
        .hover-pause:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="flex gap-6 animate-marquee-right w-max px-3 hover-pause">
        {/* Тройное дублирование для бесконечного и плавного скролла на любых экранах */}
        {[...IMAGES, ...IMAGES, ...IMAGES, ...IMAGES].map((src, idx) => (
          <div 
            key={idx} 
            className="w-[300px] h-[200px] md:w-[450px] md:h-[300px] rounded-[2rem] overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.15)] flex-shrink-0 relative group border border-zinc-100/50"
          >
            <img 
              src={src} 
              alt={`${BRAND_CONFIG.name} Gallery ${idx}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;