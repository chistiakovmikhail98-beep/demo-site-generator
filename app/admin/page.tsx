'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalProjects: number;
  totalLeads: number;
  demoLeads: number;
  siteLeads: number;
  todayLeads: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  lead_type: string;
  source_url?: string;
  project_name?: string;
  slug?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/superadmin/stats').then((r) => r.ok ? r.json() : Promise.reject()),
      fetch('/api/superadmin/leads?type=all').then((r) => r.ok ? r.json() : Promise.reject()),
      fetch('/api/superadmin/projects').then((r) => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([statsData, leadsData, projectsData]) => {
        setStats(statsData);
        setRecentLeads((leadsData.leads || []).slice(0, 10));
        setRecentProjects((projectsData.projects || []).slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Сайтов" value={stats?.totalProjects || 0} />
          <StatCard label="Всего заявок" value={stats?.totalLeads || 0} />
          <StatCard label="Заявки сегодня" value={stats?.todayLeads || 0} accent />
          <StatCard label="С демо-баннера" value={stats?.demoLeads || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent leads */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Последние заявки</h2>
              <Link href="/admin/leads" className="text-xs text-violet-400 hover:text-violet-300">Все</Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-zinc-600">Пока нет заявок</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{lead.name}</div>
                      <div className="text-xs text-zinc-500">{lead.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600">
                        {lead.lead_type === 'demo' ? 'Демо' : lead.project_name || 'Сайт'}
                      </div>
                      <div className="text-[10px] text-zinc-600">
                        {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent projects */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Последние сайты</h2>
              <Link href="/admin/projects" className="text-xs text-violet-400 hover:text-violet-300">Все</Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-zinc-600">Пока нет сайтов</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-violet-400">{p.slug}.fitwebai.ru</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {p.status}
                      </span>
                      <Link href={`/admin/projects/${p.id}`} className="text-xs text-zinc-500 hover:text-white">
                        &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className={`text-2xl font-black ${accent ? 'text-violet-400' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
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
          <Link href="/admin" className="text-zinc-300 hover:text-white">Dashboard</Link>
          <Link href="/admin/projects" className="text-zinc-500 hover:text-white">Сайты</Link>
          <Link href="/admin/leads" className="text-zinc-500 hover:text-white">Заявки</Link>
        </div>
      </div>
    </div>
  );
}
