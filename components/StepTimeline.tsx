'use client';

import React from 'react';

export interface Step {
  label: string;
  href: string;
}

const STEPS: Step[] = [
  { label: 'Рассылка', href: '/sim' },
  { label: 'Сайт', href: '/demo' },
  { label: 'Заявка', href: '/demo' },
  { label: 'Оплата', href: '/order' },
  { label: 'Админка', href: '/demo?admin&dev' },
];

interface StepTimelineProps {
  currentStep: number; // 0-based index
}

export default function StepTimeline({ currentStep }: StepTimelineProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Line behind */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-violet-500 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <a
              key={step.label}
              href={step.href}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-violet-500 border-violet-500 text-white scale-110 shadow-lg shadow-violet-500/30'
                    : isDone
                    ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                  isActive ? 'text-violet-400' : isDone ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                {step.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
