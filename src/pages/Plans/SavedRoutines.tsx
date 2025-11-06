import type { WorkoutPlan } from '@/domain/types';
import { planRepo } from '@/domain/repositories/impl';
import Button from '@/components/common/Button';
import { toast } from 'sonner';

interface SavedRoutinesProps {
  plans: WorkoutPlan[];
  onSelect: (plan: WorkoutPlan) => void;
}

export default function SavedRoutines({ plans, onSelect }: SavedRoutinesProps) {
  const favorites = plans.filter((p) => p.isFavorite);

  const toggleFavorite = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    await planRepo.update(planId, { isFavorite: !plan.isFavorite });
    toast.success(plan.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No favorite routines yet. Mark plans as favorites to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((plan) => (
        <div
          key={plan.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <button onClick={() => toggleFavorite(plan.id)}>⭐</button>
          </div>
          {plan.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
          )}
          <Button variant="primary" size="sm" onClick={() => onSelect(plan)}>
            Edit
          </Button>
        </div>
      ))}
    </div>
  );
}

