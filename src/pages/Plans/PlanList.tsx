import { useNavigate } from 'react-router-dom';
import type { WorkoutPlan } from '@/domain/types';
import Button from '@/components/common/Button';
import { planRepo } from '@/domain/repositories/impl';
import { toast } from 'sonner';

interface PlanListProps {
  plans: WorkoutPlan[];
  onSelect: (plan: WorkoutPlan) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function PlanList({ plans, onSelect, onDelete, onDuplicate }: PlanListProps) {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    await planRepo.delete(id);
    toast.success('Plan deleted');
    onDelete();
  };

  const handleDuplicate = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const newName = `${plan.name} (Copy)`;
    await planRepo.duplicate(id, newName);
    toast.success('Plan duplicated');
    onDuplicate();
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No plans yet. Create your first plan!</p>
        <Button onClick={() => navigate('/plans')}>Create Plan</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.isFavorite && <span>⭐</span>}
          </div>
          {plan.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            {plan.blocks.length} exercises
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => onSelect(plan)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/session?planId=${plan.id}`)}
            >
              Start
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(plan.id)}>
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(plan.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

