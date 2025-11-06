import { useNavigate } from 'react-router-dom';
import type { SessionEntry, Exercise } from '@/domain/types';
import Button from '@/components/common/Button';
import { format } from 'date-fns';

interface SummaryProps {
  session: SessionEntry | null;
  exercises: Exercise[];
}

export default function Summary({ session, exercises }: SummaryProps) {
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No session data available</p>
        <Button variant="primary" onClick={() => navigate('/session')}>
          Start New Workout
        </Button>
      </div>
    );
  }

  const duration = session.endedAt
    ? Math.round(
        (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout Complete!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Completed on {format(new Date(session.startedAt), 'PPP')}
        </p>
        {duration > 0 && <p className="text-gray-600 dark:text-gray-400">Duration: {duration} minutes</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Session Summary</h2>
        <div className="space-y-4">
          {session.items.map((item) => {
            const exercise = exercises.find((e) => e.id === item.exerciseId);
            const completedSets = item.sets.filter((s) => s.completedAt);
            return (
              <div
                key={item.exerciseId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold mb-2">{exercise?.name || 'Unknown Exercise'}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Completed: {completedSets.length} sets</p>
                  {completedSets.map((set, idx) => (
                    <p key={idx}>
                      Set {set.setIndex + 1}: {set.completedReps} reps
                      {set.load && ` @ ${set.load} kg`}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => navigate('/progress')}>
          View Progress
        </Button>
        <Button variant="outline" onClick={() => navigate('/session')}>
          Start New Workout
        </Button>
      </div>
    </div>
  );
}

