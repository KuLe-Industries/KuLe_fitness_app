import { useState, useEffect } from 'react';
import type { WorkoutPlan } from '@/domain/types';
import { planRepo } from '@/domain/repositories/impl';
import Button from '@/components/common/Button';
import { toast } from 'sonner';

interface TemplatesProps {
  onSelect: (plan: WorkoutPlan) => void;
}

export default function Templates({ onSelect }: TemplatesProps) {
  const [templates, setTemplates] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allPlans = await planRepo.getAll();
    // Templates are plans that are not favorites and were created by seed
    setTemplates(allPlans.filter((p) => !p.isFavorite));
  };

  const useTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const newPlan = await planRepo.duplicate(templateId, `${template.name} (Copy)`);
    toast.success('Template applied');
    onSelect(newPlan);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No templates available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
          )}
          <p className="text-sm text-gray-500 mb-4">{template.blocks.length} exercises</p>
          <Button variant="primary" size="sm" onClick={() => useTemplate(template.id)}>
            Use Template
          </Button>
        </div>
      ))}
    </div>
  );
}

