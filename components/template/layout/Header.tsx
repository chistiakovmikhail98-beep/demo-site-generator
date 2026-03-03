import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import type { HeaderData } from '../types';
import Button from '../Button';

interface Props {
  data: HeaderData;
  editable?: boolean;
}

export default function Header({ data }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-zinc-950/90 backdrop-blur-md border-zinc-800 py-2 sm:py-3'
          : 'bg-transparent border-transparent py-3 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2 shrink-0">
          {data.logo && (
            <img src={data.logo} alt={data.brandName} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover" />
          )}
          <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase leading-none">
            {data.brandName}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {data.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                scrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-primary'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button size="sm" onClick={() => { window.location.href = '#footer'; }}>
            Записаться
          </Button>
        </div>

        {/* Mobile hamburger — 44px touch target */}
        <button
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu — fullscreen overlay */}
      {open && (
        <div className="fixed inset-0 top-0 z-40 bg-zinc-950/98 backdrop-blur-sm md:hidden flex flex-col pt-20 px-6 pb-8 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-1 flex-1">
            {data.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="text-lg font-bold text-zinc-200 uppercase tracking-widest py-3 border-b border-zinc-800/50 transition-colors active:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button
            fullWidth
            size="lg"
            onClick={() => { close(); window.location.href = '#footer'; }}
            className="mt-6"
          >
            Записаться
          </Button>
        </div>
      )}
    </header>
  );
}
