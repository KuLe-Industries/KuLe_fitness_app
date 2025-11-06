import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { planRepo, sessionRepo } from '@/domain/repositories/impl';
import { useAuthStore } from '@/stores/authStore';
import type { WorkoutPlan, SessionEntry } from '@/domain/types';
import Button from '@/components/common/Button';

export default function Home() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [nextWorkout, setNextWorkout] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const allPlans = await planRepo.getAll();
    setPlans(allPlans);
    const allSessions = await sessionRepo.getAll(user.id);
    setSessions(allSessions);

    // Find next scheduled workout
    const scheduled = allPlans.find((p) => p.schedule);
    setNextWorkout(scheduled || allPlans[0] || null);
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });
  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startedAt);
    return sessionDate >= weekStart && sessionDate <= endOfWeek(weekStart);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.displayName || 'Guest'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track your fitness journey</p>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">This Week's Progress</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const hasSession = weekSessions.some((s) => isSameDay(new Date(s.startedAt), day));
            return (
              <div
                key={day.toISOString()}
                className={`text-center p-2 rounded ${
                  hasSession
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className="text-sm">{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Workout CTA */}
      {nextWorkout && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Next Scheduled Workout</h2>
          <p className="mb-4">{nextWorkout.name}</p>
          <Link to={`/session?planId=${nextWorkout.id}`}>
            <Button variant="secondary" size="lg">
              Start Workout
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/plans">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-semibold mb-1">Workout Plans</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage your plans</p>
          </div>
        </Link>

        <Link to="/progress">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-1">Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View your analytics</p>
          </div>
        </Link>

        <Link to="/history">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-semibold mb-1">History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Past workout sessions</p>
          </div>
        </Link>
      </div>

      {/* Today's Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {plans.filter((p) => p.schedule).length > 0
            ? 'Check your plans for scheduled workouts'
            : 'No scheduled workouts. Create a plan to get started!'}
        </p>
      </div>
    </div>
  );
}

