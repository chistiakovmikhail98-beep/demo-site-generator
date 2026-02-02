import React from 'react';
import Section from './Section';
import { INSTRUCTORS } from '../constants';
import { Check } from 'lucide-react';
import Button from './Button';

const Instructors: React.FC = () => {
  return (
    <Section id="instructors" className="bg-[#09090b]">
      <div className="mb-12">
         <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase">Тренеры</h2>
      </div>
      
      {/* Instructor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {INSTRUCTORS.map((inst) => (
          <div key={inst.id} className="group relative cursor-pointer">
            <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 mb-4">
                <img 
                  src={inst.image} 
                  alt={inst.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">{inst.name}</h3>
                </div>
            </div>
            
            <div className="space-y-2">
               <div className="flex items-start gap-3">
                 <div className="w-5 h-5 bg-red-900/50 rounded flex items-center justify-center shrink-0 mt-1">
                   <Check className="w-3 h-3 text-red-500" />
                 </div>
                 <p className="text-zinc-400 text-sm leading-snug">{inst.specialties.join(', ')}</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-5 h-5 bg-red-900/50 rounded flex items-center justify-center shrink-0 mt-1">
                   <Check className="w-3 h-3 text-red-500" />
                 </div>
                 <p className="text-zinc-400 text-sm leading-snug">Опыт: {inst.experience}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Large White CTA Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl">
        <div className="max-w-xl">
           <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Приходите на пробный урок!</h3>
           <p className="text-zinc-600 text-lg leading-relaxed">
             Вы сможете познакомиться с нашими направлениями, тренерами и тренировочным процессом. Найдите свой стиль в Студии здорового движения.
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <Button className="bg-[#b91c1c] hover:bg-red-800 text-white rounded-full px-8 py-4 h-auto text-lg font-bold shadow-none" onClick={() => window.location.href='#footer'}>
             Записаться на урок
           </Button>
           <Button variant="outline" className="text-zinc-900 border-zinc-300 hover:bg-zinc-100 rounded-full px-8 py-4 h-auto text-lg font-bold" onClick={() => window.location.href='#pricing'}>
             Смотреть расписание
           </Button>
        </div>
      </div>
    </Section>
  );
};

export default Instructors;