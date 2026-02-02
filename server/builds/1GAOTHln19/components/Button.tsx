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
    primary: "bg-primary hover:bg-violet-600 text-white shadow-[0_0_15px_-3px_rgba(109,40,217,0.5)] hover:shadow-[0_0_20px_0px_rgba(109,40,217,0.7)]",
    secondary: "bg-zinc-100 hover:bg-white text-zinc-900",
    outline: "border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:bg-zinc-800/50",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800/30",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
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