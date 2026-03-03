import React from 'react';

interface PublishModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  publishing: boolean;
}

export default function PublishModal({ onConfirm, onCancel, publishing }: PublishModalProps) {
  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 13V3M10 3L6 7M10 3L14 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
            <path
              d="M3 13V15C3 15.552 3.448 16 4 16H16C16.552 16 17 15.552 17 15V13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">Публикация сайта</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Сайт будет пересобран с вашими изменениями и опубликован.
          Это может занять 1-2 минуты.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={publishing}
            className="flex-1 h-11 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing}
            className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {publishing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Публикация...
              </>
            ) : (
              'Опубликовать'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
