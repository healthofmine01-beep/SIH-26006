import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface JourneyStepBarProps {
  currentStage?: 'cargo' | 'route' | 'schedule' | 'analysis' | 'recommendation';
  isAnalyzing?: boolean;
}

export const JourneyStepBar: React.FC<JourneyStepBarProps> = ({
  currentStage = 'cargo',
  isAnalyzing = false,
}) => {
  const steps = [
    { id: 'cargo', label: 'Cargo' },
    { id: 'route', label: 'Route' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'analysis', label: 'AI Analysis' },
    { id: 'recommendation', label: 'Recommendation' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'cargo': return 0;
      case 'route': return 1;
      case 'schedule': return 2;
      case 'analysis': return 3;
      case 'recommendation': return 4;
      default: return 0;
    }
  };

  const currentIndex = isAnalyzing ? 3 : getStageIndex(currentStage);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold font-mono flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-[#0072E9] text-white ring-2 ring-blue-100'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span
                  className={`font-semibold ${
                    isCurrent
                      ? 'text-[#052439]'
                      : isDone
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

