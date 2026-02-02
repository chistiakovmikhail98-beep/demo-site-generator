
import React from 'react';
import Section from './Section';
import { Star, MapPin } from 'lucide-react';
import { REVIEWS } from '../constants';

const Reviews: React.FC = () => {
  return (
    <Section className="bg-zinc-50 overflow-hidden !py-24">
       <style>{`
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          animation: marquee-right 80s linear infinite;
        }
        .hover-pause:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      `}</style>

      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tight mb-4">
          Отзывы <span className="text-primary">наших учеников</span>
        </h2>
        <p className="text-zinc-500 text-lg">
           Мы ценим доверие каждого гостя нашей студии
        </p>
      </div>

      <div className="relative w-full hover-pause">
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none"></div>

        <div className="flex overflow-hidden">
          <div className="flex gap-6 animate-marquee-right w-max px-3">
            {[...REVIEWS, ...REVIEWS].map((review, idx) => (
              <div 
                key={idx} 
                className="w-[400px] bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col gap-4 flex-shrink-0 hover:shadow-xl transition-all duration-300"
              >
                 <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{review.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="underline decoration-primary/30 decoration-wavy underline-offset-2">{review.source}</span>
                        </div>
                    </div>
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${i <= (review.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'}`} />
                        ))}
                    </div>
                 </div>
                 <p className="text-zinc-600 leading-relaxed text-sm italic">
                    «{review.text}»
                 </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Reviews;
