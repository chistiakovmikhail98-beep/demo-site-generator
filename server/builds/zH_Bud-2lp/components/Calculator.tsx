
import React, { useState, useMemo } from 'react';
import Section from './Section';
import Button from './Button';
import { Sparkles, Trophy, Clock, Target, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG, CALCULATOR_STAGES, SECTION_TITLES } from '../constants';

const Calculator: React.FC = () => {
  const [duration, setDuration] = useState(3); // Months
  const [frequency, setFrequency] = useState(2); // Times per week

  const result = useMemo(() => {
    const totalClasses = Math.round(duration * 4.3 * frequency);
    const totalHours = Math.round(totalClasses * 1); // avg 1h per session

    // Определяем стадию по количеству занятий
    const stages = CALCULATOR_STAGES;
    let stageIndex = 0;
    let percentage = 15;

    if (totalClasses <= 12) {
      stageIndex = 0;
      percentage = 15;
    } else if (totalClasses <= 36) {
      stageIndex = 1;
      percentage = 45;
    } else if (totalClasses <= 72) {
      stageIndex = 2;
      percentage = 80;
    } else {
      stageIndex = Math.min(3, stages.length - 1);
      percentage = 100;
    }

    const stage = stages[stageIndex] || stages[0];

    return {
      totalClasses,
      totalHours,
      status: stage.status,
      description: stage.description,
      tags: stage.tags,
      achievement: stage.achievement,
      percentage
    };
  }, [duration, frequency]);

  return (
    <Section className="bg-[#0c0c0f] relative overflow-hidden !py-10 md:!py-24">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
              {SECTION_TITLES?.calculator?.title || 'Как меняется тело'}
            </h2>
            <p className="text-zinc-400 text-sm md:text-xl max-w-2xl mx-auto font-medium">
              {SECTION_TITLES?.calculator?.subtitle || `Узнай, чего ты достигнешь в ${BRAND_CONFIG.name}, занимаясь регулярно`}
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-8 md:space-y-12 bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-zinc-800 backdrop-blur-sm">
            
            <div className="space-y-4">
              <div className="flex justify-between items-end text-white">
                <label className="font-bold text-lg md:text-xl text-zinc-300">Срок занятий</label>
                <span className="font-mono text-2xl md:text-3xl font-black text-primary">{duration} <span className="text-sm md:text-lg text-zinc-500 font-bold uppercase">мес.</span></span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-3 md:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-red-500 transition-all"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-zinc-600 font-bold uppercase tracking-wider">
                  <span>1 мес</span>
                  <span>Полгода</span>
                  <span>Год</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end text-white">
                <label className="font-bold text-lg md:text-xl text-zinc-300">Тренировок в неделю</label>
                <span className="font-mono text-2xl md:text-3xl font-black text-primary">{frequency}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-3 md:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-red-500 transition-all"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-zinc-600 font-bold uppercase tracking-wider">
                  <span>Щадящий</span>
                  <span>Оптимальный</span>
                  <span>Активный</span>
              </div>
            </div>

             <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Всего часов</span>
                        <span className="text-xl font-black text-white">{result.totalHours} ч.</span>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Target className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Занятий</span>
                        <span className="text-xl font-black text-white">{result.totalClasses}</span>
                    </div>
                </div>
             </div>

          </div>

          {/* Right Column: Result Card */}
          <div className="lg:col-span-7 h-full">
            <div className="h-full bg-surface border border-zinc-800 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl group transition-all duration-500 hover:border-zinc-700">
                
                {/* Visual Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900">
                    <div 
                        className="h-full bg-gradient-to-r from-red-900 via-primary to-orange-500 transition-all duration-1000 ease-out shadow-[0_0_20px_#ba000f]"
                        style={{ width: `${result.percentage}%` }}
                    ></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                             <span className="inline-block py-1 px-3 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 border border-zinc-700">
                                Ваша цель
                             </span>
                             <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {result.status}
                             </h3>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-red-900 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 animate-in zoom-in duration-500">
                            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                    </div>

                    <p className="text-zinc-400 text-sm md:text-lg leading-relaxed mb-8 border-l-2 border-primary/50 pl-4">
                        {result.description}
                    </p>

                    <div className="mb-8">
                         <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-3">
                            Что изменится:
                         </span>
                         <div className="flex flex-wrap gap-2">
                             {result.tags.map((tag, i) => (
                                 <span key={i} className="px-3 py-2 bg-zinc-900 rounded-lg text-zinc-300 text-xs md:text-sm font-medium border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                     <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                     {tag}
                                 </span>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Achievement Highlight */}
                <div className="relative mt-auto bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-5 md:p-6 border border-zinc-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-full shrink-0">
                            <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">
                                Главный результат
                            </span>
                            <span className="text-white font-bold text-base md:text-xl leading-tight block">
                                {result.achievement}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => window.location.href='#footer'}
                        className="shadow-xl shadow-primary/20"
                    >
                        {SECTION_TITLES?.calculator?.buttonText || 'Начать путь к здоровью'}
                    </Button>
                </div>

            </div>
          </div>

        </div>
      </div>
    </Section>
  );
};

export default Calculator;
