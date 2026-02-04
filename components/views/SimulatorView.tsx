
import React, { useState, useEffect } from 'react';
import { Card, Button, SectionHeader, Toggle } from '../Shared';
import { SimulationParams } from '../../types';
import { ambient } from '../../services/ambientService';
import { Play, RotateCcw, Zap, Moon, Users, Activity, Sliders, Waves } from 'lucide-react';
import { FadeIn, LiveNumber } from '../Motion';

export const SimulatorView: React.FC = () => {
  // --- STATE ---
  const [params, setParams] = useState<SimulationParams>({
    sleepDelta: 0,
    stressLoad: 30,
    socialBattery: 70
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [projectedScore, setProjectedScore] = useState(85);
  const [projectedMood, setProjectedMood] = useState('Balanced');

  // --- CAUSAL ENGINE (MOCK) ---
  // In a full implementation, this runs TensorFlow.js causal inference
  useEffect(() => {
    if (isSimulating) {
        // Causal Logic: Sleep has 3x weight. Stress is inverse.
        // Base score 75.
        const sleepImpact = params.sleepDelta * 10;
        const stressImpact = (params.stressLoad - 50) * -0.5;
        const socialImpact = (params.socialBattery > 80 ? 5 : 0); // Diminishing returns

        const newScore = Math.max(0, Math.min(100, 75 + sleepImpact + stressImpact + socialImpact));
        
        setProjectedScore(newScore);

        // Derive mood label
        if (newScore > 90) setProjectedMood("Radiant");
        else if (newScore > 75) setProjectedMood("Optimized");
        else if (newScore > 50) setProjectedMood("Functional");
        else if (newScore > 30) setProjectedMood("Strained");
        else setProjectedMood("Critical");

        // Audio Feedback (Layer 4)
        // Intensity is inverse to score (Low score = Dissonant/Intense sound)
        const intensity = 1 - (newScore / 100); 
        ambient.startDrone(intensity);
    } else {
        ambient.stopDrone();
    }
  }, [params, isSimulating]);

  const handleParamChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    ambient.playInteraction('tap');
  };

  const toggleSimulation = () => {
      const newState = !isSimulating;
      setIsSimulating(newState);
      ambient.resume();
      ambient.playInteraction(newState ? 'success' : 'tap');
  };

  // --- VISUALIZER ---
  // A generative CSS gradient/shadow representing the "Twin's Aura"
  const getAuraStyle = () => {
    if (!isSimulating) return "shadow-xl shadow-slate-200 dark:shadow-slate-900 bg-slate-100 dark:bg-slate-800 scale-100";
    
    // Dynamic styles based on projected score
    const scale = 0.9 + (projectedScore / 200); // 0.9 to 1.4
    
    if (projectedScore > 80) return "shadow-[0_0_60px_rgba(20,184,166,0.6)] bg-gradient-to-br from-teal-400 to-emerald-300 animate-pulse-slow"; // Teal/Green
    if (projectedScore > 50) return "shadow-[0_0_40px_rgba(99,102,241,0.5)] bg-gradient-to-br from-indigo-400 to-blue-300 animate-pulse-slow"; // Indigo/Blue
    return "shadow-[0_0_50px_rgba(244,63,94,0.6)] bg-gradient-to-br from-rose-500 to-amber-600 animate-pulse-fast"; // Red/Orange
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in space-y-8">
      <SectionHeader title="Digital Twin" subtitle="Run causal simulations on your future state." />

      {/* The Twin Visualizer */}
      <div className="h-64 md:h-80 w-full flex items-center justify-center relative overflow-hidden rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors duration-1000">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>

        {/* The "Twin" - Abstract Representation */}
        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-[2000ms] ease-in-out relative z-10 flex items-center justify-center ${getAuraStyle()}`}>
             {isSimulating && (
                 <div className="text-white font-bold text-3xl md:text-4xl drop-shadow-md">
                     <LiveNumber value={projectedScore} />
                 </div>
             )}
             {!isSimulating && <Waves size={32} className="text-slate-400" />}
        </div>

        {/* Status Label */}
        <div className="absolute bottom-6 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-1">Projected State</p>
            <p className={`text-xl font-medium transition-all duration-500 ${isSimulating ? 'text-slate-800 dark:text-slate-100' : 'opacity-0 translate-y-2'}`}>
                {projectedMood}
            </p>
        </div>
      </div>

      {/* Control Deck */}
      <Card className="p-6 md:p-8 space-y-8 relative overflow-hidden">
        
        {/* Simulation Toggle Overlay */}
        {!isSimulating && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px] z-20 flex items-center justify-center transition-opacity duration-500">
                <Button onClick={toggleSimulation} className="h-14 px-8 text-lg shadow-xl shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700">
                    <Play size={20} fill="currentColor" className="mr-2" /> 
                    Initialize Simulation
                </Button>
            </div>
        )}

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={20} className="text-indigo-500" />
                Input Variables
            </h3>
            {isSimulating && (
                <button onClick={toggleSimulation} className="text-slate-400 hover:text-indigo-500 transition-colors">
                    <RotateCcw size={20} />
                </button>
            )}
        </div>

        {/* Input 1: Sleep */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                     <Moon size={18} className="text-indigo-400" />
                     <span>Sleep Delta</span>
                 </div>
                 <span className="text-sm font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full">
                     {params.sleepDelta > 0 ? '+' : ''}{params.sleepDelta} hrs
                 </span>
             </div>
             <input 
                type="range" min="-4" max="4" step="0.5"
                value={params.sleepDelta}
                onChange={(e) => handleParamChange('sleepDelta', parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
                disabled={!isSimulating}
             />
             <div className="flex justify-between text-xs text-slate-400">
                 <span>Sleep Deprived</span>
                 <span>Overslept</span>
             </div>
        </div>

        {/* Input 2: Social Battery */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                     <Users size={18} className="text-teal-400" />
                     <span>Social Output</span>
                 </div>
                 <span className="text-sm font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 px-3 py-1 rounded-full">
                     {params.socialBattery}%
                 </span>
             </div>
             <input 
                type="range" min="0" max="100" step="10"
                value={params.socialBattery}
                onChange={(e) => handleParamChange('socialBattery', parseInt(e.target.value))}
                className="w-full accent-teal-500"
                disabled={!isSimulating}
             />
             <div className="flex justify-between text-xs text-slate-400">
                 <span>Hermit Mode</span>
                 <span>Full Extrovert</span>
             </div>
        </div>

        {/* Input 3: Stress Load */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                     <Activity size={18} className="text-rose-400" />
                     <span>Cognitive Load</span>
                 </div>
                 <span className="text-sm font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full">
                     {params.stressLoad}%
                 </span>
             </div>
             <input 
                type="range" min="0" max="100" step="5"
                value={params.stressLoad}
                onChange={(e) => handleParamChange('stressLoad', parseInt(e.target.value))}
                className="w-full accent-rose-500"
                disabled={!isSimulating}
             />
             <div className="flex justify-between text-xs text-slate-400">
                 <span>Zen</span>
                 <span>Burnout</span>
             </div>
        </div>

      </Card>

      <div className="text-center">
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
              * This is a causal inference model. Results are probabilistic correlations, not medical predictions.
          </p>
      </div>
    </div>
  );
};
