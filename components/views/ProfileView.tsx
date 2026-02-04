
import React, { useState, useEffect } from 'react';
import { Card, Button, SectionHeader, Toggle } from '../Shared';
import { Shield, Briefcase, Smartphone, Download, Trash2, Camera, Activity, Lock, Eye, FileText, BarChart3, Calendar, LogOut, User as UserIcon } from 'lucide-react';
import { UserProfile, User } from '../../types';
import { AuthForm } from '../auth/AuthComponents';
import { logout } from '../../services/authService';

interface ProfileViewProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLoginSuccess, onLogout }) => {
  // --- AUTHENTICATION GATE ---
  if (!user) {
      return (
          <div className="max-w-md mx-auto py-12 animate-fade-in">
             <Card className="p-8 md:p-12 bg-white/50 backdrop-blur-sm border-dashed border-2">
                 <AuthForm onSuccess={onLoginSuccess} />
             </Card>
          </div>
      );
  }

  // --- MOCK INITIAL STATE (Ideally fetched from backend using user.id) ---
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name || 'Explorer',
    email: user.email,
    pronouns: '',
    region: 'North America',
    dateOfBirth: '',
    workType: 'Remote',
    workSchedule: 'Flexible',
    screenTime: 'High',
    physicalActivity: 'Low',
    workStress: 40,
    notifications: 'Quiet',
    privacy: {
      aiPersonalization: true,
      analytics: false,
      visibleToResearchers: false,
      shareWorkContext: true,
      shareDailyLogs: true,
      shareJournalEntries: false,
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 800);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updatePrivacy = (key: keyof UserProfile['privacy'], value: boolean) => {
    setProfile(prev => ({ ...prev, privacy: { ...prev.privacy, [key]: value } }));
    setHasChanges(true);
  };

  const getStressLabel = (val: number) => {
      if (val < 35) return { text: 'Chill (Low Load)', color: 'text-teal-700 bg-teal-50 border-teal-100' };
      if (val < 70) return { text: 'Balanced (Steady)', color: 'text-indigo-700 bg-indigo-50 border-indigo-100' };
      return { text: 'Intense (High Load)', color: 'text-amber-700 bg-amber-50 border-amber-100' };
  };

  const stressInfo = getStressLabel(profile.workStress);

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in space-y-10">
      
      {/* Header with Sticky Save Action */}
      <div className="flex items-center justify-between sticky top-[4.5rem] z-30 bg-slate-50/90 backdrop-blur-sm py-4 border-b border-slate-100 transition-all">
        <div className="flex items-center gap-3">
             <SectionHeader title="Profile & Context" subtitle={`Signed in as ${user.email}`} />
        </div>
        <div className="flex gap-3">
             {hasChanges && (
                <div className="animate-fade-in">
                    <Button onClick={handleSave} className="h-10 text-sm px-5" isLoading={isSaving}>
                    {isSaving ? 'Syncing...' : 'Save Changes'}
                    </Button>
                </div>
            )}
             <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="Sign Out">
                 <LogOut size={20} />
             </button>
        </div>
      </div>

      {/* Identity Card */}
      <section>
          <Card className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            <div className="relative group cursor-pointer self-center md:self-auto">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-medium shadow-lg shadow-teal-100 overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
            </div>
            </div>
            <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Display Name</label>
                    <input 
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-teal-200 focus:ring-0 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                    placeholder="What should we call you?"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Pronouns (Optional)</label>
                    <input 
                    value={profile.pronouns}
                    onChange={(e) => updateProfile('pronouns', e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-teal-200 focus:ring-0 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="e.g. they/them"
                    />
                </div>
                
                {/* Date of Birth Field */}
                <div className="sm:col-span-2 pt-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Date of Birth (Optional)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                         <div className="relative w-full sm:w-auto">
                            <input 
                                type="date"
                                value={profile.dateOfBirth || ''}
                                onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                                className="w-full sm:w-auto min-w-[200px] p-3 pl-10 rounded-2xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-teal-200 focus:ring-0 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                            />
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                            Used only for age-based insights. Never shared publicly.
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </Card>
      </section>

      {/* Daily Context Section */}
      <section className="space-y-4">
        <div className="px-1">
            <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Briefcase size={20} className="text-teal-600" />
                Daily Context
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-lg leading-relaxed">
                This helps us tailor insights to your reality.
            </p>
        </div>
        
        <Card className="space-y-8 p-8">
            {/* Work Context */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">What is your primary daily rhythm?</label>
                <div className="flex flex-wrap gap-2">
                    {['Student', 'Office', 'Remote', 'Manual', 'Shift-based', 'Freelance'].map((type) => (
                        <button
                            key={type}
                            onClick={() => updateProfile('workType', type)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                profile.workType === type 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-slate-50" />

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 {/* Screen Time */}
                 <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <Smartphone size={18} className="text-slate-400" />
                        <label className="text-sm font-medium text-slate-700">Approx. Screen Time</label>
                     </div>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['Low', 'Medium', 'High'].map((level) => (
                            <button
                                key={level}
                                onClick={() => updateProfile('screenTime', level)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                    profile.screenTime === level
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                     </div>
                 </div>

                 {/* Work Stress Slider */}
                 <div className="space-y-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-slate-400" />
                            <label className="text-sm font-medium text-slate-700">Work Intensity</label>
                        </div>
                        <div className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 ${stressInfo.color}`}>
                            {stressInfo.text}
                        </div>
                     </div>
                     
                     <div className="relative pt-2 pb-1">
                        {/* Custom Track Background with Gradients */}
                        <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-gradient-to-r from-teal-100 via-indigo-100 to-amber-100 pointer-events-none overflow-hidden" />

                        {/* Input Range - overriding global style for transparency */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5"
                          value={profile.workStress}
                          onChange={(e) => updateProfile('workStress', parseInt(e.target.value))}
                          className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10 focus:outline-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2"
                        />
                        
                        {/* Markers */}
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-3 select-none">
                            <span className="text-teal-400/80 pl-1">Chill</span>
                            <span className="text-indigo-400/80">Balanced</span>
                            <span className="text-amber-400/80 pr-1">Intense</span>
                        </div>
                     </div>
                 </div>
            </div>
        </Card>
      </section>

      {/* Privacy & Data Control Section */}
      <section className="space-y-4 pt-4">
         <div className="px-1">
            <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-slate-400" />
                Data Rights & Visibility
            </h3>
            <p className="text-sm text-slate-500 mt-1">
                Granular control over what the system can access and process.
            </p>
        </div>

        <Card variant="flat" className="space-y-8 bg-slate-50/50 p-6 md:p-8">
            
            {/* System Permissions */}
            <div className="space-y-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Lock size={12} /> System Permissions
                </h4>
                
                <div className="flex items-start justify-between">
                    <div>
                        <span className="block font-medium text-slate-800 text-sm md:text-base">AI Personalization</span>
                        <span className="text-xs md:text-sm text-slate-500 mt-0.5 block max-w-sm leading-relaxed">
                            Allow the intelligence engine to process your data locally to generate custom insights. Disabling this turns off all smart features.
                        </span>
                    </div>
                    <Toggle 
                        enabled={profile.privacy.aiPersonalization} 
                        onChange={(v) => updatePrivacy('aiPersonalization', v)} 
                    />
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <span className="block font-medium text-slate-800 text-sm md:text-base">Anonymous Analytics</span>
                        <span className="text-xs md:text-sm text-slate-500 mt-0.5 block max-w-sm leading-relaxed">
                            Share aggregated, non-identifiable usage patterns to help us improve the product.
                        </span>
                    </div>
                    <Toggle 
                        enabled={profile.privacy.analytics} 
                        onChange={(v) => updatePrivacy('analytics', v)} 
                    />
                </div>
            </div>

            <div className="w-full h-px bg-slate-200/60" />

            {/* Granular Data Access */}
            <div className="space-y-5">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Eye size={12} /> Data Visibility
                </h4>
                
                <div className={`transition-opacity duration-300 ${!profile.privacy.aiPersonalization ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="space-y-6">
                        {/* Work Context */}
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 hidden sm:block">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <span className="block font-medium text-slate-800 text-sm md:text-base">Work & Lifestyle Context</span>
                                    <span className="text-xs md:text-sm text-slate-500 mt-0.5 block max-w-sm leading-relaxed">
                                        Used to calibrate advice based on your schedule (e.g., preventing burnout for shift workers).
                                    </span>
                                </div>
                            </div>
                            <Toggle 
                                enabled={profile.privacy.shareWorkContext} 
                                onChange={(v) => updatePrivacy('shareWorkContext', v)} 
                            />
                        </div>

                        {/* Health Logs */}
                        <div className="flex items-start justify-between">
                             <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 hidden sm:block">
                                    <BarChart3 size={16} />
                                </div>
                                <div>
                                    <span className="block font-medium text-slate-800 text-sm md:text-base">Health & Sleep Logs</span>
                                    <span className="text-xs md:text-sm text-slate-500 mt-0.5 block max-w-sm leading-relaxed">
                                        Used to identify patterns in energy, sleep quality, and recovery over time.
                                    </span>
                                </div>
                             </div>
                            <Toggle 
                                enabled={profile.privacy.shareDailyLogs} 
                                onChange={(v) => updatePrivacy('shareDailyLogs', v)} 
                            />
                        </div>

                        {/* Journal Entries */}
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 hidden sm:block">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <span className="block font-medium text-slate-800 text-sm md:text-base">Mind & Journal Entries</span>
                                    <span className="text-xs md:text-sm text-slate-500 mt-0.5 block max-w-sm leading-relaxed">
                                        Analyzed strictly in-session for reframing suggestions. Never permanently stored or trained on.
                                    </span>
                                </div>
                            </div>
                            <Toggle 
                                enabled={profile.privacy.shareJournalEntries} 
                                onChange={(v) => updatePrivacy('shareJournalEntries', v)} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-slate-200/60" />

            {/* Account Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button variant="ghost" className="text-xs md:text-sm h-10 px-4 justify-start">
                    <Download size={16} />
                    Download My Data
                </Button>
                <Button variant="danger" className="text-xs md:text-sm h-10 px-4 bg-transparent border border-rose-100 hover:bg-rose-50 justify-start">
                    <Trash2 size={16} />
                    Delete Account
                </Button>
            </div>
        </Card>
      </section>
      
      <div className="h-8"></div>
    </div>
  );
};
