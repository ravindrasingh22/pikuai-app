export type KidProfile = {
  id: string;
  name: string;
  age: number;
  gender: 'Boy' | 'Girl' | 'Prefer not to say' | '';
  pin: string;
  avatar: 'ravin' | 'maya' | 'generated';
  streak: number;
  dailyMinutes: number;
  alerts: number;
  topics: string[];
  weeklyMinutes: number[];
};

export type ChatMessage = {
  id: string;
  role: 'kid' | 'ai';
  text: string;
  time: string;
};

export type ChatThread = {
  id: string;
  backendThreadId?: string;
  kidId: string;
  title: string;
  preview: string;
  tag: string;
  date: string;
  pinned: boolean;
  paused: boolean;
  messages: ChatMessage[];
};

export type ParentProfile = {
  email: string;
  firstName: string;
  lastName: string;
  pin: string;
};

export type AuthSession = {
  parentUserId?: string;
  accessToken?: string;
  refreshToken?: string;
  nextStep?: string;
  parentUnlocked?: boolean;
};

export type Subscription = {
  planId: 'monthly' | 'quarterly' | 'annual';
  status: 'Active' | 'Trial' | 'Expired';
  validUntil: string;
  tokensLeft: number;
  daysLeft: number;
};

export type AppState = {
  parent: ParentProfile;
  auth: AuthSession;
  kids: KidProfile[];
  activeKidId: string;
  kidOnboardingCompleted: Record<string, boolean>;
  chats: ChatThread[];
  subscription: Subscription;
  selectedAvatar: 'ravin' | 'maya' | 'generated';
};
