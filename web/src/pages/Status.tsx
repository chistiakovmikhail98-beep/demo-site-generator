import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, ExternalLink, ArrowLeft, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

interface StatusData {
  id: string;
  status: 'pending' | 'processing' | 'building' | 'deploying' | 'completed' | 'failed';
  deployedUrl?: string;
  error?: string;
}

const STEPS = [
  { key: 'pending', label: 'В очереди', icon: '📋' },
  { key: 'processing', label: 'AI анализирует данные', icon: '🤖' },
  { key: 'building', label: 'Сборка сайта', icon: '🔨' },
  { key: 'deploying', label: 'Публикация на Vercel', icon: '🚀' },
  { key: 'completed', label: 'Готово!', icon: '✅' },
];

export default function Status() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Перегенерация проекта
  const handleRegenerate = async () => {
    if (!id) return;
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/projects/${id}/regenerate`, { method: 'POST' });
      if (response.ok) {
        setStatus(prev => prev ? { ...prev, status: 'pending', deployedUrl: undefined, error: undefined } : null);
      }
    } catch (err) {
      console.error('Ошибка перегенерации:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Удаление проекта
  const handleDelete = async () => {
    if (!id || !confirm('Удалить этот проект?')) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${id}`);
        if (!response.ok) {
          throw new Error('Проект не найден');
        }
        const data: StatusData = await response.json();
        setStatus(data);

        // Продолжаем polling если не завершено
        if (data.status !== 'completed' && data.status !== 'failed') {
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      }
    };

    pollStatus();
  }, [id]);

  const getCurrentStepIndex = () => {
    if (!status) return 0;
    return STEPS.findIndex(s => s.key === status.status);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Генерация сайта
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {status?.status === 'completed'
              ? 'Ваш сайт готов!'
              : status?.status === 'failed'
              ? 'Произошла ошибка'
              : 'Создаём ваш сайт...'}
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            {STEPS.map((step, idx) => {
              const currentIdx = getCurrentStepIndex();
              const isCompleted = idx < currentIdx || status?.status === 'completed';
              const isCurrent = idx === currentIdx && status?.status !== 'completed' && status?.status !== 'failed';
              const isPending = idx > currentIdx;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-indigo-50 border-2 border-indigo-200'
                      : isCompleted
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{step.icon}</span>
                  <span
                    className={`font-medium flex-1 ${
                      isCurrent ? 'text-indigo-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {isCurrent && (
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Success Result */}
          {status?.status === 'completed' && status.deployedUrl && (
            <div className="mt-8 space-y-6">
              {/* Preview iframe */}
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-500 truncate flex-1 ml-2">
                    {status.deployedUrl}
                  </span>
                </div>
                <iframe
                  src={status.deployedUrl}
                  className="w-full h-[400px] bg-white"
                  title="Превью сайта"
                />
              </div>

              {/* Actions */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Сайт опубликован!
                </h2>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={status.deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Открыть сайт
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isRegenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Перегенерировать
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-200 transition disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status?.status === 'failed' && (
            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-200">
              <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Ошибка генерации
              </h2>
              <p className="text-red-600 mb-4">{status.error || 'Неизвестная ошибка'}</p>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isRegenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Попробовать снова
              </button>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Создать ещё один сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
