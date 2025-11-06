import { useState, useEffect } from 'react';
import type { WorkoutPlan, PlanExerciseBlock, Exercise } from '@/domain/types';
import { planRepo } from '@/domain/repositories/impl';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { toast } from 'sonner';

interface PlanEditorProps {
  plan: WorkoutPlan | null;
  exercises: Exercise[];
  onSave: () => void;
  onCancel: () => void;
}

export default function PlanEditor({ plan, exercises, onSave, onCancel }: PlanEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<PlanExerciseBlock[]>([]);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description || '');
      setBlocks([...plan.blocks]);
    } else {
      setName('');
      setDescription('');
      setBlocks([]);
    }
  }, [plan]);

  const addExercise = () => {
    if (exercises.length === 0) {
      toast.error('No exercises available. Add exercises first.');
      return;
    }
    const newBlock: PlanExerciseBlock = {
      exerciseId: exercises[0].id,
      target: { sets: 3, reps: 10, restSec: 90 },
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeExercise = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, updates: Partial<PlanExerciseBlock>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...updates };
    setBlocks(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a plan name');
      return;
    }
    if (blocks.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    try {
      if (plan) {
        await planRepo.update(plan.id, {
          name,
          description,
          blocks: blocks.map((b, i) => ({ ...b, order: i })),
        });
        toast.success('Plan updated');
      } else {
        await planRepo.create({
          name,
          description,
          blocks: blocks.map((b, i) => ({ ...b, order: i })),
        });
        toast.success('Plan created');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save plan');
      console.error(error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{plan ? 'Edit Plan' : 'Create Plan'}</h2>

      <div className="space-y-4 mb-6">
        <Input label="Plan Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Exercises</h3>
        {blocks.map((block, index) => {
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-start mb-2">
                <Select
                  value={block.exerciseId}
                  onChange={(e) => updateBlock(index, { exerciseId: e.target.value })}
                  options={exercises.map((e) => ({ value: e.id, label: e.name }))}
                />
                <Button variant="destructive" size="sm" onClick={() => removeExercise(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  label="Sets"
                  type="number"
                  value={block.target.sets}
                  onChange={(e) =>
                    updateBlock(index, {
                      target: { ...block.target, sets: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  label="Reps"
                  type="number"
                  value={block.target.reps}
                  onChange={(e) =>
                    updateBlock(index, {
                      target: { ...block.target, reps: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  label="Rest (sec)"
                  type="number"
                  value={block.target.restSec}
                  onChange={(e) =>
                    updateBlock(index, {
                      target: { ...block.target, restSec: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  label="Load (kg)"
                  type="number"
                  value={block.target.load || ''}
                  onChange={(e) =>
                    updateBlock(index, {
                      target: { ...block.target, load: parseFloat(e.target.value) || undefined },
                    })
                  }
                />
              </div>
            </div>
          );
        })}
        <Button variant="outline" onClick={addExercise}>
          + Add Exercise
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave}>
          Save Plan
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

