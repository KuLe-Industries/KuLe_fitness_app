import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile } from '@/domain/types';
import { userRepo } from '@/domain/repositories/impl';
import { authAdapter } from '@/services/auth';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      loadUser: async () => {
        set({ isLoading: true });
        try {
          const user = await userRepo.getCurrent();
          set({ user, isLoading: false });
          if (!user) {
            // Auto-sign in as guest
            await get().signInAsGuest();
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          set({ isLoading: false });
        }
      },

      signInAsGuest: async () => {
        set({ isLoading: true });
        try {
          const user = await authAdapter.signInAsGuest();
          await userRepo.save(user);
          set({ user, isLoading: false });
        } catch (error) {
          console.error('Failed to sign in as guest:', error);
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        const result = await authAdapter.signInWithGoogle();
        if (result) {
          await userRepo.save(result);
          set({ user: result });
        }
        // If null, show modal (handled in UI)
      },

      signInWithEmail: async (email: string, password: string) => {
        const result = await authAdapter.signInWithEmail(email, password);
        if (result) {
          await userRepo.save(result);
          set({ user: result });
        }
        // If null, show modal (handled in UI)
      },

      signInWithFacebook: async () => {
        const result = await authAdapter.signInWithFacebook();
        if (result) {
          await userRepo.save(result);
          set({ user: result });
        }
        // If null, show modal (handled in UI)
      },

      signOut: async () => {
        await authAdapter.signOut();
        set({ user: null });
      },

      updateUser: async (updates: Partial<UserProfile>) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...updates };
        await userRepo.save(updated);
        set({ user: updated });
      },
    }),
    {
      name: 'kule-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

