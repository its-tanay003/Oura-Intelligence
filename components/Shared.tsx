
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic, Loader2, StopCircle, Eye, EyeOff, X } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// --- PHYSICS UTILS ---
const SPRING_CONFIG = { stiffness: 150, damping: 15, mass: 0.1 };

// --- MAGNETIC WRAPPER ---
// Adds a subtle magnetic pull to any component
const Magnetic: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const position = { x: useMotionValue(0), y: useMotionValue(0) };
    
    const smoothX = useSpring(position.x, SPRING_CONFIG);
    const smoothY = useSpring(position.y, SPRING_CONFIG);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        position.x.set(middleX * 0.15); // Attraction strength
        position.y.set(middleY * 0.15);
    };

    const handleMouseLeave = () => {
        position.x.set(0);
        position.y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: smoothX, y: smoothY }}
            className="w-fit h-fit"
        >
            {children}
        </motion.div>
    );
};

// --- CARD COMPONENT (Glassmorphism 3.0 + Tilt) ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlight' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Tilt Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]); // Inverted for natural tilt
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  const springRotateX = useSpring(rotateX, SPRING_CONFIG);
  const springRotateY = useSpring(rotateY, SPRING_CONFIG);

  // Glare Physics
  const glareX = useTransform(x, [-100, 100], [0, 100]);
  const glareY = useTransform(y, [-100, 100], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct * 200);
      y.set(yPct * 200);
  };

  const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
  };

  const variants = {
    default: "bg-slate-900/40 border-white/5 hover:border-teal-500/30 hover:bg-slate-800/50",
    highlight: "bg-teal-900/10 border-teal-500/20 hover:border-teal-400/40 hover:bg-teal-900/20",
    flat: "bg-slate-950/40 border-white/5" 
  };

  return (
    <motion.div 
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
      className={`relative rounded-3xl p-6 backdrop-blur-xl border transition-colors duration-500 overflow-hidden group ${variants[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Glare Effect */}
      <motion.div 
        style={{ 
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.07) 0%, transparent 80%)`,
        }}
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      {/* Content */}
      <div className="relative z-10 transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// --- BUTTON COMPONENT (Magnetic + Liquid) ---
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
  const base = "relative overflow-hidden px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 outline-none transition-all";
  
  const styles = {
    primary: "bg-teal-500 text-slate-950 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]",
    secondary: "bg-slate-800/50 border border-white/10 text-slate-200 hover:bg-slate-800",
    ghost: "bg-transparent text-slate-400 hover:text-white",
    soft: "bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
  };

  const btnContent = (
    <button 
      className={`${base} ${styles[variant]} ${className} disabled:opacity-50`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Liquid Hover Fill */}
      {variant === 'primary' && (
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
         {isLoading ? <Loader2 size={20} className="animate-spin" /> : children}
      </span>
    </button>
  );

  // Apply Magnetic effect to Primary/Soft buttons
  if (variant === 'primary' || variant === 'soft' || variant === 'secondary') {
      return <Magnetic>{btnContent}</Magnetic>;
  }

  return btnContent;
};

// --- GLASS SLIDER COMPONENT ---
// A custom range input replacement that feels like a physical UI element
interface GlassSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    label?: string;
    className?: string;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({ value, min, max, step = 1, onChange, label, className = '' }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const relativeX = clientX - rect.left;
        const newPercentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        const newValue = min + (newPercentage / 100) * (max - min);
        
        // Snap to step
        const steppedValue = Math.round(newValue / step) * step;
        onChange(Math.max(min, Math.min(max, steppedValue)));
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); 
        setIsDragging(true);
        handleInteraction(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Attach global listeners for mouse up to ensure we catch release outside the component
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className={`space-y-4 ${className}`}>
             {label && <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</label>}
             <div 
                ref={ref}
                className="relative h-12 w-full bg-slate-900/50 rounded-full border border-white/5 cursor-pointer touch-none overflow-visible group"
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => { if(isDragging) handleInteraction(e); }}
                onTouchStart={handleMouseDown}
                onTouchMove={(e) => { if(isDragging) handleInteraction(e); }}
             >
                 {/* Track Fill */}
                 <div 
                    className={`absolute top-0 left-0 bottom-0 rounded-l-full transition-all duration-100 ease-out ${isDragging ? 'bg-teal-400/30 shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'bg-teal-500/20'}`}
                    style={{ width: `${percentage}%` }}
                 />
                 
                 {/* Glow Line / Active Track Indicator */}
                 <div 
                    className="absolute top-0 bottom-0 w-px bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] transition-all duration-100 ease-out"
                    style={{ left: `${percentage}%` }}
                 />

                 {/* Physical Knob / Thumb */}
                 <div 
                    className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-200 ease-out z-10 flex items-center justify-center pointer-events-none"
                    style={{ 
                        left: `${percentage}%`,
                        transform: `translateY(-50%) scale(${isDragging ? 0.8 : 1})`
                    }}
                 >
                     <div className={`w-1.5 h-1.5 rounded-full bg-teal-500 transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0'}`} />
                 </div>

                 {/* Text Value (Floating) */}
                 <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                     <span className="text-xs font-mono text-slate-600">{min}</span>
                     <span className="text-xs font-mono text-slate-600">{max}</span>
                 </div>
             </div>
        </div>
    );
};

// --- INPUT COMPONENT (Glass) ---
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
            {label && <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}
            <div className="relative group">
                <input 
                    {...props}
                    type={isPassword && isPasswordVisible ? 'text' : props.type}
                    className={`w-full p-4 rounded-2xl bg-slate-900/50 border backdrop-blur-md outline-none font-medium text-slate-200 placeholder:text-slate-600 transition-all duration-300
                    ${error ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/10 focus:border-teal-500/50 focus:bg-slate-900/80 focus:shadow-[0_0_20px_rgba(20,184,166,0.1)]'}
                    ${icon ? 'pl-11' : ''} ${className}`}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors duration-300 pointer-events-none">
                        {icon}
                    </div>
                )}
                {isPassword && (
                    <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-amber-500 ml-1 font-mono mt-1">{error}</p>}
        </div>
    );
};

// --- SECTION HEADER (Massive Typography) ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-12">
    <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl font-thin text-white tracking-tighter mb-4 leading-[0.9]"
    >
        {title}
    </motion.h1>
    {subtitle && (
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em] opacity-80 pl-1 border-l-2 border-teal-500/50"
        >
            {subtitle}
        </motion.p>
    )}
  </div>
);

// --- MODAL (Backdrop Blur) ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative bg-slate-900/90 border border-white/10 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 transition-colors z-10">
                            <X size={20} />
                        </button>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- EMPTY STATE ---
export const EmptyState: React.FC<{ title: string; message: string; actionLabel?: string; onAction?: () => void; icon?: React.ElementType }> = ({ 
  title, message, actionLabel, onAction, icon: Icon = Sparkles 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-white/5 rounded-[2rem] bg-slate-900/20">
      <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-8 shadow-lg border border-white/5 animate-float">
        <Icon size={40} className="text-teal-400/80" />
      </div>
      <h3 className="text-3xl font-thin text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed font-mono text-xs tracking-wide">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" className="min-w-[160px]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// --- TOGGLE ---
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none border border-white/10 ${
      enabled ? 'bg-teal-500/20' : 'bg-slate-800'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 shadow-sm ${
        enabled ? 'translate-x-6 bg-teal-400' : 'translate-x-1 bg-slate-400'
      }`}
    />
  </button>
);

// --- VOICE INPUT ---
interface VoiceInputProps {
  onTranscript: (text: string) => void;
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
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
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
          } catch (error) { console.error(error); } finally { setIsProcessing(false); }
        };
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) { alert("Microphone access needed."); }
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
      className={`relative p-3 rounded-full transition-all duration-300 ${
        isRecording 
          ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/50' 
          : 'bg-slate-800 text-slate-400 hover:bg-teal-500/20 hover:text-teal-400'
      } ${className}`}
    >
      {isProcessing ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
    </button>
  );
};
