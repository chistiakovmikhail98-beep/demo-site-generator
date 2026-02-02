import React, { useState } from 'react';
import Section from './Section';
import { FAQ_ITEMS } from '../constants';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-zinc-50">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
           <h2 className="text-4xl font-bold text-zinc-900 mb-6">FAQ</h2>
           <p className="text-zinc-500 text-lg leading-relaxed">Ответы на самые частые вопросы новичков. Если не нашли ответ — напишите нам в мессенджеры.</p>
        </div>
        
        <div className="md:col-span-8 space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border border-zinc-800 bg-[#121215] rounded-[2rem] overflow-hidden shadow-lg">
              <button
                className="w-full flex items-center justify-between p-8 text-left hover:bg-zinc-900 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-white text-lg pr-8">{item.question}</span>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                   {openIndex === index ? <Minus className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-8 pt-0 text-zinc-400 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default FAQ;