import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionRepo, planRepo, exerciseRepo } from '@/domain/repositories/impl';
import { useAuthStore } from '@/stores/authStore';
import type { SessionEntry, WorkoutPlan, Exercise } from '@/domain/types';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function History() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<SessionEntry | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, selectedPlan]);

  const loadData = async () => {
    if (!user) return;
    const [allSessions, allPlans, allExercises] = await Promise.all([
      selectedPlan
        ? sessionRepo.getByPlan(selectedPlan)
        : sessionRepo.getAll(user.id),
      planRepo.getAll(),
      exerciseRepo.getAll(),
    ]);
    setSessions(allSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()));
    setPlans(allPlans);
    setExercises(allExercises);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    await sessionRepo.delete(id);
    toast.success('Session deleted');
    loadData();
  };

  const duration = (session: SessionEntry) => {
    if (!session.endedAt) return 'Incomplete';
    const mins = Math.round(
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60
    );
    return `${mins} minutes`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout History</h1>
        <p className="text-gray-600 dark:text-gray-400">View your past workout sessions</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Select
          label="Filter by Plan"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          options={[
            { value: '', label: 'All Plans' },
            ...plans.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      </div>

      {selectedSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">Session Details</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {format(new Date(selectedSession.startedAt), 'PPP p')}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Duration: {duration(selectedSession)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)}>
              Close
            </Button>
          </div>
          <div className="space-y-4">
            {selectedSession.items.map((item) => {
              const exercise = exercises.find((e) => e.id === item.exerciseId);
              const completedSets = item.sets.filter((s) => s.completedAt);
              return (
                <div
                  key={item.exerciseId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-semibold mb-2">{exercise?.name || 'Unknown Exercise'}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
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
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No workout sessions yet</p>
          </div>
        ) : (
          sessions.map((session) => {
            const plan = plans.find((p) => p.id === session.planId);
            return (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {plan?.name || 'Free Workout'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(session.startedAt), 'PPP p')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {duration(session)} • {session.items.length} exercises
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSession(session)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

