
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, SectionHeader, VoiceInput, Toggle, Input } from '../Shared';
import { reframeThought, generateSpeech } from '../../services/geminiService';
import { Wind, ShieldCheck, RefreshCcw, ArrowLeft, Play, Square, Settings2, Volume2, VolumeX, Loader2, Circle, Heart, Phone, MessageSquare, Plus, Trash2, Users, Split, Camera, PenTool, AlertCircle } from 'lucide-react';
import { FadeIn, AmbientBreath, useMotion } from '../Motion';
import { TrustedContact } from '../../types';

type Mode = 'MENU' | 'REALITY' | 'BREATH' | 'CONNECT';

interface MindViewProps {
    initialMode?: Mode;
}

export const MindView: React.FC<MindViewProps> = ({ initialMode = 'MENU' }) => {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const renderContent = () => {
    switch (mode) {
      case 'REALITY':
        return <RealityCheckTool onBack={() => setMode('MENU')} />;
      case 'BREATH':
        return <BreathingTool onBack={() => setMode('MENU')} />;
      case 'CONNECT':
        return <TrustedCircleTool onBack={() => setMode('MENU')} />;
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
    <SectionHeader title="Mind" subtitle="Tools for clarity, connection, and regulation." />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        onClick={() => onSelect('REALITY')} 
        className="cursor-pointer group hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors border-l-4 border-l-transparent hover:border-l-teal-400"
      >
        <div className="p-3 bg-teal-100 dark:bg-teal-900/40 rounded-full text-teal-600 dark:text-teal-400 w-fit mb-4 group-hover:scale-110 transition-transform duration-500">
          <Wind size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Reality Check</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Untangle heavy thoughts by separating feelings from facts.
        </p>
      </Card>

      <Card 
        onClick={() => onSelect('BREATH')} 
        className="cursor-pointer group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors border-l-4 border-l-transparent hover:border-l-blue-400"
      >
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform duration-500">
          <Circle size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Deep Breath</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Regulate your nervous system with visual and audio pacing.
        </p>
      </Card>

      <Card 
        onClick={() => onSelect('CONNECT')} 
        className="cursor-pointer group hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors border-l-4 border-l-transparent hover:border-l-rose-400 md:col-span-2"
      >
        <div className="flex items-center gap-4">
             <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 dark:text-rose-400 w-fit group-hover:scale-110 transition-transform duration-500">
                <Heart size={24} />
            </div>
            <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Reach Someone You Trust</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Connect with a loved one when things feel heavy. We never contact them for you.
                </p>
            </div>
        </div>
      </Card>
    </div>

    <div className="mt-8 px-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grounding Truths</h4>
        <div className="space-y-3">
        <div className="flex gap-4 text-slate-600 dark:text-slate-300 text-sm md:text-base p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                <span>Feelings are real, but they are not facts.</span>
        </div>
        <div className="flex gap-4 text-slate-600 dark:text-slate-300 text-sm md:text-base p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <ShieldCheck size={20} className="text-teal-500 shrink-0 mt-0.5" />
                <span>You don't have to solve everything today.</span>
        </div>
        </div>
    </div>
  </>
);

// --- TRUSTED CIRCLE TOOL ---

const TrustedCircleTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [contacts, setContacts] = useState<TrustedContact[]>(() => {
        const saved = localStorage.getItem('oura_trusted_contacts');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    
    // New Contact Form State
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRelation, setNewRelation] = useState('');
    const [newMethod, setNewMethod] = useState<'call' | 'message'>('call');

    useEffect(() => {
        localStorage.setItem('oura_trusted_contacts', JSON.stringify(contacts));
    }, [contacts]);

    const handleAdd = () => {
        if (!newName || !newPhone) return;
        const contact: TrustedContact = {
            id: Date.now().toString(),
            name: newName,
            phone: newPhone,
            relationship: newRelation,
            method: newMethod
        };
        setContacts([...contacts, contact]);
        setIsAdding(false);
        setNewName(''); setNewPhone(''); setNewRelation('');
    };

    const handleDelete = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    const initiateContact = (contact: TrustedContact) => {
        if (contact.method === 'call') {
            window.location.href = `tel:${contact.phone}`;
        } else {
            window.location.href = `sms:${contact.phone}`;
        }
    };

    return (
        <div className="animate-fade-in">
             <button 
                onClick={onBack} 
                className="group flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>
            <SectionHeader title="Reach Someone" subtitle="Connection regulates the nervous system." />

            {/* List State */}
            {!isAdding && contacts.length > 0 && (
                <div className="space-y-4">
                    {contacts.map(contact => (
                        <Card key={contact.id} className="relative overflow-hidden border-rose-100 dark:border-rose-900/30">
                             <div className="absolute top-0 left-0 w-1 h-full bg-rose-400/50" />
                             <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-medium text-slate-800 dark:text-slate-100 text-lg">{contact.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{contact.relationship || 'Trusted Contact'}</p>
                                </div>
                                <button onClick={() => handleDelete(contact.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                                    <Trash2 size={16} />
                                </button>
                             </div>
                             
                             <Button 
                                onClick={() => initiateContact(contact)}
                                className="w-full h-14 bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none text-white text-lg"
                             >
                                {contact.method === 'call' ? <Phone size={20} className="mr-2" /> : <MessageSquare size={20} className="mr-2" />}
                                {contact.method === 'call' ? 'Call' : 'Message'} {contact.name.split(' ')[0]}
                             </Button>
                        </Card>
                    ))}
                    <div className="pt-4 text-center">
                        <button onClick={() => setIsAdding(true)} className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Plus size={16} /> Add another contact
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isAdding && contacts.length === 0 && (
                <Card variant="flat" className="py-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-400 mb-2">
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Your Trusted Circle</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
                            Add a few people who make you feel safe. We'll make it easy to reach them when you need to grounding.
                        </p>
                    </div>
                    <Button onClick={() => setIsAdding(true)} variant="soft" className="text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30">
                        Add Trusted Contact
                    </Button>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        We will <strong className="font-medium">never</strong> contact them for you. You are always in control.
                    </p>
                </Card>
            )}

            {/* Add Form */}
            {isAdding && (
                <Card className="space-y-6">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100">New Contact</h3>
                    <Input 
                        label="Name" 
                        placeholder="e.g. Mom, Alex" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                    />
                    <Input 
                        label="Relationship (Optional)" 
                        placeholder="e.g. Partner, Best Friend" 
                        value={newRelation} 
                        onChange={e => setNewRelation(e.target.value)} 
                    />
                    <Input 
                        label="Phone Number" 
                        placeholder="+1 555..." 
                        type="tel"
                        value={newPhone} 
                        onChange={e => setNewPhone(e.target.value)} 
                    />
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Preferred Method</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setNewMethod('call')}
                                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 ${newMethod === 'call' ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                <Phone size={16} /> Call
                            </button>
                            <button 
                                onClick={() => setNewMethod('message')}
                                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 ${newMethod === 'message' ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                <MessageSquare size={16} /> Message
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsAdding(false)} className="flex-1">Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newName || !newPhone} className="flex-1">Save</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

// --- BREATHING TOOL ---

const BreathingTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { prefersReducedMotion } = useMotion();
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
                // Generate calm intro audio with simplified punctuation to avoid TTS 500 errors
                const prompt = "Sit comfortably. Relax your shoulders. Inhale deeply, and exhale completely. Let's begin.";
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
                // Fail silently (user still gets visualizer) or optionally show toast here
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
                className="group flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>

            <SectionHeader title="Deep Breath" subtitle="Coherent breathing (4s in, 6s out) to reset your rhythm." />

            <Card className="flex-1 flex flex-col items-center justify-center py-12 relative overflow-hidden bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800/50 min-h-[500px]">
                
                {/* Immersive Visualizer */}
                <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                    {/* Subconscious Pulse (Always active, subtle rhythm) */}
                    <div className={`absolute inset-4 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl ${!prefersReducedMotion ? 'animate-pulse-slow' : 'opacity-10'}`} />

                    {/* Ambient Background Glow - Reacts to rhythm */}
                    <div 
                        className={`absolute inset-0 bg-gradient-to-tr from-blue-300/30 to-teal-300/30 dark:from-blue-900/30 dark:to-teal-900/30 rounded-full blur-3xl transition-all ease-in-out
                        ${prefersReducedMotion ? 'opacity-20' : 
                          phase === 'INHALE' ? 'duration-[4000ms] scale-125 opacity-70' : 
                          phase === 'HOLD' ? 'duration-[2000ms] scale-125 opacity-60' :
                          'duration-[6000ms] scale-75 opacity-20'
                        }`} 
                    />

                    {/* Outer Expansion Ring */}
                    <div className={`absolute inset-0 rounded-full border border-blue-100/50 dark:border-blue-800/20 transition-all ease-in-out
                        ${prefersReducedMotion ? '' :
                          phase === 'INHALE' ? 'duration-[4000ms] scale-110 opacity-100 border-2' : 'duration-[6000ms] scale-90 opacity-30 border'
                        }`} 
                    />
                    
                    {/* Middle Ring */}
                    <div className={`absolute inset-8 rounded-full border border-blue-200/50 dark:border-blue-700/30 transition-all ease-in-out
                        ${prefersReducedMotion ? '' :
                          phase === 'INHALE' ? 'duration-[4000ms] scale-105 opacity-80' : 'duration-[6000ms] scale-95 opacity-40'
                        }`} 
                    />
                    
                    {/* Core Breath Circle */}
                    <div 
                        className={`w-40 h-40 rounded-full shadow-2xl transition-all ease-in-out flex items-center justify-center z-10 relative overflow-hidden
                            ${phase === 'INHALE' ? 'duration-[4000ms] scale-150 bg-gradient-to-br from-blue-300 to-teal-300 dark:from-blue-500 dark:to-teal-500 shadow-blue-200/50 dark:shadow-blue-900/50' : 
                              phase === 'HOLD' ? 'duration-[2000ms] scale-150 bg-gradient-to-br from-blue-400 to-teal-400 dark:from-blue-600 dark:to-teal-600' :
                              'duration-[6000ms] scale-100 bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-800 shadow-none'}
                            ${phase === 'WAIT' ? 'duration-500 scale-100 bg-slate-200 dark:bg-slate-700' : ''}
                        `}
                    >
                        {/* Inner texture/shine */}
                        <div className={`absolute inset-0 bg-white/20 rounded-full transform -translate-y-1/2 blur-md transition-opacity duration-1000 ${phase === 'INHALE' ? 'opacity-50' : 'opacity-0'}`} />

                        <span className={`text-white font-medium tracking-[0.2em] uppercase text-sm transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                            {phase === 'INHALE' ? 'Inhale' : phase === 'HOLD' ? 'Hold' : phase === 'EXHALE' ? 'Exhale' : ''}
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
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/50' 
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-200'
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
                            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
                            isLoading={isPreparingAudio}
                        >
                            <Play size={20} fill="currentColor" />
                            Begin
                        </Button>
                    </div>
                ) : (
                    <div className="text-center space-y-6 animate-fade-in z-20">
                         <div className="text-3xl font-light text-slate-700 dark:text-slate-200 tabular-nums tracking-tight">
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

// --- REALITY CHECK TOOL ---
// Redesigned as "Split-Stream Deconstruction Board"

const RealityCheckTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<number>(0);
  
  // State for Reality Check
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [facts, setFacts] = useState('');
  const [story, setStory] = useState('');
  
  // Result
  const [reframe, setReframe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Cognitive Grounding
  const [absoluteWarning, setAbsoluteWarning] = useState<string | null>(null);

  // Live checker for absolute words
  useEffect(() => {
      const absoluteTerms = /\b(always|never|everyone|nobody|everything|nothing|hate|impossible|completely|constantly)\b/i;
      const match = story.match(absoluteTerms);
      if (match) {
          setAbsoluteWarning(`"${match[0]}" is an absolute term. Is that 100% factual?`);
      } else {
          setAbsoluteWarning(null);
      }
  }, [story]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    // Passing structured data to service
    const result = await reframeThought({ 
        emotion, 
        intensity,
        facts, 
        story 
    });
    setReframe(result);
    setIsLoading(false);
    setStep(2); // Go to results
  };

  const reset = () => {
    setStep(0);
    setFacts('');
    setStory('');
    setEmotion('');
    setReframe(null);
    setAbsoluteWarning(null);
  };

  const appendText = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
    setter(prev => {
        const separator = prev.trim() ? ' ' : '';
        return prev + separator + text;
    });
  };

  // Intro View
  if (step === 0) {
      return (
        <div className="animate-fade-in">
             <button 
                onClick={onBack} 
                className="group flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back
            </button>
            <SectionHeader title="Reality Check" subtitle="Separate feelings from facts." />
            <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 border-none py-10 md:py-14">
            <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 px-2">
                <div className="p-4 bg-white dark:bg-teal-900/30 rounded-full text-teal-600 dark:text-teal-400 shadow-sm ring-4 ring-teal-50/50 dark:ring-teal-900/20">
                <Wind size={40} />
                </div>
                <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 tracking-tight">Heavy thoughts?</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed text-base md:text-lg">
                    We often confuse our *stories* about an event with the event itself. Let's deconstruct that.
                    </p>
                </div>
                <Button onClick={() => setStep(1)} variant="soft" className="px-8 py-4 text-base md:text-lg w-full sm:w-auto shadow-sm">Start Check</Button>
            </div>
            </Card>
        </div>
      );
  }

  // Deconstruction Board (Split View)
  if (step === 1) {
    return (
      <div className="animate-fade-in h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <button 
                onClick={() => setStep(0)} 
                className="group flex items-center gap-2 text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 -ml-3 rounded-lg transition-all"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Abort
            </button>
            <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            </div>
        </div>
        
        <SectionHeader title="The Deconstruction" subtitle="Fill in the three pillars of your experience." />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* COLUMN 1: EMOTION */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0ms' }}>
                 <div className="flex items-center gap-2 text-rose-500 mb-1">
                     <Heart size={18} />
                     <span className="text-xs font-bold uppercase tracking-wider">Internal State</span>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name the emotion</label>
                     <div className="flex gap-2 mb-4">
                        <input 
                            value={emotion}
                            onChange={(e) => setEmotion(e.target.value)}
                            placeholder="e.g. Overwhelmed"
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 outline-none"
                        />
                        <div className="shrink-0 pt-1">
                             <VoiceInput onTranscript={appendText(setEmotion)} />
                        </div>
                     </div>
                     
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Intensity: {intensity}/10</label>
                     <input 
                        type="range" 
                        min="1" max="10" 
                        value={intensity} 
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full accent-rose-500"
                     />
                 </div>
            </div>

            {/* COLUMN 2: STORY (Assumption) */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <div className="flex items-center gap-2 text-amber-500 mb-1">
                     <PenTool size={18} />
                     <span className="text-xs font-bold uppercase tracking-wider">The Story</span>
                 </div>
                 <div className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border shadow-sm h-full flex flex-col transition-colors duration-300 ${absoluteWarning ? 'border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-none' : 'border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">What I assume</label>
                        <VoiceInput onTranscript={appendText(setStory)} />
                     </div>
                     <textarea 
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        placeholder="Everyone is judging me..."
                        className="flex-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 resize-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 outline-none text-base leading-relaxed"
                     />
                     
                     {/* Cognitive Grounding Alert */}
                     {absoluteWarning && (
                         <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex gap-3 text-xs text-amber-700 dark:text-amber-400 animate-fade-in">
                             <AlertCircle size={16} className="shrink-0 mt-0.5" />
                             {absoluteWarning}
                         </div>
                     )}
                 </div>
            </div>

            {/* COLUMN 3: FACTS (Reality) */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
                 <div className="flex items-center gap-2 text-teal-500 mb-1">
                     <Camera size={18} />
                     <span className="text-xs font-bold uppercase tracking-wider">The Facts</span>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">What a camera sees</label>
                        <VoiceInput onTranscript={appendText(setFacts)} />
                     </div>
                     <textarea 
                        value={facts}
                        onChange={(e) => setFacts(e.target.value)}
                        placeholder="I sat in a meeting. No one spoke for 10 seconds."
                        className="flex-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 resize-none focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none text-base leading-relaxed"
                     />
                 </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button 
                onClick={handleAnalyze} 
                disabled={!story || !facts || !emotion || isLoading} 
                className="w-full md:w-auto px-8 h-14 text-lg shadow-lg shadow-indigo-100 dark:shadow-none"
                isLoading={isLoading}
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
            className="group flex items-center gap-2 text-slate-400 text-sm mb-6 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 -ml-3 rounded-lg transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Start Over
        </button>

       <SectionHeader title="The Shift" subtitle="Bridging the gap between story and reality." />
       
       <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 md:space-y-10 relative overflow-hidden">
           
           {/* Visual Connection Line */}
           <div className="absolute top-0 left-8 bottom-0 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
               <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4 border-l-2 border-amber-400">The Story</p>
                   <p className="text-slate-500 dark:text-slate-400 italic text-sm md:text-base leading-relaxed pl-4">"{story}"</p>
               </div>
               <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4 border-l-2 border-teal-400">The Reality</p>
                   <p className="text-slate-500 dark:text-slate-400 italic text-sm md:text-base leading-relaxed pl-4">"{facts}"</p>
               </div>
           </div>

           <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/30 p-6 md:p-8 relative">
               <div className="absolute top-6 right-6 text-indigo-200 dark:text-indigo-900/20">
                   <Split size={48} />
               </div>
               <h3 className="text-lg md:text-xl font-medium text-indigo-900 dark:text-indigo-100 mb-4">A Grounded Reframe</h3>
               <p className="text-indigo-800 dark:text-indigo-200 leading-8 text-lg md:text-xl relative z-10">
                   {reframe}
               </p>
           </Card>

           <div className="pt-4 flex justify-center">
               <Button variant="secondary" onClick={reset} className="text-sm">
                   <RefreshCcw size={16} />
                   New Check
               </Button>
           </div>
       </div>
    </div>
  );
};
