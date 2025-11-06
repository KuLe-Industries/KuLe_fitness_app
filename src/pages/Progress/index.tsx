import { useState, useEffect } from 'react';
import { sessionRepo, exerciseRepo, planRepo } from '@/domain/repositories/impl';
import { useAuthStore } from '@/stores/authStore';
import type { SessionEntry, Exercise, WorkoutPlan } from '@/domain/types';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import DatePicker from '@/components/common/DatePicker';
import Button from '@/components/common/Button';
import { exportToFile, importFromFile } from '@/utils/export';
import { format, subDays, subWeeks } from 'date-fns';
import { toast } from 'sonner';

export default function Progress() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [startDate, setStartDate] = useState(format(subWeeks(new Date(), 4), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, startDate, endDate]);

  const loadData = async () => {
    if (!user) return;
    const [allSessions, allExercises, allPlans] = await Promise.all([
      sessionRepo.getByDateRange(user.id, startDate, endDate),
      exerciseRepo.getAll(),
      planRepo.getAll(),
    ]);
    setSessions(allSessions);
    setExercises(allExercises);
    setPlans(allPlans);
  };

  // Calculate metrics
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((sum, session) => {
    return (
      sum +
      session.items.reduce((itemSum, item) => {
        return (
          itemSum +
          item.sets
            .filter((s) => s.completedAt)
            .reduce(
              (setSum, set) => setSum + (set.completedReps || 0) * (set.load || 0),
              0
            )
        );
      }, 0)
    );
  }, 0);

  // Weekly adherence
  const weeks = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const weeklyAdherence = weeks > 0 ? Math.round((totalSessions / weeks) * 100) : 0;

  // Weight progression chart
  const weightProgression = sessions
    .flatMap((s) => s.items)
    .reduce((acc, item) => {
      const exercise = exercises.find((e) => e.id === item.exerciseId);
      if (!exercise) return acc;
      const maxLoad = Math.max(...item.sets.map((s) => s.load || 0));
      if (maxLoad > 0) {
        if (!acc[exercise.name]) acc[exercise.name] = [];
        acc[exercise.name].push(maxLoad);
      }
      return acc;
    }, {} as Record<string, number[]>);

  // Session frequency chart
  const sessionDates = sessions.map((s) => format(new Date(s.startedAt), 'yyyy-MM-dd'));
  const frequencyData = sessionDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Progress & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your fitness journey</p>
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Date Range</h2>
        <div className="flex gap-4">
          <DatePicker label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <DatePicker label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Sessions
          </h3>
          <p className="text-3xl font-bold">{totalSessions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Volume (kg)
          </h3>
          <p className="text-3xl font-bold">{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Weekly Adherence
          </h3>
          <p className="text-3xl font-bold">{weeklyAdherence}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart
            title="Session Frequency"
            data={{
              labels: Object.keys(frequencyData),
              datasets: [
                {
                  label: 'Sessions',
                  data: Object.values(frequencyData),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                },
              ],
            }}
          />
        </div>

        {Object.keys(weightProgression).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <LineChart
              title="Weight Progression"
              data={{
                labels: Object.keys(weightProgression).slice(0, 5),
                datasets: Object.entries(weightProgression)
                  .slice(0, 5)
                  .map(([name, values], idx) => ({
                    label: name,
                    data: values,
                    borderColor: `hsl(${idx * 60}, 70%, 50%)`,
                    fill: false,
                  })),
              }}
            />
          </div>
        )}
      </div>

      {/* Export/Import */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="flex gap-4">
          <Button variant="primary" onClick={exportToFile}>
            Export Data
          </Button>
          <Button variant="outline" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                try {
                  await importFromFile(file);
                  toast.success('Data imported successfully');
                  loadData();
                } catch (error) {
                  toast.error('Failed to import data');
                }
              }
            };
            input.click();
          }}>
            Import Data
          </Button>
        </div>
      </div>
    </div>
  );
}

