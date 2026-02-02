import React from 'react';
import Section from './Section';
import Button from './Button';
import { Star, Gift, Sparkles, Activity } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <Section id="pricing" className="bg-zinc-50">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase tracking-tight">
          Инвестиция в <span className="text-primary italic">здоровье</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Victoria Marus Rates */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
             <div className="flex items-center gap-3 mb-6 border-b border-zinc-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="text-primary w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Виктория Марус (Эксперт)</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center">
                    <span className="text-zinc-600 font-medium">Диагностика первичная</span>
                    <span className="text-zinc-900 font-black">10 000 ₽</span>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center">
                    <span className="text-zinc-600 font-medium">Разовое групповое</span>
                    <span className="text-zinc-900 font-black">1 500 ₽</span>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center">
                    <span className="text-zinc-600 font-medium">Персональное занятие</span>
                    <span className="text-zinc-900 font-black">4 500 ₽</span>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl flex justify-between items-center border border-primary/10">
                    <span className="text-primary font-bold">Абонемент 8 занятий</span>
                    <span className="text-primary font-black">10 400 ₽</span>
                </div>
             </div>
          </div>

          {/* Section: Other Trainers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 uppercase tracking-tight">В. Володченкова</h3>
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Диагностика</span>
                      <span className="font-bold">5 000 ₽</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Разовое (группа)</span>
                      <span className="font-bold">1 000 ₽</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Абонемент 8 зан.</span>
                      <span className="font-bold">6 400 ₽</span>
                   </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 uppercase tracking-tight">Светлана Широбокова</h3>
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Разовое (группа)</span>
                      <span className="font-bold">700 ₽</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Абонемент 8 зан.</span>
                      <span className="font-bold">4 400 ₽</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Персональное</span>
                      <span className="font-bold">1 300 ₽</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-zinc-900 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">Фитнес-массаж</h3>
              <p className="text-sm text-zinc-500 max-w-sm">Глубокое восстановление и проработка мышечных зажимов</p>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-white font-black text-2xl">2 000 - 3 200 ₽</span>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">50-80 минут</span>
            </div>
          </div>

        </div>

        <div className="bg-primary rounded-[2rem] p-8 md:p-10 flex flex-col justify-between shadow-xl shadow-primary/20 text-white min-h-[400px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
               <Activity className="w-5 h-5 text-white" />
               <span className="text-xs font-bold uppercase tracking-widest">Диагностика</span>
            </div>
            <h3 className="text-3xl font-bold mb-6 leading-tight uppercase italic tracking-tighter">Начните осознанно</h3>
            <p className="text-red-100 opacity-95 leading-relaxed mb-8 text-lg font-medium">
              Первая диагностика ОДА у Виктории Володченковой всего за <span className="text-white font-black text-2xl">2 500 ₽</span> (вместо 5 000 ₽) при записи через сайт.
            </p>
          </div>
          
          <Button className="relative z-10 bg-white !text-primary hover:bg-zinc-100 shadow-2xl w-full rounded-full font-bold text-lg h-14" onClick={() => window.location.href='#footer'}>
            Записаться на диагностику
          </Button>
        </div>

      </div>
    </Section>
  );
};

export default Pricing;