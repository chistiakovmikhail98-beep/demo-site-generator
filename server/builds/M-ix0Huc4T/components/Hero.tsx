import React from 'react';
import Button from './Button';
import { HERO_ADVANTAGES } from '../constants';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center bg-background pt-28 pb-8 md:pt-40 md:pb-12 overflow-hidden">
      
      <style>{`
        @keyframes float-text {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float-text-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-float-text {
          animation: float-text 25s linear infinite;
          will-change: transform;
        }
        .animate-float-text-reverse {
          animation: float-text-reverse 25s linear infinite;
          will-change: transform;
        }
      `}</style>
      
      <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 pointer-events-none select-none flex flex-col gap-0 opacity-20">
        <div className="whitespace-nowrap flex animate-float-text">
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            Victoria Marus • Wellness • Healthy Movement • 
          </span>
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12">
            Victoria Marus • Wellness • Healthy Movement • 
          </span>
        </div>
        <div className="whitespace-nowrap flex animate-float-text-reverse">
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            Care • Health • Balance • Restoration • 
          </span>
          <span className="text-[12vw] md:text-[15vw] font-black text-zinc-800 uppercase tracking-tighter leading-[0.85] shrink-0 pr-12 opacity-50">
            Care • Health • Balance • Restoration • 
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[600px]">
          
          <div className="bg-surface rounded-[2.5rem] p-8 sm:p-10 md:p-14 flex flex-col justify-center items-start shadow-xl border border-zinc-800/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="inline-block px-4 py-1.5 mb-8 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest text-accent uppercase">
              г. Смоленск
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Студия <br />
              <span className="text-primary italic">здорового движения</span>
            </h1>
            
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Пространство, где тело и разум воссоединяются. Экосистема заботы о себе через осознанное движение.
            </p>
            
            <ul className="space-y-3 mb-10">
              {HERO_ADVANTAGES.map((text, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-300 text-base md:text-lg leading-tight">
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 shadow-[0_0_5px_#9d174d]"></div>
                  {text}
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" onClick={() => window.location.href='#quiz'} className="bg-primary hover:bg-accent">
                Начать путь к здоровью
              </Button>
            </div>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden h-[300px] sm:h-[400px] lg:h-full relative shadow-xl border border-zinc-800/50 group">
            <img 
              src="https://i.ibb.co/wNQcQNrh/photo-248.jpg" 
              alt="Студия Виктории Марус" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Градиент только снизу, чтобы верхняя часть фото была чистой */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10">
                 <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                     <p className="text-white font-bold italic text-lg leading-tight">
                        «Счастливая жизнь рождается из гармонии тела и разума»
                     </p>
                 </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;