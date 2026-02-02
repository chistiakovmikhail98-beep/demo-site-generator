import React from 'react';
import Section from './Section';
import Button from './Button';
import { REQUESTS_ROW_1, REQUESTS_ROW_2, REQUESTS_ROW_3 } from '../constants';

const MarqueeRow: React.FC<{ items: typeof REQUESTS_ROW_1, reverse?: boolean }> = ({ items, reverse = false }) => {
  return (
    <div className="flex overflow-hidden py-4">
      <div 
        className={`flex gap-6 px-3 w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
      >
        {/* Triple duplication to ensure smooth infinite scroll on wide screens */}
        {[...items, ...items, ...items].map((req, idx) => (
          <div 
            key={`${req.text}-${idx}`} 
            className="flex items-center gap-3 bg-white rounded-full py-4 px-6 pr-7 shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <img 
              src={req.image} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover border-2 border-zinc-100 shrink-0"
            />
            <span className="text-zinc-900 font-bold whitespace-nowrap text-[11px] md:text-sm">
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Requests: React.FC = () => {
  return (
    <Section className="bg-[#121215] overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 60s linear infinite;
        }
      `}</style>

      <div className="mb-16 text-center">
        <h2 className="text-3xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
          С какими запросами <br/>
          <span className="text-zinc-500">приходят в студию</span>
        </h2>
      </div>

      <div className="flex flex-col gap-3 md:gap-5 mb-16 -mx-4 md:-mx-0 opacity-90">
        <MarqueeRow items={REQUESTS_ROW_1} />
        <MarqueeRow items={REQUESTS_ROW_2} reverse />
        <MarqueeRow items={REQUESTS_ROW_3} />
      </div>

      <div className="flex justify-center">
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => window.location.href='#quiz'}
          className="font-bold px-10"
        >
          Подобрать программу сегодня
        </Button>
      </div>
    </Section>
  );
};

export default Requests;