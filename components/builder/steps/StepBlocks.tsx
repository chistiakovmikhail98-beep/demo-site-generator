'use client';

import { useBuilderStore } from '@/lib/builder/store';
import { BLOCK_DEFINITIONS, getRequiredBlocks } from '@/lib/builder/block-definitions';

export default function StepBlocks() {
  const selectedBlocks = useBuilderStore(s => s.selectedBlocks);
  const blockVariants = useBuilderStore(s => s.blockVariants);
  const toggleBlock = useBuilderStore(s => s.toggleBlock);
  const setBlockVariant = useBuilderStore(s => s.setBlockVariant);

  const required = getRequiredBlocks();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Разделы сайта</h1>
        <p className="text-zinc-400">Выберите блоки и их варианты отображения</p>
      </div>

      <div className="space-y-3">
        {BLOCK_DEFINITIONS.map((block) => {
          const isRequired = required.includes(block.id);
          const isSelected = selectedBlocks.includes(block.id);
          const currentVariant = blockVariants[block.id] || 1;

          return (
            <div
              key={block.id}
              className={`
                rounded-xl border p-4 transition-all
                ${isSelected
                  ? 'border-zinc-700 bg-zinc-900'
                  : 'border-zinc-800/50 bg-zinc-900/30 opacity-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  onClick={() => !isRequired && toggleBlock(block.id)}
                  disabled={isRequired}
                  className={`
                    mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-xs transition-colors
                    ${isSelected
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-zinc-700 text-zinc-600'
                    }
                    ${isRequired ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  `}
                >
                  {isSelected && '✓'}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{block.icon}</span>
                    <h3 className="font-semibold">{block.name}</h3>
                    {isRequired && (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                        обязательный
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">{block.description}</p>

                  {/* Variant selector */}
                  {isSelected && (
                    <div className="mt-3 flex gap-2">
                      {block.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setBlockVariant(block.id, v.id)}
                          className={`
                            rounded-lg border px-3 py-1.5 text-xs font-medium transition-all
                            ${currentVariant === v.id
                              ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                              : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                            }
                          `}
                          title={v.description}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Выбрано {selectedBlocks.length} блоков
      </p>
    </div>
  );
}
