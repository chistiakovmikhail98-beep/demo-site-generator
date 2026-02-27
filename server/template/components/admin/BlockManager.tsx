import React from 'react';
import type { BlockConfig } from '../../types';

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Главная',
  gallery: 'Галерея',
  quiz: 'Квиз',
  requests: 'Запросы',
  progressTimeline: 'Прогресс',
  directions: 'Направления',
  director: 'Руководитель',
  atmosphere: 'Атмосфера',
  instructors: 'Тренеры',
  stories: 'Истории',
  reviews: 'Отзывы',
  calculator: 'Калькулятор',
  advantages: 'Преимущества',
  pricing: 'Тарифы',
  objections: 'Возражения',
  faq: 'FAQ',
};

// Short variant names that fit in sidebar buttons (max ~8 chars)
export const VARIANT_NAMES: Record<string, string[]> = {
  hero: ['Классика', 'Фото-фон', 'Слайдер'],
  directions: ['Карточки', 'Компакт', 'Фильтры'],
  gallery: ['Мозаика', 'Слайдер', 'Сетка'],
  instructors: ['Карточки', 'Профили', 'Компакт'],
  stories: ['До/После', 'Карточки', 'Таймлайн'],
  reviews: ['Карточки', 'Минимал', 'Сетка'],
  director: ['Боковой', 'Карточка', 'Полный'],
  pricing: ['Карточки', 'Акцент', 'Минимал'],
  faq: ['Список', 'Двойной', 'Компакт'],
  objections: ['Мифы', 'Список', 'Карточки'],
  requests: ['Строка', 'Сетка', 'Облако'],
  advantages: ['Карточки', 'Иконки', 'Числа'],
  atmosphere: ['Сетка', 'Слайдер', 'Мозаика'],
};

const SINGLE_VARIANT_BLOCKS = ['quiz', 'calculator', 'progressTimeline'];

interface BlockManagerProps {
  layout: BlockConfig[];
  onChange: (layout: BlockConfig[]) => void;
}

export default function BlockManager({ layout, onChange }: BlockManagerProps) {
  const sorted = [...layout].sort((a, b) => a.order - b.order);

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const newLayout = [...sorted];
    [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];

    const updated = newLayout.map((block, i) => ({ ...block, order: i }));
    onChange(updated);
  };

  const setVariant = (type: string, variant: 1 | 2 | 3) => {
    const updated = layout.map((block) =>
      block.type === type ? { ...block, variant } : block
    );
    onChange(updated);
  };

  const toggleVisibility = (type: string) => {
    const updated = layout.map((block) =>
      block.type === type ? { ...block, visible: !block.visible } : block
    );
    onChange(updated);
  };

  // Scroll to block on the page when clicking its name
  const scrollToBlock = (type: string) => {
    const blockEl = document.querySelector(`[data-block="${type}"]`);
    if (blockEl) {
      blockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-3 space-y-1.5">
      {sorted.map((block, index) => {
        const variantNames = VARIANT_NAMES[block.type];
        const hasVariants = !SINGLE_VARIANT_BLOCKS.includes(block.type);

        return (
          <div
            key={block.type}
            className={`rounded-lg transition-all ${
              block.visible ? 'bg-zinc-800/80' : 'bg-zinc-800/30 opacity-50'
            }`}
          >
            {/* Top row: reorder + name + visibility */}
            <div className="flex items-center gap-1.5 px-2.5 py-2">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-px shrink-0">
                <button
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="w-5 h-3.5 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === sorted.length - 1}
                  className="w-5 h-3.5 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Block name — click to scroll */}
              <button
                onClick={() => scrollToBlock(block.type)}
                className="text-[13px] text-zinc-200 flex-1 min-w-0 truncate font-medium text-left hover:text-primary transition-colors"
                title={`Перейти к блоку «${BLOCK_LABELS[block.type]}»`}
              >
                {BLOCK_LABELS[block.type] || block.type}
              </button>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisibility(block.type)}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors shrink-0 ${
                  block.visible
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-700'
                }`}
                title={block.visible ? 'Скрыть' : 'Показать'}
              >
                {block.visible ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6.5 6.5A2 2 0 009.5 9.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 5C2.3 6 2 7 2 8C2 8 4.5 13 8 13C9.2 13 10.3 12.5 11 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* Variant buttons (when block has variants) */}
            {hasVariants && variantNames && (
              <div className="flex gap-1 px-2.5 pb-2.5">
                {([1, 2, 3] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(block.type, v)}
                    className={`flex-1 h-7 text-[11px] font-medium rounded-md transition-colors ${
                      block.variant === v
                        ? 'bg-primary text-white'
                        : 'bg-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-600'
                    }`}
                  >
                    {variantNames[v - 1]}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
