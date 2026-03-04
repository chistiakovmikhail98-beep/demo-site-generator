'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { isPlaceholder } from './PlaceholderImg';

export interface AiChatConfig {
  managerName: string;
  managerImage: string;
  managerTitle: string;
  managerExpertise: string;
  welcomeMessage: string;
  responseTime: string;
  placeholderText: string;
  webhookUrl?: string;
  brandName: string;
  brandNiche: string;
  brandCity?: string;
  pricingInfo: string;
  contactPhone?: string;
}

const WEBHOOK_URL_DEFAULT = "https://primum-digital.store/webhook/iivik";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const DEFAULT_CONFIG: AiChatConfig = {
  managerName: 'Консультант',
  managerImage: '',
  managerTitle: 'Консультант',
  managerExpertise: 'Эксперт',
  welcomeMessage: 'Здравствуйте! Чем могу помочь?',
  responseTime: 'Отвечаю в течение пары минут',
  placeholderText: 'Задайте вопрос...',
  brandName: '',
  brandNiche: 'fitness',
  pricingInfo: '',
};

interface AiChatProps {
  answers: Record<string, string>;
  config?: AiChatConfig;
  variant?: 'default' | 'widget';
  className?: string;
}

const AiChat: React.FC<AiChatProps> = ({ answers, config: configProp, variant = 'default', className = '' }) => {
  const config = configProp || DEFAULT_CONFIG;
  const webhookUrl = config.webhookUrl || WEBHOOK_URL_DEFAULT;
  const [sessionId] = useState(() => `web_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', text: config.welcomeMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isWidget = variant === 'widget';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const contextString = Object.entries(answers).length > 0
        ? Object.entries(answers).map(([key, val]) => `- ${key}: ${val}`).join('\n')
        : "Пользователь еще не прошел квиз.";

      const historyString = messages
        .slice(-6)
        .map(m => `${m.sender === 'user' ? 'Пользователь' : `${config.managerName} (AI)`}: ${m.text}`)
        .join('\n');

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
Ответь пользователю от имени ${config.managerName} (${config.managerTitle} ${config.brandName}${config.brandCity ? ` в ${config.brandCity}` : ''}).
Ниша: ${config.brandNiche}.
Будь профессиональной, эмпатичной и поддерживающей.
Если спрашивают цены: ${config.pricingInfo}.
${config.contactPhone ? `Телефон для записи: ${config.contactPhone}.` : ''}
Не пиши слишком длинные тексты. Используй эмодзи.
`;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg.text, prompt: fullPrompt }),
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);

      let botResponseText = "";
      try {
        const data = JSON.parse(responseText);
        if (typeof data === 'object' && data !== null) {
          if (data.text) botResponseText = data.text;
          else if (data.output) botResponseText = data.output;
          else if (data.message) botResponseText = data.message;
          else if (Array.isArray(data) && data[0]?.text) botResponseText = data[0].text;
          else botResponseText = JSON.stringify(data);
        } else {
          botResponseText = String(data);
        }
      } catch {
        botResponseText = responseText;
      }

      if (!botResponseText?.trim()) {
        botResponseText = "Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), sender: 'bot',
        text: "Простите, возникла ошибка соединения. Пожалуйста, напишите мне в Telegram или WhatsApp по кнопкам ниже."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
                  {isPlaceholder(config.managerImage) ? (
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-primary shadow-lg flex items-center justify-center">
                      <User className="w-6 h-6 md:w-8 md:h-8 text-zinc-500" />
                    </div>
                  ) : (
                    <img src={config.managerImage} alt={config.managerName} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary shadow-lg" />
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-[var(--color-background,#09090b)] animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg">{config.managerName.split(' ')[0]}</h3>
                  <p className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">{config.managerTitle}</p>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  На связи и готов(а) помочь вам с любыми вопросами о {config.brandName}.
                </p>
              </div>
            </div>
            <div className="hidden md:block mt-auto pt-6 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs">{config.responseTime}</p>
            </div>
          </div>
        ) : (
          <div className="bg-primary p-4 flex items-center gap-3 border-b border-white/10">
            <div className="relative">
              {isPlaceholder(config.managerImage) ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border border-white/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
              ) : (
                <img src={config.managerImage} alt={config.managerName} className="w-10 h-10 rounded-full object-cover border border-white/30" />
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-none uppercase tracking-tight">{config.managerName}</h3>
              <p className="text-red-200 text-[10px] font-medium mt-0.5">{config.managerExpertise}</p>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-surface relative h-full overflow-hidden">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none shadow-primary/20' : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800'
                }`}>
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
                placeholder={config.placeholderText}
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
