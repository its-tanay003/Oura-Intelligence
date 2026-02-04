
import { User } from '../types';

/**
 * AUTHENTICATION ARCHITECTURE (SIMULATED)
 * 
 * In a production environment, this service would interface with:
 * - POST /auth/login (Rate limited, Argon2id verification)
 * - POST /auth/google (OAuth 2.0 Token Exchange)
 * - Secure HTTPOnly Cookies for session management
 * 
 * Current Implementation:
 * - LocalStorage for session persistence (Simulating Tokens)
 * - Mock async delays to simulate network/crypto latency
 * - Client-side validation mirroring backend rules
 */

const MOCK_DELAY = 800; // ms to simulate network + hashing cost

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePasswordStrength = (password: string) => {
  let score = 0;
  if (password.length > 8) score++;
  if (password.length > 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4); // 0-4 scale
};

// --- API MOCKS ---

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  if (!validateEmail(email)) throw new Error("Please enter a valid email address.");
  if (password.length < 6) throw new Error("Check your password and try again.");
  
  // Simulate successful user retrieval
  const user: User = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email,
    name: email.split('@')[0],
    provider: 'email',
    joinDate: new Date().toISOString(),
    emailVerified: true
  };
  
  localStorage.setItem('oura_session', JSON.stringify(user));
  return user;
};

export const signupWithEmail = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY + 200)); // Slightly longer for "creation"
  
  if (!validateEmail(email)) throw new Error("Please enter a valid email address.");
  if (validatePasswordStrength(password) < 2) throw new Error("Password is too weak for your safety.");

  const user: User = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email,
    name: email.split('@')[0],
    provider: 'email',
    joinDate: new Date().toISOString(),
    emailVerified: false // Needs verification
  };

  // Note: We typically don't set the session immediately for unverified users in strict systems,
  // but for this UX flow, we return the user object to the UI to handle the verification step.
  return user;
};

export const resendVerificationEmail = async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return true;
};

export const loginWithGoogle = async (): Promise<User> => {
  // Simulate Popup & OAuth Handshake
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const user: User = {
    id: 'google_' + Math.random().toString(36).substr(2, 9),
    email: 'alex.doe@gmail.com',
    name: 'Alex Doe',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Doe&background=0D9488&color=fff',
    provider: 'google',
    joinDate: new Date().toISOString(),
    emailVerified: true
  };

  localStorage.setItem('oura_session', JSON.stringify(user));
  return user;
};

export const logout = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  localStorage.removeItem('oura_session');
};

export const getSession = (): User | null => {
  const stored = localStorage.getItem('oura_session');
  return stored ? JSON.parse(stored) : null;
};
