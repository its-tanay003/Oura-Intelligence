
import React, { useState } from 'react';
import { Button, Input, Modal } from '../Shared';
import { Mail, Lock, Check, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { loginWithEmail, signupWithEmail, loginWithGoogle, validatePasswordStrength, resendVerificationEmail } from '../../services/authService';
import { User } from '../../types';

interface AuthFormProps {
    onSuccess: (user: User) => void;
    initialMode?: 'login' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Verification State
    const [pendingUser, setPendingUser] = useState<User | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<'idle' | 'sent'>('idle');

    const isSignup = mode === 'signup';
    const passwordStrength = validatePasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isSignup) {
                const user = await signupWithEmail(email, password);
                // Don't call onSuccess yet, show verification
                setPendingUser(user);
            } else {
                const user = await loginWithEmail(email, password);
                onSuccess(user);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected issue occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const user = await loginWithGoogle();
            onSuccess(user);
        } catch (err) {
            setError("Google sign-in was interrupted.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!pendingUser) return;
        setIsResending(true);
        try {
            await resendVerificationEmail(pendingUser.email);
            setResendStatus('sent');
            setTimeout(() => setResendStatus('idle'), 3000); // Reset status after 3s
        } catch (e) {
            setError("Failed to resend email.");
        } finally {
            setIsResending(false);
        }
    };

    const handleVerificationComplete = () => {
        if (pendingUser) {
            // In a real app, we would verify the token here.
            // For mock, we assume they clicked the link and are now verified.
            const verifiedUser = { ...pendingUser, emailVerified: true };
            localStorage.setItem('oura_session', JSON.stringify(verifiedUser));
            onSuccess(verifiedUser);
        }
    };

    // --- VERIFICATION VIEW ---
    if (pendingUser) {
        return (
            <div className="animate-fade-in w-full max-w-sm mx-auto p-2 text-center">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6 shadow-sm shadow-teal-100 dark:shadow-none relative">
                    <Inbox size={32} />
                    <div className="absolute top-0 right-0 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm">
                        <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 tracking-tight mb-2">Check your inbox</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    To secure your account, we've sent a verification link to <span className="font-medium text-slate-700 dark:text-slate-200">{pendingUser.email}</span>.
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={handleVerificationComplete}
                        className="w-full h-14 text-base shadow-lg shadow-teal-100/50 dark:shadow-none"
                    >
                        I've Verified
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={handleResend}
                        disabled={isResending || resendStatus === 'sent'}
                        className="w-full h-12 text-sm"
                    >
                        {isResending ? (
                            <RefreshCw size={16} className="animate-spin mr-2" />
                        ) : resendStatus === 'sent' ? (
                            <Check size={16} className="text-emerald-500 mr-2" />
                        ) : null}
                        {resendStatus === 'sent' ? "Email Sent" : "Resend Verification Email"}
                    </Button>
                </div>

                <button 
                    onClick={() => setPendingUser(null)}
                    className="mt-6 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    Use a different email
                </button>
            </div>
        );
    }

    // --- LOGIN / SIGNUP VIEW ---
    return (
        <div className="animate-fade-in w-full max-w-sm mx-auto p-2">
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-4 shadow-sm shadow-teal-100 dark:shadow-none">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 tracking-tight">
                    {isSignup ? "Create your space" : "Welcome back"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    {isSignup ? "Private, secure, and always under your control." : "Enter your credentials to access your insights."}
                </p>
            </div>

            {/* Google Auth - Primary Option */}
            <button 
                type="button"
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 group mb-6 relative overflow-hidden"
            >
                {isLoading ? (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden absolute bottom-0 left-0">
                            <div className="h-full bg-teal-500 w-1/3 animate-[slide_1s_infinite_linear]" />
                        </div>
                    </div>
                ) : null}
                
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-medium text-slate-700 dark:text-slate-200">Continue with Google</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or with email</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    icon={<Mail size={18} />}
                    required
                />
                
                <div className="space-y-2">
                    <Input 
                        type="password" 
                        placeholder={isSignup ? "Create a password" : "Your password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        icon={<Lock size={18} />}
                        required
                    />
                    
                    {/* Password Strength Meter (Signup Only) */}
                    {isSignup && password.length > 0 && (
                        <div className="px-1 animate-fade-in">
                            <div className="flex gap-1 h-1 mb-1">
                                {[1, 2, 3, 4].map((step) => (
                                    <div 
                                        key={step} 
                                        className={`flex-1 rounded-full transition-all duration-500 ${
                                            passwordStrength >= step 
                                                ? (passwordStrength < 2 ? 'bg-amber-300' : passwordStrength < 4 ? 'bg-teal-300' : 'bg-teal-500') 
                                                : 'bg-slate-100 dark:bg-slate-800'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 text-right">
                                {passwordStrength < 2 ? "Keep going..." : passwordStrength < 4 ? "Good start" : "Strong & Secure"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex gap-3 text-amber-700 dark:text-amber-300 text-sm items-start animate-fade-in">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p className="leading-relaxed">{error}</p>
                    </div>
                )}

                <Button 
                    type="submit" 
                    className="w-full h-14 text-base shadow-lg shadow-teal-100/50 dark:shadow-none mt-2" 
                    isLoading={isLoading}
                >
                    {isSignup ? "Create Account" : "Sign In"}
                    {!isLoading && <ArrowRight size={18} className="opacity-60" />}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isSignup ? "Already have an account?" : "No account yet?"}{" "}
                    <button 
                        type="button"
                        onClick={() => setMode(isSignup ? 'login' : 'signup')}
                        className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                    >
                        {isSignup ? "Sign in" : "Create one"}
                    </button>
                </p>
                <p className="text-[10px] text-slate-400 mt-6 max-w-xs mx-auto leading-relaxed">
                    By continuing, you acknowledge our commitment to Privacy. Your data remains encrypted and under your control.
                </p>
            </div>
        </div>
    );
};

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 md:p-8">
                <AuthForm 
                    onSuccess={(u) => {
                        onSuccess(u);
                        onClose();
                    }} 
                />
            </div>
        </Modal>
    );
};
