import React from 'react';
import { Sparkles } from 'lucide-react';

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
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
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
    soft: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
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

// --- Toggle Component ---
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
      enabled ? 'bg-teal-600' : 'bg-slate-200'
    }`}
    aria-pressed={enabled}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// --- Section Header ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 animate-fade-in">
    <h1 className="text-2xl font-medium text-slate-800 tracking-tight">{title}</h1>
    {subtitle && <p className="text-slate-500 mt-1 text-sm leading-relaxed">{subtitle}</p>}
  </div>
);

// --- Empty State Component ---
interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  actionLabel, 
  onAction, 
  icon: Icon = Sparkles 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <Icon size={28} className="text-teal-500/80" />
      </div>
      <h3 className="text-lg font-medium text-slate-800 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed text-sm md:text-base">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" className="min-w-[140px]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};