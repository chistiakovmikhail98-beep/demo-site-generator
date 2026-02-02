import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { ATMOSPHERE } from '../constants';

// Преобразуем данные из constants в формат компонента
const STEPS = ATMOSPHERE.map((item, idx) => ({
  id: idx,
  title: item.title,
  subtitle: item.title,
  text: item.description,
  image: item.image,
  label: `Шаг ${idx + 1}`
}));

const Atmosphere: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const scrollDist = -rect.top;
      const trackLength = rect.height - viewportHeight;
      
      if (trackLength <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollDist / trackLength));
      
      const index = Math.min(
        Math.floor(progress * STEPS.length),
        STEPS.length - 1
      );
      
      setActiveStep(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-zinc-50 relative" id="atmosphere">
      <div ref={containerRef} className="relative h-[350vh]">
         <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
             <div className="w-full h-full lg:max-w-7xl lg:mx-auto lg:px-4 lg:h-[85vh] flex items-center justify-center">
                <div className="w-full h-full bg-surface lg:rounded-[3rem] overflow-hidden shadow-2xl relative flex border-0 lg:border border-zinc-800/50">
                   <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black via-black/90 to-transparent z-20 lg:static lg:w-[45%] lg:h-full lg:bg-none lg:p-0 lg:pl-16 lg:pr-8 lg:py-16 flex flex-col pointer-events-none lg:pointer-events-auto">
                      <div className="hidden lg:block mb-auto">
                        <h2 className="text-4xl xl:text-5xl font-black text-white uppercase tracking-tight">
                          Фотоэкскурсия <br/><span className="text-primary">по студии</span>
                        </h2>
                      </div>
                      <div className="relative h-[180px] lg:h-[300px] flex items-end lg:block">
                          {STEPS.map((step, idx) => (
                            <div 
                              key={step.id}
                              className={`absolute inset-0 flex flex-col justify-end lg:justify-center transition-all duration-500 ease-out
                                ${activeStep === idx 
                                  ? 'opacity-100 translate-y-0 delay-100' 
                                  : 'opacity-0 translate-y-4 lg:translate-y-8'
                                }
                              `}
                            >
                                <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-6">
                                   <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full border border-zinc-700 flex items-center justify-center text-sm lg:text-xl font-bold ${activeStep === idx ? 'bg-primary border-primary text-white' : 'text-zinc-600'}`}>
                                      {idx + 1}
                                   </div>
                                   <h2 className="lg:hidden text-lg font-black text-white uppercase tracking-tight">
                                      Фотоэкскурсия
                                   </h2>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4 leading-tight">{step.subtitle}</h3>
                                <p className="text-sm lg:text-lg text-zinc-300 lg:text-zinc-400 leading-relaxed mb-4 lg:mb-8 max-w-md">
                                  {step.text}
                                </p>
                                <div className="pointer-events-auto">
                                    <Button size="sm" onClick={() => window.location.href='#footer'} className="lg:h-12 lg:px-6 shadow-lg shadow-primary/20">
                                        Записаться
                                    </Button>
                                </div>
                            </div>
                          ))}
                      </div>
                      <div className="mt-auto hidden lg:flex gap-2">
                          {STEPS.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`h-1 rounded-full transition-all duration-300 ${activeStep === idx ? 'w-12 bg-primary' : 'w-4 bg-zinc-800'}`}
                            ></div>
                          ))}
                      </div>
                   </div>
                   <div className="absolute inset-0 z-0 lg:static lg:w-[55%] lg:h-full">
                      {STEPS.map((step, idx) => (
                         <div 
                           key={step.id}
                           className={`absolute inset-0 transition-all duration-700 ease-in-out
                             ${activeStep === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'}
                           `}
                         >
                            <img 
                               src={step.image} 
                               alt={step.title} 
                               className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 lg:bg-gradient-to-t lg:from-black/80 lg:via-transparent lg:to-transparent"></div>
                            <div className="absolute top-6 right-6 lg:bottom-10 lg:left-10 lg:top-auto lg:right-auto z-20">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 lg:px-6 lg:py-3 rounded-full flex items-center gap-2 lg:gap-3">
                                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary shadow-[0_0_10px_#ba000f]"></div>
                                    <span className="text-white font-medium tracking-wide text-xs lg:text-sm">{step.label}</span>
                                </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Atmosphere;