
import React, { createContext, useContext, useState } from 'react';
import { motion } from 'framer-motion';

export type SystemState = 'OPTIMAL' | 'BALANCED' | 'DEPLETED';

interface AmbientSystemContextType {
  systemState: SystemState;
  setSystemState: (state: SystemState) => void;
}

const AmbientSystemContext = createContext<AmbientSystemContextType>({
  systemState: 'OPTIMAL',
  setSystemState: () => {},
});

export const useAmbientSystem = () => useContext(AmbientSystemContext);

export const AmbientSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemState, setSystemState] = useState<SystemState>('OPTIMAL');
  return (
    <AmbientSystemContext.Provider value={{ systemState, setSystemState }}>
      {children}
    </AmbientSystemContext.Provider>
  );
};

export const AmbientBackground: React.FC = () => {
  const { systemState } = useAmbientSystem();

  // Color Configs for each state
  const colors = {
    OPTIMAL: {
      orb1: 'bg-teal-500/10',
      orb2: 'bg-indigo-500/10',
      orb3: 'bg-emerald-500/5',
      base: 'from-slate-950 via-slate-900 to-slate-950'
    },
    BALANCED: {
      orb1: 'bg-blue-500/10',
      orb2: 'bg-violet-500/10',
      orb3: 'bg-teal-500/5',
      base: 'from-slate-950 via-slate-900 to-slate-950'
    },
    DEPLETED: {
      orb1: 'bg-rose-600/15', // Warning hue
      orb2: 'bg-amber-600/10',
      orb3: 'bg-orange-500/5',
      base: 'from-slate-950 via-rose-950/20 to-slate-950' // Subtle reddish tint in void
    }
  };

  const currentColors = colors[systemState];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950 transition-colors duration-[3000ms]">
      {/* Deep Space Base */}
      <div className={`absolute inset-0 bg-gradient-to-b opacity-90 transition-colors duration-[3000ms] ${currentColors.base}`} />

      {/* Moving Orbs (Simulating R3F Shaders via CSS Filters) */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute top-0 left-[-20%] w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen transition-colors duration-[3000ms] ${currentColors.orb1}`}
      />

      <motion.div 
        animate={{ 
          x: [0, -100, 0], 
          y: [0, 100, 0],
          scale: [1, 1.5, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen transition-colors duration-[3000ms] ${currentColors.orb2}`}
      />

      <motion.div 
        animate={{ 
          x: [0, 50, -50, 0], 
          y: [0, -100, 50, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
        className={`absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen transition-colors duration-[3000ms] ${currentColors.orb3}`}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-80" />
    </div>
  );
};
