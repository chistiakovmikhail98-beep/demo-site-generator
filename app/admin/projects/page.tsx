'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  edit_password_plain: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/projects')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить проект "${name}"? Это действие нельзя отменить.`)) return;
    const res = await fetch(`/api/superadmin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Сайты ({projects.length})</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Название</th>
                  <th className="text-left px-4 py-3">Субдомен</th>
                  <th className="text-left px-4 py-3">Статус</th>
                  <th className="text-left px-4 py-3">Пароль</th>
                  <th className="text-left px-4 py-3">Дата</th>
                  <th className="text-right px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://${p.slug}.fitwebai.ru`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        {p.slug}.fitwebai.ru
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{p.edit_password_plain || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://${p.slug}.fitwebai.ru?admin`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
                        >
                          Админка
                        </a>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="text-[10px] px-2 py-1 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-violet-400"
                        >
                          Ред.
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="text-[10px] px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          Удал.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {projects.length === 0 && (
            <div className="text-center py-12 text-zinc-600">Нет проектов</div>
          )}
        </div>
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
          <Link href="/admin/projects" className="text-zinc-300 hover:text-white">Сайты</Link>
          <Link href="/admin/leads" className="text-zinc-500 hover:text-white">Заявки</Link>
        </div>
      </div>
    </div>
  );
}
