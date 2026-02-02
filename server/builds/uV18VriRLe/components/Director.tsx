import React from 'react';
import Section from './Section';
import { Star, GraduationCap, Award, Users, Heart, Sparkles } from 'lucide-react';
import { DIRECTOR_CONFIG } from '../constants';

const Director: React.FC = () => {
  // Иконки для достижений
  const achievementIcons = [GraduationCap, Award, Sparkles, Users, Heart, Star];

  return (
    <Section id="director" className="bg-[#09090b] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

        {/* Photo Container */}
        <div className="lg:col-span-5 relative">
           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
           <div className="rounded-[3rem] overflow-hidden border-2 border-zinc-800 shadow-2xl aspect-[3/4] md:aspect-auto">
             <img
               src={DIRECTOR_CONFIG.image}
               alt={DIRECTOR_CONFIG.name}
               className="w-full h-full object-cover transition-all duration-700"
             />
           </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-7 space-y-8">
           <div>
              <div className="inline-block px-4 py-1.5 mb-6 border border-primary/30 bg-primary/10 rounded-full text-xs font-bold tracking-widest text-accent uppercase">
                 {DIRECTOR_CONFIG.title}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-none mb-4 uppercase tracking-tighter">
                {DIRECTOR_CONFIG.name.split(' ').map((word, i) => (
                  <span key={i}>
                    {i === 0 ? word : <><br /><span className="text-primary italic">{word}</span></>}
                  </span>
                ))}
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                {DIRECTOR_CONFIG.description}
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 {DIRECTOR_CONFIG.achievements.slice(0, Math.ceil(DIRECTOR_CONFIG.achievements.length / 2)).map((achievement, i) => {
                   const IconComponent = achievementIcons[i % achievementIcons.length];
                   return (
                     <div key={i} className="flex gap-4">
                        <IconComponent className="text-primary shrink-0 w-6 h-6 mt-1" />
                        <p className="text-zinc-300 text-sm leading-relaxed">
                           {achievement}
                        </p>
                     </div>
                   );
                 })}
              </div>

              <div className="space-y-4">
                 {DIRECTOR_CONFIG.achievements.slice(Math.ceil(DIRECTOR_CONFIG.achievements.length / 2)).map((achievement, i) => {
                   const IconComponent = achievementIcons[(i + 3) % achievementIcons.length];
                   return (
                     <div key={i} className="flex gap-4">
                        <IconComponent className="text-primary shrink-0 w-6 h-6 mt-1" />
                        <p className="text-zinc-300 text-sm leading-relaxed">
                           {achievement}
                        </p>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4">
              <button
                onClick={() => window.location.href='#pricing'}
                className="bg-primary hover:bg-accent text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-primary/20"
              >
                 Записаться
              </button>
           </div>
        </div>

      </div>
    </Section>
  );
};

export default Director;
