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
import { googleSheetsService, saveUserToSheets, saveExerciseToSheets, savePlanToSheets, saveSessionToSheets } from '@/services/googleSheets';

// Google Sheets Repository Implementations
// These replace localForage with Google Sheets API

class GoogleSheetsUserRepository implements UserRepository {
  async getCurrent(): Promise<UserProfile | null> {
    try {
      const data = await googleSheetsService.getRange('Users', 'A2:D1000');
      if (!data.values || data.values.length === 0) return null;
      
      // Get the most recent user (last row)
      const lastRow = data.values[data.values.length - 1];
      return {
        id: lastRow[0],
        displayName: lastRow[1],
        preferences: JSON.parse(lastRow[2]),
        lockedExerciseDefaults: {},
      };
    } catch (error) {
      console.error('Failed to get user from Google Sheets:', error);
      return null;
    }
  }

  async save(profile: UserProfile): Promise<void> {
    try {
      await saveUserToSheets(profile);
    } catch (error) {
      console.error('Failed to save user to Google Sheets:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    // Clear is handled by deleting rows, but we'll just clear the local reference
    // Actual deletion would require finding and deleting specific rows
  }
}

class GoogleSheetsExerciseRepository implements ExerciseRepository {
  async getAll(): Promise<Exercise[]> {
    try {
      const data = await googleSheetsService.getRange('Exercises', 'A2:G1000');
      if (!data.values) return [];
      
      return data.values.map((row: unknown[]) => {
        const typedRow = row as string[];
        return {
          id: typedRow[0],
          name: typedRow[1],
          muscleGroups: typedRow[2] ? typedRow[2].split(', ').filter((g: string) => g) : [],
          equipment: typedRow[3] ? typedRow[3].split(', ').filter((e: string) => e) : [],
          tags: typedRow[4] ? typedRow[4].split(', ').filter((t: string) => t) : [],
          instructions: typedRow[5] || undefined,
        };
      });
    } catch (error) {
      console.error('Failed to get exercises from Google Sheets:', error);
      return [];
    }
  }

  async getById(id: ExerciseId): Promise<Exercise | null> {
    const exercises = await this.getAll();
    return exercises.find((e) => e.id === id) || null;
  }

  async create(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const { v4: uuidv4 } = await import('uuid');
    const newExercise: Exercise = {
      ...exercise,
      id: uuidv4(),
    };
    await saveExerciseToSheets(newExercise);
    return newExercise;
  }

  async update(id: ExerciseId, updates: Partial<Exercise>): Promise<Exercise> {
    // For Google Sheets, we'd need to find the row and update it
    // For simplicity, we'll append a new row with updated data
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Exercise ${id} not found`);
    
    const updated = { ...existing, ...updates };
    await saveExerciseToSheets(updated);
    return updated;
  }

  async delete(_exerciseId: ExerciseId): Promise<void> {
    // Deletion in Google Sheets requires finding and clearing the row
    // This is a simplified version - in production you'd want proper row deletion
    void _exerciseId;
    console.warn('Delete operation not fully implemented for Google Sheets');
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

class GoogleSheetsPlanRepository implements PlanRepository {
  async getAll(): Promise<WorkoutPlan[]> {
    try {
      const data = await googleSheetsService.getRange('Plans', 'A2:H1000');
      if (!data.values) return [];
      
      return data.values.map((row: unknown[]) => {
        const typedRow = row as string[];
        return {
          id: typedRow[0],
          name: typedRow[1],
          description: typedRow[2] || undefined,
          blocks: JSON.parse(typedRow[3]),
          schedule: typedRow[4] ? JSON.parse(typedRow[4]) : undefined,
          createdAt: typedRow[5],
          updatedAt: typedRow[6],
          isFavorite: typedRow[7] === 'TRUE',
        };
      });
    } catch (error) {
      console.error('Failed to get plans from Google Sheets:', error);
      return [];
    }
  }

  async getById(id: PlanId): Promise<WorkoutPlan | null> {
    const plans = await this.getAll();
    return plans.find((p) => p.id === id) || null;
  }

  async create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    const { v4: uuidv4 } = await import('uuid');
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await savePlanToSheets(newPlan);
    return newPlan;
  }

  async update(id: PlanId, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Plan ${id} not found`);
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await savePlanToSheets(updated);
    return updated;
  }

  async delete(_planId: PlanId): Promise<void> {
    void _planId;
    console.warn('Delete operation not fully implemented for Google Sheets');
  }

  async duplicate(id: PlanId, newName: string): Promise<WorkoutPlan> {
    const plan = await this.getById(id);
    if (!plan) throw new Error(`Plan ${id} not found`);
    
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

class GoogleSheetsSessionRepository implements SessionRepository {
  async getAll(userId: UUID): Promise<SessionEntry[]> {
    try {
      const data = await googleSheetsService.getRange('Sessions', 'A2:H1000');
      if (!data.values) return [];
      
      const sessions = data.values.map((row: unknown[]) => {
        const typedRow = row as string[];
        return {
          id: typedRow[0],
          userId: typedRow[1],
          planId: typedRow[2] || undefined,
          startedAt: typedRow[3],
          endedAt: typedRow[4] || undefined,
          notes: typedRow[5] || undefined,
          items: JSON.parse(typedRow[6]),
        };
      });
      
      return sessions.filter((s: SessionEntry) => s.userId === userId);
    } catch (error) {
      console.error('Failed to get sessions from Google Sheets:', error);
      return [];
    }
  }

  async getById(id: SessionId): Promise<SessionEntry | null> {
    try {
      const data = await googleSheetsService.getRange('Sessions', 'A2:H1000');
      if (!data.values) return null;
      
      const row = data.values.find((r: unknown[]) => (r as string[])[0] === id);
      if (!row) return null;
      
      const typedRow = row as string[];
      return {
        id: typedRow[0],
        userId: typedRow[1],
        planId: typedRow[2] || undefined,
        startedAt: typedRow[3],
        endedAt: typedRow[4] || undefined,
        notes: typedRow[5] || undefined,
        items: JSON.parse(typedRow[6]),
      };
    } catch (error) {
      console.error('Failed to get session from Google Sheets:', error);
      return null;
    }
  }

  async create(session: Omit<SessionEntry, 'id'>): Promise<SessionEntry> {
    const { v4: uuidv4 } = await import('uuid');
    const newSession: SessionEntry = {
      ...session,
      id: uuidv4(),
    };
    await saveSessionToSheets(newSession);
    return newSession;
  }

  async update(id: SessionId, updates: Partial<SessionEntry>): Promise<SessionEntry> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Session ${id} not found`);
    
    const updated = { ...existing, ...updates };
    await saveSessionToSheets(updated);
    return updated;
  }

  async delete(_sessionId: SessionId): Promise<void> {
    void _sessionId;
    console.warn('Delete operation not fully implemented for Google Sheets');
  }

  async getByPlan(planId: PlanId): Promise<SessionEntry[]> {
    const sessions = await this.getAll(''); // We'd need userId here, but for now get all
    return sessions.filter((s) => s.planId === planId);
  }

  async getByDateRange(userId: UUID, start: string, end: string): Promise<SessionEntry[]> {
    const sessions = await this.getAll(userId);
    return sessions.filter((s) => s.startedAt >= start && s.startedAt <= end);
  }
}

export const googleSheetsUserRepo = new GoogleSheetsUserRepository();
export const googleSheetsExerciseRepo = new GoogleSheetsExerciseRepository();
export const googleSheetsPlanRepo = new GoogleSheetsPlanRepository();
export const googleSheetsSessionRepo = new GoogleSheetsSessionRepository();

