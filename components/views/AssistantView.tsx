
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, SectionHeader } from '../Shared';
import { ai, createChat, sendMessage, generateImage, generateSpeech, transcribeAudio } from '../../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, Send, Image as ImageIcon, Sparkles, Volume2, Globe, Brain, StopCircle, X, Loader2, Radio } from 'lucide-react';
import { View, UserProfile, Goal } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  image?: string;
  audio?: string; // base64
  groundingUrls?: {title: string, uri: string}[];
}

interface AssistantViewProps {
    onChangeView?: (view: View) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ onChangeView }) => {
  const [mode, setMode] = useState<'CHAT' | 'LIVE'>('CHAT');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hello. I'm your calm intelligence assistant. How can I support you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat Configs
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isCreative, setIsCreative] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Chat Session
  const chatRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Initialize Chat with Context
  useEffect(() => {
    if (!chatRef.current) {
      // 1. User Profile Context
      const savedProfile = localStorage.getItem('oura_profile');
      let contextString = "User Profile: Not set.";
      if (savedProfile) {
          try {
              const p: UserProfile = JSON.parse(savedProfile);
              contextString = `User Profile Context:
              - Name: ${p.name}
              - Work Rhythm: ${p.workType}
              - Recent Stress Level: ${p.workStress}/100
              - Privacy Settings: ${p.privacy.shareWorkContext ? 'Work Context Shared' : 'Work Context Hidden'}.`;
          } catch (e) { }
      }

      // 2. Active Goals/Journeys Context
      const savedGoals = localStorage.getItem('oura_goals');
      let goalsContext = "";
      let activeGoalTitle = "my goal";
      
      if (savedGoals) {
          try {
              const goals: Goal[] = JSON.parse(savedGoals);
              const active = goals.filter(g => g.active && g.type === 'learning');
              if (active.length > 0) {
                   goalsContext = `Active Learning Journeys:\n${active.map(g => `- ${g.title} (${g.progress}% complete)`).join('\n')}`;
                   activeGoalTitle = active[0].title;
              }
          } catch (e) { }
      }

      // 3. Enhanced System Instruction for Intent Analysis
      const systemPrompt = `
      You are a supportive, calm, and intelligent assistant focused on mental wellbeing and clarity.
      
      CONTEXT:
      ${contextString}
      ${goalsContext}

      INTENT RECOGNITION & CAPABILITIES:
      1. NAVIGATE: Analyze user text for intents to access specific features. Use the 'navigate' tool.
         - "I need to log my sleep" or "track mood" -> navigate(LOG)
         - "Help me relax" or "I'm stressed" -> navigate(MIND)
         - "How have I been doing lately?" -> navigate(INSIGHTS)
         - "I want to work on my learning journey" or "Check my progress on ${activeGoalTitle}" -> navigate(GOALS)
         - "I feel lonely" or "Call my trusted contact" -> navigate(CONNECT)
      
      2. COACH: Provide tailored advice based on their Profile and Goals.
         - If they are a Shift Worker, acknowledge schedule challenges.
         - If they have active Learning Journeys, encourage small next steps on their milestones.
      
      3. CONNECT: If the user expresses high stress, anxiety, overwhelm, or loneliness, gently suggest navigating to the 'CONNECT' view (Trusted Circle).

      GUIDELINES:
      - Keep answers concise unless asked to elaborate.
      - Never diagnose.
      - Never claim to be a doctor.
      - If crisis is detected, suggest human connection via the Connect tool or professional help.
      `;

      chatRef.current = createChat(systemPrompt);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !isCreative) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (isCreative) {
        // Image Generation Mode
        const base64Image = await generateImage(userMsg.text || '', aspectRatio);
        if (base64Image) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', image: base64Image }]);
        } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I couldn't generate that image right now." }]);
        }
      } else {
        // Chat Mode
        let response = await sendMessage(chatRef.current, userMsg.text || '', useThinking, useSearch);
        
        // --- Tool Call Handling Loop ---
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCalls = response.functionCalls;
            const functionResponses = [];

            for (const call of functionCalls) {
                if (call.name === 'navigate' && onChangeView) {
                    const args = call.args as any;
                    console.log("Navigating to:", args.view);
                    
                    // Execute Navigation
                    onChangeView(args.view as View);
                    
                    // Prepare response for the model
                    // FIXED: Wrap in functionResponse to form a valid Part
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            id: call.id,
                            response: { success: true, message: `Navigated user to ${args.view}` }
                        }
                    });

                    // Add a system message to chat to inform user (optional, but good UX)
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), 
                        role: 'model', 
                        text: `*Opening ${args.view === 'CONNECT' ? 'Trusted Circle' : args.view}...*` 
                    }]);
                }
            }

            // Send tool output back to model to complete the turn
            if (functionResponses.length > 0) {
                response = await sendMessage(chatRef.current, functionResponses);
            }
        }

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
            .filter(Boolean);

        if (response.text) {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: response.text,
                groundingUrls: grounding
            }]);
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I encountered a hiccup. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
      try {
          const audioData = await generateSpeech(text);
          if (audioData) {
            const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
            audio.play();
          }
      } catch (e) {
          console.error(e);
      }
  };

  // --- Transcription Logic ---
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
      if (isRecording) {
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const recorder = new MediaRecorder(stream);
              chunksRef.current = [];
              recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
              recorder.onstop = async () => {
                  const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = async () => {
                      const base64 = (reader.result as string).split(',')[1];
                      if (!base64) return;
                      setIsLoading(true);
                      try {
                        const text = await transcribeAudio(base64, 'audio/webm');
                        setInput(prev => prev + " " + text);
                      } catch(err) {
                        console.error(err);
                      } finally {
                        setIsLoading(false);
                      }
                  };
              };
              recorder.start();
              mediaRecorderRef.current = recorder;
              setIsRecording(true);
          } catch (e) {
              alert("Microphone access denied");
          }
      }
  };

  if (mode === 'LIVE') {
      return <LiveMode onClose={() => setMode('CHAT')} />;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in relative">
      <div className="flex justify-between items-center mb-4">
        <SectionHeader title="Companion" subtitle="Gemini 3 Powered" />
        <Button onClick={() => setMode('LIVE')} variant="soft" className="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30">
            <Radio size={18} />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-slate-800 dark:bg-teal-700 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm'
            }`}>
              {msg.image ? (
                <img src={msg.image} alt="Generated" className="rounded-xl w-full max-w-sm" />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              )}
              
              {/* Grounding Sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100/20 dark:border-slate-700/50">
                      <p className="text-xs font-bold uppercase opacity-50 mb-1">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingUrls.map((url, i) => (
                            <a key={i} href={url.uri} target="_blank" rel="noreferrer" className="text-xs opacity-70 hover:opacity-100 underline truncate max-w-[150px]">
                                {url.title || 'Source'}
                            </a>
                        ))}
                      </div>
                  </div>
              )}

              {/* Actions */}
              {msg.role === 'model' && msg.text && (
                  <button onClick={() => handleTTS(msg.text!)} className="mt-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      <Volume2 size={16} />
                  </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Loader2 size={16} className="animate-spin text-teal-500" />
                    {useThinking ? "Thinking deeply..." : isCreative ? "Creating image..." : "Typing..."}
                </div>
            </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-800 p-2 shadow-lg dark:shadow-black/20 relative z-20">
        
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            
            {/* Thinking Toggle */}
            <button 
                onClick={() => setUseThinking(!useThinking)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    useThinking ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                <Brain size={14} /> Think
            </button>

            {/* Search Toggle */}
            <button 
                onClick={() => setUseSearch(!useSearch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    useSearch ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                <Globe size={14} /> Search
            </button>

             {/* Creative Mode Toggle */}
             <button 
                onClick={() => setIsCreative(!isCreative)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isCreative ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                <ImageIcon size={14} /> Creative
            </button>

            {isCreative && (
                 <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-full px-2 py-1 text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer"
                 >
                     <option value="1:1">1:1</option>
                     <option value="16:9">16:9</option>
                     <option value="9:16">9:16</option>
                     <option value="4:3">4:3</option>
                     <option value="3:4">3:4</option>
                 </select>
            )}
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={toggleRecording}
                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Mic size={20} />
            </button>
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isCreative ? "Describe an image to generate..." : "Ask anything..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base"
                disabled={isLoading}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-full transition-all ${
                    input.trim() 
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-none hover:bg-teal-700' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                }`}
            >
                {isCreative ? <Sparkles size={20} /> : <Send size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- LIVE MODE COMPONENT ---

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
  
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

const LiveMode: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [status, setStatus] = useState("Connecting...");
    const [volume, setVolume] = useState(0);

    // Refs for cleanup
    const audioContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;
        let nextStartTime = 0;
        const sources = new Set<AudioBufferSourceNode>();

        const initLive = async () => {
            if (!ai) return;
            
            try {
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
                const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                audioContextRef.current = inputAudioContext;
                
                const outputNode = outputAudioContext.createGain();
                outputNode.connect(outputAudioContext.destination);

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    callbacks: {
                        onopen: () => {
                            if (isMounted) setStatus("Listening");
                            
                            const source = inputAudioContext.createMediaStreamSource(stream);
                            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessor.onaudioprocess = (e) => {
                                const inputData = e.inputBuffer.getChannelData(0);
                                // Simple volume viz
                                let sum = 0;
                                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                                if (isMounted) setVolume(Math.sqrt(sum/inputData.length) * 5);

                                const pcmBlob = createBlob(inputData);
                                sessionPromise.then((session: any) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };

                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContext.destination);
                        },
                        onmessage: async (msg: LiveServerMessage) => {
                            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (base64Audio) {
                                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                                const audioBuffer = await decodeAudioData(
                                    decode(base64Audio),
                                    outputAudioContext,
                                    24000,
                                    1
                                );
                                const source = outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.start(nextStartTime);
                                nextStartTime += audioBuffer.duration;
                                sources.add(source);
                                source.onended = () => sources.delete(source);
                            }
                        },
                        onclose: () => { if (isMounted) setStatus("Disconnected"); },
                        onerror: () => { if (isMounted) setStatus("Connection Error"); }
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                        }
                    }
                });

                sessionRef.current = sessionPromise;

            } catch (e) {
                console.error(e);
                setStatus("Failed to connect");
            }
        };

        initLive();

        return () => {
            isMounted = false;
            audioContextRef.current?.close();
            // Close session if possible (no explicit close method on promise, usually relies on socket drop)
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white animate-fade-in">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <X size={24} />
            </button>
            
            <div className="relative">
                {/* Visualizer Orb */}
                <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 blur-xl opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                    style={{ transform: `translate(-50%, -50%) scale(${1 + volume})` }}
                />
                <div className="w-32 h-32 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10 shadow-2xl">
                     <Mic size={32} className="text-teal-400" />
                </div>
            </div>

            <h2 className="mt-8 text-2xl font-light tracking-tight">{status}</h2>
            <p className="text-slate-400 mt-2 text-sm">Gemini Live Audio</p>
            
            <div className="mt-12 flex gap-6">
                <Button variant="danger" onClick={onClose} className="rounded-full h-14 w-14 p-0 flex items-center justify-center">
                    <StopCircle size={24} />
                </Button>
            </div>
        </div>
    );
};
