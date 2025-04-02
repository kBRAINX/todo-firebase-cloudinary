export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    lastLogin: Date;
    preferences?: UserPreferences;
  }

  export interface UserPreferences {
    theme: 'light' | 'dark';
    language: 'fr' | 'en';
    showCompletedTasks: boolean;
    defaultPriority: 'low' | 'medium' | 'high';
  }

  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }