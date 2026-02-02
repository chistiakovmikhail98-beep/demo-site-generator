import React from 'react';
import Section from './Section';
import Button from './Button';
import { STORIES } from '../constants';
import { ArrowRight } from 'lucide-react';

const Stories: React.FC = () => {
  return (
    <Section id="stories" className="bg-zinc-50">
      <div className="flex justify-between items-end mb-12">
         <h2 className="text-3xl md:text-5xl font-bold text-zinc-900">Истории успеха</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {STORIES.map((story) => (
          <div key={story.id} className="bg-[#121215] p-2 border border-zinc-800 rounded-[2.5rem] shadow-xl flex flex-col">
             <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="relative aspect-[3/4]">
                   <img src={story.beforeImg} className="w-full h-full object-cover rounded-[2rem] grayscale" alt="Before" />
                   <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 text-xs text-zinc-200 rounded-full font-medium">До</div>
                </div>
                <div className="relative aspect-[3/4]">
                   <img src={story.afterImg} className="w-full h-full object-cover rounded-[2rem]" alt="After" />
                   <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs text-white rounded-full font-medium">После</div>
                </div>
             </div>
             <div className="p-6 md:p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-white mb-3">{story.title}</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed flex-grow">{story.description}</p>
                
                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => window.location.href='#footer'}>
                        Хочу также
                    </Button>
                    <button className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-full">
                      Читать полностью <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Stories;