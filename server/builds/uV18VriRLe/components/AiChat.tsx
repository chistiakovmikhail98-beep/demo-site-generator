import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

const MANAGER_AVATAR = "https://static.tildacdn.com/tild3163-3331-4131-b131-643538356637/photo.jpg";
const WEBHOOK_URL = "https://primum-digital.store/webhook/iivik";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface AiChatProps {
  answers: Record<string, string>;
  variant?: 'default' | 'widget';
  className?: string;
}

const AiChat: React.FC<AiChatProps> = ({ answers, variant = 'default', className = '' }) => {
  // Генерация уникального ID сессии (как в примере)
  const [sessionId] = useState(() => `web_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Здравствуйте! Я Виктория Марус, основатель студии здорового движения. Рада, что вы заботитесь о своем здоровье! Я отвечу на любые вопросы о наших методиках, осанке, реабилитации и помогу записаться на диагностику. Чем могу помочь? 😊'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isWidget = variant === 'widget';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1. Добавляем сообщение пользователя
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 2. Формируем контекст из квиза
      const contextString = Object.entries(answers).length > 0
        ? Object.entries(answers).map(([key, val]) => `- ${key}: ${val}`).join('\n')
        : "Пользователь еще не прошел квиз.";

      // 3. Формируем историю переписки (последние 6 сообщений)
      const historyString = messages
        .slice(-6) 
        .map(m => `${m.sender === 'user' ? 'Пользователь' : 'Виктория (AI)'}: ${m.text}`)
        .join('\n');

      // 4. Собираем полный промпт для AI (Адаптировано под Викторию Марус)
      const fullPrompt = `
Входящее сообщение от пользователя: "${userMsg.text}"

---
ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ (ИЗ КВИЗА):
${contextString}

ТЕХНИЧЕСКИЕ ДАННЫЕ:
URL: ${window.location.href}

ИСТОРИЯ ПЕРЕПИСКИ:
${historyString}

ТВОЯ ЗАДАЧА:
Ответь пользователю от имени Виктории Марус (основатель Студии здорового движения в Смоленске). 
Твоя специализация: коррекция осанки, пилатес, реабилитация, движение без боли.
Будь профессиональной, эмпатичной и поддерживающей.
Если спрашивают цены: первичная диагностика - 10 000 руб (у Виктории) или 5 000 руб (у топ-тренера).
Пробные занятия от 700 руб.
Не пиши слишком длинные тексты. Используй эмодзи.
`;

      const payload = {
        sessionId: sessionId, 
        message: userMsg.text,
        prompt: fullPrompt 
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }

      // 5. Парсим ответ (логика из примера для надежности)
      let botResponseText = "";
      try {
        const data = JSON.parse(responseText);
        // Ищем поле с текстом ответа в разных популярных форматах n8n/вебхуков
        if (typeof data === 'object' && data !== null) {
            if (data.text) botResponseText = data.text;
            else if (data.output) botResponseText = data.output;
            else if (data.message) botResponseText = data.message;
            else if (Array.isArray(data) && data[0]?.text) botResponseText = data[0].text;
            else botResponseText = JSON.stringify(data);
        } else {
            botResponseText = String(data);
        }
      } catch (e) {
         // Если не JSON, считаем что вернулся чистый текст
         botResponseText = responseText;
      }

      // Если ответ пустой
      if (!botResponseText || botResponseText.trim() === "") {
         botResponseText = "Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Простите, возникла ошибка соединения. Пожалуйста, напишите мне в Telegram или WhatsApp по кнопкам ниже."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerClasses = isWidget
    ? "bg-surface border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]"
    : "bg-surface border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col md:flex-row h-[550px] md:h-[600px]";

  const outerClasses = isWidget 
    ? `w-full ${className}` 
    : `w-full mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ${className}`;

  return (
    <div className={outerClasses}>
      <div className={containerClasses}>
        {!isWidget ? (
            <div className="bg-zinc-900/50 p-4 md:p-8 md:w-1/3 flex flex-col md:justify-between border-b md:border-b-0 md:border-r border-zinc-800">
                <div>
                    <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-6">
                        <div className="relative">
                            <img 
                                src={MANAGER_AVATAR} 
                                alt="Виктория" 
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-[#121215] animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Виктория</h3>
                            <p className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">Основатель</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            На связи и готова помочь вам обрести радость движения и жизнь без боли.
                        </p>
                    </div>
                </div>
                
                <div className="hidden md:block mt-auto pt-6 border-t border-zinc-800">
                    <p className="text-zinc-500 text-xs">
                        Отвечаю в течение пары минут
                    </p>
                </div>
            </div>
        ) : (
            <div className="bg-primary p-4 flex items-center gap-3 border-b border-white/10">
                <div className="relative">
                    <img 
                        src={MANAGER_AVATAR} 
                        alt="Виктория" 
                        className="w-10 h-10 rounded-full object-cover border border-white/30"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm leading-none uppercase tracking-tight">Виктория Марус</h3>
                    <p className="text-red-200 text-[10px] font-medium mt-0.5">Эксперт по осанке</p>
                </div>
            </div>
        )}

        <div className="flex-1 flex flex-col bg-surface relative h-full overflow-hidden">
            <div 
                ref={chatContainerRef} 
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`
                                max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                                ${msg.sender === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                                    : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800'
                                }
                            `}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-900 text-zinc-500 rounded-2xl rounded-tl-none p-3 flex items-center gap-2 border border-zinc-800">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-xs">Пишу ответ...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-zinc-900/50 border-t border-zinc-800">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Спросите меня о здоровье..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 p-2 bg-primary hover:bg-accent text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;