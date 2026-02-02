import React from 'react';
import { BRAND_CONFIG } from '../constants';

const DemoBanner: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-primary/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-wider">
            Демо версия сайта
          </span>
        </div>
        <span className="text-xs md:text-sm font-black text-primary uppercase tracking-tight">
          {BRAND_CONFIG.name}
        </span>
        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
          <span className="text-[10px] text-zinc-400 font-medium">
            создано Primum Digital Agency
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
