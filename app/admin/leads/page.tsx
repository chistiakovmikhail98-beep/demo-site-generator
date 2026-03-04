'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  phone: string;
  lead_type: string;
  messenger?: string;
  studio_name?: string;
  source?: string;
  source_url?: string;
  project_name?: string;
  slug?: string;
  quiz_answers?: any;
  created_at: string;
}

type TabType = 'all' | 'demo' | 'site';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/superadmin/leads?type=${tab}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [tab, router]);

  const exportCSV = () => {
    const header = 'Имя,Телефон,Тип,Источник,Дата\n';
    const rows = leads.map((l) =>
      `"${l.name}","${l.phone}","${l.lead_type}","${l.project_name || l.studio_name || ''}","${new Date(l.created_at).toLocaleString('ru-RU')}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Заявки ({leads.length})</h1>
          <button
            onClick={exportCSV}
            className="text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors"
          >
            Экспорт CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'demo', 'site'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                tab === t ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Все' : t === 'demo' ? 'С демо-баннера' : 'С сайтов'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-600">Загрузка...</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Имя</th>
                    <th className="text-left px-4 py-3">Телефон</th>
                    <th className="text-left px-4 py-3">Тип</th>
                    <th className="text-left px-4 py-3">Источник</th>
                    <th className="text-left px-4 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{lead.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          lead.lead_type === 'demo' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {lead.lead_type === 'demo' ? 'Демо' : 'Сайт'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {lead.project_name || lead.studio_name || lead.source || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {new Date(lead.created_at).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leads.length === 0 && (
              <div className="text-center py-12 text-zinc-600">Нет заявок</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center text-xs font-black">F</div>
          <span className="text-sm font-bold text-white">Admin</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-zinc-500 hover:text-white">Dashboard</Link>
          <Link href="/admin/projects" className="text-zinc-500 hover:text-white">Сайты</Link>
          <Link href="/admin/leads" className="text-zinc-300 hover:text-white">Заявки</Link>
        </div>
      </div>
    </div>
  );
}
