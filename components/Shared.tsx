import React from 'react';

// --- Card Component ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlight' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const baseStyle = "rounded-3xl p-6 transition-all duration-300 ease-out";
  const variants = {
    default: "bg-white shadow-sm hover:shadow-md border border-slate-100",
    highlight: "bg-teal-50 border border-teal-100",
    flat: "bg-slate-50 border border-slate-100/50" // Very subtle
  };

  return (
    <div 
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className} ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
    >
      {children}
    </div>
  );
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const base = "px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const styles = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
    soft: "bg-teal-50 text-teal-700 hover:bg-teal-100"
  };

  return (
    <button 
      className={`${base} ${styles[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="animate-pulse">Thinking...</span> : children}
    </button>
  );
};

// --- Section Header ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 animate-fade-in">
    <h1 className="text-2xl font-medium text-slate-800 tracking-tight">{title}</h1>
    {subtitle && <p className="text-slate-500 mt-1 text-sm leading-relaxed">{subtitle}</p>}
  </div>
);