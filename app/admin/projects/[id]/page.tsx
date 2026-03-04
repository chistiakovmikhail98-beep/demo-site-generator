'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  niche: string;
  description: string;
  edit_password_plain: string | null;
  deployed_url: string;
  vk_group_url: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/superadmin/projects/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setProject(data.project);
        setForm({ name: data.project.name, slug: data.project.slug || '', status: data.project.status });
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/superadmin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('Сохранено');
        setTimeout(() => setMessage(''), 2000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Ошибка');
      }
    } catch {
      setMessage('Ошибка соединения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Загрузка...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/admin/projects" className="text-sm text-zinc-500 hover:text-white mb-4 inline-block">&larr; Все сайты</Link>

        <h1 className="text-2xl font-bold mb-6">Редактирование: {project.name}</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 mb-4">
            <div>ID: <span className="text-zinc-400 font-mono">{project.id.slice(0, 8)}...</span></div>
            <div>Создан: {new Date(project.created_at).toLocaleString('ru-RU')}</div>
            {project.vk_group_url && <div className="col-span-2">VK: <a href={project.vk_group_url} target="_blank" rel="noopener noreferrer" className="text-violet-400">{project.vk_group_url}</a></div>}
            {project.edit_password_plain && <div>Пароль: <span className="text-emerald-400 font-mono">{project.edit_password_plain}</span></div>}
          </div>

          {/* Editable fields */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Название</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Субдомен</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-violet-500"
              />
              <span className="text-sm text-zinc-500">.fitwebai.ru</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </div>

          {message && (
            <div className={`text-sm px-4 py-2 rounded-xl ${
              message === 'Сохранено' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-sm font-bold rounded-xl transition-colors"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <a
              href={`https://${form.slug || project.slug}.fitwebai.ru`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm rounded-xl transition-colors text-zinc-300"
            >
              Открыть сайт
            </a>
          </div>
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
