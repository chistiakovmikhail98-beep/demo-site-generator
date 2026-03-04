import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[var(--color-background,#09090b)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide rounded-xl";

  const variants = {
    primary: "bg-primary hover:bg-accent text-white shadow-[0_4px_24px_-4px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_8px_32px_-4px_rgba(var(--color-primary-rgb),0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    secondary: "bg-zinc-100 hover:bg-white text-zinc-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    outline: "border border-zinc-600 hover:border-primary/60 text-zinc-200 hover:text-white hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-[0.98]",
  };

  // All sizes enforce 44px+ touch targets (Apple HIG / WCAG)
  const sizes = {
    sm: "h-11 px-5 text-sm",     // 44px
    md: "h-12 px-7 text-[15px]", // 48px
    lg: "h-14 px-9 text-base",   // 56px
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;