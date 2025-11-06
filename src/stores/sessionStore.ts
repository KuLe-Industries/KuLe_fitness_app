import { create } from 'zustand';
import type { SessionEntry, SessionItem, PlanId } from '@/domain/types';
import { sessionRepo } from '@/domain/repositories/impl';
import { useAuthStore } from './authStore';

interface SessionState {
  currentSession: SessionEntry | null;
  isActive: boolean;
  startSession: (planId?: PlanId) => Promise<void>;
  updateSessionItem: (exerciseId: string, updates: Partial<SessionItem>) => void;
  completeSet: (exerciseId: string, setIndex: number, completed: boolean, actualReps?: number, load?: number) => void;
  endSession: () => Promise<void>;
  saveSession: () => Promise<void>;
  loadActiveSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  isActive: false,

  loadActiveSession: async () => {
    const key = 'kule_active_session';
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const session = JSON.parse(stored) as SessionEntry;
        set({ currentSession: session, isActive: !session.endedAt });
      }
    } catch (error) {
      console.warn('Failed to load active session:', error);
    }
  },

  startSession: async (planId?: PlanId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const session: SessionEntry = {
      id: crypto.randomUUID(),
      userId: user.id,
      planId,
      startedAt: new Date().toISOString(),
      items: [],
    };

    localStorage.setItem('kule_active_session', JSON.stringify(session));
    set({ currentSession: session, isActive: true });
  },

  updateSessionItem: (exerciseId: string, updates: Partial<SessionItem>) => {
    const session = get().currentSession;
    if (!session) return;

    const itemIndex = session.items.findIndex((item) => item.exerciseId === exerciseId);
    if (itemIndex >= 0) {
      session.items[itemIndex] = { ...session.items[itemIndex], ...updates };
    } else {
      session.items.push({
        exerciseId,
        planned: updates.planned || { sets: 0, reps: 0, restSec: 0 },
        sets: updates.sets || [],
        ...updates,
      });
    }

    localStorage.setItem('kule_active_session', JSON.stringify(session));
    set({ currentSession: { ...session } });
  },

  completeSet: (exerciseId: string, setIndex: number, completed: boolean, actualReps?: number, load?: number) => {
    const session = get().currentSession;
    if (!session) return;

    // Create a deep copy to ensure reactivity
    const updatedSession = JSON.parse(JSON.stringify(session)) as SessionEntry;
    
    let item = updatedSession.items.find((item) => item.exerciseId === exerciseId);
    if (!item) {
      item = {
        exerciseId,
        planned: { sets: 0, reps: 0, restSec: 0 },
        sets: [],
      };
      updatedSession.items.push(item);
    }

    let setItem = item.sets.find((s) => s.setIndex === setIndex);
    if (!setItem) {
      setItem = {
        setIndex,
        plannedReps: item.planned.reps,
        completedReps: completed ? actualReps || item.planned.reps : undefined,
        load,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
      item.sets.push(setItem);
    } else {
      setItem.completedReps = completed ? actualReps || setItem.plannedReps : undefined;
      setItem.load = load;
      setItem.completedAt = completed ? new Date().toISOString() : undefined;
    }

    localStorage.setItem('kule_active_session', JSON.stringify(updatedSession));
    set({ currentSession: updatedSession });
  },

  endSession: async () => {
    const session = get().currentSession;
    if (!session) return;

    session.endedAt = new Date().toISOString();
    await sessionRepo.create(session);
    localStorage.removeItem('kule_active_session');
    set({ currentSession: null, isActive: false });
  },

  saveSession: async () => {
    const session = get().currentSession;
    if (!session) return;

    // Only save to localStorage, don't create session entries until workout is complete
    localStorage.setItem('kule_active_session', JSON.stringify(session));
  },
}));

