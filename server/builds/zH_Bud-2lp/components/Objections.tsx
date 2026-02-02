import React from 'react';
import Section from './Section';
import { OBJECTIONS_PAIRS } from '../constants';
import { MessageCircleQuestion, CheckCircle2 } from 'lucide-react';

const Objections: React.FC = () => {
  return (
    <Section className="bg-[#09090b]">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
          Вам это знакомо?
        </h2>
        <p className="text-zinc-400 text-lg">
          Развеиваем популярные мифы, которые мешают начать
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OBJECTIONS_PAIRS.map((item, i) => (
          <div 
            key={i} 
            className="group flex flex-col h-full bg-[#18181b] border border-zinc-800 rounded-[2rem] p-8 shadow-lg hover:border-zinc-700 transition-colors duration-300"
          >
            {/* Myth Part */}
            <div className="mb-6 relative">
               <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                    <MessageCircleQuestion className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Миф</span>
               </div>
               <p className="text-zinc-400 text-lg italic leading-relaxed">
                 «{item.myth}»
               </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 my-auto opacity-50"></div>

            {/* Answer Part */}
            <div className="mt-6">
               <div className="flex items-center gap-2 mb-3">
                   <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                   </div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Ответ</span>
               </div>
               <p className="text-zinc-200 text-base leading-relaxed font-medium">
                 {item.answer}
               </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Objections;