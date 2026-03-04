import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Конструктор сайта — FitWebAI',
  description: 'Создайте сайт для фитнес-студии за 5 минут',
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}
