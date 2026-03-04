'use client';

const STEPS = [
  { label: 'Ниша', short: 'Ниша' },
  { label: 'Блоки', short: 'Блоки' },
  { label: 'Бриф', short: 'Бриф' },
  { label: 'Дизайн', short: 'Дизайн' },
  { label: 'Предпросмотр', short: 'Превью' },
  { label: 'Регистрация', short: 'Аккаунт' },
  { label: 'Оплата', short: 'Оплата' },
];

interface Props {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function BuilderProgress({ currentStep, onStepClick }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="text-lg font-bold tracking-tight">
          <span className="text-white">Fit</span>
          <span className="text-rose-500">Web</span>
          <span className="text-white">AI</span>
        </a>

        {/* Desktop progress */}
        <nav className="hidden items-center gap-1 md:flex">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isClickable = i < currentStep;

            return (
              <button
                key={i}
                onClick={() => isClickable && onStepClick?.(i)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                  ${isActive ? 'bg-white/10 text-white' : ''}
                  ${isDone ? 'cursor-pointer text-zinc-400 hover:text-white' : ''}
                  ${!isActive && !isDone ? 'cursor-default text-zinc-600' : ''}
                `}
              >
                <span className={`
                  flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold
                  ${isActive ? 'bg-rose-500 text-white' : ''}
                  ${isDone ? 'bg-emerald-500/20 text-emerald-400' : ''}
                  ${!isActive && !isDone ? 'bg-zinc-800 text-zinc-500' : ''}
                `}>
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile progress */}
        <div className="flex items-center gap-3 md:hidden">
          <span className="text-sm text-zinc-400">
            Шаг {currentStep + 1} из {STEPS.length}
          </span>
          <div className="flex gap-0.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-4 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-rose-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
