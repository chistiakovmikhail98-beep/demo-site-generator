import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import AiChat from './AiChat';
import { Check, Calendar, User, Phone } from 'lucide-react';

const MANAGER_AVATAR = "https://i.ibb.co/LDrvK08K/photo-7.jpg";

const MANAGER_TIPS: Record<number, string> = {
  0: "Выберите, для кого ищем занятия. У нас есть специализированные программы для любого возраста!",
  1: "Честный ответ поможет мне подобрать наиболее эффективную и безопасную методику восстановления.",
  2: "Это поможет сфокусироваться на самом главном результате для вашего здоровья и легкости движения.",
  3: "Укажите ваши контакты, чтобы я могла отправить вам персональный план и связаться для консультации.",
  4: "Подберем формат занятий, который лучше всего впишется в ваш образ жизни и обеспечит результат.",
  5: "Подумайте, когда вам удобнее всего выделить время на заботу о себе в нашем пространстве.",
  6: "Всё готово! Сейчас сформирую ваш персональный план оздоровления."
};

const STEPS = [
  {
    id: 1,
    key: 'who',
    title: 'Кто будет заниматься?',
    options: [
      'Женщина (30-45+ лет)',
      'Мужчина (35+ лет)',
      'Ребенок (7-14 лет)',
      'Подросток (14-17 лет)',
    ]
  },
  {
    id: 2,
    key: 'pain',
    title: 'Есть ли дискомфорт или боли?',
    options: [
      'Боли в спине или шее',
      'Последствия травм',
      'Хроническая усталость',
      'Особых проблем нет, хочу профилактику',
    ]
  },
  {
    id: 3,
    key: 'goal',
    title: 'Какая ваша главная цель?',
    options: [
      'Исправить осанку / убрать сутулость',
      'Восстановиться после травмы',
      'Обрести легкость и гибкость',
      'Улучшить физическую форму без боли',
    ]
  },
  {
    id: 4,
    key: 'contact',
    title: 'Куда отправить ваш план?',
    subtitle: 'Для подбора подходящего времени на диагностику.'
  },
  {
    id: 5,
    key: 'format',
    title: 'Желаемый формат занятий?',
    options: [
      'Групповые тренировки',
      'Индивидуально с тренером',
      'Массаж + занятия',
      'Пока не знаю'
    ]
  },
  {
    id: 6,
    key: 'schedule',
    title: 'Удобное время для занятий?',
    options: [
      'Будни (утро/день)',
      'Будни (вечер)',
      'Выходные дни',
      'Плавающий график'
    ]
  },
  {
    id: 7,
    key: 'final',
    title: 'Результат готов!',
    subtitle: 'Нажмите кнопку, чтобы увидеть персональную подборку.'
  }
];

interface QuizProps {
  onAnswersUpdate?: (answers: Record<string, string>) => void;
}

const Quiz: React.FC<QuizProps> = ({ onAnswersUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync answers with parent component
  useEffect(() => {
    if (onAnswersUpdate) {
      onAnswersUpdate(answers);
    }
  }, [answers, onAnswersUpdate]);

  const stepConfig = STEPS[currentStep];
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [stepConfig.key]: option }));
    setTimeout(() => {
        if (currentStep < STEPS.length - 1) {
          handleNext();
        }
    }, 350);
  };

  const handleContactChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    let numberBody = digits;
    if (['7', '8'].includes(digits[0])) numberBody = digits.slice(1);
    numberBody = numberBody.slice(0, 10);
    let formatted = '+7';
    if (numberBody.length > 0) formatted += ` (${numberBody.slice(0, 3)}`;
    if (numberBody.length >= 3) formatted += `) ${numberBody.slice(3, 6)}`;
    if (numberBody.length >= 6) formatted += `-${numberBody.slice(6, 8)}`;
    if (numberBody.length >= 8) formatted += `-${numberBody.slice(8, 10)}`;
    handleContactChange('phone', formatted);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
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

  const getResults = () => {
    const goal = answers.goal || '';
    const pain = answers.pain || '';
    
    let directions = [];
    if (goal.includes('осанку') || pain.includes('спине')) {
        directions = [
            { title: 'Коррекция осанки', desc: 'Работа со сколиозом и болями' },
            { title: 'Пилатес', desc: 'Укрепление кора' }
        ];
    } else if (goal.includes('травмы')) {
        directions = [
            { title: 'Реабилитация', desc: 'Безопасное восстановление' },
            { title: 'Массаж', desc: 'Снятие зажимов' }
        ];
    } else {
        directions = [
            { title: 'Йога', desc: 'Гибкость и баланс' },
            { title: 'Функциональный тренинг', desc: 'Сила и выносливость' }
        ];
    }

    return {
        levelTag: 'Персональный план',
        description: `Цель: ${goal}. Фокус на: ${pain}. Программа для: ${answers.who}.`,
        directions,
        schedule: answers.schedule || 'Удобный график'
    };
  };

  const resultData = getResults();

  const ManagerBlock = () => (
    <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-6 bg-transparent p-0 mt-4 lg:mt-0">
        <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
                <img 
                    src={MANAGER_AVATAR} 
                    alt="Виктория" 
                    className="w-12 h-12 lg:w-24 lg:h-24 rounded-full object-cover border-2 lg:border-4 border-white/20"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-primary"></div>
            </div>
            <div className="lg:hidden flex flex-col">
                 <span className="text-sm font-bold text-white uppercase tracking-wide">
                    Виктория
                 </span>
                 <span className="text-[10px] font-medium text-red-200 uppercase tracking-wide opacity-80">
                    Основатель
                 </span>
            </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full">
            <span className="text-base font-bold text-white uppercase tracking-wide hidden lg:block pl-2">
                Виктория Марус
            </span>
            <div className="bg-white/10 lg:bg-white rounded-2xl lg:rounded-3xl lg:rounded-tl-none p-3 lg:p-6 shadow-sm border border-white/10 lg:border-none animate-in fade-in slide-in-from-left-2 duration-500">
                <p className="text-white lg:text-zinc-900 text-xs lg:text-lg leading-snug font-medium">
                    {MANAGER_TIPS[currentStep]}
                </p>
            </div>
        </div>
    </div>
  );

  return (
    <div id="quiz" className="bg-background pt-8 pb-10 md:pt-16 md:pb-20 relative">
      <div className="text-center mb-6 md:mb-12 max-w-3xl mx-auto px-4 relative z-10">
        <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight uppercase">
          Подберем программу <br className="md:hidden"/>за 1 минуту
        </h2>
        <p className="text-zinc-500 text-sm md:text-lg">
          Пройдите квиз и получите персональные рекомендации от Виктории Марус
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
        
        <div className={`relative bg-surface rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border border-zinc-800/50 ${showResults ? 'mb-8 md:mb-12' : ''}`}>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 p-4 md:p-12 min-h-[420px] md:min-h-[550px] flex flex-col">
                
                {!showResults && !isAnalyzing && (
                    <div className="mb-4 md:mb-10 max-w-4xl">
                        <div className="flex justify-between items-end mb-2 md:mb-4">
                            <span className="text-red-200 text-xs md:text-sm font-medium uppercase tracking-widest">Вопрос {currentStep + 1} / {STEPS.length}</span>
                            <span className="text-white text-xs md:text-sm font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(157,23,77,0.5)]" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="flex-grow flex flex-col">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 animate-in zoom-in duration-500 flex-grow">
                             <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6 md:mb-8"></div>
                             <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Обрабатываем ваши данные...</h3>
                             <p className="text-zinc-400 text-sm">Ищем оптимальное решение для вашего здоровья</p>
                        </div>
                    ) : showResults ? (
                         <div className="flex flex-col items-center justify-center text-center py-6 md:py-10 flex-grow">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-xl shadow-primary/20 animate-in zoom-in">
                                <Check className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4 uppercase tracking-tight">Ваш план готов!</h3>
                            <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto">
                                Мы подобрали направления, которые помогут вам двигаться без боли.
                            </p>
                            <div className="mt-6 md:mt-8 animate-bounce">
                                <p className="text-[10px] md:text-sm text-primary uppercase tracking-widest font-bold">Смотрите ниже</p>
                            </div>
                         </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 h-full">
                             <div className="flex-1 order-2 lg:order-1 flex flex-col justify-center">
                                 <h2 className="text-xl md:text-4xl font-bold text-white mb-1 md:mb-2 leading-tight min-h-[3.5rem] md:min-h-0 flex items-center">
                                    {stepConfig.title}
                                 </h2>
                                 {stepConfig.subtitle && (
                                    <p className="text-zinc-400 text-xs md:text-base mb-4 md:mb-8">{stepConfig.subtitle}</p>
                                 )}
                                 {!stepConfig.subtitle && <div className="mb-4 md:mb-8"></div>}

                                 {stepConfig.key === 'contact' ? (
                                    <div className="space-y-3 md:space-y-4 max-w-md w-full">
                                        <div>
                                            <label className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase ml-4 mb-1 md:mb-2 block">Ваше имя</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-600" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Введите ваше имя"
                                                    value={answers.name || ''}
                                                    onChange={(e) => handleContactChange('name', e.target.value)}
                                                    className="w-full bg-white/5 border border-zinc-800 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-white text-sm md:text-base focus:outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-zinc-700"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase ml-4 mb-1 md:mb-2 block">Номер телефона</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-600" />
                                                <input 
                                                    type="tel" 
                                                    placeholder="+7 (___) ___-__-__"
                                                    value={answers.phone || ''}
                                                    onChange={handlePhoneChange}
                                                    maxLength={18}
                                                    className="w-full bg-white/5 border border-zinc-800 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-white text-sm md:text-base focus:outline-none focus:bg-white/10 focus:border-primary transition-all placeholder:text-zinc-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2 md:pt-4">
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
                                 ) : stepConfig.key === 'final' ? (
                                     <div className="w-full max-w-md">
                                         <div className="bg-white/5 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-zinc-800">
                                             <p className="text-zinc-500 mb-1 text-xs uppercase font-bold tracking-wider">Подборка для:</p>
                                             <p className="text-white font-bold text-base md:text-lg mb-3 leading-tight">{answers.who}</p>
                                             <p className="text-zinc-500 mb-1 text-xs uppercase font-bold tracking-wider">Основная цель:</p>
                                             <p className="text-white font-bold text-base md:text-lg leading-tight">{answers.goal}</p>
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
                                 ) : (
                                    <div className="space-y-2 md:space-y-3 w-full">
                                      <div className="grid grid-cols-1 gap-2 md:gap-3">
                                          {stepConfig.options?.map((option) => (
                                              <button
                                                  key={option}
                                                  onClick={() => handleOptionSelect(option)}
                                                  className={`
                                                      px-4 py-3 md:p-5 text-left border rounded-xl md:rounded-xl transition-all duration-200 flex items-center justify-between group w-full
                                                      ${answers[stepConfig.key] === option 
                                                      ? 'border-primary bg-primary text-white shadow-lg font-bold ring-2 ring-primary/50' 
                                                      : 'border-zinc-800 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-zinc-700'
                                                      }
                                                  `}
                                              >
                                                  <span className="text-sm md:text-lg leading-tight">{option}</span>
                                                  {answers[stepConfig.key] === option && <Check className="w-4 h-4 md:w-6 md:h-6 text-white animate-in zoom-in shrink-0 ml-2" />}
                                              </button>
                                          ))}
                                      </div>
                                    </div>
                                 )}
                             </div>

                             <div className="order-1 lg:order-2 lg:w-[38%] shrink-0">
                                <ManagerBlock />
                             </div>

                        </div>
                    )}
                </div>
            </div>
        </div>

        {showResults && (
            <>
                <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-[#121215] border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl relative overflow-hidden mb-6">
                        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="text-center mb-6 md:mb-10">
                                <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 uppercase tracking-tighter italic">Ваш путь к здоровью</h2>
                                <p className="text-zinc-500 text-sm md:text-base">Персональные рекомендации от Виктории Марус</p>
                            </div>

                            <div className="bg-zinc-900/50 rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-8 border border-zinc-800 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                                <div className="bg-primary px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-white font-bold text-xs md:text-sm uppercase tracking-wide shrink-0 shadow-lg shadow-primary/30">
                                    {resultData.levelTag}
                                </div>
                                <p className="text-zinc-300 leading-snug text-sm md:text-lg">
                                    {resultData.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-10">
                                <div className="col-span-2 md:col-span-1">
                                    <h3 className="text-white font-bold text-base md:text-xl mb-3 md:mb-6 flex items-center gap-2 uppercase tracking-widest text-primary">
                                        Подходящие направления
                                    </h3>
                                    <div className="space-y-3">
                                        {resultData.directions.map((dir, idx) => (
                                            <div key={idx} className="bg-zinc-800/30 p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col shadow-lg border border-zinc-800">
                                                <span className="text-white font-bold text-sm md:text-lg mb-0.5">{dir.title}</span>
                                                <span className="text-zinc-500 text-[10px] md:text-sm">{dir.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <h3 className="text-white font-bold text-base md:text-xl mb-3 md:mb-6 flex items-center gap-2 uppercase tracking-widest text-primary">
                                        Дальнейшие шаги
                                    </h3>
                                    <div className="bg-zinc-900/50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-zinc-800 h-full flex flex-col justify-between">
                                        <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                            <li className="flex items-start gap-2 text-zinc-400 text-xs md:text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                Запись на первичную диагностику ОДА
                                            </li>
                                            <li className="flex items-start gap-2 text-zinc-400 text-xs md:text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                Подбор графика ({resultData.schedule})
                                            </li>
                                            <li className="flex items-start gap-2 text-zinc-400 text-xs md:text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                Начало курса восстановления без боли
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <Button size="md" className="w-full md:w-auto px-12 mb-2 bg-primary hover:bg-accent" onClick={() => window.location.href='#footer'}>
                                    Записаться на диагностику
                                </Button>
                                <p className="text-zinc-600 text-[10px] md:text-xs text-center">
                                    Виктория Марус свяжется с вами для подтверждения времени консультации.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <AiChat answers={answers} />
            </>
        )}

      </div>
    </div>
  );
};

export default Quiz;