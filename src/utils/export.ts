import type { Exercise, WorkoutPlan, SessionEntry, UserProfile } from '@/domain/types';
import { exerciseRepo, planRepo, sessionRepo, userRepo } from '@/domain/repositories/impl';
import { useAuthStore } from '@/stores/authStore';

export interface ExportData {
  version: string;
  exportedAt: string;
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: SessionEntry[];
  user?: UserProfile;
}

export async function exportData(): Promise<ExportData> {
  const exercises = await exerciseRepo.getAll();
  const plans = await planRepo.getAll();
  const user = useAuthStore.getState().user;
  const sessions = user ? await sessionRepo.getAll(user.id) : [];

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    exercises,
    plans,
    sessions,
    user: user || undefined,
  };
}

export async function exportToFile(): Promise<void> {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kule-fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as ExportData;

  // Import exercises
  for (const exercise of data.exercises) {
    try {
      await exerciseRepo.create(exercise);
    } catch {
      // Exercise might already exist, skip
    }
  }

  // Import plans
  for (const plan of data.plans) {
    try {
      await planRepo.create(plan);
    } catch {
      // Plan might already exist, skip
    }
  }

  // Import sessions
  for (const session of data.sessions) {
    try {
      await sessionRepo.create(session);
    } catch {
      // Session might already exist, skip
    }
  }

  // Import user if provided
  if (data.user) {
    await userRepo.save(data.user);
    useAuthStore.getState().updateUser(data.user);
  }
}

export async function factoryReset(): Promise<void> {
  // Clear all data
  const exercises = await exerciseRepo.getAll();
  for (const ex of exercises) {
    await exerciseRepo.delete(ex.id);
  }

  const plans = await planRepo.getAll();
  for (const plan of plans) {
    await planRepo.delete(plan.id);
  }

  const user = useAuthStore.getState().user;
  if (user) {
    const sessions = await sessionRepo.getAll(user.id);
    for (const session of sessions) {
      await sessionRepo.delete(session.id);
    }
  }

  await userRepo.clear();
  useAuthStore.getState().signOut();
  localStorage.clear();
}

