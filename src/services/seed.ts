import type { Exercise, WorkoutPlan } from '@/domain/types';
import { exerciseRepo, planRepo } from '@/domain/repositories/impl';

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
];

const EQUIPMENT = [
  'Dumbbell',
  'Barbell',
  'Bodyweight',
  'Cable',
  'Machine',
  'Kettlebell',
  'Resistance Band',
];

export const seedExercises: Omit<Exercise, 'id'>[] = [
  // Chest
  { name: 'Push-ups', muscleGroups: ['Chest', 'Triceps'], equipment: ['Bodyweight'], tags: ['compound'] },
  { name: 'Bench Press', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Dumbbell Press', muscleGroups: ['Chest', 'Triceps'], equipment: ['Dumbbell'], tags: ['compound'] },
  { name: 'Incline Dumbbell Press', muscleGroups: ['Chest', 'Triceps'], equipment: ['Dumbbell'], tags: ['compound'] },
  { name: 'Chest Fly', muscleGroups: ['Chest'], equipment: ['Dumbbell', 'Machine'], tags: ['isolation'] },
  { name: 'Cable Fly', muscleGroups: ['Chest'], equipment: ['Cable'], tags: ['isolation'] },
  { name: 'Dips', muscleGroups: ['Chest', 'Triceps'], equipment: ['Bodyweight'], tags: ['compound'] },
  { name: 'Decline Bench Press', muscleGroups: ['Chest', 'Triceps'], equipment: ['Barbell'], tags: ['compound'] },

  // Back
  { name: 'Pull-ups', muscleGroups: ['Back', 'Biceps'], equipment: ['Bodyweight'], tags: ['compound'] },
  { name: 'Chin-ups', muscleGroups: ['Back', 'Biceps'], equipment: ['Bodyweight'], tags: ['compound'] },
  { name: 'Bent-Over Row', muscleGroups: ['Back', 'Biceps'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Dumbbell Row', muscleGroups: ['Back', 'Biceps'], equipment: ['Dumbbell'], tags: ['compound'] },
  { name: 'Lat Pulldown', muscleGroups: ['Back', 'Biceps'], equipment: ['Cable'], tags: ['compound'] },
  { name: 'Cable Row', muscleGroups: ['Back', 'Biceps'], equipment: ['Cable'], tags: ['compound'] },
  { name: 'T-Bar Row', muscleGroups: ['Back', 'Biceps'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Face Pull', muscleGroups: ['Back', 'Shoulders'], equipment: ['Cable'], tags: ['isolation'] },
  { name: 'Shrugs', muscleGroups: ['Back'], equipment: ['Dumbbell', 'Barbell'], tags: ['isolation'] },

  // Shoulders
  { name: 'Overhead Press', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Dumbbell Shoulder Press', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Dumbbell'], tags: ['compound'] },
  { name: 'Lateral Raises', muscleGroups: ['Shoulders'], equipment: ['Dumbbell'], tags: ['isolation'] },
  { name: 'Front Raises', muscleGroups: ['Shoulders'], equipment: ['Dumbbell'], tags: ['isolation'] },
  { name: 'Rear Delt Fly', muscleGroups: ['Shoulders'], equipment: ['Dumbbell'], tags: ['isolation'] },
  { name: 'Arnold Press', muscleGroups: ['Shoulders', 'Triceps'], equipment: ['Dumbbell'], tags: ['compound'] },
  { name: 'Upright Row', muscleGroups: ['Shoulders'], equipment: ['Barbell', 'Dumbbell'], tags: ['compound'] },

  // Biceps
  { name: 'Bicep Curls', muscleGroups: ['Biceps'], equipment: ['Dumbbell', 'Barbell'], tags: ['isolation'] },
  { name: 'Hammer Curls', muscleGroups: ['Biceps'], equipment: ['Dumbbell'], tags: ['isolation'] },
  { name: 'Cable Curls', muscleGroups: ['Biceps'], equipment: ['Cable'], tags: ['isolation'] },
  { name: 'Preacher Curl', muscleGroups: ['Biceps'], equipment: ['Dumbbell', 'Barbell'], tags: ['isolation'] },
  { name: 'Concentration Curl', muscleGroups: ['Biceps'], equipment: ['Dumbbell'], tags: ['isolation'] },

  // Triceps
  { name: 'Tricep Dips', muscleGroups: ['Triceps'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Overhead Tricep Extension', muscleGroups: ['Triceps'], equipment: ['Dumbbell'], tags: ['isolation'] },
  { name: 'Tricep Pushdown', muscleGroups: ['Triceps'], equipment: ['Cable'], tags: ['isolation'] },
  { name: 'Close-Grip Bench Press', muscleGroups: ['Triceps', 'Chest'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Skull Crushers', muscleGroups: ['Triceps'], equipment: ['Dumbbell', 'Barbell'], tags: ['isolation'] },

  // Legs
  { name: 'Squats', muscleGroups: ['Legs', 'Glutes'], equipment: ['Barbell', 'Bodyweight'], tags: ['compound'] },
  { name: 'Leg Press', muscleGroups: ['Legs', 'Glutes'], equipment: ['Machine'], tags: ['compound'] },
  { name: 'Leg Curls', muscleGroups: ['Legs'], equipment: ['Machine'], tags: ['isolation'] },
  { name: 'Leg Extensions', muscleGroups: ['Legs'], equipment: ['Machine'], tags: ['isolation'] },
  { name: 'Lunges', muscleGroups: ['Legs', 'Glutes'], equipment: ['Bodyweight', 'Dumbbell'], tags: ['compound'] },
  { name: 'Romanian Deadlift', muscleGroups: ['Legs', 'Glutes', 'Back'], equipment: ['Barbell'], tags: ['compound'] },
  { name: 'Bulgarian Split Squats', muscleGroups: ['Legs', 'Glutes'], equipment: ['Bodyweight', 'Dumbbell'], tags: ['compound'] },
  { name: 'Calf Raises', muscleGroups: ['Legs'], equipment: ['Bodyweight', 'Dumbbell'], tags: ['isolation'] },
  { name: 'Deadlift', muscleGroups: ['Legs', 'Glutes', 'Back'], equipment: ['Barbell'], tags: ['compound'] },

  // Glutes
  { name: 'Hip Thrust', muscleGroups: ['Glutes'], equipment: ['Barbell'], tags: ['isolation'] },
  { name: 'Glute Bridge', muscleGroups: ['Glutes'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Romanian Deadlift', muscleGroups: ['Glutes', 'Legs'], equipment: ['Barbell'], tags: ['compound'] },

  // Core
  { name: 'Plank', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Crunches', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Russian Twists', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Leg Raises', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['isolation'] },
  { name: 'Mountain Climbers', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['compound'] },
  { name: 'Dead Bug', muscleGroups: ['Core'], equipment: ['Bodyweight'], tags: ['isolation'] },

  // Cardio
  { name: 'Running', muscleGroups: ['Cardio'], equipment: [], tags: ['cardio'] },
  { name: 'Cycling', muscleGroups: ['Cardio'], equipment: [], tags: ['cardio'] },
  { name: 'Jump Rope', muscleGroups: ['Cardio'], equipment: [], tags: ['cardio'] },
];

export async function seedDatabase() {
  const existingExercises = await exerciseRepo.getAll();
  if (existingExercises.length > 0) {
    return; // Already seeded
  }

  // Seed exercises
  for (const exercise of seedExercises) {
    await exerciseRepo.create(exercise);
  }

  // Seed plan templates
  const exercises = await exerciseRepo.getAll();

  // Full Body 3x/week
  const fullBodyExercises = [
    exercises.find((e) => e.name === 'Squats'),
    exercises.find((e) => e.name === 'Bench Press'),
    exercises.find((e) => e.name === 'Bent-Over Row'),
    exercises.find((e) => e.name === 'Overhead Press'),
    exercises.find((e) => e.name === 'Deadlift'),
    exercises.find((e) => e.name === 'Plank'),
  ].filter(Boolean) as Exercise[];

  if (fullBodyExercises.length >= 3) {
    await planRepo.create({
      name: 'Full Body 3x/Week',
      description: 'Complete full body workout, perfect for beginners',
      blocks: fullBodyExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        target: { sets: 3, reps: 10, restSec: 90 },
        order: idx,
      })),
      schedule: { weekdays: [1, 3, 5] },
      isFavorite: false,
    });
  }

  // Push/Pull/Legs
  const pushExercises = [
    exercises.find((e) => e.name === 'Bench Press'),
    exercises.find((e) => e.name === 'Overhead Press'),
    exercises.find((e) => e.name === 'Tricep Pushdown'),
    exercises.find((e) => e.name === 'Lateral Raises'),
  ].filter(Boolean) as Exercise[];

  const pullExercises = [
    exercises.find((e) => e.name === 'Pull-ups'),
    exercises.find((e) => e.name === 'Bent-Over Row'),
    exercises.find((e) => e.name === 'Bicep Curls'),
    exercises.find((e) => e.name === 'Face Pull'),
  ].filter(Boolean) as Exercise[];

  const legExercises = [
    exercises.find((e) => e.name === 'Squats'),
    exercises.find((e) => e.name === 'Romanian Deadlift'),
    exercises.find((e) => e.name === 'Leg Press'),
    exercises.find((e) => e.name === 'Calf Raises'),
  ].filter(Boolean) as Exercise[];

  if (pushExercises.length >= 3 && pullExercises.length >= 3 && legExercises.length >= 3) {
    await planRepo.create({
      name: 'Push/Pull/Legs',
      description: '6-day split: Push, Pull, Legs, repeat',
      blocks: [...pushExercises, ...pullExercises, ...legExercises].map((ex, idx) => ({
        exerciseId: ex.id,
        target: { sets: 4, reps: 8, restSec: 90 },
        order: idx,
      })),
      schedule: { weekdays: [0, 1, 2, 3, 4, 5] },
      isFavorite: false,
    });
  }

  // Bodyweight Split
  const bodyweightExercises = [
    exercises.find((e) => e.name === 'Push-ups'),
    exercises.find((e) => e.name === 'Pull-ups'),
    exercises.find((e) => e.name === 'Squats'),
    exercises.find((e) => e.name === 'Plank'),
    exercises.find((e) => e.name === 'Lunges'),
    exercises.find((e) => e.name === 'Dips'),
  ].filter(Boolean) as Exercise[];

  if (bodyweightExercises.length >= 4) {
    await planRepo.create({
      name: 'Bodyweight Split',
      description: 'No equipment needed - perfect for home workouts',
      blocks: bodyweightExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        target: { sets: 3, reps: 15, restSec: 60 },
        order: idx,
      })),
      schedule: { weekdays: [1, 3, 5] },
      isFavorite: false,
    });
  }
}

