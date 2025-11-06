import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import type { WorkoutPlan } from '@/domain/types';

interface CalendarProps {
  plans: WorkoutPlan[];
}

export default function Calendar({ plans }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const scheduledPlans = plans.filter((p) => p.schedule);

  const getPlansForDate = (date: Date) => {
    return scheduledPlans.filter((plan) => {
      if (!plan.schedule) return false;
      if (plan.schedule.weekdays) {
        const dayOfWeek = date.getDay();
        return plan.schedule.weekdays.includes(dayOfWeek);
      }
      if (plan.schedule.events) {
        return plan.schedule.events.some((e) => isSameDay(new Date(e.date), date));
      }
      return false;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
            }
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
            }
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 p-2">
            {day}
          </div>
        ))}
        {daysInMonth.map((day) => {
          const plansForDay = getPlansForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-20 p-2 border rounded ${
                isCurrentMonth
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-100 dark:bg-gray-900 opacity-50'
              }`}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              {plansForDay.map((plan) => (
                <div
                  key={plan.id}
                  className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded p-1 mb-1 truncate"
                >
                  {plan.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

