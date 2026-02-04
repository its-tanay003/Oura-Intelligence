
import React, { useState, useEffect } from 'react';
import { Card, EmptyState, Button } from '../Shared';
import { FadeIn, AmbientBreath, PulseIndicator } from '../Motion';
import { Battery, Brain, Scale, Sunrise, ArrowRight, PauseCircle, Activity, CheckCircle, Coffee, Zap, ShieldAlert, ThermometerSun } from 'lucide-react';
import { View } from '../../types';

interface HomeViewProps {
  onChangeView: (view: View) => void;
}

// Simulated System State for demonstration
type SystemState = 'OPTIMAL' | 'BALANCED' | 'DEPLETED';

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  const [hasData] = useState(true); 
  const [isExpanded, setIsExpanded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // --- AMBIENT INTELLIGENCE STATE ---
  // In a real app, this would be derived from user logs (Sleep + Stress + Activity)
  const [systemVitality, setSystemVitality] = useState(85); // 0-100
  const [systemState, setSystemState] = useState<SystemState>('OPTIMAL');

  // React to vitality changes
  useEffect(() => {
      if (systemVitality < 40) setSystemState('DEPLETED');
      else if (systemVitality < 75) setSystemState('BALANCED');
      else setSystemState('OPTIMAL');
  }, [systemVitality]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // --- DYNAMIC AMBIENT STYLES ---
  const getAmbientBackground = () => {
      switch(systemState) {
          case 'DEPLETED': 
              return "bg-slate-900 text-slate-400"; // Eco-Calm / Protection Mode
          case 'BALANCED': 
              return "bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-950 dark:to-amber-900/10";
          case 'OPTIMAL': 
              return "bg-gradient-to-br from-slate-50 to-teal-50/50 dark:from-slate-950 dark:to-teal-900/10";
      }
  };

  return (
    <div className={`-mx-4 sm:-mx-6 -my-6 px-4 sm:px-6 py-6 min-h-full transition-colors duration-[2000ms] ease-in-out ${getAmbientBackground()}`}>
      <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      
      {/* Dev Toggle for Demo */}
      <div className="flex justify-end opacity-20 hover:opacity-100 transition-opacity">
          <button onClick={() => setSystemVitality(v => v > 50 ? 25 : 85)} className="text-[10px] uppercase font-bold tracking-widest border border-current px-2 py-1 rounded">
              Simulate: {systemState}
          </button>
      </div>

      {/* Header Section */}
      <FadeIn direction="up" delay={0}>
          <section className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-200/10 pb-6 md:pb-8">
            <div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-normal mb-2 tracking-tight ${systemState === 'DEPLETED' ? 'text-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                  {getGreeting()}.
              </h2>
              <p className={`text-base md:text-lg transition-colors duration-1000 ${systemState === 'DEPLETED' ? 'text-rose-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {systemState === 'DEPLETED' 
                    ? "System resources are low. Protection mode active." 
                    : hasData ? "Here is your system rhythm today." : "Let's establish a baseline."}
              </p>
            </div>
            
            {hasData && (
                <div className="hidden md:flex flex-col items-end text-right">
                    <p className="text-sm font-medium opacity-60 uppercase tracking-wider flex items-center gap-2">
                        <PulseIndicator active={systemState !== 'DEPLETED'} color={systemState === 'DEPLETED' ? 'bg-rose-500' : 'bg-teal-500'} />
                        System Status
                    </p>
                    <p className={`font-medium transition-colors ${systemState === 'DEPLETED' ? 'text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                        {systemState === 'DEPLETED' ? 'Recovery Required' : 'Steady Rhythm'}
                    </p>
                </div>
            )}
          </section>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: System State */}
        <div className="lg:col-span-7 space-y-6">
          <FadeIn delay={1}>
            {hasData ? (
                <AmbientBreath>
                    <Card 
                        variant={systemState === 'DEPLETED' ? 'flat' : 'default'} 
                        className={`relative overflow-hidden h-full transition-all duration-[2000ms] ${systemState === 'DEPLETED' ? 'border-rose-900/30 bg-rose-900/5' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-medium opacity-50 uppercase tracking-wider">Internal Balance</span>
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`text-sm md:text-base hover:underline p-2 -mr-2 rounded-lg transition-colors ${systemState === 'DEPLETED' ? 'text-rose-400 hover:bg-rose-900/20' : 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}
                                aria-expanded={isExpanded}
                            >
                                {isExpanded ? "Show Less" : "Deep Dive"}
                            </button>
                        </div>
                        
                        {systemState === 'DEPLETED' ? (
                            // --- BURNOUT REALITY LENS ---
                            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                                    <Battery size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-200">Recharge Required</h3>
                                <p className="text-slate-400 max-w-sm">Cognitive load is high. We've simplified your dashboard to reduce noise.</p>
                                <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                                    <div className="h-full bg-rose-500 w-[25%] rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ) : (
                            // --- OPTIMAL / BALANCED STATE ---
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                                <StatusIndicator 
                                    delay={2} 
                                    icon={<Battery size={20} />} 
                                    label="Vitality" 
                                    status={systemVitality > 80 ? "Peak" : "Steady"} 
                                    color="text-emerald-600 dark:text-emerald-400" 
                                    bg="bg-emerald-50 dark:bg-emerald-900/10" 
                                    progress={systemVitality}
                                />
                                <StatusIndicator 
                                    delay={3} 
                                    icon={<Brain size={20} />} 
                                    label="Focus" 
                                    status="Light" 
                                    color="text-teal-600 dark:text-teal-400" 
                                    bg="bg-teal-50 dark:bg-teal-900/10" 
                                    progress={92}
                                />
                                <StatusIndicator 
                                    delay={4} 
                                    icon={<Scale size={20} />} 
                                    label="Balance" 
                                    status="Good" 
                                    color="text-blue-600 dark:text-blue-400" 
                                    bg="bg-blue-50 dark:bg-blue-900/10" 
                                    progress={78}
                                />
                                <StatusIndicator 
                                    delay={5} 
                                    icon={<Sunrise size={20} />} 
                                    label="Rest" 
                                    status="Aligned" 
                                    color="text-amber-600 dark:text-amber-400" 
                                    bg="bg-amber-50 dark:bg-amber-900/10" 
                                    progress={88}
                                />
                            </div>
                        )}

                        {isExpanded && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-slide-up origin-top">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Pattern Analysis</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-prose">
                                {systemState === 'DEPLETED' 
                                 ? "Sustained high load detected over 48 hours. Cortisol proxies suggest a need for 20 minutes of non-sleep deep rest (NSDR)."
                                 : "Your patterns suggest a stable rhythm. Cognitive load is lower than average, providing a window for creative work or rest. No immediate variation detected."}
                            </p>
                        </div>
                        )}
                    </Card>
                </AmbientBreath>
            ) : (
                // Calibration / Empty State
                <Card variant="default" className="h-full flex items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-2 border-slate-100 dark:border-slate-800 min-h-[300px]">
                    <EmptyState 
                        title="Calibration Mode"
                        message="The system is learning your baseline. Log your first day to activate insights."
                        actionLabel="Log Day 1"
                        onAction={() => onChangeView(View.LOG)}
                        icon={Activity}
                    />
                </Card>
            )}
          </FadeIn>
        </div>

        {/* Right Column: Gentle Action */}
        <div className="lg:col-span-5 flex flex-col gap-4">
            <FadeIn delay={2} direction="up">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium opacity-50 uppercase tracking-wider pl-1">Recommended</p>
                </div>
                
                <Card 
                    variant={systemState === 'DEPLETED' ? 'flat' : 'highlight'} 
                    onClick={() => onChangeView(View.MIND)} 
                    className={`cursor-pointer group ${systemState === 'DEPLETED' ? 'bg-rose-900/10 border-rose-900/30' : ''}`}
                >
                    <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shadow-sm dark:shadow-none shrink-0 group-hover:scale-110 transition-transform duration-300 ${systemState === 'DEPLETED' ? 'bg-rose-500/20 text-rose-400' : 'bg-white dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'}`}>
                        {systemState === 'DEPLETED' ? <ShieldAlert size={24} /> : <PauseCircle size={24} />}
                    </div>
                    <div>
                        <h3 className={`font-medium text-lg ${systemState === 'DEPLETED' ? 'text-rose-100' : 'text-slate-800 dark:text-slate-100'}`}>
                            {systemState === 'DEPLETED' ? 'Emergency Grounding' : 'Reality Check'}
                        </h3>
                        <p className={`text-sm mt-1 leading-relaxed ${systemState === 'DEPLETED' ? 'text-rose-200/60' : 'text-slate-500 dark:text-slate-400'}`}>
                            {systemState === 'DEPLETED' ? '3-minute sensory reset to lower cortisol.' : 'A gentle 2-minute thought clearing exercise.'}
                        </p>
                    </div>
                    <div className="ml-auto self-center opacity-50 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} />
                    </div>
                    </div>
                </Card>
          </FadeIn>

          <FadeIn delay={3} direction="up">
            <Card 
                variant={permissionGranted ? "highlight" : "flat"} 
                className={`transition-all duration-500 ease-calm ${
                    permissionGranted 
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' 
                    : systemState === 'DEPLETED' ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => !permissionGranted && setPermissionGranted(true)}
            >
                <div className="flex items-center justify-between">
                <div className="flex gap-3 items-start">
                    {permissionGranted ? (
                        <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 animate-scale-in"><CheckCircle size={20} /></div>
                    ) : (
                        <div className={`mt-0.5 ${systemState === 'DEPLETED' ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}><Coffee size={20} /></div>
                    )}
                    <div>
                        <span className={`font-medium block transition-colors ${permissionGranted ? 'text-emerald-800 dark:text-emerald-200' : systemState === 'DEPLETED' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                            {permissionGranted ? "Rest Mode Active" : "Do nothing right now"}
                        </span>
                        <span className={`text-xs md:text-sm leading-relaxed block mt-0.5 ${systemState === 'DEPLETED' ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                            {permissionGranted ? "No data needed. Just be." : "Sometimes the best action is inaction."}
                        </span>
                    </div>
                </div>
                {!permissionGranted && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-1 rounded-full whitespace-nowrap">Permitted</span>
                )}
                </div>
            </Card>
          </FadeIn>
        </div>
      </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ icon, label, status, color, bg, delay, progress }: any) => (
  <FadeIn delay={delay} className={`relative p-3 md:p-4 rounded-2xl ${bg} flex flex-col items-start gap-3 hover:scale-105 transition-transform duration-300 overflow-hidden`}>
    <div className={`${color} opacity-80`}>{icon}</div>
    <div className="w-full relative z-10">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${color} mb-2`}>{status}</div>
      
      {/* Soft Progress Bar */}
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-slate-900/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full opacity-60 ${color.replace('text-', 'bg-')}`} 
                style={{ width: `${progress}%`, transition: 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            />
        </div>
      )}
    </div>
  </FadeIn>
);
