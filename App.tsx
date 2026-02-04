import React, { useState } from 'react';
import { View } from './types';
import { HomeView } from './components/views/HomeView';
import { LogView } from './components/views/LogView';
import { MindView } from './components/views/MindView';
import { InsightsView } from './components/views/InsightsView';
import { Home, PlusCircle, Brain, BarChart2, User, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.HOME);

  const renderView = () => {
    switch (activeView) {
      case View.HOME: return <HomeView onChangeView={setActiveView} />;
      case View.LOG: return <LogView />;
      case View.MIND: return <MindView />;
      case View.INSIGHTS: return <InsightsView />;
      default: return <div className="p-8 text-center text-slate-500">Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 flex flex-col">
      
      {/* Top Navigation - Desktop Friendly */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView(View.HOME)}>
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-200">
               <Layout size={18} />
            </div>
            <span className="font-medium text-slate-800 tracking-tight text-lg">Oura <span className="text-slate-400 font-normal">Intelligence</span></span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink label="Home" active={activeView === View.HOME} onClick={() => setActiveView(View.HOME)} />
            <NavLink label="Insights" active={activeView === View.INSIGHTS} onClick={() => setActiveView(View.INSIGHTS)} />
            <NavLink label="Mind" active={activeView === View.MIND} onClick={() => setActiveView(View.MIND)} />
            <NavLink label="Profile" active={activeView === View.PROFILE} onClick={() => setActiveView(View.PROFILE)} />
          </nav>

          {/* Action Button */}
          <button 
            onClick={() => setActiveView(View.LOG)}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-md shadow-slate-200 active:scale-95"
          >
            <PlusCircle size={18} className="text-teal-400 group-hover:text-teal-300" />
            <span className="hidden sm:inline text-sm font-medium">Log Entry</span>
            <span className="sm:hidden text-sm font-medium">Log</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {/* Added pb-24 for mobile to clear bottom nav, reset to pb-12 on desktop */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-12 pb-24 md:pb-12 animate-fade-in">
        {renderView()}
      </main>

      {/* Mobile Bottom Nav (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 pb-safe">
         <div className="flex justify-around items-center h-16 px-2">
            <MobileIcon icon={<Home size={20} />} label="Home" isActive={activeView === View.HOME} onClick={() => setActiveView(View.HOME)} />
            <MobileIcon icon={<BarChart2 size={20} />} label="Insights" isActive={activeView === View.INSIGHTS} onClick={() => setActiveView(View.INSIGHTS)} />
            <MobileIcon icon={<Brain size={20} />} label="Mind" isActive={activeView === View.MIND} onClick={() => setActiveView(View.MIND)} />
            <MobileIcon icon={<User size={20} />} label="Me" isActive={activeView === View.PROFILE} onClick={() => setActiveView(View.PROFILE)} />
         </div>
      </nav>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm hidden md:block">
        <p>© 2026 Oura Intelligence. Calm Technology.</p>
      </footer>
    </div>
  );
};

// Desktop Nav Link
const NavLink = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'text-slate-800 bg-slate-100' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

// Mobile Nav Icon
const MobileIcon = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;