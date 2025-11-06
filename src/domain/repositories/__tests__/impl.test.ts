import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exerciseRepo } from '../impl';

// Mock localForage
vi.mock('localforage', () => {
  const storage: Record<string, unknown> = {};
  return {
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(storage[key] || null)),
      setItem: vi.fn((key: string, value: unknown) => {
        storage[key] = value;
        return Promise.resolve(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
        return Promise.resolve();
      }),
    },
  };
});

describe('ExerciseRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an exercise', async () => {
    const exercise = await exerciseRepo.create({
      name: 'Push-ups',
      muscleGroups: ['Chest'],
      equipment: ['Bodyweight'],
    });

    expect(exercise.name).toBe('Push-ups');
    expect(exercise.id).toBeDefined();
  });

  it('should get all exercises', async () => {
    await exerciseRepo.create({
      name: 'Squats',
      muscleGroups: ['Legs'],
    });

    const exercises = await exerciseRepo.getAll();
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('should get exercise by id', async () => {
    const created = await exerciseRepo.create({
      name: 'Bench Press',
      muscleGroups: ['Chest'],
    });

    const found = await exerciseRepo.getById(created.id);
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe('Bench Press');
  });

  it('should search exercises', async () => {
    await exerciseRepo.create({
      name: 'Bicep Curls',
      muscleGroups: ['Biceps'],
    });

    const results = await exerciseRepo.search('bicep');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('bicep');
  });
});

