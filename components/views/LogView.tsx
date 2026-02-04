import React, { useState } from 'react';
import { Card, Button, SectionHeader } from '../Shared';
import { Moon, Droplets, Activity, Save } from 'lucide-react';
import { Emotion } from '../../types';

export const LogView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [sleep, setSleep] = useState(7);
  const [hydration, setHydration] = useState(3);

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (saved) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center animate-fade-in text-center px-4">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6 shadow-sm scale-110 duration-500 ease-out transition-transform">
          <Save size={32} className="md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl md:text-3xl font-medium text-slate-800 tracking-tight">Logged.</h2>
        <p className="text-slate-500 mt-2 text-sm md:text-lg">Checking in is an act of self-care.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 md:space-y-10 animate-fade-in">
      <SectionHeader title="Quick Log" subtitle="Less than 30 seconds." />

      {/* Sleep Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-slate-700 font-medium px-1">
          <Moon size={20} className="text-indigo-400" />
          <span className="text-base md:text-lg">Sleep</span>
          <span className="ml-auto text-slate-400 font-normal text-sm md:text-base bg-slate-100 px-3 py-1 rounded-full">{sleep} hrs</span>
        </div>
        <Card variant="flat" className="py-8 md:py-10">
          <div className="px-2">
            <input 
              type="range" 
              min="4" 
              max="12" 
              step="0.5" 
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full h-8 cursor-pointer touch-none"
              aria-label="Sleep hours"
            />
          </div>
          <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-4 px-2 font-medium">
            <span>Restless</span>
            <span>Rested</span>
          </div>
        </Card>
      </section>

      {/* Hydration Section */}
      <section className="space-y-4">
         <div className="flex items-center gap-3 text-slate-700 font-medium px-1">
          <Droplets size={20} className="text-blue-400" />
          <span className="text-base md:text-lg">Hydration</span>
          <span className="ml-auto text-slate-400 font-normal text-sm md:text-base bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{hydration} glasses</span>
        </div>
        <div className="flex gap-3 md:gap-6">
            <button 
                onClick={() => setHydration(Math.max(0, hydration - 1))}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-2xl font-medium hover:bg-slate-200 transition-colors active:scale-95 touch-manipulation"
                aria-label="Decrease hydration"
            >−</button>
            <div className="flex-1 flex items-center justify-center bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800 text-xl font-medium">
                {hydration}
            </div>
            <button 
                onClick={() => setHydration(hydration + 1)}
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-medium hover:bg-blue-200 transition-colors active:scale-95 touch-manipulation"
                aria-label="Increase hydration"
            >+</button>
        </div>
      </section>

      {/* Emotion Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-slate-700 font-medium px-1">
          <Activity size={20} className="text-rose-400" />
          <span className="text-base md:text-lg">How does the body feel?</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {[Emotion.CALM, Emotion.TIRED, Emotion.ANXIOUS, Emotion.ENERGETIC].map((e) => (
             <button 
               key={e}
               className="p-4 md:p-5 rounded-2xl border border-slate-100 text-slate-600 bg-white hover:bg-teal-50 hover:border-teal-100 hover:text-teal-700 transition-all text-sm md:text-base font-medium active:scale-[0.98] shadow-sm"
             >
                {e}
             </button>
          ))}
        </div>
      </section>

      <div className="pt-6 md:pt-8">
        <Button onClick={handleSave} className="w-full h-12 md:h-14 text-base md:text-lg shadow-lg shadow-teal-100/50">
           Save to Log
        </Button>
      </div>
    </div>
  );
};