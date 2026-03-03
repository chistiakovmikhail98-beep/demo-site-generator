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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed tracking-wide rounded-full";
  
  const variants = {
    primary: "bg-primary hover:bg-accent text-white shadow-[0_0_15px_-3px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_0_20px_0px_rgba(var(--color-primary-rgb),0.7)]",
    secondary: "bg-zinc-100 hover:bg-white text-zinc-900",
    outline: "border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:bg-zinc-800/50",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800/30",
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