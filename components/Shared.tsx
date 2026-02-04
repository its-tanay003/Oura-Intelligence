
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic, Loader2, StopCircle, Eye, EyeOff, X } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';

// --- Card Component ---
// Added: transform-gpu for better performance, hover scaling
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlight' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const baseStyle = "rounded-3xl p-6 transition-all duration-300 ease-calm transform-gpu backface-hidden";
  const variants = {
    default: "bg-white shadow-sm hover:shadow-md border border-slate-100",
    highlight: "bg-teal-50 border border-teal-100",
    flat: "bg-slate-50 border border-slate-100/50" // Very subtle
  };

  const interactiveStyle = onClick ? "cursor-pointer active:scale-[0.98] hover:translate-y-[-2px]" : "";

  return (
    <div 
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${interactiveStyle} ${className}`}
    >
      {children}
    </div>
  );
};

// --- Button Component ---
// Added: tactile press feedback, smooth ring focus
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
  const base = "px-6 py-3 rounded-2xl font-medium transition-all duration-200 ease-calm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  const styles = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-200 focus-visible:ring-teal-500",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400",
    ghost: "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300",
    soft: "bg-teal-50 text-teal-700 hover:bg-teal-100 focus-visible:ring-teal-400",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-400"
  };

  return (
    <button 
      className={`${base} ${styles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 size={20} className="animate-spin" /> : children}
    </button>
  );
};

// --- Input Component (Auth Optimized) ---
// Added: Smooth border transition on focus
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = props.type === 'password';
    
    return (
        <div className="space-y-1.5 w-full text-left">
            {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative group transition-all duration-300">
                <input 
                    {...props}
                    type={isPassword && isPasswordVisible ? 'text' : props.type}
                    className={`w-full p-4 rounded-2xl bg-slate-50 border-2 transition-all duration-300 ease-calm outline-none font-medium text-slate-800 placeholder:text-slate-300
                    ${error ? 'border-amber-200 bg-amber-50/30 focus:border-amber-300' : 'border-slate-100 focus:border-teal-200 focus:bg-white focus:shadow-sm'}
                    ${icon ? 'pl-11' : ''} ${className}`}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300 pointer-events-none">
                        {icon}
                    </div>
                )}
                {isPassword && (
                    <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200/50"
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-amber-600 ml-1 animate-fade-in">{error}</p>}
        </div>
    );
};

// --- Modal Component ---
// Added: Smooth scale/opacity entrance
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) setVisible(true);
        else setTimeout(() => setVisible(false), 300);
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-calm ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 ease-calm transform ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10">
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
};

// --- Toggle Component ---
// Added: Smooth glide transition
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-calm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
      enabled ? 'bg-teal-600' : 'bg-slate-200'
    }`}
    aria-pressed={enabled}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 ease-calm shadow-sm ${
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
export const EmptyState: React.FC<{ title: string; message: string; actionLabel?: string; onAction?: () => void; icon?: React.ElementType }> = ({ 
  title, message, actionLabel, onAction, icon: Icon = Sparkles 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-scale-in border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm animate-float">
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

// --- Voice Input Component ---
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const text = await transcribeAudio(base64, 'audio/webm');
            onTranscript(text);
          } catch (error) {
            console.error("Transcription failed", error);
          } finally {
            setIsProcessing(false);
          }
        };
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or not available", err);
      alert("Please allow microphone access to use voice input.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`relative p-2 rounded-full transition-all duration-300 ease-calm ${
        isRecording 
          ? 'bg-rose-50 text-rose-500 scale-110' 
          : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-600 hover:scale-105'
      } ${className}`}
      title="Voice Input"
    >
      {isProcessing ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isRecording ? (
        <>
          <span className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-ping"></span>
          <StopCircle size={18} className="relative z-10" />
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
};
