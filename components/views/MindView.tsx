import React, { useState } from 'react';
import { Card, Button, SectionHeader, VoiceInput } from '../Shared';
import { reframeThought } from '../../services/geminiService';
import { Wind, ShieldCheck, RefreshCcw, ArrowLeft } from 'lucide-react';

export const MindView: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [situation, setSituation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [thought, setThought] = useState('');
  const [reframe, setReframe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    const result = await reframeThought({ situation, emotion: feeling, thought });
    setReframe(result);
    setIsLoading(false);
    setStep(2);
  };

  const reset = () => {
    setStep(0);
    setSituation('');
    setFeeling('');
    setThought('');
    setReframe(null);
  };

  const appendText = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
    setter(prev => {
        const separator = prev.trim() ? ' ' : '';
        return prev + separator + text;
    });
  };

  // Step 0: Intro
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto pb-6 animate-fade-in space-y-6 md:space-y-8">
        <SectionHeader title="Mind" subtitle="Separate feelings from facts." />
        
        <Card className="bg-gradient-to-br from-teal-50 to-white border-none py-10 md:py-14">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 px-2">
            <div className="p-4 bg-white rounded-full text-teal-600 shadow-sm ring-4 ring-teal-50/50">
              <Wind size={40} />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-medium text-slate-800 tracking-tight">Heavy thoughts?</h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-base md:text-lg">
                We often confuse what we assume with what actually happened. Let's untangle that.
                </p>
            </div>
            <Button onClick={() => setStep(1)} variant="soft" className="px-8 py-4 text-base md:text-lg w-full sm:w-auto shadow-sm">Start Reality Check</Button>
          </div>
        </Card>

        <div className="px-2 md:px-4 mt-8">
             <h4 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Grounding Truths</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-4 text-slate-600 text-sm md:text-base p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                     <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                     <span>Feelings are real, but they are not facts.</span>
                </div>
                <div className="flex gap-4 text-slate-600 text-sm md:text-base p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                     <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                     <span>You don't have to solve everything today.</span>
                </div>
             </div>
        </div>
      </div>
    );
  }

  // Step 1: Input
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto pb-6 animate-fade-in">
        <button 
          onClick={() => setStep(0)} 
          className="group flex items-center gap-2 text-slate-400 text-sm mb-6 hover:text-slate-600 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 transition-all touch-manipulation"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back
        </button>
        
        <SectionHeader title="The Situation" />
        
        <div className="space-y-6 md:space-y-8 bg-white p-5 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                    <label className="block text-sm md:text-base font-medium text-slate-700">What actually happened?</label>
                    <VoiceInput onTranscript={appendText(setSituation)} />
                </div>
                <textarea 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none h-28 md:h-32 text-base md:text-lg text-slate-700 placeholder:text-slate-300 transition-all shadow-inner"
                    placeholder="E.g., I missed a deadline."
                    value={situation}
                    onChange={e => setSituation(e.target.value)}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                    <label className="block text-sm md:text-base font-medium text-slate-700">What are you assuming this means?</label>
                    <VoiceInput onTranscript={appendText(setThought)} />
                </div>
                <textarea 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none h-28 md:h-32 text-base md:text-lg text-slate-700 placeholder:text-slate-300 transition-all shadow-inner"
                    placeholder="E.g., Everyone thinks I'm lazy and I'll get fired."
                    value={thought}
                    onChange={e => setThought(e.target.value)}
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                    <label className="block text-sm md:text-base font-medium text-slate-700">One word for the emotion</label>
                    <VoiceInput onTranscript={appendText(setFeeling)} />
                </div>
                <input 
                    type="text"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-teal-500 outline-none text-base md:text-lg text-slate-700 placeholder:text-slate-300 shadow-inner"
                    placeholder="E.g., Ashamed"
                    value={feeling}
                    onChange={e => setFeeling(e.target.value)}
                />
            </div>

            <Button 
                onClick={handleAnalyze} 
                className="w-full mt-2 h-14 text-base md:text-lg" 
                isLoading={isLoading}
                disabled={!thought || !situation}
            >
                Find Perspective
            </Button>
        </div>
      </div>
    );
  }

  // Step 2: Result
  return (
    <div className="max-w-2xl mx-auto pb-6 animate-fade-in h-full flex flex-col">
       <SectionHeader title="A Shift in Perspective" />
       
       <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 md:space-y-10">
           <Card className="bg-slate-50 border-none p-5 md:p-6">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Assumption</p>
               <p className="text-slate-600 italic text-base md:text-lg leading-relaxed">"{thought}"</p>
           </Card>

           <div className="relative pl-6 md:pl-8 py-2">
               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-300 to-emerald-400 rounded-full"></div>
               <h3 className="text-lg md:text-xl font-medium text-slate-800 mb-4">Let's reframe that.</h3>
               <p className="text-slate-700 leading-8 text-lg md:text-xl">
                   {reframe}
               </p>
           </div>

           <div className="pt-6 md:pt-8 border-t border-slate-100">
               <Button variant="secondary" onClick={reset} className="w-full h-12 md:h-14 text-base">
                   <RefreshCcw size={18} />
                   Start Over
               </Button>
           </div>
       </div>
    </div>
  );
};