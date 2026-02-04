
import React, { useEffect, useState, createContext, useContext } from 'react';

// --- MOTION CONTEXT & HOOKS ---

interface MotionContextType {
    prefersReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({ prefersReducedMotion: false });

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (
        <MotionContext.Provider value={{ prefersReducedMotion }}>
            {children}
        </MotionContext.Provider>
    );
};

export const useMotion = () => useContext(MotionContext);

// --- ANIMATION PRIMITIVES ---

/**
 * PageTransition
 * Wraps top-level views. Handles the "cross-fade" effect when switching views.
 * Uses a unique key to trigger the re-render animation.
 */
export const PageTransition: React.FC<{ children: React.ReactNode; viewKey: string }> = ({ children, viewKey }) => {
    const { prefersReducedMotion } = useMotion();
    
    // Key ensures React unmounts/remounts, triggering CSS animations
    return (
        <div key={viewKey} className={prefersReducedMotion ? '' : 'animate-fade-in'}>
            {children}
        </div>
    );
};

/**
 * FadeIn
 * Standard entrance animation for content blocks.
 * Supports staggered delay.
 */
interface FadeInProps {
    children: React.ReactNode;
    delay?: number; // index for staggering
    className?: string;
    direction?: 'up' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = '', direction = 'up' }) => {
    const { prefersReducedMotion } = useMotion();
    
    const style = prefersReducedMotion ? {} : {
        animationDelay: `${delay * 50}ms`,
        animationFillMode: 'both' // Ensures opacity:0 before animation starts
    };

    const animationClass = prefersReducedMotion 
        ? '' 
        : direction === 'up' ? 'animate-slide-up' : 'animate-fade-in';

    return (
        <div className={`${animationClass} ${className}`} style={style}>
            {children}
        </div>
    );
};

/**
 * AmbientBreath
 * Adds a very subtle scaling/opacity cycle to "alive" elements like cards or status indicators.
 * Pauses on hover to reduce cognitive load while interacting.
 */
export const AmbientBreath: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    const { prefersReducedMotion } = useMotion();
    const animClass = prefersReducedMotion ? '' : 'animate-breathe hover:animate-none';
    
    return (
        <div className={`${animClass} ${className}`}>
            {children}
        </div>
    );
};

/**
 * LiveNumber
 * Animates a number from start to end value smoothly.
 */
export const LiveNumber: React.FC<{ value: number; duration?: number; className?: string }> = ({ value, duration = 1000, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const { prefersReducedMotion } = useMotion();

    useEffect(() => {
        if (prefersReducedMotion) {
            setDisplayValue(value);
            return;
        }

        let startTimestamp: number | null = null;
        const startValue = displayValue;
        
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // EaseOutExpo function for calm settlement
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            setDisplayValue(startValue + (value - startValue) * ease);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [value, prefersReducedMotion]);

    return <span className={className}>{Math.round(displayValue)}</span>;
};

/**
 * PulseIndicator
 * A soft, glowing dot to indicate "live" status or backend activity.
 */
export const PulseIndicator: React.FC<{ active?: boolean; color?: string }> = ({ active = true, color = 'bg-teal-500' }) => {
    const { prefersReducedMotion } = useMotion();
    if (!active) return <div className={`w-2 h-2 rounded-full ${color} opacity-20`} />;

    return (
        <div className="relative w-2 h-2">
            <div className={`absolute inset-0 rounded-full ${color} ${prefersReducedMotion ? '' : 'animate-ping opacity-20 duration-[3000ms]'}`}></div>
            <div className={`relative w-2 h-2 rounded-full ${color}`}></div>
        </div>
    );
};
