
import React, { useState, useEffect } from 'react';
import { Card, EmptyState, Button, SectionHeader } from '../Shared';
import { FadeIn, AmbientBreath, PulseIndicator, LiveNumber } from '../Motion';
import { Battery, Brain, Scale, Sunrise, ArrowRight, PauseCircle, Activity, CheckCircle, Coffee, Zap, ShieldAlert, ThermometerSun } from 'lucide-react';
import { View } from '../../types';
import { useAmbientSystem } from '../AmbientBackground';

interface HomeViewProps {
  onChangeView: (view: View) => void;
}

// Simulated System State
type SystemState = 'OPTIMAL' | 'BALANCED' | 'DEPLETED';

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  const [hasData] = useState(true); 
  const [isExpanded, setIsExpanded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // --- AMBIENT INTELLIGENCE STATE ---
  const [systemVitality, setSystemVitality] = useState(85); // 0-100
  const { setSystemState } = useAmbientSystem();
  
  // Local derived state for UI text
  const [localSystemState, setLocalSystemState] = useState<SystemState>('OPTIMAL');

  useEffect(() => {
      let newState: SystemState = 'OPTIMAL';
      if (systemVitality < 40) newState = 'DEPLETED';
      else if (systemVitality < 75) newState = 'BALANCED';
      
      setLocalSystemState(newState);
      setSystemState(newState);
  }, [systemVitality, setSystemState]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Dev Toggle */}
      <div className="absolute top-0 right-0 opacity-10 hover:opacity-100 transition-opacity z-50">
          <button onClick={() => setSystemVitality(v => v > 50 ? 25 : 85)} className="text-[10px] uppercase font-bold tracking-widest border border-current px-2 py-1 rounded">
              Simulate: {localSystemState}
          </button>
      </div>

      {/* Massive Header */}
      <FadeIn direction="up" delay={0}>
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div>
              <h1 className="text-7xl md:text-9xl font-thin text-white tracking-tighter leading-[0.8] mb-4">
                  {getGreeting()}.
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl">
                {localSystemState === 'DEPLETED' 
                    ? "System resources are critical. Engaging protection protocols." 
                    : "Your system rhythm is steady. Ready for high-cognitive tasks."}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 mb-2">
                    <PulseIndicator active={localSystemState !== 'DEPLETED'} color={localSystemState === 'DEPLETED' ? 'bg-rose-500' : 'bg-teal-500'} />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">System Status</span>
                </div>
                <div className={`text-3xl font-light ${localSystemState === 'DEPLETED' ? 'text-rose-400' : 'text-teal-400'}`}>
                    {localSystemState === 'DEPLETED' ? 'RECOVERY MODE' : 'OPTIMAL'}
                </div>
            </div>
          </header>
      </FadeIn>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Vitality Card (Span 2) */}
        <div className="md:col-span-2">
          <FadeIn delay={1} className="h-full">
            {hasData ? (
                <AmbientBreath className="h-full">
                    <Card 
                        className={`h-full min-h-[300px] flex flex-col justify-between relative overflow-hidden transition-colors duration-[2000ms] ${localSystemState === 'DEPLETED' ? 'bg-rose-950/20 border-rose-900/30' : ''}`}
                    >
                        <div className="flex justify-between items-start z-10">
                            <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Internal Battery</span>
                            {localSystemState !== 'DEPLETED' && <Battery className="text-teal-500" />}
                        </div>
                        
                        <div className="relative z-10 my-8">
                            <div className="text-8xl md:text-[10rem] font-thin leading-none tracking-tighter text-white">
                                <LiveNumber value={systemVitality} />%
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 z-10">
                             <div className="space-y-1">
                                 <span className="block text-xs text-slate-500 font-mono uppercase">Rest</span>
                                 <span className="block text-xl font-light text-slate-300">8.2h</span>
                             </div>
                             <div className="space-y-1">
                                 <span className="block text-xs text-slate-500 font-mono uppercase">Focus</span>
                                 <span className="block text-xl font-light text-slate-300">High</span>
                             </div>
                             <div className="space-y-1">
                                 <span className="block text-xs text-slate-500 font-mono uppercase">Strain</span>
                                 <span className="block text-xl font-light text-slate-300">12%</span>
                             </div>
                        </div>

                        {/* Background Glow */}
                        <div className={`absolute -right-20 -bottom-20 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${localSystemState === 'DEPLETED' ? 'bg-rose-500' : 'bg-teal-500'}`} />
                    </Card>
                </AmbientBreath>
            ) : (
                <Card className="h-full flex items-center justify-center p-12 border-dashed">
                    <EmptyState 
                        title="Calibration"
                        message="System requires baseline data."
                        actionLabel="Initialize Log"
                        onAction={() => onChangeView(View.LOG)}
                        icon={Activity}
                    />
                </Card>
            )}
          </FadeIn>
        </div>

        {/* Action Stack (Span 1) */}
        <div className="flex flex-col gap-6">
            
            {/* Context Aware Action */}
            <FadeIn delay={2} direction="up" className="flex-1">
                <Card 
                    variant={localSystemState === 'DEPLETED' ? 'flat' : 'highlight'} 
                    onClick={() => onChangeView(View.MIND)} 
                    className={`h-full cursor-pointer group flex flex-col justify-center ${localSystemState === 'DEPLETED' ? 'bg-rose-900/10 border-rose-900/30' : ''}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${localSystemState === 'DEPLETED' ? 'bg-rose-500/20 text-rose-400' : 'bg-teal-500/10 text-teal-400'}`}>
                            {localSystemState === 'DEPLETED' ? <ShieldAlert size={24} /> : <PauseCircle size={24} />}
                        </div>
                        <ArrowRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    
                    <h3 className="text-2xl font-light text-white mb-2">
                        {localSystemState === 'DEPLETED' ? 'Emergency Reset' : 'Reality Check'}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {localSystemState === 'DEPLETED' ? 'Cortisol high. Initiate 3-min grounding.' : 'Clear mental cache. 2-min exercise.'}
                    </p>
                </Card>
            </FadeIn>

            {/* Permission / Status */}
            <FadeIn delay={3} direction="up" className="flex-1">
                <Card 
                    variant={permissionGranted ? "highlight" : "flat"} 
                    className={`h-full cursor-pointer transition-all duration-500 ${permissionGranted ? 'bg-emerald-900/10 border-emerald-500/20' : ''}`}
                    onClick={() => !permissionGranted && setPermissionGranted(true)}
                >
                    <div className="flex items-start justify-between h-full">
                        <div className="flex flex-col justify-between h-full">
                            <div className={permissionGranted ? 'text-emerald-400' : 'text-slate-500'}>
                                {permissionGranted ? <CheckCircle size={24} /> : <Coffee size={24} />}
                            </div>
                            <div>
                                <h3 className={`text-xl font-light ${permissionGranted ? 'text-emerald-200' : 'text-slate-300'}`}>
                                    {permissionGranted ? "Rest Active" : "Do Nothing"}
                                </h3>
                            </div>
                        </div>
                    </div>
                </Card>
            </FadeIn>

        </div>
      </div>
    </div>
  );
};
