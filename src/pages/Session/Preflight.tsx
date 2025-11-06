import type { WorkoutPlan, Exercise } from '@/domain/types';
import Button from '@/components/common/Button';

interface PreflightProps {
  plan: WorkoutPlan | null;
  exercises: Exercise[];
  onStart: () => void;
}

export default function Preflight({ plan, exercises, onStart }: PreflightProps) {
  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No plan selected</p>
        <Button variant="primary" onClick={onStart}>
          Start Free Workout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h1>
        {plan.description && (
          <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Workout Preview</h2>
        <div className="space-y-4">
          {plan.blocks.map((block, index) => {
            const exercise = exercises.find((e) => e.id === block.exerciseId);
            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {index + 1}. {exercise?.name || 'Unknown Exercise'}
                  </h3>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    {block.target.sets} sets × {block.target.reps} reps
                  </p>
                  {block.target.load && <p>Load: {block.target.load} kg</p>}
                  <p>Rest: {block.target.restSec}s</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onStart}>
        Start Workout
      </Button>
    </div>
  );
}

