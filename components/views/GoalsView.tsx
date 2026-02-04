
import React, { useState, useEffect } from 'react';
import { Card, Button, SectionHeader, VoiceInput, EmptyState, Input } from '../Shared';
import { generateLearningJourney } from '../../services/geminiService';
import { Compass, CheckCircle, Circle, Plus, ChevronDown, ChevronUp, Loader2, Sparkles, X, Target, Zap, Beaker, Minus, Trash2, Repeat } from 'lucide-react';
import { Goal, Milestone } from '../../types';
import { FadeIn } from '../Motion';

type CreateStep = 'TYPE_SELECT' | 'INPUT_LEARNING' | 'INPUT_HABIT' | 'GENERATING' | 'REVIEW';

export const GoalsView: React.FC = () => {
  // --- STATE ---
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('oura_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>('TYPE_SELECT');
  
  // Learning Journey State
  const [topic, setTopic] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<{ title: string; milestones: any[] } | null>(null);

  // Habit State
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTarget, setHabitTarget] = useState(1);
  const [habitUnit, setHabitUnit] = useState('times');

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('oura_goals', JSON.stringify(goals));
  }, [goals]);

  // --- HANDLERS ---
  
  // 1. Learning Journey Handlers
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setCreateStep('GENERATING');
    const plan = await generateLearningJourney(topic);
    setGeneratedPlan(plan);
    setCreateStep('REVIEW');
  };

  const handleSaveLearningGoal = () => {
    if (!generatedPlan) return;
    
    const newGoal: Goal = {
        id: Date.now().toString(),
        title: generatedPlan.title,
        type: 'learning',
        active: true,
        progress: 0,
        createdAt: new Date().toISOString(),
        milestones: generatedPlan.milestones.map((m, i) => ({
            id: `ms-${Date.now()}-${i}`,
            title: m.title,
            description: m.description,
            isCompleted: false
        }))
    };

    setGoals([newGoal, ...goals]);
    resetCreation();
  };

  // 2. Habit Handlers
  const handleSaveHabit = () => {
      if (!habitTitle.trim()) return;

      const newGoal: Goal = {
          id: Date.now().toString(),
          title: habitTitle,
          type: 'habit',
          active: true,
          progress: 0,
          createdAt: new Date().toISOString(),
          currentValue: 0,
          targetValue: habitTarget,
          unit: habitUnit
      };

      setGoals([newGoal, ...goals]);
      resetCreation();
  };

  // Shared
  const resetCreation = () => {
    setIsCreating(false);
    setCreateStep('TYPE_SELECT');
    setTopic('');
    setGeneratedPlan(null);
    setHabitTitle('');
    setHabitTarget(1);
    setHabitUnit('times');
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
        if (goal.id !== goalId || !goal.milestones) return goal;
        
        const updatedMilestones = goal.milestones.map(m => 
            m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );

        const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
        const progress = Math.round((completedCount / updatedMilestones.length) * 100);

        return { ...goal, milestones: updatedMilestones, progress };
    }));
  };

  const updateGoalValue = (id: string, increment: number) => {
    setGoals(prev => prev.map(g => {
        if (g.id !== id) return g;
        const current = Math.max(0, (g.currentValue || 0) + increment);
        const target = g.targetValue || 1;
        const progress = Math.min(100, Math.round((current / target) * 100));
        return { ...g, currentValue: current, progress };
    }));
  };

  const deleteGoal = (id: string) => {
      if(confirm("Remove this goal?")) {
          setGoals(prev => prev.filter(g => g.id !== id));
      }
  };

  // --- RENDER HELPERS ---
  
  // Creation Modal/Overlay
  if (isCreating) {
      return (
          <div className="animate-fade-in max-w-2xl mx-auto min-h-[60vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <button onClick={resetCreation} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <X size={24} className="text-slate-400" />
                 </button>
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">New Goal</span>
                 <div className="w-10" />
              </div>

              {/* STEP 1: TYPE SELECTION */}
              {createStep === 'TYPE_SELECT' && (
                  <div className="flex-1 flex flex-col justify-center space-y-6 animate-slide-up">
                      <div className="text-center mb-4">
                          <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Choose your path</h2>
                          <p className="text-slate-500 dark:text-slate-400 mt-2">What kind of progress are you looking for?</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Card 
                              onClick={() => setCreateStep('INPUT_LEARNING')} 
                              className="cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md group transition-all"
                          >
                              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <Compass size={28} />
                              </div>
                              <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">Learning Journey</h3>
                              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                  Explore a new topic. AI creates a structured path of milestones for you.
                              </p>
                          </Card>
                          <Card 
                              onClick={() => setCreateStep('INPUT_HABIT')} 
                              className="cursor-pointer hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md group transition-all"
                          >
                              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <Zap size={28} />
                              </div>
                              <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">Simple Habit</h3>
                              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                  Track consistency. Set a daily target (e.g. water, reading, steps).
                              </p>
                          </Card>
                      </div>
                  </div>
              )}

              {/* STEP 2a: HABIT INPUT */}
              {createStep === 'INPUT_HABIT' && (
                  <div className="flex-1 flex flex-col justify-center space-y-6 animate-slide-up">
                      <div className="text-center">
                          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
                              <Zap size={32} />
                          </div>
                          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Define your Habit</h2>
                      </div>
                      
                      <Card className="space-y-6 max-w-sm mx-auto w-full p-6 md:p-8">
                          <div>
                              <Input 
                                  label="Habit Name"
                                  value={habitTitle} 
                                  onChange={e => setHabitTitle(e.target.value)} 
                                  placeholder="e.g. Drink Water" 
                                  autoFocus
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <Input 
                                      label="Daily Target"
                                      type="number" 
                                      min="1"
                                      value={habitTarget} 
                                      onChange={e => setHabitTarget(parseInt(e.target.value) || 1)} 
                                  />
                              </div>
                              <div>
                                  <Input 
                                      label="Unit"
                                      value={habitUnit} 
                                      onChange={e => setHabitUnit(e.target.value)} 
                                      placeholder="e.g. times" 
                                  />
                              </div>
                          </div>

                          <div className="pt-2 flex gap-3">
                              <Button variant="secondary" onClick={() => setCreateStep('TYPE_SELECT')} className="flex-1">Back</Button>
                              <Button 
                                  onClick={handleSaveHabit} 
                                  disabled={!habitTitle} 
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none"
                              >
                                  Create Habit
                              </Button>
                          </div>
                      </Card>
                  </div>
              )}

              {/* STEP 2b: LEARNING INPUT */}
              {createStep === 'INPUT_LEARNING' && (
                  <div className="flex-1 flex flex-col justify-center space-y-8 animate-slide-up">
                      <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 mx-auto shadow-sm">
                              <Compass size={32} />
                          </div>
                          <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Where does your curiosity lead?</h2>
                          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                              Tell us a topic, skill, or idea you want to explore. We'll map out a gentle path for you.
                          </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
                          <VoiceInput onTranscript={setTopic} className="shrink-0" />
                          <input 
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              placeholder="e.g. Urban Gardening, Stoicism, Python..."
                              className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 h-14"
                              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                              autoFocus
                          />
                          <Button onClick={handleGenerate} disabled={!topic.trim()} className="rounded-xl h-12 w-12 p-0 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600">
                              <Sparkles size={20} />
                          </Button>
                      </div>
                      
                      <div className="flex justify-center">
                           <button onClick={() => setCreateStep('TYPE_SELECT')} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                               Go Back
                           </button>
                      </div>
                  </div>
              )}

              {createStep === 'GENERATING' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <Loader2 size={40} className="text-indigo-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 text-lg animate-pulse">Designing your journey...</p>
                  </div>
              )}

              {createStep === 'REVIEW' && generatedPlan && (
                  <div className="space-y-6 animate-slide-up">
                      <SectionHeader title={generatedPlan.title} subtitle="Here is a suggested path. You can always change it later." />
                      
                      <div className="space-y-3">
                          {generatedPlan.milestones.map((m: any, i: number) => (
                              <Card key={i} className="flex gap-4 items-start">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-medium text-sm shrink-0 mt-0.5">
                                      {i + 1}
                                  </div>
                                  <div>
                                      <h4 className="font-medium text-slate-800 dark:text-slate-100">{m.title}</h4>
                                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                                  </div>
                              </Card>
                          ))}
                      </div>

                      <div className="pt-4 flex gap-3">
                          <Button variant="secondary" onClick={() => setCreateStep('INPUT_LEARNING')} className="flex-1">Back</Button>
                          <Button onClick={handleSaveLearningGoal} className="flex-1 bg-indigo-500 hover:bg-indigo-600">Start Journey</Button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // Main Dashboard
  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
          <SectionHeader title="Growth" subtitle="Curiosity without the pressure." />
          <Button onClick={() => setIsCreating(true)} variant="soft" className="h-10 text-sm">
              <Plus size={18} /> New Goal
          </Button>
      </div>

      {goals.length === 0 ? (
          <EmptyState 
            title="No Goals Yet" 
            message="Growth happens in small steps. Start a new Learning Journey or set a Simple Habit."
            actionLabel="Explore Ideas"
            onAction={() => setIsCreating(true)}
            icon={Target}
          />
      ) : (
          <div className="grid grid-cols-1 gap-6">
              {goals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onToggleMilestone={toggleMilestone} 
                    onUpdateValue={updateGoalValue}
                    onDelete={deleteGoal}
                  />
              ))}
          </div>
      )}
    </div>
  );
};

// --- COMPONENT: Goal Card ---

const GoalCard: React.FC<{ 
    goal: Goal; 
    onToggleMilestone: (gid: string, mid: string) => void;
    onUpdateValue: (gid: string, val: number) => void;
    onDelete: (id: string) => void;
}> = ({ goal, onToggleMilestone, onUpdateValue, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    
    const isComplete = goal.progress === 100;
    const isLearning = goal.type === 'learning';
    const isHabit = goal.type === 'habit';
    const isExperiment = goal.type === 'experiment';

    const getIcon = () => {
        if (isLearning) return <Compass size={24} />;
        if (isHabit) return <Zap size={24} />;
        if (isExperiment) return <Beaker size={24} />;
        return <Target size={24} />;
    };

    const getColors = () => {
        if (isComplete) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600';
        if (isLearning) return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
        if (isHabit) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
        return 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400';
    };

    const getProgressColor = () => {
        if (isComplete) return 'bg-emerald-500';
        if (isLearning) return 'bg-indigo-500 dark:bg-indigo-400';
        if (isHabit) return 'bg-amber-500 dark:bg-amber-400';
        return 'bg-teal-500 dark:bg-teal-400';
    };

    // Calculate Next Step for Learning
    const nextMilestone = goal.milestones?.find(m => !m.isCompleted);

    return (
        <Card className={`transition-all duration-500 ${isComplete ? 'opacity-75' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className={`p-3 rounded-full shrink-0 ${getColors()}`}>
                        {isComplete ? <CheckCircle size={24} /> : getIcon()}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-medium text-slate-800 dark:text-slate-100 ${isComplete ? 'line-through text-slate-400' : ''}`}>
                            {goal.title}
                        </h3>
                        
                        <div className="mt-2">
                             {/* Learning Progress: Segmented Bar */}
                            {isLearning && goal.milestones && (
                                <div className="flex gap-1 h-1.5 w-full max-w-[200px]">
                                    {goal.milestones.map((m, i) => (
                                        <div 
                                            key={i}
                                            className={`flex-1 rounded-full transition-all duration-500 ${m.isCompleted ? getProgressColor() : 'bg-slate-100 dark:bg-slate-800'}`}
                                        />
                                    ))}
                                </div>
                            )}

                             {/* Habit/Experiment Progress: Linear Bar + Text */}
                            {(isHabit || isExperiment) && (
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${getProgressColor()}`} 
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {goal.currentValue || 0} / {goal.targetValue || '?'} {goal.unit || 'units'}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {!expanded && !isComplete && nextMilestone && isLearning && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                Next: {nextMilestone.title}
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Actions for Habits/Experiments */}
                {(isHabit || isExperiment) && !isComplete && (
                     <div className="flex items-center gap-2 ml-2">
                        <button 
                            onClick={() => onUpdateValue(goal.id, -1)}
                            className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
                        >
                            <Minus size={18} />
                        </button>
                        <button 
                            onClick={() => onUpdateValue(goal.id, 1)}
                            className={`p-2 rounded-full transition-colors text-white active:scale-95 ${getProgressColor()}`}
                        >
                            <Plus size={18} />
                        </button>
                     </div>
                )}
                
                {/* Expand Toggle */}
                {isLearning && (
                    <button onClick={() => setExpanded(!expanded)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 transition-colors ml-4 p-1">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                )}
                
                {/* Simple Delete for Non-Learning */}
                {(!isLearning) && (
                     <button onClick={() => setExpanded(!expanded)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 transition-colors ml-4 p-1">
                        <ChevronDown size={20} />
                     </button>
                )}
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-1 animate-slide-up">
                    
                    {/* Learning Milestones */}
                    {isLearning && goal.milestones && goal.milestones.map((m, i) => (
                        <div 
                            key={m.id} 
                            onClick={() => onToggleMilestone(goal.id, m.id)}
                            className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className={`mt-0.5 transition-colors ${m.isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                                {m.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium transition-colors ${m.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {m.title}
                                </h4>
                                {m.description && (
                                    <p className={`text-xs mt-0.5 leading-relaxed ${m.isCompleted ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {m.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Habit Details (Simple) */}
                    {(isHabit || isExperiment) && (
                        <div className="px-1 py-2">
                             <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                                 <span>Current Progress</span>
                                 <span className="font-medium text-slate-800 dark:text-slate-200">{goal.progress}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${getProgressColor()}`} 
                                    style={{ width: `${goal.progress}%` }}
                                />
                             </div>
                             {isHabit && (
                                 <div className="mt-4 flex gap-2 text-xs text-slate-400">
                                     <Repeat size={14} />
                                     <span>Resets daily</span>
                                 </div>
                             )}
                        </div>
                    )}

                    {/* Delete Action */}
                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
                            className="text-xs text-rose-400 hover:text-rose-600 hover:underline px-2 py-1 flex items-center gap-1"
                        >
                            <Trash2 size={14} />
                            {isLearning ? "Abandon Journey" : "Delete Goal"}
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};
