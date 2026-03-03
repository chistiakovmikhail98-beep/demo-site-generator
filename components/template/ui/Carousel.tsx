import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  itemClassName?: string;
  gap?: number;
  peek?: boolean;
  loop?: boolean;
  onSlideChange?: (index: number) => void;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDots = true,
  showArrows = true,
  itemClassName = '',
  gap = 16,
  peek = true,
  loop = true,
  onSlideChange,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const itemCount = children.length;

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      container.scrollTo({
        left: child.offsetLeft - (peek ? gap : 0),
        behavior: 'smooth',
      });
    }
  }, [peek, gap]);

  // Track active slide via scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      let closest = 0;
      let closestDist = Infinity;

      Array.from(container.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const dist = Math.abs(el.offsetLeft - scrollLeft - (peek ? gap : 0));
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      if (closest !== activeIndex) {
        setActiveIndex(closest);
        onSlideChange?.(closest);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex, onSlideChange, peek, gap]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || itemCount <= 1) return;

    const timer = setInterval(() => {
      const next = loop
        ? (activeIndex + 1) % itemCount
        : Math.min(activeIndex + 1, itemCount - 1);
      scrollToIndex(next);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isPaused, activeIndex, itemCount, loop, scrollToIndex]);

  const handlePrev = () => {
    const prev = loop
      ? (activeIndex - 1 + itemCount) % itemCount
      : Math.max(activeIndex - 1, 0);
    scrollToIndex(prev);
  };

  const handleNext = () => {
    const next = loop
      ? (activeIndex + 1) % itemCount
      : Math.min(activeIndex + 1, itemCount - 1);
    scrollToIndex(next);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide scroll-smooth"
        style={{
          scrollSnapType: 'x mandatory',
          gap: `${gap}px`,
          paddingLeft: peek ? `${gap}px` : undefined,
          paddingRight: peek ? `${gap}px` : undefined,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className={`flex-shrink-0 ${itemClassName}`}
            style={{ scrollSnapAlign: 'start' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && itemCount > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            aria-label="Назад"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            aria-label="Вперёд"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && itemCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center`}
              aria-label={`Слайд ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Carousel;
