
export enum View {
  HOME = 'HOME',
  LOG = 'LOG',
  INSIGHTS = 'INSIGHTS',
  MIND = 'MIND',
  GOALS = 'GOALS',
  PROFILE = 'PROFILE',
  ASSISTANT = 'ASSISTANT'
}

export enum Emotion {
  CALM = 'Calm',
  ANXIOUS = 'Anxious',
  TIRED = 'Tired',
  ENERGETIC = 'Energetic',
  NEUTRAL = 'Neutral',
  OVERWHELMED = 'Overwhelmed'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'apple';
  joinDate: string;
}

export interface UserProfile {
  // Identity
  name: string;
  email: string;
  pronouns: string;
  region: string;
  dateOfBirth?: string;
  
  // Work & Context
  workType: 'Student' | 'Office' | 'Remote' | 'Manual' | 'Shift-based' | 'Freelance' | 'Other';
  workSchedule: 'Fixed' | 'Flexible' | 'Rotational';
  screenTime: 'Low' | 'Medium' | 'High';
  physicalActivity: 'Low' | 'Medium' | 'High';
  workStress: number; // 0-100 normalized
  
  // Preferences
  notifications: 'Normal' | 'Quiet' | 'None';
  
  // Privacy
  privacy: {
    // System Level
    aiPersonalization: boolean;
    analytics: boolean;
    visibleToResearchers: boolean;
    
    // Data Level (Granular)
    shareWorkContext: boolean;     // Can AI use job/schedule info?
    shareDailyLogs: boolean;       // Can AI use sleep/mood data?
    shareJournalEntries: boolean;  // Can AI process free-text thoughts?
  };
}

export interface DailyLog {
  date: string;
  sleepHours: number;
  mood: Emotion;
  hydration: number; // glasses
  stressLevel: number; // 1-5 (Low to High, internal value only)
  notes?: string;
}

export interface ThoughtRecord {
  id: string;
  timestamp: number;
  emotion: string;
  situation: string; // What happened
  thought: string; // What I'm assuming
  reframe?: string; // AI generated or user generated
}

export interface Goal {
  id: string;
  title: string;
  type: 'experiment' | 'habit';
  active: boolean;
  progress: number; // 0-100 abstract
}
