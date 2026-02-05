
import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import { HomeView } from './components/views/HomeView';
import { LogView } from './components/views/LogView';
import { MindView } from './components/views/MindView';
import { InsightsView } from './components/views/InsightsView';
import { ProfileView } from './components/views/ProfileView';
import { AssistantView } from './components/views/AssistantView';
import { GoalsView } from './components/views/GoalsView';
import { SimulatorView } from './components/views/SimulatorView';
import { AuthModal } from './components/auth/AuthComponents';
import { getSession, logout } from './services/authService';
import { Home, PlusCircle, Brain, BarChart2, User as UserIcon, Layout, MessageCircle, Compass, Waves } from 'lucide-react';
import { MotionProvider, PageTransition } from './components/Motion';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ambient } from './services/ambientService';
import { AmbientBackground, AmbientSystemProvider } from './components/AmbientBackground'; 

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    const initAudio = () => {
        ambient.resume();
        window.removeEventListener('click', initAudio);
    };
    window.addEventListener('click', initAudio);
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setActiveView(View.HOME);
  };

  const handleProtectedAction = (action: () => void) => {
    if (!user) { setIsAuthModalOpen(true); } else { action(); }
  };

  const handleNav = (view: View) => {
      setActiveView(view);
      ambient.playInteraction('tap');
  };

  const renderView = () => {
    switch (activeView) {
      case View.HOME: return <HomeView onChangeView={handleNav} />;
      case View.LOG: return <LogView />;
      case View.MIND: return <MindView initialMode="MENU" />;
      case View.CONNECT: return <MindView initialMode="CONNECT" />;
      case View.GOALS: return <GoalsView />;
      case View.SIMULATOR: return <SimulatorView />;
      case View.INSIGHTS: return <InsightsView onChangeView={handleNav} />;
      case View.PROFILE: return <ProfileView user={user} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />;
      case View.ASSISTANT: return <AssistantView onChangeView={handleNav} />;
      default: return <div className="p-8 text-center text-slate-500">Coming Soon</div>;
    }
  };

  return (
        <div className="relative min-h-screen text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 flex flex-col overflow-hidden">
        
        {/* THE LIVING LAYER */}
        <AmbientBackground />

        {/* Global Auth Modal */}
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onSuccess={handleLoginSuccess}
        />

        {/* Glass Header */}
        <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            
            {/* Brand */}
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleNav(View.HOME)}>
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-teal-400 shadow-xl">
                        <Layout size={20} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="font-light text-xl tracking-tight text-white">Oura</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Intelligence</span>
                </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
                <NavLink label="Home" active={activeView === View.HOME} onClick={() => handleNav(View.HOME)} />
                <NavLink label="Assistant" active={activeView === View.ASSISTANT} onClick={() => handleNav(View.ASSISTANT)} />
                <NavLink label="Insights" active={activeView === View.INSIGHTS} onClick={() => handleNav(View.INSIGHTS)} />
                <NavLink label="Twin" active={activeView === View.SIMULATOR} onClick={() => handleNav(View.SIMULATOR)} />
                <NavLink label="Goals" active={activeView === View.GOALS} onClick={() => handleNav(View.GOALS)} />
                <NavLink label="Mind" active={activeView === View.MIND} onClick={() => handleNav(View.MIND)} />
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => handleProtectedAction(() => handleNav(View.LOG))}
                    className="group relative px-5 py-2.5 rounded-xl bg-slate-100 text-slate-900 font-medium text-sm hover:scale-105 active:scale-95 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                        <PlusCircle size={16} /> Log
                    </span>
                </button>
                
                <button 
                    onClick={() => handleNav(View.PROFILE)}
                    className="hidden md:flex w-10 h-10 rounded-full bg-slate-800 border border-white/10 hover:border-white/20 items-center justify-center overflow-hidden transition-all active:scale-95"
                >
                    {user && user.avatar ? (
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={18} className="text-slate-400" />
                    )}
                </button>
            </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-32 md:pb-12">
            <PageTransition viewKey={activeView}>
                {renderView()}
            </PageTransition>
        </main>

        {/* Mobile Nav Glass */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] z-50 shadow-2xl shadow-black/50">
            <div className="flex justify-around items-center h-16 px-2">
                <MobileIcon icon={<Home size={20} />} label="Home" isActive={activeView === View.HOME} onClick={() => handleNav(View.HOME)} />
                <MobileIcon icon={<Waves size={20} />} label="Twin" isActive={activeView === View.SIMULATOR} onClick={() => handleNav(View.SIMULATOR)} />
                <MobileIcon icon={<MessageCircle size={20} />} label="Chat" isActive={activeView === View.ASSISTANT} onClick={() => handleNav(View.ASSISTANT)} />
                <MobileIcon icon={<Brain size={20} />} label="Mind" isActive={activeView === View.MIND} onClick={() => handleNav(View.MIND)} />
                <MobileIcon icon={<UserIcon size={20} />} label="Profile" isActive={activeView === View.PROFILE} onClick={() => handleNav(View.PROFILE)} />
            </div>
        </nav>
        </div>
  );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AmbientSystemProvider>
            <MotionProvider>
                <AppContent />
            </MotionProvider>
        </AmbientSystemProvider>
    </ThemeProvider>
);

const NavLink = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {label}
  </button>
);

const MobileIcon = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
        isActive ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500'
    }`}
  >
    {icon}
    {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-teal-400 rounded-full" />}
  </button>
);

export default App;
