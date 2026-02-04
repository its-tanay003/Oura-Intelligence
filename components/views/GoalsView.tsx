
import React, { useState, useEffect } from 'react';
import { Card, Button, SectionHeader, VoiceInput, EmptyState, Input } from '../Shared';
import { generateLearningJourney } from '../../services/geminiService';
import { Compass, CheckCircle, Circle, Plus, ChevronDown, ChevronUp, Loader2, Sparkles, X, Target, Zap, Beaker, Minus, Trash2 } from 'lucide-react';
import { Goal, Milestone } from '../../types';
import { FadeIn } from '../Motion';

export const GoalsView: React.FC = () => {
  // --- STATE ---
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('oura_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState<'INPUT' | 'GENERATING' | 'REVIEW'>('INPUT');
  const [topic, setTopic] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<{ title: string; milestones: any[] } | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('oura_goals', JSON.stringify(goals));
  }, [goals]);

  // --- HANDLERS ---
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setCreateStep('GENERATING');
    const plan = await generateLearningJourney(topic);
    setGeneratedPlan(plan);
    setCreateStep('REVIEW');
  };

  const handleSaveGoal = () => {
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

  const resetCreation = () => {
    setIsCreating(false);
    setCreateStep('INPUT');
    setTopic('');
    setGeneratedPlan(null);
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
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">New Journey</span>
                 <div className="w-10" />
              </div>

              {createStep === 'INPUT' && (
                  <div className="flex-1 flex flex-col justify-center space-y-8">
                      <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto shadow-sm">
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
                          />
                          <Button onClick={handleGenerate} disabled={!topic.trim()} className="rounded-xl h-12 w-12 p-0 flex items-center justify-center">
                              <Sparkles size={20} />
                          </Button>
                      </div>
                  </div>
              )}

              {createStep === 'GENERATING' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                      <Loader2 size={40} className="text-teal-500 animate-spin" />
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
                          <Button variant="secondary" onClick={() => setCreateStep('INPUT')} className="flex-1">Back</Button>
                          <Button onClick={handleSaveGoal} className="flex-1">Start Journey</Button>
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
              <Plus size={18} /> New Journey
          </Button>
      </div>

      {goals.length === 0 ? (
          <EmptyState 
            title="No Journeys Yet" 
            message="Growth happens in small steps. Start a new Learning Journey to explore something new."
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
                            className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Minus size={18} />
                        </button>
                        <button 
                            onClick={() => onUpdateValue(goal.id, 1)}
                            className={`p-2 rounded-full transition-colors text-white ${getProgressColor()}`}
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
                
                {/* Simple Delete for Non-Learning if needed, though mostly handled inside expand for Learning */}
                {(!isLearning && !isHabit && !isExperiment) && (
                     <button onClick={() => setExpanded(!expanded)} className="text-slate-300 hover:text-slate-500 transition-colors ml-4 p-1">
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

                    {/* Simple Delete Action */}
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
