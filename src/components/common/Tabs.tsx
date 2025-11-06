import { Tab } from '@headlessui/react';
import { cn } from '@/utils/cn';

interface TabsProps {
  tabs: string[];
  children: React.ReactNode;
}

export default function Tabs({ tabs, children }: TabsProps) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              cn(
                'flex-shrink-0 rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-colors',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-primary-700 shadow dark:bg-gray-700 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-white/[0.12] dark:text-gray-300'
              )
            }
          >
            {tab}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">{children}</Tab.Panels>
    </Tab.Group>
  );
}

// Export Tab for convenience
export { Tab };

