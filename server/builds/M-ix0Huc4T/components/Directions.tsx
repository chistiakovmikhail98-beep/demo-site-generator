import React, { useState } from 'react';
import Section from './Section';
import { DIRECTIONS } from '../constants';
import { Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const Directions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Все');
  const [showAll, setShowAll] = useState(false);
  
  const tabs = [
    'Все', 
    'Групповые', 
    'Индивидуальные', 
    'Восстановление', 
    'Специальные', 
    'Wellness', 
    'Онлайн'
  ];

  const categoryMap: Record<string, string> = {
    'Групповые': 'dance',
    'Индивидуальные': 'body',
    'Восстановление': 'beginner',
    'Специальные': 'special',
    'Wellness': 'wellness',
    'Онлайн': 'online'
  };

  const filteredDirections = DIRECTIONS.filter(dir => {
    if (activeTab === 'Все') return true;
    return dir.category === categoryMap[activeTab];
  });

  const displayedDirections = showAll ? filteredDirections : filteredDirections.slice(0, 6);

  return (
    <Section id="directions" className="bg-zinc-100">
      <div className="mb-12">
        <h2 className="text-3xl md:text-6xl font-black text-zinc-900 mb-8 uppercase tracking-tight leading-[0.9]">
          19 направлений <br />
          <span className="text-zinc-400">в одной студии</span>
        </h2>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowAll(false); // Reset showAll when switching tabs
              }}
              className={`
                px-4 py-2 md:px-6 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wide transition-all border-2
                ${activeTab === tab 
                  ? 'bg-primary text-white border-primary shadow-lg' 
                  : 'bg-transparent text-zinc-400 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {displayedDirections.map((dir) => (
          <div 
            key={dir.id} 
            className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          >
            {/* Image Top */}
            <div className="h-56 overflow-hidden relative m-2 rounded-t-[1.8rem] rounded-b-xl">
              <img 
                src={dir.image} 
                alt={dir.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-6 pt-2 flex flex-col flex-grow">
              
              {/* Meta Pills */}
              <div className="flex gap-2 mb-4">
                {/* Duration Pill */}
                <div className="bg-zinc-100 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-600">{dir.duration}</span>
                </div>
                
                {/* Stats Pill */}
                <div className="bg-zinc-100 rounded-xl px-3 py-2 flex flex-col justify-center gap-0.5 flex-grow">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                     <Zap className="w-3 h-3 text-orange-400" />
                     <span>Интенсивность:</span>
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${i < (dir.complexity || 0) ? 'bg-zinc-800' : 'border border-zinc-300'}`}
                          ></div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3 text-xs text-zinc-400 leading-tight">
                {dir.tags.join('; ')}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-zinc-900 mb-3 leading-tight">{dir.title}</h3>

              {/* Description */}
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 line-clamp-4 flex-grow">
                {dir.description}
              </p>

              {/* Button */}
              <button 
                onClick={() => window.location.href='#footer'}
                className="w-full py-4 rounded-2xl bg-primary hover:bg-red-800 text-white font-bold text-sm tracking-wide transition-colors uppercase shadow-lg shadow-primary/20"
              >
                {dir.buttonText || 'Записаться'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show All Toggle */}
      {filteredDirections.length > 6 && (
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-zinc-200 rounded-full text-zinc-900 font-bold uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            {showAll ? (
              <>Скрыть часть <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Посмотреть все ({filteredDirections.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </Section>
  );
};

export default Directions;