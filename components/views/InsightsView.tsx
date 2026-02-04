import React, { useEffect, useState } from 'react';
import { Card, SectionHeader } from '../Shared';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateDailyInsight } from '../../services/geminiService';
import { Sparkles } from 'lucide-react';

const data = [
  { day: 'M', score: 60, type: 'Rest' },
  { day: 'T', score: 75, type: 'Active' },
  { day: 'W', score: 50, type: 'Low' },
  { day: 'T', score: 85, type: 'Good' },
  { day: 'F', score: 70, type: 'Steady' },
  { day: 'S', score: 90, type: 'Peak' },
  { day: 'S', score: 80, type: 'Rest' },
];

export const InsightsView: React.FC = () => {
  const [insight, setInsight] = useState<{title: string, body: string} | null>(null);

  useEffect(() => {
    // Generate insight on mount
    const fetchInsight = async () => {
        const result = await generateDailyInsight(data);
        setInsight(result);
    };
    fetchInsight();
  }, []);

  return (
    <div className="pb-12 animate-fade-in space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <SectionHeader title="Insights" subtitle="Understanding patterns, not just numbers." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        {/* AI Insight */}
        <div className="md:col-span-1">
            <Card variant="highlight" className="border-l-4 border-l-teal-400 h-full p-5 md:p-6">
                <div className="flex gap-3 mb-3 md:mb-4">
                    <Sparkles size={20} className="text-teal-600 mt-0.5 shrink-0" />
                    <h3 className="font-medium text-slate-800 text-lg">{insight ? insight.title : "Analyzing Patterns..."}</h3>
                </div>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {insight ? insight.body : "Looking at your recent recovery and stress levels to find helpful connections."}
                </p>
            </Card>
        </div>

        {/* Chart */}
        <section className="md:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly Energy</h3>
                <span className="text-[10px] md:text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Last 7 Days</span>
            </div>
            
            <div className="h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={32}>
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 13}} 
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{fill: '#f1f5f9', radius: 4}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px'}}
                    />
                    <Bar dataKey="score" radius={[6, 6, 6, 6]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#14b8a6' : '#cbd5e1'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-400 mt-6 max-w-sm mx-auto">
                Bars show relative energy levels. Consistent sleep (teal) correlates with higher days.
            </p>
        </section>
      </div>
      
      <Card variant="flat" className="text-center py-6 md:py-8 bg-slate-50/50">
          <p className="text-sm md:text-base text-slate-500 italic">
              "You don't need to be at 100% to be worthy."
          </p>
      </Card>
    </div>
  );
};