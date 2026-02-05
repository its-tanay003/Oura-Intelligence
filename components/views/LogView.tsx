
import React, { useState } from 'react';
import { Card, Button, SectionHeader, VoiceInput, GlassSlider } from '../Shared';
import { Moon, Droplets, Activity, Save, Edit3, Heart } from 'lucide-react';
import { Emotion } from '../../types';
import { FadeIn } from '../Motion';

export const LogView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [sleep, setSleep] = useState(7.5);
  const [hydration, setHydration] = useState(4);
  const [notes, setNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const appendNote = (text: string) => {
    setNotes(prev => prev ? prev + ' ' + text : text);
  };

  if (saved) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center animate-fade-in text-center px-6">
        <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 mb-8 shadow-[0_0_40px_rgba(20,184,166,0.2)] scale-110 duration-700 ease-out transition-transform">
          <Save size={40} />
        </div>
        <h2 className="text-5xl font-thin text-white tracking-tighter mb-4">Logged.</h2>
        <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">System Updated</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-12 pb-20 animate-fade-in">
      <SectionHeader title="Input" subtitle="Update your physiological state." />

      {/* Sleep Section - Massive Typography */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
            <div className="flex items-center gap-3 text-indigo-300">
                <Moon size={24} />
                <span className="font-mono text-xs uppercase tracking-widest">Sleep</span>
            </div>
            <div className="text-6xl font-thin text-white tracking-tighter leading-none">
                {sleep}<span className="text-2xl text-slate-500 ml-1">h</span>
            </div>
        </div>
        <GlassSlider 
            min={4} max={12} step={0.5} 
            value={sleep} 
            onChange={setSleep} 
        />
      </section>

      {/* Hydration Section */}
      <section className="space-y-6 pt-8">
         <div className="flex items-end justify-between px-2">
            <div className="flex items-center gap-3 text-blue-300">
                <Droplets size={24} />
                <span className="font-mono text-xs uppercase tracking-widest">Hydration</span>
            </div>
            <div className="text-6xl font-thin text-white tracking-tighter leading-none">
                {hydration}<span className="text-2xl text-slate-500 ml-1">gl</span>
            </div>
        </div>
        <GlassSlider 
            min={0} max={12} step={1} 
            value={hydration} 
            onChange={setHydration} 
        />
      </section>

      {/* Emotion Grid */}
      <section className="space-y-6 pt-8">
        <div className="flex items-center gap-3 text-rose-300 px-2 mb-4">
          <Heart size={24} />
          <span className="font-mono text-xs uppercase tracking-widest">Internal State</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[Emotion.CALM, Emotion.TIRED, Emotion.ANXIOUS, Emotion.ENERGETIC].map((e) => (
             <button 
               key={e}
               onClick={() => setSelectedMood(e)}
               className={`p-6 rounded-2xl border transition-all duration-300 text-lg font-light tracking-wide ${
                   selectedMood === e 
                   ? 'bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                   : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800'
               }`}
             >
                {e}
             </button>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4 pt-8">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3 text-slate-400">
                 <Edit3 size={20} />
                 <span className="font-mono text-xs uppercase tracking-widest">Context</span>
             </div>
             <VoiceInput onTranscript={appendNote} />
          </div>
          <textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Add nuance..."
             className="w-full h-32 p-6 rounded-[2rem] bg-slate-900/40 border border-white/10 focus:border-teal-500/50 focus:bg-slate-900/80 outline-none resize-none transition-all placeholder:text-slate-600 text-slate-200 text-lg font-light leading-relaxed"
          />
      </section>

      <div className="pt-8">
        <Button onClick={handleSave} className="w-full h-16 text-lg font-light tracking-widest uppercase bg-teal-600 hover:bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
           Commit Log
        </Button>
      </div>
    </div>
  );
};
