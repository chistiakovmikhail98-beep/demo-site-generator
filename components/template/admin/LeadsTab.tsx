'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: 'quiz' | 'footer' | 'chat';
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  created_at: string;
  quiz_answers?: Record<string, string> | null;
}

interface LeadsTabProps {
  projectId: string;
  jwt: string;
  apiUrl: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-amber-500/20 text-amber-400',
  converted: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-zinc-500/20 text-zinc-400',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  contacted: 'Связались',
  converted: 'Клиент',
  rejected: 'Отказ',
};

const SOURCE_LABELS: Record<string, string> = {
  quiz: 'Квиз',
  footer: 'Форма',
  chat: 'Чат',
};

export default function LeadsTab({ projectId, jwt, apiUrl }: LeadsTabProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [projectId, jwt]);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = apiUrl || '';
      const res = await fetch(`${baseUrl}/api/site-leads?project_id=${projectId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHour < 24) return `${diffHour} ч назад`;
    if (diffDay < 7) return `${diffDay} дн назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Загрузка заявок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-xs text-red-400 mb-3">{error}</p>
        <button onClick={fetchLeads} className="text-xs text-primary hover:underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-800 flex items-center justify-center">
          <InboxIcon />
        </div>
        <p className="text-sm text-zinc-300 font-medium mb-1">Пока нет заявок</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Заявки появятся, когда посетители заполнят квиз или форму на вашем сайте.
        </p>
      </div>
    );
  }

  const newCount = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="p-3">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-xs text-zinc-400">
          Всего: <span className="text-white font-bold">{leads.length}</span>
        </span>
        {newCount > 0 && (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full">
            {newCount} новых
          </span>
        )}
        <button
          onClick={fetchLeads}
          className="ml-auto text-[10px] text-zinc-500 hover:text-primary transition-colors"
          title="Обновить"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Lead list */}
      <div className="space-y-2">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white truncate">{lead.name}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, '')}`}
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lead.phone}
                  </a>
                  <span className="text-[10px] text-zinc-600">
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-600 whitespace-nowrap shrink-0">
                {formatTime(lead.created_at)}
              </span>
            </div>

            {/* Expanded: quiz answers */}
            {expandedId === lead.id && lead.quiz_answers && (
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                  Ответы квиза
                </p>
                <div className="space-y-1">
                  {Object.entries(lead.quiz_answers)
                    .filter(([k]) => k.startsWith('step_'))
                    .map(([key, val]) => (
                      <div key={key} className="flex gap-2 text-[11px]">
                        <span className="text-zinc-600 shrink-0">{key.replace('step_', '#')}</span>
                        <span className="text-zinc-300">{val}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10H7L8.5 13H11.5L13 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" />
      <path d="M3 10V15C3 15.552 3.448 16 4 16H16C16.552 16 17 15.552 17 15V10" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400" />
      <path d="M3 10L5 4H15L17 10" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M13 8A5 5 0 113 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 3V8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
