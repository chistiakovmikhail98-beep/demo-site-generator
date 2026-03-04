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
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[var(--color-background,#0c0c0e)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide rounded-full";

  const variants = {
    primary: "bg-primary hover:bg-accent text-white shadow-[0_4px_20px_-4px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_8px_30px_-4px_rgba(var(--color-primary-rgb),0.7)] hover:scale-[1.03] active:scale-95",
    secondary: "bg-zinc-100 hover:bg-white text-zinc-900 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95",
    outline: "border border-zinc-600 hover:border-primary/60 text-zinc-200 hover:text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95",
  };

  // All sizes enforce 44px+ touch targets (Apple HIG / WCAG)
  const sizes = {
    sm: "h-11 px-5 text-sm",     // 44px
    md: "h-12 px-6 text-base",   // 48px
    lg: "h-14 px-8 text-lg",     // 56px
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