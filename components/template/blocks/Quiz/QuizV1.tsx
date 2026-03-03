import React, { useState, useRef, useEffect } from 'react';
import { Check, User, Phone, ChevronDown } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { QuizData, QuizStep } from './types';
import { isPlaceholder } from '../../PlaceholderImg';
import Button from '../../Button';
import AiChat from '../../AiChat';

// ---------------------------------------------------------------------------
// QuizV1 — Mobile-first multi-step quiz with manager chat bubble
// ---------------------------------------------------------------------------

interface QuizV1Props extends BlockProps<QuizData> {
  onAnswersUpdate?: (answers: Record<string, string>) => void;
}

/** Build internal steps array from props data */
function buildSteps(data: QuizData): QuizStep[] {
  const quizSteps: QuizStep[] = data.steps.map((step, idx) => ({
    id: idx + 1,
    key: `step_${idx}`,
    title: step.question,
    options: step.options,
  }));

  // Insert contact step after 3rd question (or at end if fewer)
  const contactIdx = Math.min(3, quizSteps.length);
  quizSteps.splice(contactIdx, 0, {
    id: contactIdx + 1,
    key: 'contact',
    title: 'Куда отправить ваш план?',
    subtitle: 'Для подбора подходящего времени на диагностику.',
    options: [],
  });

  // Final "confirm" step
  quizSteps.push({
    id: quizSteps.length + 1,
    key: 'final',
    title: 'Результат готов!',
    subtitle: 'Нажмите кнопку, чтобы увидеть персональную подборку.',
    options: [],
  });

  return quizSteps;
}

const QuizV1: React.FC<QuizV1Props> = ({ data, onAnswersUpdate }) => {
  // ---- state ----
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const steps = buildSteps(data);
  const managerName = data.managerName || 'Менеджер';
  const managerImage = data.managerImage || '';
  const tips: Record<number, string> = {};
  (data.tips || []).forEach((tip, idx) => {
    tips[idx] = tip;
  });

  // Sync answers to parent
  useEffect(() => {
    onAnswersUpdate?.(answers);
  }, [answers, onAnswersUpdate]);

  const stepConfig = steps[currentStep];
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  // ---- handlers ----
  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [stepConfig.key]: option }));
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 350);
  };

  const handleContactChange = (field: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    let body = digits;
    if (['7', '8'].includes(digits[0])) body = digits.slice(1);
    body = body.slice(0, 10);

    let formatted = '+7';
    if (body.length > 0) formatted += ` (${body.slice(0, 3)}`;
    if (body.length >= 3) formatted += `) ${body.slice(3, 6)}`;
    if (body.length >= 6) formatted += `-${body.slice(6, 8)}`;
    if (body.length >= 8) formatted += `-${body.slice(8, 10)}`;
    handleContactChange('phone', formatted);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // If leaving contact step with name+phone, save the lead
      if (stepConfig.key === 'contact' && answers.name && answers.phone) {
        saveLead(answers);
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  /** Save lead to /api/site-leads */
  const saveLead = async (ans: Record<string, string>) => {
    try {
      const host = window.location.hostname;
      const parts = host.split('.');
      const slug = parts.length >= 3 ? parts[0] : window.location.pathname.split('/s/')[1]?.split('/')[0] || '';
      const quizAnswers: Record<string, string> = {};
      for (const [k, v] of Object.entries(ans)) {
        if (k.startsWith('step_')) quizAnswers[k] = v;
      }
      await fetch('/api/site-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ans.name,
          phone: ans.phone,
          source: 'quiz',
          slug,
          quiz_answers: quizAnswers,
          source_url: window.location.href,
        }),
      });
    } catch {
      // Silently fail — don't block quiz UX
    }
  };

  const handleSubmit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 2000);
  };

  // ---- results logic ----
  const getResults = () => {
    const goal = answers.step_1 || answers.step_0 || '';
    const pain = answers.step_2 || answers.step_1 || '';

    let directions = [];
    if (goal.includes('осанку') || pain.includes('спине')) {
      directions = [
        { title: 'Коррекция осанки', desc: 'Работа со сколиозом и болями' },
        { title: 'Пилатес', desc: 'Укрепление кора' },
      ];
    } else if (goal.includes('травмы')) {
      directions = [
        { title: 'Реабилитация', desc: 'Безопасное восстановление' },
        { title: 'Массаж', desc: 'Снятие зажимов' },
      ];
    } else {
      directions = [
        { title: 'Йога', desc: 'Гибкость и баланс' },
        { title: 'Функциональный тренинг', desc: 'Сила и выносливость' },
      ];
    }

    return {
      levelTag: 'Персональный план',
      description: `Цель: ${goal}. Фокус: ${pain}. Программа для: ${answers.step_0 || 'вас'}.`,
      directions,
      schedule: answers.step_3 || 'Удобный график',
    };
  };

  const resultData = getResults();

  // ---- Manager chat block ----
  const ManagerBlock = () => (
    <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-6 bg-transparent p-0 mt-4 lg:mt-0">
      {/* Avatar row */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          {isPlaceholder(managerImage) ? (
            <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 lg:border-4 border-white/20 flex items-center justify-center">
              <User className="w-6 h-6 lg:w-10 lg:h-10 text-zinc-500" />
            </div>
          ) : (
            <img
              src={managerImage}
              alt={managerName}
              className="w-12 h-12 lg:w-24 lg:h-24 rounded-full object-cover border-2 lg:border-4 border-white/20"
            />
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-[#0c0c0e]" />
        </div>

        {/* Mobile-only name */}
        <div className="lg:hidden flex flex-col">
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {managerName.split(' ')[0]}
          </span>
          <span className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">
            Менеджер
          </span>
        </div>
      </div>

      {/* Chat bubble */}
      <div className="flex flex-col gap-3 w-full">
        <span className="text-base font-bold text-white uppercase tracking-wide hidden lg:block pl-2">
          {managerName}
        </span>
        <div className="bg-white/10 lg:bg-zinc-800 rounded-2xl lg:rounded-3xl lg:rounded-tl-none p-3 lg:p-6 shadow-sm border border-white/10 lg:border-zinc-700 animate-in fade-in slide-in-from-left-2 duration-500">
          <p className="text-white lg:text-zinc-100 text-xs lg:text-lg leading-snug font-medium">
            {tips[currentStep] || tips[0] || 'Ответьте на несколько вопросов, и мы подберем для вас программу.'}
          </p>
        </div>
      </div>
    </div>
  );

  // ---- Render: question options ----
  const renderOptions = () => (
    <div className="space-y-2 sm:space-y-3 w-full">
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {stepConfig.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={`
              px-4 py-3 sm:p-4 md:p-5 text-left border rounded-xl transition-all duration-200
              flex items-center justify-between group w-full min-h-[44px]
              ${
                answers[stepConfig.key] === option
                  ? 'border-primary bg-primary text-white shadow-lg font-bold ring-2 ring-primary/50'
                  : 'border-zinc-800 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-zinc-700 active:scale-[0.98]'
              }
            `}
          >
            <span className="text-sm sm:text-base md:text-lg leading-tight">{option}</span>
            {answers[stepConfig.key] === option && (
              <Check className="w-5 h-5 md:w-6 md:h-6 text-white animate-in zoom-in shrink-0 ml-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // ---- Render: contact form ----
  const renderContactForm = () => (
    <div className="space-y-3 sm:space-y-4 max-w-md w-full">
      {/* Name input */}
      <div>
        <label className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase ml-4 mb-1 sm:mb-2 block">
          Ваше имя
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-600" />
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={answers.name || ''}
            onChange={(e) => handleContactChange('name', e.target.value)}
            className="w-full bg-white/5 border border-zinc-800 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-white text-sm sm:text-base focus:outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-zinc-700 min-h-[44px]"
          />
        </div>
      </div>

      {/* Phone input */}
      <div>
        <label className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase ml-4 mb-1 sm:mb-2 block">
          Номер телефона
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-600" />
          <input
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={answers.phone || ''}
            onChange={handlePhoneChange}
            maxLength={18}
            className="w-full bg-white/5 border border-zinc-800 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-white text-sm sm:text-base focus:outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-zinc-700 min-h-[44px]"
          />
        </div>
      </div>

      <div className="pt-2 sm:pt-4">
        <Button
          fullWidth
          size="md"
          onClick={handleNext}
          disabled={!answers.name || !answers.phone || answers.phone.length < 16}
        >
          Далее
        </Button>
      </div>
    </div>
  );

  // ---- Render: final confirmation ----
  const renderFinalStep = () => (
    <div className="w-full max-w-md">
      <div className="bg-white/5 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-zinc-800">
        <p className="text-zinc-500 mb-1 text-xs uppercase font-bold tracking-wider">Подборка для:</p>
        <p className="text-white font-bold text-base sm:text-lg mb-3 leading-tight">
          {answers.step_0 || 'вас'}
        </p>
        <p className="text-zinc-500 mb-1 text-xs uppercase font-bold tracking-wider">Основная цель:</p>
        <p className="text-white font-bold text-base sm:text-lg leading-tight">
          {answers.step_1 || answers.step_0 || ''}
        </p>
      </div>
      <Button
        fullWidth
        size="md"
        onClick={handleSubmit}
        className="shadow-xl shadow-primary/20"
      >
        Увидеть результаты
      </Button>
    </div>
  );

  // ---- Main render ----
  return (
    <div id="quiz" className="bg-[#0c0c0e] pt-8 pb-10 md:pt-16 md:pb-20 relative">
      {/* Section header */}
      <div className="text-center mb-6 md:mb-12 max-w-3xl mx-auto px-4 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight uppercase">
          Подберем программу <br className="sm:hidden" />
          за 1 минуту
        </h2>
        <p className="text-zinc-400 text-sm md:text-lg">
          Пройдите квиз и получите персональные рекомендации
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Main quiz card */}
        <div
          className={`relative bg-zinc-900 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-800/50 ${
            showResults ? 'mb-8 md:mb-12' : ''
          }`}
        >
          {/* Glow blob */}
          <div className="absolute -top-20 -right-20 w-60 sm:w-80 h-60 sm:h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 p-4 sm:p-6 md:p-12 min-h-[380px] sm:min-h-[420px] md:min-h-[550px] flex flex-col">
            {/* Progress bar */}
            {!showResults && !isAnalyzing && (
              <div className="mb-4 md:mb-10 max-w-4xl">
                <div className="flex justify-between items-end mb-2 md:mb-4">
                  <span className="text-primary/80 text-xs sm:text-sm font-medium uppercase tracking-widest">
                    Вопрос {currentStep + 1} / {steps.length}
                  </span>
                  <span className="text-white text-xs sm:text-sm font-bold">{progress}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="flex-grow flex flex-col">
              {/* Analyzing spinner */}
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 animate-in zoom-in duration-500 flex-grow">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6 md:mb-8" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    Обрабатываем ваши данные...
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Ищем оптимальное решение для вашего здоровья
                  </p>
                </div>
              ) : showResults ? (
                /* ---- Show Results inside card ---- */
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-10 flex-grow">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-xl shadow-primary/20 animate-in zoom-in">
                    <Check className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4 uppercase tracking-tight">
                    Ваш план готов!
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-md mx-auto">
                    Мы подобрали направления, которые помогут вам двигаться без боли.
                  </p>
                  <div className="mt-6 md:mt-8 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-[10px] md:text-sm text-primary uppercase tracking-widest font-bold">
                      Смотрите ниже
                    </p>
                  </div>
                </div>
              ) : (
                /* ---- Active quiz step ---- */
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 h-full">
                  {/* Quiz content — order-2 on mobile, order-1 on desktop */}
                  <div className="flex-1 order-2 lg:order-1 flex flex-col justify-center">
                    <h2 className="text-lg sm:text-xl md:text-4xl font-bold text-white mb-1 md:mb-2 leading-tight min-h-[2.5rem] sm:min-h-[3.5rem] md:min-h-0 flex items-center">
                      {stepConfig.title}
                    </h2>
                    {stepConfig.subtitle && (
                      <p className="text-zinc-400 text-xs md:text-base mb-4 md:mb-8">
                        {stepConfig.subtitle}
                      </p>
                    )}
                    {!stepConfig.subtitle && <div className="mb-4 md:mb-8" />}

                    {stepConfig.key === 'contact'
                      ? renderContactForm()
                      : stepConfig.key === 'final'
                      ? renderFinalStep()
                      : renderOptions()}
                  </div>

                  {/* Manager block — order-1 on mobile, order-2 on desktop */}
                  <div className="order-1 lg:order-2 lg:w-[38%] shrink-0">
                    <ManagerBlock />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Results section (below card) ---- */}
        {showResults && (
          <>
            <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-[#121215] border border-zinc-800 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-12 shadow-2xl relative overflow-hidden mb-6">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                  {/* Results header */}
                  <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 uppercase tracking-tighter italic">
                      Ваш путь к здоровью
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm md:text-base">
                      Персональные рекомендации
                    </p>
                  </div>

                  {/* Level tag + description */}
                  <div className="bg-zinc-900/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 border border-zinc-800 flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center">
                    <div className="bg-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white font-bold text-xs sm:text-sm uppercase tracking-wide shrink-0 shadow-lg shadow-primary/30">
                      {resultData.levelTag}
                    </div>
                    <p className="text-zinc-300 leading-snug text-sm sm:text-base md:text-lg">
                      {resultData.description}
                    </p>
                  </div>

                  {/* Directions + next steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
                    {/* Directions */}
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base md:text-xl mb-3 md:mb-6 flex items-center gap-2 uppercase tracking-widest text-primary">
                        Подходящие направления
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {resultData.directions.map((dir, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-800/30 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl flex flex-col shadow-lg border border-zinc-800"
                          >
                            <span className="text-white font-bold text-sm md:text-lg mb-0.5">
                              {dir.title}
                            </span>
                            <span className="text-zinc-500 text-[10px] sm:text-xs md:text-sm">
                              {dir.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next steps */}
                    <div>
                      <h3 className="text-white font-bold text-sm sm:text-base md:text-xl mb-3 md:mb-6 flex items-center gap-2 uppercase tracking-widest text-primary">
                        Дальнейшие шаги
                      </h3>
                      <div className="bg-zinc-900/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 border border-zinc-800 h-full flex flex-col justify-between">
                        <ul className="space-y-2 sm:space-y-3 mb-4 md:mb-6">
                          <li className="flex items-start gap-2 text-zinc-400 text-xs sm:text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            Запись на первичную диагностику ОДА
                          </li>
                          <li className="flex items-start gap-2 text-zinc-400 text-xs sm:text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            Подбор графика ({resultData.schedule})
                          </li>
                          <li className="flex items-start gap-2 text-zinc-400 text-xs sm:text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            Начало курса восстановления без боли
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-center">
                    <Button
                      size="md"
                      className="w-full sm:w-auto sm:px-12 mb-2 bg-primary hover:bg-accent"
                      onClick={() => {
                        const el = document.getElementById('footer');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Записаться на диагностику
                    </Button>
                    <p className="text-zinc-600 text-[10px] sm:text-xs text-center">
                      Мы свяжемся с вами для подтверждения времени консультации.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat after results */}
            <AiChat answers={answers} />
          </>
        )}
      </div>
    </div>
  );
};

export default QuizV1;
