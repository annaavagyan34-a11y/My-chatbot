export type SubjectType =
  | 'all'
  | 'math'
  | 'armenian'
  | 'history'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'cs'
  | 'english';

export type ThemeMode = 'light' | 'dark';

export interface SubjectConfig {
  id: SubjectType;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  badgeColorLight: string;
  badgeColorDark: string;
  accentColor: string;
  promptPlaceholder: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  subject?: SubjectType;
  image?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: SubjectType;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  grade?: string;
  avatar: string; // Emoji or image URL
  avatarColor?: string;
  school?: string;
  createdAt: number;
}
