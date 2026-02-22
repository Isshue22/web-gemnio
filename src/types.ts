export type Language = 'Spanish' | 'French' | 'German' | 'Japanese' | 'Chinese' | 'English';

export interface UserStats {
  streak: number;
  totalMinutes: number;
  vocabularyCount: number;
  level: number;
}

export interface Session {
  id: string;
  date: string;
  duration: number;
  language: Language;
  transcript: string;
}

export type AppView = 'dashboard' | 'voice' | 'songs' | 'settings';
