import { useState } from 'react';
import type { WorkoutPlan, Exercise, SessionItem } from '@/domain/types';
import { useSessionStore } from '@/stores/sessionStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Timer from '@/components/session/Timer';
import Dialog from '@/components/common/Dialog';
import { toast } from 'sonner';

interface ActiveProps {
  plan: WorkoutPlan | null;
  exercises: Exercise[];
  onEnd: () => void;
}

export default function Active({ plan, exercises, onEnd }: ActiveProps) {
  const currentSession = useSessionStore((state) => state.currentSession);
  const { completeSet, endSession } = useSessionStore();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showPartialDialog, setShowPartialDialog] = useState(false);
  const [partialData, setPartialData] = useState({ reps: 0, load: 0 });
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  if (!currentSession || !plan) {
    return <div>Loading...</div>;
  }

  const currentBlock = plan.blocks[currentExerciseIndex];
  const currentExercise = exercises.find((e) => e.id === currentBlock.exerciseId);
  const sessionItem =
    currentSession.items.find((item) => item.exerciseId === currentBlock.exerciseId) ||
    ({
      exerciseId: currentBlock.exerciseId,
      planned: currentBlock.target,
      sets: [],
    } as SessionItem);

  const handleCompleteSet = (setIndex: number, completed: boolean) => {
    if (completed) {
      completeSet(
        currentBlock.exerciseId,
        setIndex,
        true,
        currentBlock.target.reps,
        currentBlock.target.load
      );
    } else {
      setCurrentSetIndex(setIndex);
      setShowPartialDialog(true);
    }
  };

  const handlePartialComplete = () => {
    completeSet(
      currentBlock.exerciseId,
      currentSetIndex,
      true,
      partialData.reps,
      partialData.load
    );
    setShowPartialDialog(false);
    setPartialData({ reps: 0, load: 0 });
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < plan.blocks.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      // Reset timer for new exercise
      window.dispatchEvent(new Event('timer-reset'));
    } else {
      handleEndWorkout();
    }
  };

  const handleEndWorkout = async () => {
    await endSession();
    toast.success('Workout completed!');
    onEnd();
  };

  const completedSets = sessionItem.sets.filter((s) => s.completedAt).length;
  const totalSets = currentBlock.target.sets;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {plan.name} - Exercise {currentExerciseIndex + 1}/{plan.blocks.length}
        </h1>
        <Button variant="outline" onClick={handleEndWorkout}>
          End Workout
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{currentExercise?.name}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentBlock.target.sets} sets × {currentBlock.target.reps} reps
          {currentBlock.target.load && ` @ ${currentBlock.target.load} kg`}
        </p>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Progress: {completedSets}/{totalSets} sets</span>
            <span>{Math.round((completedSets / totalSets) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {Array.from({ length: totalSets }).map((_, index) => {
            const set = sessionItem.sets.find((s) => s.setIndex === index);
            const isCompleted = !!set?.completedAt;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border rounded ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                <span>Set {index + 1}</span>
                {isCompleted ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {set.completedReps} reps
                    {set.load && ` @ ${set.load} kg`}
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteSet(index, true)}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteSet(index, false)}
                    >
                      Partial
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Timer restSeconds={currentBlock.target.restSec} />
      </div>

      <div className="flex gap-2">
        {currentExerciseIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          >
            Previous Exercise
          </Button>
        )}
        <Button variant="primary" onClick={handleNextExercise} className="flex-1">
          {currentExerciseIndex < plan.blocks.length - 1 ? 'Next Exercise' : 'Complete Workout'}
        </Button>
      </div>

      <Dialog
        open={showPartialDialog}
        onClose={() => setShowPartialDialog(false)}
        title="Partial Completion"
      >
        <div className="space-y-4">
          <Input
            label="Actual Reps"
            type="number"
            value={partialData.reps}
            onChange={(e) => setPartialData({ ...partialData, reps: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Actual Load (kg)"
            type="number"
            value={partialData.load}
            onChange={(e) =>
              setPartialData({ ...partialData, load: parseFloat(e.target.value) || 0 })
            }
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handlePartialComplete}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setShowPartialDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

