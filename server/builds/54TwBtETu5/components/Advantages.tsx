import React from 'react';
import Section from './Section';
import { ADVANTAGES_GRID } from '../constants';

const Advantages: React.FC = () => {
  return (
    <Section id="advantages" className="bg-zinc-50">
      <div className="mb-12">
        <h2 className="text-3xl md:text-6xl font-black text-zinc-900 mb-8 uppercase tracking-tight leading-[0.9]">
          Почему <br />
          <span className="text-zinc-400">выбирают нас</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADVANTAGES_GRID.map((item, idx) => (
          <div 
            key={idx} 
            className="group relative h-[400px] rounded-[2rem] overflow-hidden bg-zinc-900 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-default"
          >
            {/* Background Image - removed opacity-80 */}
            <img 
              src={item.image} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-all duration-300"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8">
              {/* Header area */}
              <div className="transform translate-y-0 transition-transform duration-300">
                <h4 className="text-white font-bold text-2xl leading-tight">{item.title}</h4>
              </div>

              {/* Text area */}
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-zinc-300 text-sm leading-relaxed font-medium opacity-90 group-hover:opacity-100">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Advantages;