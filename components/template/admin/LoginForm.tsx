import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function LoginForm({ onLogin, onClose }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    const result = await onLogin(password);
    if (!result.success) {
      setError(result.error || 'Ошибка входа');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
              <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Режим редактирования</h2>
          <p className="text-sm text-zinc-400 mt-1">Введите пароль для доступа к редактору сайта</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              autoFocus
              className="w-full h-11 px-4 bg-zinc-800 border border-zinc-600 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-11 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
