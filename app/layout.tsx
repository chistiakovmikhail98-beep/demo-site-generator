import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitWebAI — Сайты для фитнес-студий за 60 секунд',
  description: 'Автоматическая генерация сайтов для фитнес-студий из группы ВКонтакте',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
