import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Activity, Zap, Move, Star, Heart, Shield } from 'lucide-react';
import { SECTION_TITLES, CALCULATOR_STAGES } from '../constants';

// Таймлайн лейблы для 4 этапов
const TIMELINE_LABELS = ['1 НЕД.', '4 НЕД.', '8 НЕД.', 'ПОЛГОДА'];

// Прогресс stats для визуализации графика (4 этапа)
const PROGRESS_STATS = [
  { artistry: 10, technique: 20, confidence: 30, plasticity: 25 },
  { artistry: 30, technique: 45, confidence: 55, plasticity: 60 },
  { artistry: 60, technique: 75, confidence: 80, plasticity: 75 },
  { artistry: 95, technique: 90, confidence: 100, plasticity: 95 },
];

// Конвертируем CALCULATOR_STAGES из constants в формат для визуализации
const STAGES = (CALCULATOR_STAGES && CALCULATOR_STAGES.length >= 4)
  ? CALCULATOR_STAGES.slice(0, 4).map((stage, i) => ({
      id: `stage-${i}`,
      title: stage.status || `Этап ${i + 1}`,
      description: stage.description || '',
      bullets: stage.tags || [],
      timelineLabel: TIMELINE_LABELS[i] || `${(i + 1) * 2} НЕД.`,
      stats: PROGRESS_STATS[i] || PROGRESS_STATS[0],
    }))
  : [
      // Fallback если CALCULATOR_STAGES пустой
      { id: 'start', title: 'Начало', description: 'Первые шаги к результату', bullets: ['Знакомство', 'Диагностика', 'Первые занятия'], timelineLabel: '1 НЕД.', stats: PROGRESS_STATS[0] },
      { id: 'progress', title: 'Прогресс', description: 'Видимые изменения', bullets: ['Улучшение техники', 'Рост выносливости', 'Первые результаты'], timelineLabel: '4 НЕД.', stats: PROGRESS_STATS[1] },
      { id: 'growth', title: 'Рост', description: 'Уверенное развитие', bullets: ['Закрепление навыков', 'Повышение уровня', 'Новые цели'], timelineLabel: '8 НЕД.', stats: PROGRESS_STATS[2] },
      { id: 'mastery', title: 'Мастерство', description: 'Устойчивый результат', bullets: ['Стабильный прогресс', 'Высокий уровень', 'Новый образ жизни'], timelineLabel: 'ПОЛГОДА', stats: PROGRESS_STATS[3] },
    ];

// Метки для ромба — универсальные показатели развития
const RADAR_LABELS = ['Техника', 'Сила', 'Гибкость', 'Выносливость'];

// Custom Graphic Component: Health Radar с динамическими цветами
const ArtistGrowthViz: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const stats = STAGES[activeIndex].stats;

  const size = 400;
  const center = size / 2;
  const radius = 110;

  const getPoint = (value: number, angle: number) => {
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const points = [
    getPoint(stats.artistry, angles[0]),
    getPoint(stats.technique, angles[1]),
    getPoint(stats.confidence, angles[2]),
    getPoint(stats.plasticity, angles[3])
  ].join(' ');

  const circles = [30, 60, 90, 110];

  // Позиции меток для SVG
  const labelPositions = [
    { x: center, y: center - radius - 15, anchor: 'middle' },
    { x: center + radius + 15, y: center + 4, anchor: 'start' },
    { x: center, y: center + radius + 20, anchor: 'middle' },
    { x: center - radius - 15, y: center + 4, anchor: 'end' },
  ];

  return (
    <div className="w-full h-full bg-background relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[400px] bg-primary/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute inset-0 z-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at center, #27272a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="relative z-10 w-full max-w-[320px] md:max-w-[380px] aspect-square radar-chart">
            <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0">
                <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" className="radar-gradient-start" />
                        <stop offset="100%" className="radar-gradient-end" />
                    </linearGradient>
                </defs>
                <line x1={center} y1={center-radius} x2={center} y2={center+radius} stroke="#333" strokeWidth="1" />
                <line x1={center-radius} y1={center} x2={center+radius} y2={center} stroke="#333" strokeWidth="1" />
                {circles.map((r, i) => (<circle key={i} cx={center} cy={center} r={r} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />))}
                <polygon points={points} fill="url(#radarGradient)" className="stroke-primary transition-all duration-1000 ease-out" strokeWidth="2" />
                {RADAR_LABELS.map((label, i) => (
                  <text key={i} x={labelPositions[i].x} y={labelPositions[i].y} textAnchor={labelPositions[i].anchor as 'start' | 'middle' | 'end'} className="fill-primary text-[10px] font-bold uppercase tracking-widest">{label}</text>
                ))}
            </svg>
        </div>

        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {RADAR_LABELS.map((label, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                        <span>{label}</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary transition-all duration-1000 shadow-glow" style={{ width: `${Object.values(stats)[i]}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="absolute top-6 left-6 flex items-center gap-2 border-l border-white/20 pl-3">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ДИНАМИКА РАЗВИТИЯ</span>
        </div>
    </div>
  );
};

const ProgressTimeline: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
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
      const index = Math.min(Math.floor(progress * STAGES.length), STAGES.length - 1);
      setActiveIndex(index);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-background" id="progress-timeline">
      <div ref={containerRef} className="relative h-[400vh]">
         <div className="sticky top-0 h-screen flex flex-col lg:flex-row items-center justify-center overflow-hidden py-10">
            <div className="w-full h-full lg:h-[85vh] max-w-7xl mx-auto px-4 md:px-8">
                <div className="w-full h-full bg-surface border border-zinc-800/50 md:rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="hidden lg:flex justify-between items-center p-12 pb-0 relative z-20">
                         <div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{SECTION_TITLES?.calculator?.title || 'Как меняется тело'}</h2>
                            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">{SECTION_TITLES?.calculator?.subtitle || 'Трансформация через системный подход'}</p>
                         </div>
                         <div className="relative w-[45%]">
                            <div className="absolute top-[8px] left-0 w-full h-px bg-zinc-800"></div>
                            <div className="absolute top-[8px] left-0 h-px bg-primary transition-all duration-700" style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}></div>
                            <div className="relative flex justify-between">
                                {STAGES.map((s, i) => (
                                    <div key={i} className="flex flex-col items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 z-10 ${i <= activeIndex ? 'bg-primary border-primary shadow-glow' : 'bg-zinc-900 border-zinc-700'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${i === activeIndex ? 'text-white' : 'text-zinc-700'}`}>{s.timelineLabel}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:hidden p-6 z-30 bg-surface border-b border-zinc-800/50">
                         <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3">ПУТЬ К ЗДОРОВЬЮ</h2>
                         <div className="flex gap-1">{STAGES.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= activeIndex ? 'bg-primary shadow-glow' : 'bg-zinc-800'}`}></div>))}</div>
                    </div>
                    <div className="flex-grow relative z-10 overflow-hidden flex flex-col lg:flex-row">
                        <div className="w-full h-[55%] lg:w-7/12 lg:h-full lg:order-2 lg:p-12 p-4">
                            <div className="w-full h-full rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-inner"><ArtistGrowthViz activeIndex={activeIndex} /></div>
                        </div>
                        <div className="w-full h-[45%] lg:w-5/12 lg:h-full lg:order-1 relative z-20">
                             {STAGES.map((stage, idx) => (
                                <div key={idx} className={`absolute inset-0 flex flex-col justify-center p-6 lg:pl-16 lg:pr-8 transition-all duration-700 ${activeIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                                    <div className="mb-6 lg:mb-10">
                                        <span className="text-5xl lg:text-8xl font-black text-white/5 mb-[-20px] block leading-none tracking-tighter">0{idx + 1}</span>
                                        <h3 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-8 tracking-tight">{stage.title}</h3>
                                        <p className="text-zinc-500 text-sm lg:text-lg leading-relaxed font-medium">{stage.description}</p>
                                    </div>
                                    <div className="space-y-3 lg:space-y-4">
                                        {stage.bullets.map((bullet, bIdx) => (
                                            <div key={bIdx} className="flex items-center gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform duration-300"></div>
                                                <p className="text-zinc-300 text-xs lg:text-base font-bold uppercase tracking-tight">{bullet}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;