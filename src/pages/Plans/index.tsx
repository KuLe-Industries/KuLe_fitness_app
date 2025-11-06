import { useState, useEffect } from 'react';
import { planRepo, exerciseRepo } from '@/domain/repositories/impl';
import type { WorkoutPlan, Exercise } from '@/domain/types';
import Tabs, { Tab } from '@/components/common/Tabs';
import PlanList from './PlanList';
import PlanEditor from './PlanEditor';
import ExerciseLibrary from './ExerciseLibrary';
import SavedRoutines from './SavedRoutines';
import Templates from './Templates';
import Calendar from './Calendar';

export default function Plans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allPlans, allExercises] = await Promise.all([
      planRepo.getAll(),
      exerciseRepo.getAll(),
    ]);
    setPlans(allPlans);
    setExercises(allExercises);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout Plans</h1>
        <p className="text-gray-600 dark:text-gray-400">Create and manage your workout routines</p>
      </div>

      <Tabs tabs={['Plans', 'Create/Edit', 'Exercise Library', 'Templates', 'Routines', 'Calendar']}>
        <Tab.Panel>
          <PlanList
            plans={plans}
            onSelect={setSelectedPlan}
            onDelete={loadData}
            onDuplicate={loadData}
          />
        </Tab.Panel>
        <Tab.Panel>
          <PlanEditor
            plan={selectedPlan}
            exercises={exercises}
            onSave={loadData}
            onCancel={() => setSelectedPlan(null)}
          />
        </Tab.Panel>
        <Tab.Panel>
          <ExerciseLibrary exercises={exercises} onUpdate={loadData} />
        </Tab.Panel>
        <Tab.Panel>
          <Templates onSelect={(plan) => setSelectedPlan(plan)} />
        </Tab.Panel>
        <Tab.Panel>
          <SavedRoutines plans={plans} onSelect={setSelectedPlan} />
        </Tab.Panel>
        <Tab.Panel>
          <Calendar plans={plans} />
        </Tab.Panel>
      </Tabs>
    </div>
  );
}

