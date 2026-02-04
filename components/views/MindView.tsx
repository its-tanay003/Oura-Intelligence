
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, SectionHeader, VoiceInput, Toggle } from '../Shared';
import { reframeThought, generateSpeech } from '../../services/geminiService';
import { Wind, ShieldCheck, RefreshCcw, ArrowLeft, Play, Square, Settings2, Volume2, VolumeX, Loader2, Circle } from 'lucide-react';
import { FadeIn, AmbientBreath } from '../Motion';

type Mode = 'MENU' | 'REALITY' | 'BREATH';

export const MindView: React.FC = () => {
  const [mode, setMode] = useState<Mode>('MENU');

  const renderContent = () => {
    switch (mode) {
      case 'REALITY':
        return <RealityCheckTool onBack={() => setMode('MENU')} />;
      case 'BREATH':
        return <BreathingTool onBack={() => setMode('MENU')} />;
      default:
        return <MindMenu onSelect={setMode} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-6 animate-fade-in space-y-6 md:space-y-8 min-h-[60vh]">
      {renderContent()}
    </div>
  );
};

// --- SUB-VIEWS ---

const MindMenu: React.FC<{ onSelect: (m: Mode) => void }> = ({ onSelect }) => (
  <>
    <SectionHeader title="Mind" subtitle="Tools for clarity and regulation." />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        onClick={() => onSelect('REALITY')} 
        className="cursor-pointer group hover:bg-teal-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-teal-400"
      >
        <div className="p-3 bg-teal-100 rounded-full text-teal-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-500">
          <Wind size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Reality Check</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Untangle heavy thoughts by separating feelings from facts.
        </p>
      </Card>

      <Card 
        onClick={() => onSelect('BREATH')} 
        className="cursor-pointer group hover:bg-blue-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-blue-400"
      >
        <div className="p-3 bg-blue-100 rounded-full text-blue-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-500">
          <Circle size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Deep Breath</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Regulate your nervous system with visual and audio pacing.
        </p>
      </Card>
    </div>

    <div className="mt-8 px-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grounding Truths</h4>
        <div className="space-y-3">
        <div className="flex gap-4 text-slate-600 text-sm md:text-base p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                <span>Feelings are real, but they are not facts.</span>
        </div>
        <div className="flex gap-4 text-slate-600 text-sm md:text-base p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                <span>You don't have to solve everything today.</span>
        </div>
        </div>
    </div>
  </>
);

// --- BREATHING TOOL ---

const BreathingTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(1); // minutes
    const [timeLeft, setTimeLeft] = useState(60);
    const [phase, setPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'WAIT'>('WAIT');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isPreparingAudio, setIsPreparingAudio] = useState(false);
    
    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setPhase('WAIT');
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing Rhythm Logic (4-4-4-4 Box or 4-6 Coherent)
    // Let's use Coherent Breathing (4s In, 6s Out) for calm
    useEffect(() => {
        if (!isActive) return;

        const cycleLength = 10000; // 10s total
        const inhaleTime = 4000;
        
        const runCycle = () => {
            setPhase('INHALE');
            setTimeout(() => {
                if(isActive) setPhase('EXHALE');
            }, inhaleTime);
        };

        runCycle(); // Start immediately
        const rhythm = setInterval(runCycle, cycleLength);

        return () => clearInterval(rhythm);
    }, [isActive]);

    const handleStart = async () => {
        setTimeLeft(duration * 60);
        
        if (audioEnabled) {
            setIsPreparingAudio(true);
            try {
                // Generate calm intro audio
                const prompt = "Sit comfortably. Relax your shoulders. Inhale deeply... and exhale completely. Let's begin.";
                const audioData = await generateSpeech(prompt);
                if (audioData) {
                    if (audioRef.current) {
                        audioRef.current.src = `data:audio/mp3;base64,${audioData}`;
                        audioRef.current.play();
                    } else {
                        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
                        audioRef.current = audio;
                        audio.play();
                    }
                }
            } catch (e) {
                console.error("Audio generation failed", e);
            } finally {
                setIsPreparingAudio(false);
            }
        }
        
        setIsActive(true);
    };

    const handleStop = () => {
        setIsActive(false);
        setPhase('WAIT');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <button 
                onClick={onBack} 
                className="group flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-slate-600 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 transition-all w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>

            <SectionHeader title="Deep Breath" subtitle="Coherent breathing (4s in, 6s out) to reset your rhythm." />

            <Card className="flex-1 flex flex-col items-center justify-center py-12 relative overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
                
                {/* Visualizer */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                    {/* Outer Rings */}
                    <div className={`absolute inset-0 rounded-full border-2 border-blue-100 transition-all duration-[4000ms] ease-in-out ${phase === 'INHALE' ? 'scale-110 opacity-100' : 'scale-100 opacity-50'}`} />
                    <div className={`absolute inset-4 rounded-full border border-blue-200 transition-all duration-[4000ms] ease-in-out ${phase === 'INHALE' ? 'scale-105 opacity-80' : 'scale-95 opacity-40'}`} />
                    
                    {/* Core Breath Circle */}
                    <div 
                        className={`w-32 h-32 bg-blue-400 rounded-full shadow-lg shadow-blue-200 transition-all ease-in-out flex items-center justify-center z-10
                            ${phase === 'INHALE' ? 'duration-[4000ms] scale-[2.2] bg-blue-300' : 'duration-[6000ms] scale-100 bg-blue-500'}
                            ${phase === 'WAIT' ? 'duration-500 scale-100 bg-slate-200' : ''}
                        `}
                    >
                        <span className={`text-white font-medium tracking-widest uppercase text-sm transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                            {phase === 'INHALE' ? 'Inhale' : 'Exhale'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                {!isActive ? (
                    <div className="w-full max-w-xs space-y-6 animate-fade-in z-20">
                        {/* Duration Selector */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 5].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setDuration(m)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        duration === m 
                                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-100' 
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-200'
                                    }`}
                                >
                                    {m} min
                                </button>
                            ))}
                        </div>

                        {/* Audio Toggle */}
                        <button 
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className="flex items-center justify-center gap-2 text-slate-400 text-sm hover:text-blue-500 transition-colors mx-auto"
                        >
                            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            {audioEnabled ? "Audio Guide On" : "Silent Mode"}
                        </button>

                        <Button 
                            onClick={handleStart} 
                            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                            isLoading={isPreparingAudio}
                        >
                            <Play size={20} fill="currentColor" />
                            Begin
                        </Button>
                    </div>
                ) : (
                    <div className="text-center space-y-6 animate-fade-in z-20">
                         <div className="text-3xl font-light text-slate-700 tabular-nums tracking-tight">
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <Button 
                            onClick={handleStop} 
                            variant="secondary"
                            className="w-40 mx-auto"
                        >
                            <Square size={18} fill="currentColor" />
                            Stop
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

// --- REALITY CHECK TOOL (Existing Logic) ---

const RealityCheckTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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

  if (step === 0) {
      return (
        <div className="animate-fade-in">
             <button 
                onClick={onBack} 
                className="group flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-slate-600 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 transition-all w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>
            <SectionHeader title="Reality Check" subtitle="Separate feelings from facts." />
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
                <Button onClick={() => setStep(1)} variant="soft" className="px-8 py-4 text-base md:text-lg w-full sm:w-auto shadow-sm">Start Check</Button>
            </div>
            </Card>
        </div>
      );
  }

  // Step 1: Input
  if (step === 1) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setStep(0)} 
          className="group flex items-center gap-2 text-slate-400 text-sm mb-6 hover:text-slate-600 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 transition-all touch-manipulation"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Step Back
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
    <div className="animate-fade-in h-full flex flex-col">
       <button 
            onClick={() => setStep(0)} 
            className="group flex items-center gap-2 text-slate-400 text-sm mb-6 hover:text-slate-600 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 transition-all touch-manipulation"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          New Check
        </button>

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
