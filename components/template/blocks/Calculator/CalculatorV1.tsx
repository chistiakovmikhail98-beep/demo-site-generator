import React, { useState, useMemo } from 'react';
import { Sparkles, Trophy, Clock, Target, CheckCircle2 } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { CalculatorData } from './types';
import Section from '../../Section';
import Button from '../../Button';

// ---------------------------------------------------------------------------
// CalculatorV1 — Mobile-first interactive duration/frequency calculator
// ---------------------------------------------------------------------------

const CalculatorV1: React.FC<BlockProps<CalculatorData>> = ({ data }) => {
  const [duration, setDuration] = useState(3); // months 1-12
  const [frequency, setFrequency] = useState(2); // per week 1-5

  const stages = data.stages || [];

  const result = useMemo(() => {
    const totalClasses = Math.round(duration * 4.3 * frequency);
    const totalHours = Math.round(totalClasses * 1); // avg 1h/session

    // Determine stage by total classes
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
      status: stage?.title || 'Старт',
      description: stage?.description || '',
      tags: stage?.tags || [],
      achievement: stage?.achievements?.[0] || '',
      percentage: stage?.progress ?? percentage,
    };
  }, [duration, frequency, stages]);

  return (
    <Section className="bg-[#0c0c0e] relative overflow-hidden !py-10 md:!py-24" id="calculator">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-6xl font-black text-white uppercase tracking-tight mb-3 sm:mb-4">
            {data.title || 'Как меняется тело'}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto font-medium">
            {data.subtitle || 'Узнай, чего ты достигнешь, занимаясь регулярно'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-stretch">
          {/* ---- Left column: Sliders ---- */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 md:space-y-12 bg-zinc-900/50 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] border border-zinc-800 backdrop-blur-sm">
            {/* Duration slider */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-end text-white">
                <label className="font-bold text-base sm:text-lg md:text-xl text-zinc-300">
                  Срок занятий
                </label>
                <span className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-primary">
                  {duration}{' '}
                  <span className="text-xs sm:text-sm md:text-lg text-zinc-500 font-bold uppercase">
                    мес.
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-3 md:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-red-500 transition-all min-h-[44px]"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-zinc-600 font-bold uppercase tracking-wider">
                <span>1 мес</span>
                <span>Полгода</span>
                <span>Год</span>
              </div>
            </div>

            {/* Frequency slider */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-end text-white">
                <label className="font-bold text-base sm:text-lg md:text-xl text-zinc-300">
                  Тренировок в неделю
                </label>
                <span className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-primary">
                  {frequency}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-3 md:h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary hover:accent-red-500 transition-all min-h-[44px]"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-zinc-600 font-bold uppercase tracking-wider">
                <span>Щадящий</span>
                <span>Оптимальный</span>
                <span>Активный</span>
              </div>
            </div>

            {/* Summary row */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Всего часов
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white">
                    {result.totalHours} ч.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Занятий
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white">
                    {result.totalClasses}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Right column: Result card ---- */}
          <div className="lg:col-span-7 h-full">
            <div className="h-full bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl group transition-all duration-500 hover:border-zinc-700">
              {/* Progress bar top */}
              <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-zinc-900">
                <div
                  className="h-full bg-gradient-to-r from-red-900 via-primary to-orange-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>

              <div className="relative z-10">
                {/* Status header */}
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                  <div>
                    <span className="inline-block py-1 px-3 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 border border-zinc-700">
                      Ваша цель
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                      {result.status}
                    </h3>
                  </div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-red-900 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 animate-in zoom-in duration-500">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 border-l-2 border-primary/50 pl-3 sm:pl-4">
                  {result.description}
                </p>

                {/* Tags */}
                <div className="mb-6 sm:mb-8">
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2 sm:mb-3">
                    Что изменится:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {result.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-900 rounded-lg text-zinc-300 text-[11px] sm:text-xs md:text-sm font-medium border border-zinc-800 flex items-center gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement highlight */}
              {result.achievement && (
                <div className="relative mt-auto bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-zinc-700/50">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-full shrink-0">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">
                        Главный результат
                      </span>
                      <span className="text-white font-bold text-sm sm:text-base md:text-xl leading-tight block">
                        {result.achievement}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-5 sm:mt-6">
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('footer');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="shadow-xl shadow-primary/20"
                >
                  Начать путь к здоровью
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CalculatorV1;
