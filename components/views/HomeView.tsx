import React, { useState } from 'react';
import { Card, EmptyState } from '../Shared';
import { Battery, Brain, Scale, Sunrise, ArrowRight, PauseCircle, Activity } from 'lucide-react';
import { View } from '../../types';

interface HomeViewProps {
  onChangeView: (view: View) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  // Mock system state - Set to 'false' to demonstrate the requested Empty State
  const [hasData] = useState(false); 
  const [isExpanded, setIsExpanded] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-6 md:pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-slate-800 mb-2 tracking-tight">{getGreeting()}.</h2>
          <p className="text-slate-500 text-base md:text-lg">
            {hasData ? "Here is how your system looks today." : "Let's establish a baseline."}
          </p>
        </div>
        {hasData && (
            <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Current Status</p>
                <p className="text-teal-600 font-medium">Optimal Flow</p>
            </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: System State or Empty State */}
        <div className="lg:col-span-7 space-y-6">
          {hasData ? (
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
                  <StatusIndicator icon={<Battery size={20} />} label="Energy" status="Steady" color="text-emerald-600" bg="bg-emerald-50" />
                  <StatusIndicator icon={<Brain size={20} />} label="Mental Load" status="Light" color="text-teal-600" bg="bg-teal-50" />
                  <StatusIndicator icon={<Scale size={20} />} label="Balance" status="Good" color="text-blue-600" bg="bg-blue-50" />
                  <StatusIndicator icon={<Sunrise size={20} />} label="Recovery" status="Optimal" color="text-amber-600" bg="bg-amber-50" />
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-6 border-t border-slate-100 animate-slide-up">
                    <h4 className="font-medium text-slate-800 mb-2">Analysis</h4>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-prose">
                      Your patterns suggest a stable week. Mental load is lower than average, providing a window for creative work or rest. No immediate action required.
                    </p>
                  </div>
                )}
              </Card>
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
        </div>

        {/* Right Column: Gentle Action */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-1">Recommended</p>
          </div>
          
          <Card variant="highlight" onClick={() => onChangeView(View.MIND)} className="cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.98]">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-full text-teal-600 shadow-sm shrink-0">
                <PauseCircle size={24} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 text-lg">Reality Check</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">A gentle 2-minute thought clearing exercise to separate fact from feeling.</p>
              </div>
              <div className="ml-auto self-center text-teal-600">
                <ArrowRight size={20} />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-600 font-medium block">Do nothing right now</span>
                <span className="text-xs md:text-sm text-slate-400">Sometimes the best action is inaction.</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-200/50 px-2 py-1 rounded-full">Permitted</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ icon, label, status, color, bg }: any) => (
  <div className={`p-3 md:p-4 rounded-2xl ${bg} flex flex-col items-start gap-3 transition-colors`}>
    <div className={`${color} opacity-80`}>{icon}</div>
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{status}</div>
    </div>
  </div>
);