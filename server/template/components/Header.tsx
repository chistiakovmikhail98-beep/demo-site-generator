import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, BRAND_CONFIG } from '../constants';
import Button from './Button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-10 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-zinc-950/90 backdrop-blur-md border-zinc-800 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-none">
            <span className={`text-xl font-black tracking-tighter transition-colors uppercase ${isScrolled ? 'text-white' : 'text-white'}`}>
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">STUDIO</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                isScrolled ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-primary'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button size="sm" onClick={() => window.location.href='#footer'} className="font-bold bg-primary hover:bg-accent">
            Записаться
          </Button>
        </div>

        <button 
          className={`md:hidden ${isScrolled ? 'text-zinc-200' : 'text-zinc-900'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-zinc-950 border-b border-zinc-800 p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-lg font-bold text-zinc-200 py-3 border-b border-zinc-800/50 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button fullWidth onClick={() => { setIsMobileMenuOpen(false); window.location.href='#footer'; }} className="bg-primary">
            Записаться
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;