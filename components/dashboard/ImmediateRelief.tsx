'use client';

import { Wind, Zap } from 'lucide-react';
import { useState } from 'react';

interface ReliefTechnique {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  bgColor: string;
}

const techniques: ReliefTechnique[] = [
  {
    id: 'breathing',
    title: 'Breathing Technique',
    description: '4-7-8 method for calm',
    icon: <Wind className="w-6 h-6" />,
    steps: [
      'Breathe in for 4 counts',
      'Hold for 7 counts',
      'Exhale for 8 counts',
      'Repeat 4 times',
    ],
    bgColor: 'bg-secondary-fixed/20',
  },
  {
    id: 'grounding',
    title: 'Grounding Exercise',
    description: '5-4-3-2-1 technique',
    icon: <Zap className="w-6 h-6" />,
    steps: [
      '5 things you see',
      '4 things you can touch',
      '3 things you hear',
      '2 things you smell',
      '1 thing you taste',
    ],
    bgColor: 'bg-tertiary-fixed/20',
  },
];

interface ImmediateReliefProps {
  onTechniqueSelect?: (id: string) => void;
}

export function ImmediateRelief({ onTechniqueSelect }: ImmediateReliefProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="label-caps block">Immediate Relief</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techniques.map((technique) => (
          <button
            key={technique.id}
            onClick={() => {
              setExpanded(expanded === technique.id ? null : technique.id);
              onTechniqueSelect?.(technique.id);
            }}
            className={`card p-6 text-left transition-all hover:shadow-lg cursor-pointer ${
              expanded === technique.id
                ? 'ring-2 ring-primary'
                : ''
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-3 rounded-lg ${technique.bgColor}`}>
                {technique.icon}
              </div>
              <div>
                <h4 className="heading-md text-on-surface">{technique.title}</h4>
                <p className="text-sm text-on-surface-variant">{technique.description}</p>
              </div>
            </div>

            {expanded === technique.id && (
              <div className="mt-6 pt-6 border-t border-outline-variant space-y-3">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Steps
                </p>
                <ol className="space-y-2">
                  {technique.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-on-surface pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
