import { useState } from 'react';
import { exerciseRepo } from '@/domain/repositories/impl';
import type { Exercise } from '@/domain/types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Dialog from '@/components/common/Dialog';
import { toast } from 'sonner';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onUpdate: () => void;
}

export default function ExerciseLibrary({ exercises, onUpdate }: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroups: [] as string[],
    equipment: [] as string[],
    tags: [] as string[],
  });

  const muscleGroups = Array.from(
    new Set(exercises.flatMap((e) => e.muscleGroups))
  ).sort();

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.muscleGroups.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMuscle = !selectedMuscleGroup || e.muscleGroups.includes(selectedMuscleGroup);
    return matchesSearch && matchesMuscle;
  });

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }
    if (newExercise.muscleGroups.length === 0) {
      toast.error('Please add at least one muscle group');
      return;
    }

    try {
      await exerciseRepo.create({
        name: newExercise.name,
        muscleGroups: newExercise.muscleGroups,
        equipment: newExercise.equipment,
        tags: newExercise.tags,
      });
      toast.success('Exercise added');
      setShowAddDialog(false);
      setNewExercise({ name: '', muscleGroups: [], equipment: [], tags: [] });
      onUpdate();
    } catch (error) {
      toast.error('Failed to add exercise');
      console.error(error);
    }
  };

  const addMuscleGroup = (group: string) => {
    if (!newExercise.muscleGroups.includes(group)) {
      setNewExercise({
        ...newExercise,
        muscleGroups: [...newExercise.muscleGroups, group],
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          options={[
            { value: '', label: 'All Muscle Groups' },
            ...muscleGroups.map((g) => ({ value: g, label: g })),
          ]}
          className="w-48"
        />
        <Button variant="primary" onClick={() => setShowAddDialog(true)}>
          + Add Exercise
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <h3 className="font-semibold mb-2">{exercise.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Muscle Groups:</strong> {exercise.muscleGroups.join(', ')}
              </p>
              {exercise.equipment && exercise.equipment.length > 0 && (
                <p>
                  <strong>Equipment:</strong> {exercise.equipment.join(', ')}
                </p>
              )}
              {exercise.tags && exercise.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {exercise.tags.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add Exercise"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Exercise Name"
            value={newExercise.name}
            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">Muscle Groups</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {muscleGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => addMuscleGroup(group)}
                  className={`px-3 py-1 rounded text-sm ${
                    newExercise.muscleGroups.includes(group)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            <Input
              placeholder="Add custom muscle group"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  addMuscleGroup(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAddExercise}>
              Add Exercise
            </Button>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

