import localForage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type {
  UserProfile,
  Exercise,
  ExerciseId,
  WorkoutPlan,
  PlanId,
  SessionEntry,
  SessionId,
  UUID,
} from '../types';
import type {
  UserRepository,
  ExerciseRepository,
  PlanRepository,
  SessionRepository,
} from '../repositories';

const STORAGE_KEYS = {
  USER: 'kule_user',
  EXERCISES: 'kule_exercises',
  PLANS: 'kule_plans',
  SESSIONS: 'kule_sessions',
  VERSION: 'kule_version',
} as const;

class UserRepositoryImpl implements UserRepository {
  async getCurrent(): Promise<UserProfile | null> {
    return localForage.getItem<UserProfile>(STORAGE_KEYS.USER);
  }

  async save(profile: UserProfile): Promise<void> {
    await localForage.setItem(STORAGE_KEYS.USER, profile);
  }

  async clear(): Promise<void> {
    await localForage.removeItem(STORAGE_KEYS.USER);
  }
}

class ExerciseRepositoryImpl implements ExerciseRepository {
  async getAll(): Promise<Exercise[]> {
    const exercises = await localForage.getItem<Exercise[]>(STORAGE_KEYS.EXERCISES);
    return exercises || [];
  }

  async getById(id: ExerciseId): Promise<Exercise | null> {
    const exercises = await this.getAll();
    return exercises.find((e) => e.id === id) || null;
  }

  async create(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const newExercise: Exercise = {
      ...exercise,
      id: uuidv4(),
    };
    const exercises = await this.getAll();
    exercises.push(newExercise);
    await localForage.setItem(STORAGE_KEYS.EXERCISES, exercises);
    return newExercise;
  }

  async update(id: ExerciseId, updates: Partial<Exercise>): Promise<Exercise> {
    const exercises = await this.getAll();
    const index = exercises.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Exercise ${id} not found`);
    }
    exercises[index] = { ...exercises[index], ...updates };
    await localForage.setItem(STORAGE_KEYS.EXERCISES, exercises);
    return exercises[index];
  }

  async delete(id: ExerciseId): Promise<void> {
    const exercises = await this.getAll();
    const filtered = exercises.filter((e) => e.id !== id);
    await localForage.setItem(STORAGE_KEYS.EXERCISES, filtered);
  }

  async search(query: string): Promise<Exercise[]> {
    const exercises = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.muscleGroups.some((g) => g.toLowerCase().includes(lowerQuery)) ||
        e.equipment?.some((eq) => eq.toLowerCase().includes(lowerQuery)) ||
        e.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  async filterByMuscleGroup(group: string): Promise<Exercise[]> {
    const exercises = await this.getAll();
    return exercises.filter((e) =>
      e.muscleGroups.some((g) => g.toLowerCase() === group.toLowerCase())
    );
  }

  async filterByEquipment(equipment: string): Promise<Exercise[]> {
    const exercises = await this.getAll();
    return exercises.filter((e) =>
      e.equipment?.some((eq) => eq.toLowerCase() === equipment.toLowerCase())
    );
  }
}

class PlanRepositoryImpl implements PlanRepository {
  async getAll(): Promise<WorkoutPlan[]> {
    const plans = await localForage.getItem<WorkoutPlan[]>(STORAGE_KEYS.PLANS);
    return plans || [];
  }

  async getById(id: PlanId): Promise<WorkoutPlan | null> {
    const plans = await this.getAll();
    return plans.find((p) => p.id === id) || null;
  }

  async create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    const plans = await this.getAll();
    plans.push(newPlan);
    await localForage.setItem(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  }

  async update(id: PlanId, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const plans = await this.getAll();
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Plan ${id} not found`);
    }
    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await localForage.setItem(STORAGE_KEYS.PLANS, plans);
    return plans[index];
  }

  async delete(id: PlanId): Promise<void> {
    const plans = await this.getAll();
    const filtered = plans.filter((p) => p.id !== id);
    await localForage.setItem(STORAGE_KEYS.PLANS, filtered);
  }

  async duplicate(id: PlanId, newName: string): Promise<WorkoutPlan> {
    const plan = await this.getById(id);
    if (!plan) {
      throw new Error(`Plan ${id} not found`);
    }
    const duplicated: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      ...plan,
      name: newName,
      isFavorite: false,
    };
    delete (duplicated as WorkoutPlan).id;
    delete (duplicated as WorkoutPlan).createdAt;
    delete (duplicated as WorkoutPlan).updatedAt;
    return this.create(duplicated);
  }

  async getFavorites(): Promise<WorkoutPlan[]> {
    const plans = await this.getAll();
    return plans.filter((p) => p.isFavorite);
  }
}

class SessionRepositoryImpl implements SessionRepository {
  async getAll(userId: UUID): Promise<SessionEntry[]> {
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS);
    return (sessions || []).filter((s) => s.userId === userId);
  }

  async getById(id: SessionId): Promise<SessionEntry | null> {
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS);
    return (sessions || []).find((s) => s.id === id) || null;
  }

  async create(session: Omit<SessionEntry, 'id'>): Promise<SessionEntry> {
    const newSession: SessionEntry = {
      ...session,
      id: uuidv4(),
    };
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS) || [];
    sessions.push(newSession);
    await localForage.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  async update(id: SessionId, updates: Partial<SessionEntry>): Promise<SessionEntry> {
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS) || [];
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Session ${id} not found`);
    }
    sessions[index] = { ...sessions[index], ...updates };
    await localForage.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return sessions[index];
  }

  async delete(id: SessionId): Promise<void> {
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS) || [];
    const filtered = sessions.filter((s) => s.id !== id);
    await localForage.setItem(STORAGE_KEYS.SESSIONS, filtered);
  }

  async getByPlan(planId: PlanId): Promise<SessionEntry[]> {
    const sessions = await localForage.getItem<SessionEntry[]>(STORAGE_KEYS.SESSIONS);
    return (sessions || []).filter((s) => s.planId === planId);
  }

  async getByDateRange(userId: UUID, start: string, end: string): Promise<SessionEntry[]> {
    const sessions = await this.getAll(userId);
    return sessions.filter((s) => s.startedAt >= start && s.startedAt <= end);
  }
}

// Create repository instances
const localUserRepo = new UserRepositoryImpl();
const localExerciseRepo = new ExerciseRepositoryImpl();
const localPlanRepo = new PlanRepositoryImpl();
const localSessionRepo = new SessionRepositoryImpl();

// Wrapper repositories that check config and delegate to Google Sheets or local
class SmartUserRepository implements UserRepository {
  async getCurrent(): Promise<UserProfile | null> {
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsUserRepo } = await import('./googleSheets');
          return googleSheetsUserRepo.getCurrent();
        }
      } catch (e) {
        console.error('Failed to use Google Sheets, falling back to local', e);
      }
    }
    return localUserRepo.getCurrent();
  }

  async save(profile: UserProfile): Promise<void> {
    const config = localStorage.getItem('kule_google_sheets_config');
    let useSheets = false;
    if (config) {
      try {
        const parsed = JSON.parse(config);
        useSheets = parsed.enabled && parsed.apiKey && parsed.spreadsheetId;
      } catch (e) {
        // Fall through to local
      }
    }
    
    // Always save locally for backup
    await localUserRepo.save(profile);
    
    // Also save to Google Sheets if enabled
    if (useSheets) {
      try {
        const { googleSheetsUserRepo } = await import('./googleSheets');
        await googleSheetsUserRepo.save(profile);
      } catch (e) {
        console.error('Failed to save to Google Sheets', e);
      }
    }
  }

  async clear(): Promise<void> {
    await localUserRepo.clear();
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled) {
          const { googleSheetsUserRepo } = await import('./googleSheets');
          await googleSheetsUserRepo.clear();
        }
      } catch (e) {
        // Ignore
      }
    }
  }
}

class SmartExerciseRepository implements ExerciseRepository {
  async getAll(): Promise<Exercise[]> {
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsExerciseRepo } = await import('./googleSheets');
          return googleSheetsExerciseRepo.getAll();
        }
      } catch (e) {
        console.error('Failed to use Google Sheets, falling back to local', e);
      }
    }
    return localExerciseRepo.getAll();
  }

  async getById(id: ExerciseId): Promise<Exercise | null> {
    const exercises = await this.getAll();
    return exercises.find((e) => e.id === id) || null;
  }

  async create(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const created = await localExerciseRepo.create(exercise);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsExerciseRepo } = await import('./googleSheets');
          await googleSheetsExerciseRepo.create(created);
        }
      } catch (e) {
        console.error('Failed to save to Google Sheets', e);
      }
    }
    
    return created;
  }

  async update(id: ExerciseId, updates: Partial<Exercise>): Promise<Exercise> {
    const updated = await localExerciseRepo.update(id, updates);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsExerciseRepo } = await import('./googleSheets');
          await googleSheetsExerciseRepo.update(id, updates);
        }
      } catch (e) {
        console.error('Failed to update in Google Sheets', e);
      }
    }
    
    return updated;
  }

  async delete(id: ExerciseId): Promise<void> {
    await localExerciseRepo.delete(id);
    // Note: Google Sheets delete not fully implemented
  }

  async search(query: string): Promise<Exercise[]> {
    return localExerciseRepo.search(query);
  }

  async filterByMuscleGroup(group: string): Promise<Exercise[]> {
    return localExerciseRepo.filterByMuscleGroup(group);
  }

  async filterByEquipment(equipment: string): Promise<Exercise[]> {
    return localExerciseRepo.filterByEquipment(equipment);
  }
}

class SmartPlanRepository implements PlanRepository {
  async getAll(): Promise<WorkoutPlan[]> {
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsPlanRepo } = await import('./googleSheets');
          return googleSheetsPlanRepo.getAll();
        }
      } catch (e) {
        console.error('Failed to use Google Sheets, falling back to local', e);
      }
    }
    return localPlanRepo.getAll();
  }

  async getById(id: PlanId): Promise<WorkoutPlan | null> {
    const plans = await this.getAll();
    return plans.find((p) => p.id === id) || null;
  }

  async create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    const created = await localPlanRepo.create(plan);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsPlanRepo } = await import('./googleSheets');
          await googleSheetsPlanRepo.create(created);
        }
      } catch (e) {
        console.error('Failed to save to Google Sheets', e);
      }
    }
    
    return created;
  }

  async update(id: PlanId, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const updated = await localPlanRepo.update(id, updates);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsPlanRepo } = await import('./googleSheets');
          await googleSheetsPlanRepo.update(id, updates);
        }
      } catch (e) {
        console.error('Failed to update in Google Sheets', e);
      }
    }
    
    return updated;
  }

  async delete(id: PlanId): Promise<void> {
    await localPlanRepo.delete(id);
  }

  async duplicate(id: PlanId, newName: string): Promise<WorkoutPlan> {
    return localPlanRepo.duplicate(id, newName);
  }

  async getFavorites(): Promise<WorkoutPlan[]> {
    return localPlanRepo.getFavorites();
  }
}

class SmartSessionRepository implements SessionRepository {
  async getAll(userId: UUID): Promise<SessionEntry[]> {
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsSessionRepo } = await import('./googleSheets');
          return googleSheetsSessionRepo.getAll(userId);
        }
      } catch (e) {
        console.error('Failed to use Google Sheets, falling back to local', e);
      }
    }
    return localSessionRepo.getAll(userId);
  }

  async getById(id: SessionId): Promise<SessionEntry | null> {
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsSessionRepo } = await import('./googleSheets');
          return googleSheetsSessionRepo.getById(id);
        }
      } catch (e) {
        // Fall through
      }
    }
    return localSessionRepo.getById(id);
  }

  async create(session: Omit<SessionEntry, 'id'>): Promise<SessionEntry> {
    const created = await localSessionRepo.create(session);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsSessionRepo } = await import('./googleSheets');
          await googleSheetsSessionRepo.create(created);
        }
      } catch (e) {
        console.error('Failed to save to Google Sheets', e);
      }
    }
    
    return created;
  }

  async update(id: SessionId, updates: Partial<SessionEntry>): Promise<SessionEntry> {
    const updated = await localSessionRepo.update(id, updates);
    
    const config = localStorage.getItem('kule_google_sheets_config');
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.enabled && parsed.apiKey && parsed.spreadsheetId) {
          const { googleSheetsSessionRepo } = await import('./googleSheets');
          await googleSheetsSessionRepo.update(id, updates);
        }
      } catch (e) {
        console.error('Failed to update in Google Sheets', e);
      }
    }
    
    return updated;
  }

  async delete(id: SessionId): Promise<void> {
    await localSessionRepo.delete(id);
  }

  async getByPlan(planId: PlanId): Promise<SessionEntry[]> {
    return localSessionRepo.getByPlan(planId);
  }

  async getByDateRange(userId: UUID, start: string, end: string): Promise<SessionEntry[]> {
    return localSessionRepo.getByDateRange(userId, start, end);
  }
}

// Export smart repositories that sync to Google Sheets when enabled
export const userRepo = new SmartUserRepository();
export const exerciseRepo = new SmartExerciseRepository();
export const planRepo = new SmartPlanRepository();
export const sessionRepo = new SmartSessionRepository();

