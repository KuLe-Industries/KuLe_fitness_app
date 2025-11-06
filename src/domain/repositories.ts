import type {
  UserProfile,
  Exercise,
  ExerciseId,
  WorkoutPlan,
  PlanId,
  SessionEntry,
  SessionId,
  UUID,
} from './types';

export interface UserRepository {
  getCurrent(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  clear(): Promise<void>;
}

export interface ExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: ExerciseId): Promise<Exercise | null>;
  create(exercise: Omit<Exercise, 'id'>): Promise<Exercise>;
  update(id: ExerciseId, exercise: Partial<Exercise>): Promise<Exercise>;
  delete(id: ExerciseId): Promise<void>;
  search(query: string): Promise<Exercise[]>;
  filterByMuscleGroup(group: string): Promise<Exercise[]>;
  filterByEquipment(equipment: string): Promise<Exercise[]>;
}

export interface PlanRepository {
  getAll(): Promise<WorkoutPlan[]>;
  getById(id: PlanId): Promise<WorkoutPlan | null>;
  create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan>;
  update(id: PlanId, plan: Partial<WorkoutPlan>): Promise<WorkoutPlan>;
  delete(id: PlanId): Promise<void>;
  duplicate(id: PlanId, newName: string): Promise<WorkoutPlan>;
  getFavorites(): Promise<WorkoutPlan[]>;
}

export interface SessionRepository {
  getAll(userId: UUID): Promise<SessionEntry[]>;
  getById(id: SessionId): Promise<SessionEntry | null>;
  create(session: Omit<SessionEntry, 'id'>): Promise<SessionEntry>;
  update(id: SessionId, session: Partial<SessionEntry>): Promise<SessionEntry>;
  delete(id: SessionId): Promise<void>;
  getByPlan(planId: PlanId): Promise<SessionEntry[]>;
  getByDateRange(userId: UUID, start: string, end: string): Promise<SessionEntry[]>;
}

export interface DataMigration {
  getVersion(): Promise<number>;
  setVersion(version: number): Promise<void>;
  migrate(fromVersion: number, toVersion: number): Promise<void>;
}

