export type UUID = string;

export type UserProfile = {
  id: UUID;
  displayName: string;
  preferences: {
    units: 'metric' | 'imperial';
    soundEnabled: boolean;
    defaultRestSec: number;
    theme: 'system' | 'light' | 'dark';
  };
  lockedExerciseDefaults: Record<ExerciseId, ExerciseDefaults>;
};

export type ExerciseId = UUID;

export type Exercise = {
  id: ExerciseId;
  name: string;
  muscleGroups: string[];
  equipment?: string[];
  tags?: string[];
  instructions?: string;
};

export type ExerciseDefaults = {
  sets: number;
  reps: number;
  restSec: number;
  tempo?: string;
  load?: number;
};

export type PlanId = UUID;

export type PlanExerciseBlock = {
  exerciseId: ExerciseId;
  target: ExerciseDefaults;
  notes?: string;
  order: number;
};

export type WorkoutPlan = {
  id: PlanId;
  name: string;
  description?: string;
  blocks: PlanExerciseBlock[];
  schedule?: PlanSchedule;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
};

export type PlanSchedule = {
  weekdays?: number[];
  events?: Array<{ date: string; planBlockIndexes?: number[] }>;
};

export type SessionId = UUID;

export type SessionEntry = {
  id: SessionId;
  userId: UUID;
  planId?: PlanId;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  items: SessionItem[];
};

export type SessionItem = {
  exerciseId: ExerciseId;
  planned: ExerciseDefaults;
  sets: Array<{
    setIndex: number;
    plannedReps: number;
    completedReps?: number;
    load?: number;
    restSec?: number;
    completedAt?: string;
  }>;
};

