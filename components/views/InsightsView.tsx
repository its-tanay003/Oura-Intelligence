
import React, { useEffect, useState } from 'react';
import { Card, SectionHeader, EmptyState } from '../Shared';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateDailyInsight } from '../../services/geminiService';
import { Sparkles, Calendar } from 'lucide-react';
import { View, Emotion, DailyLog } from '../../types';
import { useTheme } from '../ThemeContext';

// Mock Data for demonstration
const mockLogs: DailyLog[] = [
  { date: 'Mon', sleepHours: 6.5, mood: Emotion.TIRED, hydration: 4, stressLevel: 3 },
  { date: 'Tue', sleepHours: 7.0, mood: Emotion.CALM, hydration: 6, stressLevel: 2 },
  { date: 'Wed', sleepHours: 8.5, mood: Emotion.ENERGETIC, hydration: 8, stressLevel: 1 },
  { date: 'Thu', sleepHours: 5.5, mood: Emotion.ANXIOUS, hydration: 3, stressLevel: 4 },
  { date: 'Fri', sleepHours: 7.5, mood: Emotion.NEUTRAL, hydration: 5, stressLevel: 2 },
  { date: 'Sat', sleepHours: 9.0, mood: Emotion.CALM, hydration: 7, stressLevel: 1 },
  { date: 'Sun', sleepHours: 8.0, mood: Emotion.CALM, hydration: 6, stressLevel: 1 },
];

const chartData = mockLogs.map(log => ({
    day: log.date,
    score: Math.min(100, (log.sleepHours / 9) * 60 + (log.hydration / 8) * 20 + ((6 - log.stressLevel) / 5) * 20)
}));

interface InsightsViewProps {
    onChangeView: (view: View) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ onChangeView }) => {
  const [insight, setInsight] = useState<{title: string, body: string} | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch insights using Gemini
    if (mockLogs.length > 0) {
        const fetchInsight = async () => {
            const result = await generateDailyInsight(mockLogs);
            setInsight(result);
        };
        fetchInsight();
    }
  }, []);

  // Empty State Logic
  if (mockLogs.length < 3) {
    return (
        <div className="pb-12 animate-fade-in space-y-6 md:space-y-8 max-w-4xl mx-auto">
            <SectionHeader title="Insights" subtitle="Patterns appear over time." />
            <EmptyState 
                title="Gathering Data"
                message="We need about 3 days of logs to start finding meaningful connections between your sleep and energy."
                actionLabel="Log Today"
                onAction={() => onChangeView(View.LOG)}
                icon={Calendar}
            />
            <Card variant="flat" className="text-center py-6">
                 <p className="text-sm text-slate-400">
                    "Consistency is not about perfection, it's about returning."
                </p>
            </Card>
        </div>
    );
  }

  return (
    <div className="pb-12 animate-fade-in space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <SectionHeader title="Insights" subtitle="Understanding patterns, not just numbers." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        {/* AI Insight Section */}
        <div className="md:col-span-1">
            <Card variant="highlight" className="border-l-4 border-l-teal-400 dark:border-l-teal-500 h-full p-5 md:p-6 bg-teal-50/50 dark:bg-teal-900/20">
                <div className="flex gap-3 mb-3 md:mb-4">
                    <Sparkles size={20} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 text-lg">{insight ? insight.title : "Noticing Patterns..."}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                    {insight ? insight.body : "Looking at your recent rest and rhythm to find helpful connections."}
                </p>
            </Card>
        </div>

        {/* Chart */}
        <section className="md:col-span-2 bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly Rhythm</h3>
                <span className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Last 7 Days</span>
            </div>
            
            <div className="h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={32}>
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: theme === 'dark' ? '#94a3b8' : '#94a3b8', fontSize: 13}} 
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{fill: theme === 'dark' ? '#1e293b' : '#f1f5f9', radius: 4}}
                        contentStyle={{
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                            padding: '8px 12px',
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                            color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 6, 6]}>
                    {chartData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.score > 80 ? '#14b8a6' : (theme === 'dark' ? '#334155' : '#cbd5e1')} 
                        />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-400 mt-6 max-w-sm mx-auto">
                Bars indicate relative balance. Consistent inputs (teal) generally align with better system stability.
            </p>
        </section>
      </div>
      
      <Card variant="flat" className="text-center py-6 md:py-8 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm md:text-base text-slate-500 italic">
              "You don't need to be at 100% to be worthy."
          </p>
      </Card>
    </div>
  );
};
