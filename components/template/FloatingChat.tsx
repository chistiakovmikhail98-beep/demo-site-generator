'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AiChat, { type AiChatConfig } from './AiChat';

interface FloatingChatProps {
  answers?: Record<string, string>;
  chatConfig: AiChatConfig;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ answers, chatConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto origin-bottom-right animate-in fade-in slide-in-from-bottom-10 zoom-in-95 duration-300">
          <div className="w-[340px] md:w-[380px] shadow-2xl rounded-2xl overflow-hidden">
            <AiChat answers={answers || {}} config={chatConfig} variant="widget" />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-zinc-800 rotate-90' : 'bg-primary hover:bg-violet-600 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 text-white fill-white/20" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--color-background,#09090b)] rounded-full animate-bounce"></span>
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
