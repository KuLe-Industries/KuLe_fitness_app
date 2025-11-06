import type { UserProfile } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';

export interface AuthAdapter {
  signInWithGoogle(): Promise<UserProfile | null>;
  signInWithEmail(email: string, password: string): Promise<UserProfile | null>;
  signInWithFacebook(): Promise<UserProfile | null>;
  signInAsGuest(): Promise<UserProfile>;
  signOut(): Promise<void>;
}

export class LocalAuthAdapter implements AuthAdapter {
  async signInWithGoogle(): Promise<UserProfile | null> {
    // Stub: Show modal explaining offline mode
    return null;
  }

  async signInWithEmail(): Promise<UserProfile | null> {
    // Stub: Show modal explaining offline mode
    return null;
  }

  async signInWithFacebook(): Promise<UserProfile | null> {
    // Stub: Show modal explaining offline mode
    return null;
  }

  async signInAsGuest(): Promise<UserProfile> {
    const profile: UserProfile = {
      id: uuidv4(),
      displayName: 'Guest',
      preferences: {
        units: 'metric',
        soundEnabled: true,
        defaultRestSec: 90,
        theme: 'system',
      },
      lockedExerciseDefaults: {},
    };
    return profile;
  }

  async signOut(): Promise<void> {
    // Clear session-scoped data, keep local database
    localStorage.removeItem('kule_session');
  }
}

export const authAdapter: AuthAdapter = new LocalAuthAdapter();

