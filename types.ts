export enum View {
  HOME = 'HOME',
  LOG = 'LOG',
  INSIGHTS = 'INSIGHTS',
  MIND = 'MIND',
  GOALS = 'GOALS',
  PROFILE = 'PROFILE'
}

export enum Emotion {
  CALM = 'Calm',
  ANXIOUS = 'Anxious',
  TIRED = 'Tired',
  ENERGETIC = 'Energetic',
  NEUTRAL = 'Neutral',
  OVERWHELMED = 'Overwhelmed'
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