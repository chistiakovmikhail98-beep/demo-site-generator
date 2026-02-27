import React from 'react';
import type { BlockConfig, BlockType } from '../../types';

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

// Blocks that only have 1 variant
const SINGLE_VARIANT_BLOCKS = ['quiz', 'calculator', 'progressTimeline'];

interface BlockManagerProps {
  layout: BlockConfig[];
  onChange: (layout: BlockConfig[]) => void;
  onClose: () => void;
}

export default function BlockManager({ layout, onChange, onClose }: BlockManagerProps) {
  const sorted = [...layout].sort((a, b) => a.order - b.order);

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const newLayout = [...sorted];
    [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];

    // Recalculate order
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

  return (
    <div className="fixed bottom-12 left-0 right-0 z-[9989] max-h-[60vh] overflow-y-auto bg-zinc-900 border-t border-zinc-700 shadow-2xl">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Управление блоками</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Block list */}
        <div className="space-y-1">
          {sorted.map((block, index) => (
            <div
              key={block.type}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                block.visible ? 'bg-zinc-800' : 'bg-zinc-800/40 opacity-60'
              }`}
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="w-5 h-4 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === sorted.length - 1}
                  className="w-5 h-4 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Block name */}
              <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">
                {BLOCK_LABELS[block.type] || block.type}
              </span>

              {/* Variant selector */}
              {!SINGLE_VARIANT_BLOCKS.includes(block.type) && (
                <div className="flex items-center gap-0.5 shrink-0">
                  {([1, 2, 3] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(block.type, v)}
                      className={`w-7 h-7 text-xs font-medium rounded transition-colors ${
                        block.variant === v
                          ? 'bg-primary text-white'
                          : 'bg-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisibility(block.type)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                  block.visible
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-700'
                }`}
                title={block.visible ? 'Скрыть блок' : 'Показать блок'}
              >
                {block.visible ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6.5 6.5A2 2 0 009.5 9.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 5C2.3 6 2 7 2 8C2 8 4.5 13 8 13C9.2 13 10.3 12.5 11 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
