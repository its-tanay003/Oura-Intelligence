
import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import { HomeView } from './components/views/HomeView';
import { LogView } from './components/views/LogView';
import { MindView } from './components/views/MindView';
import { InsightsView } from './components/views/InsightsView';
import { ProfileView } from './components/views/ProfileView';
import { AssistantView } from './components/views/AssistantView';
import { GoalsView } from './components/views/GoalsView';
import { SimulatorView } from './components/views/SimulatorView'; // Import
import { AuthModal } from './components/auth/AuthComponents';
import { getSession, logout } from './services/authService';
import { Home, PlusCircle, Brain, BarChart2, User as UserIcon, Layout, MessageCircle, Compass, Waves } from 'lucide-react';
import { MotionProvider, PageTransition } from './components/Motion';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ambient } from './services/ambientService'; // Import audio

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { theme } = useTheme();

  // Initialize Session
  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    
    // Resume audio context on first user interaction
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

  // Protected Action Handler
  const handleProtectedAction = (action: () => void) => {
    if (!user) {
        setIsAuthModalOpen(true);
    } else {
        action();
    }
  };

  const handleNav = (view: View) => {
      setActiveView(view);
      ambient.playInteraction('tap'); // Audio Feedback
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
      case View.PROFILE: return (
        <ProfileView 
            user={user} 
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
        />
      );
      case View.ASSISTANT: return <AssistantView onChangeView={handleNav} />;
      default: return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Coming Soon</div>;
    }
  };

  return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-100 dark:selection:bg-teal-900 flex flex-col transition-colors duration-500">
        
        {/* Global Auth Modal */}
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onSuccess={handleLoginSuccess}
        />

        {/* Top Navigation - Desktop Friendly */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
            
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav(View.HOME)}>
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-200 dark:shadow-none transition-transform group-hover:scale-105 group-active:scale-95">
                <Layout size={18} />
                </div>
                <span className="font-medium text-slate-800 dark:text-white tracking-tight text-lg">Oura <span className="text-slate-400 dark:text-slate-500 font-normal">Intelligence</span></span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
                <NavLink label="Home" active={activeView === View.HOME} onClick={() => handleNav(View.HOME)} />
                <NavLink label="Assistant" active={activeView === View.ASSISTANT} onClick={() => handleNav(View.ASSISTANT)} />
                <NavLink label="Insights" active={activeView === View.INSIGHTS} onClick={() => handleNav(View.INSIGHTS)} />
                <NavLink label="Twin" active={activeView === View.SIMULATOR} onClick={() => handleNav(View.SIMULATOR)} />
                <NavLink label="Goals" active={activeView === View.GOALS} onClick={() => handleNav(View.GOALS)} />
                <NavLink label="Mind" active={activeView === View.MIND || activeView === View.CONNECT} onClick={() => handleNav(View.MIND)} />
                <NavLink label="Profile" active={activeView === View.PROFILE} onClick={() => handleNav(View.PROFILE)} />
            </nav>

            {/* Action Button */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => handleProtectedAction(() => handleNav(View.LOG))}
                    className="group flex items-center gap-2 bg-slate-800 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-300 ease-calm shadow-md shadow-slate-200 dark:shadow-none active:scale-95 hover:shadow-lg"
                >
                    <PlusCircle size={18} className="text-teal-400 dark:text-teal-600 group-hover:text-teal-300 dark:group-hover:text-teal-500 transition-colors" />
                    <span className="hidden sm:inline text-sm font-medium">Log Entry</span>
                    <span className="sm:hidden text-sm font-medium">Log</span>
                </button>
                
                {/* Desktop Avatar Preview */}
                <button 
                    onClick={() => handleNav(View.PROFILE)}
                    className="hidden md:flex w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 hover:ring-4 hover:ring-slate-100 dark:hover:ring-slate-800/50 transition-all items-center justify-center overflow-hidden active:scale-95"
                >
                    {user && user.avatar ? (
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={18} className="text-slate-500 dark:text-slate-400" />
                    )}
                </button>
            </div>
            </div>
        </header>

        {/* Main Content Area with Page Transition */}
        {/* Increased padding-bottom to pb-32 for mobile to safely clear floating nav + safe areas */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-12 pb-32 md:pb-12">
            <PageTransition viewKey={activeView}>
                {renderView()}
            </PageTransition>
        </main>

        {/* Mobile Bottom Nav (Visible only on small screens) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-50 pb-safe transition-transform duration-300">
            <div className="flex justify-around items-center h-16 px-2">
                <MobileIcon icon={<Home size={20} />} label="Home" isActive={activeView === View.HOME} onClick={() => handleNav(View.HOME)} />
                <MobileIcon icon={<Waves size={20} />} label="Twin" isActive={activeView === View.SIMULATOR} onClick={() => handleNav(View.SIMULATOR)} />
                <MobileIcon icon={<MessageCircle size={20} />} label="Chat" isActive={activeView === View.ASSISTANT} onClick={() => handleNav(View.ASSISTANT)} />
                <MobileIcon icon={<Brain size={20} />} label="Mind" isActive={activeView === View.MIND || activeView === View.CONNECT} onClick={() => handleNav(View.MIND)} />
                <MobileIcon 
                    icon={
                        user?.avatar ? 
                        <img src={user.avatar} className="w-5 h-5 rounded-full" alt="Me" /> : 
                        <UserIcon size={20} />
                    } 
                    label="Profile" 
                    isActive={activeView === View.PROFILE} 
                    onClick={() => handleNav(View.PROFILE)} 
                />
            </div>
        </nav>

        {/* Simple Footer */}
        <footer className="py-8 text-center text-slate-400 dark:text-slate-600 text-sm hidden md:block">
            <p>© 2026 Oura Intelligence. Calm Technology.</p>
        </footer>
        </div>
  );
};

const App: React.FC = () => (
    <ThemeProvider>
        <MotionProvider>
            <AppContent />
        </MotionProvider>
    </ThemeProvider>
);

// Desktop Nav Link
const NavLink = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-calm ${
      active 
        ? 'text-teal-900 dark:text-teal-100 bg-slate-100 dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 scale-105' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
    }`}
  >
    {label}
    {/* Subtle active state glow */}
    {active && (
        <span className="absolute inset-0 rounded-full bg-teal-500/5 dark:bg-teal-400/5 animate-pulse-slow pointer-events-none" />
    )}
  </button>
);

// Mobile Nav Icon
const MobileIcon = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1 w-16 py-2 transition-all duration-300 ease-calm touch-manipulation group ${
        isActive ? '-translate-y-1' : ''
    }`}
  >
    {/* Active Background Pill */}
    <div className={`absolute inset-x-1 top-1 bottom-1 bg-teal-50 dark:bg-teal-900/20 rounded-2xl transition-all duration-300 -z-10 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />

    <div className={`transition-colors duration-300 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
        {icon}
    </div>
    <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {label}
    </span>
  </button>
);

export default App;
