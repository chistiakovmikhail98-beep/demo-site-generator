import React from 'react';
import Section from './Section';
import { Star, GraduationCap, Award, Users, Heart, Sparkles } from 'lucide-react';

const Director: React.FC = () => {
  return (
    <Section id="director" className="bg-[#09090b] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* Photo Container */}
        <div className="lg:col-span-5 relative">
           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
           <div className="rounded-[3rem] overflow-hidden border-2 border-zinc-800 shadow-2xl aspect-[3/4] md:aspect-auto">
             <img 
               src="https://i.ibb.co/R4YwpgRx/photo-6.jpg" 
               alt="Виктория Марус" 
               className="w-full h-full object-cover transition-all duration-700"
             />
           </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-7 space-y-8">
           <div>
              <div className="inline-block px-4 py-1.5 mb-6 border border-primary/30 bg-primary/10 rounded-full text-xs font-bold tracking-widest text-accent uppercase">
                 Основатель студии
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 uppercase tracking-tighter">
                Виктория <br />
                <span className="text-primary italic">Марус</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                Автор детского курса по коррекции осанки и эксперт в области биомеханики движения.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <GraduationCap className="text-primary shrink-0 w-6 h-6 mt-1" />
                    <p className="text-zinc-300 text-sm leading-relaxed">
                       Международный сертификат CAFS от обучающего центра "Анатомия".
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <Award className="text-primary shrink-0 w-6 h-6 mt-1" />
                    <p className="text-zinc-300 text-sm leading-relaxed">
                       Сертификат SEAS (итальянская методика коррекции сколиоза).
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <Sparkles className="text-primary shrink-0 w-6 h-6 mt-1" />
                    <p className="text-zinc-300 text-sm leading-relaxed">
                       Основатель женского онлайн клуба «Движение с любовью».
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-4">
                    <Users className="text-primary shrink-0 w-6 h-6 mt-1" />
                    <p className="text-zinc-300 text-sm leading-relaxed">
                       Партнер сети центров «Кипарис» и «Академии здорового тела».
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <Heart className="text-primary shrink-0 w-6 h-6 mt-1" />
                    <p className="text-zinc-300 text-sm leading-relaxed">
                       Специалист по оценке ОДА и восстановительному тренингу.
                    </p>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.href='#pricing'}
                className="bg-primary hover:bg-accent text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-primary/20"
              >
                 Записаться на диагностику
              </button>
              <div className="flex items-center gap-3 px-6 text-zinc-500 font-bold uppercase text-xs tracking-widest italic">
                 "Двигайтесь к цели без боли и насилия над собой"
              </div>
           </div>
        </div>

      </div>
    </Section>
  );
};

export default Director;