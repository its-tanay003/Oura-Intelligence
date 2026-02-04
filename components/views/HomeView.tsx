
import React, { useState } from 'react';
import { Card, EmptyState, Button } from '../Shared';
import { FadeIn, AmbientBreath, PulseIndicator } from '../Motion';
import { Battery, Brain, Scale, Sunrise, ArrowRight, PauseCircle, Activity, CheckCircle, Coffee } from 'lucide-react';
import { View } from '../../types';

interface HomeViewProps {
  onChangeView: (view: View) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  // Mock system state - Set to 'true' to show the alive dashboard
  const [hasData] = useState(true); 
  const [isExpanded, setIsExpanded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* Header Section */}
      <FadeIn direction="up" delay={0}>
          <section className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-6 md:pb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-slate-800 mb-2 tracking-tight">{getGreeting()}.</h2>
              <p className="text-slate-500 text-base md:text-lg">
                {hasData ? "Here is your system rhythm today." : "Let's establish a baseline."}
              </p>
            </div>
            {hasData && (
                <div className="hidden md:flex flex-col items-end text-right">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <PulseIndicator />
                        System Status
                    </p>
                    <p className="text-teal-600 font-medium">Steady Rhythm</p>
                </div>
            )}
          </section>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: System State or Empty State */}
        <div className="lg:col-span-7 space-y-6">
          <FadeIn delay={1}>
            {hasData ? (
                <AmbientBreath>
                    <Card variant="default" className="relative overflow-hidden h-full">
                        <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Internal Balance</span>
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-teal-600 text-sm md:text-base hover:underline p-2 -mr-2 rounded-lg hover:bg-teal-50 transition-colors"
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? "Show Less" : "Deep Dive"}
                        </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                            <StatusIndicator 
                                delay={2} 
                                icon={<Battery size={20} />} 
                                label="Vitality" 
                                status="Steady" 
                                color="text-emerald-600" 
                                bg="bg-emerald-50" 
                                progress={85}
                            />
                            <StatusIndicator 
                                delay={3} 
                                icon={<Brain size={20} />} 
                                label="Focus" 
                                status="Light" 
                                color="text-teal-600" 
                                bg="bg-teal-50" 
                                progress={92}
                            />
                            <StatusIndicator 
                                delay={4} 
                                icon={<Scale size={20} />} 
                                label="Balance" 
                                status="Good" 
                                color="text-blue-600" 
                                bg="bg-blue-50" 
                                progress={78}
                            />
                            <StatusIndicator 
                                delay={5} 
                                icon={<Sunrise size={20} />} 
                                label="Rest" 
                                status="Aligned" 
                                color="text-amber-600" 
                                bg="bg-amber-50" 
                                progress={88}
                            />
                        </div>

                        {isExpanded && (
                        <div className="mt-8 pt-6 border-t border-slate-100 animate-slide-up origin-top">
                            <h4 className="font-medium text-slate-800 mb-2">Pattern Analysis</h4>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-prose">
                            Your patterns suggest a stable rhythm. Cognitive load is lower than average, providing a window for creative work or rest. No immediate variation detected.
                            </p>
                        </div>
                        )}
                    </Card>
                </AmbientBreath>
            ) : (
                // Calibration / Empty State
                <Card variant="default" className="h-full flex items-center justify-center p-8 bg-slate-50/50 border-dashed border-2 border-slate-100 min-h-[300px]">
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
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-1">Recommended</p>
                </div>
                
                <Card variant="highlight" onClick={() => onChangeView(View.MIND)} className="cursor-pointer group">
                    <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-full text-teal-600 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <PauseCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-800 text-lg">Reality Check</h3>
                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">A gentle 2-minute thought clearing exercise.</p>
                    </div>
                    <div className="ml-auto self-center text-teal-600 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} />
                    </div>
                    </div>
                </Card>
          </FadeIn>

          <FadeIn delay={3} direction="up">
            <Card 
                variant={permissionGranted ? "highlight" : "flat"} 
                className={`transition-all duration-500 ease-calm ${permissionGranted ? 'bg-emerald-50/50 border-emerald-100' : 'cursor-pointer hover:bg-slate-100'}`}
                onClick={() => !permissionGranted && setPermissionGranted(true)}
            >
                <div className="flex items-center justify-between">
                <div className="flex gap-3 items-start">
                    {permissionGranted ? (
                        <div className="mt-0.5 text-emerald-600 animate-scale-in"><CheckCircle size={20} /></div>
                    ) : (
                        <div className="mt-0.5 text-slate-400"><Coffee size={20} /></div>
                    )}
                    <div>
                        <span className={`font-medium block transition-colors ${permissionGranted ? 'text-emerald-800' : 'text-slate-600'}`}>
                            {permissionGranted ? "Rest Mode Active" : "Do nothing right now"}
                        </span>
                        <span className="text-xs md:text-sm text-slate-400 leading-relaxed block mt-0.5">
                            {permissionGranted ? "No data needed. Just be." : "Sometimes the best action is inaction."}
                        </span>
                    </div>
                </div>
                {!permissionGranted && (
                    <span className="text-xs text-slate-500 bg-slate-200/50 px-2 py-1 rounded-full whitespace-nowrap">Permitted</span>
                )}
                </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ icon, label, status, color, bg, delay, progress }: any) => (
  <FadeIn delay={delay} className={`relative p-3 md:p-4 rounded-2xl ${bg} flex flex-col items-start gap-3 hover:scale-105 transition-transform duration-300 overflow-hidden`}>
    <div className={`${color} opacity-80`}>{icon}</div>
    <div className="w-full relative z-10">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${color} mb-2`}>{status}</div>
      
      {/* Soft Progress Bar */}
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-slate-900/5 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full opacity-60 ${color.replace('text-', 'bg-')}`} 
                style={{ width: `${progress}%`, transition: 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            />
        </div>
      )}
    </div>
  </FadeIn>
);
