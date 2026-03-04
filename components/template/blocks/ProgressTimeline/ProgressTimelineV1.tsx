import React, { useState, useEffect, useRef } from 'react';
import type { BlockProps } from '../../types';
import type { ProgressTimelineData } from './types';

// ---------------------------------------------------------------------------
// ProgressTimelineV1 — Scroll-driven radar chart with stage transitions
// ---------------------------------------------------------------------------

/** Default labels for the 4 radar axes */
const RADAR_LABELS = ['Техника', 'Сила', 'Гибкость', 'Выносливость'];

/** Timeline label for each stage index */
const TIMELINE_LABELS = ['1 НЕД.', '4 НЕД.', '8 НЕД.', 'ПОЛГОДА'];

// ---------------------------------------------------------------------------
// Radar Chart sub-component
// ---------------------------------------------------------------------------

interface RadarProps {
  stats: Record<string, number>;
}

const RadarChart: React.FC<RadarProps> = ({ stats }) => {
  const size = 500;
  const center = size / 2;
  const radius = 100;

  const statValues = Object.values(stats);
  const statKeys = Object.keys(stats);
  const labels = statKeys.length > 0 ? statKeys : RADAR_LABELS;
  const values =
    statValues.length >= 4
      ? statValues.slice(0, 4)
      : [statValues[0] ?? 25, statValues[1] ?? 25, statValues[2] ?? 25, statValues[3] ?? 25];

  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const circles = [25, 50, 75, 100];

  const getPoint = (value: number, angle: number) => {
    const r = (value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  };

  const points = values.map((v, i) => getPoint(v, angles[i])).join(' ');

  const labelPositions = [
    { x: center, y: center - radius - 20, anchor: 'middle' as const },
    { x: center + radius + 20, y: center + 5, anchor: 'start' as const },
    { x: center, y: center + radius + 30, anchor: 'middle' as const },
    { x: center - radius - 20, y: center + 5, anchor: 'end' as const },
  ];

  return (
    <div className="w-full h-full bg-[var(--color-background,#09090b)] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[400px] bg-primary/10 blur-[80px] pointer-events-none" />
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #27272a 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Radar SVG */}
      <div className="relative z-10 w-full max-w-[260px] sm:max-w-[340px] md:max-w-[400px] aspect-square p-4">
        <svg viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" className="radar-gradient-start" />
              <stop offset="100%" className="radar-gradient-end" />
            </linearGradient>
          </defs>

          {/* Axes */}
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#333" strokeWidth="1" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#333" strokeWidth="1" />

          {/* Concentric circles */}
          {circles.map((r, i) => (
            <circle key={i} cx={center} cy={center} r={r} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />
          ))}

          {/* Data polygon */}
          <polygon
            points={points}
            fill="url(#radarGradient)"
            className="stroke-primary transition-all duration-1000 ease-out"
            strokeWidth="2"
          />

          {/* Labels */}
          {labels.slice(0, 4).map((label, i) => (
            <text
              key={i}
              x={labelPositions[i].x}
              y={labelPositions[i].y}
              textAnchor={labelPositions[i].anchor}
              className="fill-primary font-bold uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.08em' }}
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      {/* Bar indicators at bottom */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
        {labels.slice(0, 4).map((label, i) => (
          <div key={i} className="flex flex-col gap-1 md:gap-2">
            <span className="text-zinc-400 text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">
              {label}
            </span>
            <div className="h-0.5 md:h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-primary transition-all duration-1000 shadow-glow"
                style={{ width: `${values[i] ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top-left label */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 border-l border-white/20 pl-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
          ДИНАМИКА РАЗВИТИЯ
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ProgressTimelineV1: React.FC<BlockProps<ProgressTimelineData>> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = data.stages || [];
  const stageCount = stages.length || 4;

  // Scroll-driven stage switching
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollDist = -rect.top;
      const trackLength = rect.height - viewportHeight;
      if (trackLength <= 0) return;
      const progress = Math.max(0, Math.min(1, scrollDist / trackLength));
      const index = Math.min(Math.floor(progress * stageCount), stageCount - 1);
      setActiveIndex(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stageCount]);

  if (stages.length === 0) return null;

  const activeStage = stages[activeIndex];
  const activeStats = activeStage?.stats || {};

  return (
    <div className="relative bg-[var(--color-background,#09090b)]" id="progress-timeline">
      <div ref={containerRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen flex flex-col lg:flex-row items-center justify-center overflow-hidden py-6 sm:py-8 lg:py-10">
          <div className="w-full h-full lg:h-[85vh] max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
            <div className="w-full h-full bg-zinc-900 border border-zinc-700/50 rounded-2xl sm:rounded-[2rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col">

              {/* ---- Desktop header with timeline dots ---- */}
              <div className="hidden lg:flex justify-between items-center p-8 lg:p-12 pb-0 relative z-20">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic">
                    {data.title || 'Как меняется тело'}
                  </h2>
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mt-1">
                    {data.subtitle || 'Трансформация через системный подход'}
                  </p>
                </div>

                {/* Desktop timeline navigation */}
                <div className="relative w-[45%]">
                  <div className="absolute top-[8px] left-0 w-full h-px bg-zinc-800" />
                  <div
                    className="absolute top-[8px] left-0 h-px bg-primary transition-all duration-700"
                    style={{ width: `${(activeIndex / Math.max(stageCount - 1, 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {stages.map((s, i) => (
                      <div key={s.id || i} className="flex flex-col items-center gap-4">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-500 z-10 ${
                            i <= activeIndex
                              ? 'bg-primary border-primary shadow-glow'
                              : 'bg-zinc-900 border-zinc-700'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${
                            i === activeIndex ? 'text-white' : 'text-zinc-700'
                          }`}
                        >
                          {TIMELINE_LABELS[i] || `${(i + 1) * 2} НЕД.`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ---- Mobile header with progress bars ---- */}
              <div className="lg:hidden p-4 sm:p-6 z-30 bg-zinc-900 border-b border-zinc-700/50">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter italic mb-3">
                  {data.title || 'ПУТЬ К ЗДОРОВЬЮ'}
                </h2>
                <div className="flex gap-1">
                  {stages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i <= activeIndex ? 'bg-primary shadow-glow' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* ---- Content area ---- */}
              <div className="flex-grow relative z-10 overflow-hidden flex flex-col lg:flex-row">
                {/* Radar chart panel — top on mobile, right on desktop */}
                <div className="w-full h-[50%] sm:h-[55%] lg:w-7/12 lg:h-full lg:order-2 lg:p-12 p-3 sm:p-4">
                  <div className="w-full h-full rounded-xl sm:rounded-2xl lg:rounded-[2rem] overflow-hidden border border-zinc-700/50 shadow-inner">
                    <RadarChart stats={activeStats} />
                  </div>
                </div>

                {/* Stage info panel — bottom on mobile, left on desktop */}
                <div className="w-full h-[50%] sm:h-[45%] lg:w-5/12 lg:h-full lg:order-1 relative z-20">
                  {stages.map((stage, idx) => (
                    <div
                      key={stage.id || idx}
                      className={`absolute inset-0 flex flex-col justify-center p-4 sm:p-6 lg:pl-16 lg:pr-8 transition-all duration-700 ${
                        activeIndex === idx
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-12 pointer-events-none'
                      }`}
                    >
                      <div className="mb-4 sm:mb-6 lg:mb-10">
                        {/* Ghost number */}
                        <span className="text-4xl sm:text-5xl lg:text-8xl font-black text-white/5 mb-[-16px] sm:mb-[-20px] block leading-none tracking-tighter">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl sm:text-2xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 lg:mb-8 tracking-tight">
                          {stage.title}
                        </h3>
                        <p className="text-zinc-300 text-xs sm:text-sm lg:text-lg leading-relaxed font-medium">
                          {stage.description}
                        </p>
                      </div>

                      {/* Bullet points from tags */}
                      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                        {(stage.tags || []).map((tag, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-3 sm:gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform duration-300 shrink-0" />
                            <p className="text-zinc-300 text-[11px] sm:text-xs lg:text-base font-bold uppercase tracking-tight">
                              {tag}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Achievements (if any) */}
                      {stage.achievements && stage.achievements.length > 0 && (
                        <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 border-t border-zinc-700/50">
                          {stage.achievements.map((ach, aIdx) => (
                            <p key={aIdx} className="text-primary/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                              {ach}
                            </p>
                          ))}
                        </div>
                      )}
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

export default ProgressTimelineV1;
