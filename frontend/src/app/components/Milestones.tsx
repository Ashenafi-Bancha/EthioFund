import { Check, Target } from 'lucide-react';
import { Milestone } from '../data/mockData';

interface MilestonesProps {
  milestones: Milestone[];
  currentAmount: number;
}

export function Milestones({ milestones, currentAmount }: MilestonesProps) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">Campaign Milestones</h3>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const isReached = milestone.reached || currentAmount >= milestone.amount;
          const progress = Math.min((currentAmount / milestone.amount) * 100, 100);

          return (
            <div key={milestone.id} className="relative">
              {/* Connector Line */}
              {index < milestones.length - 1 && (
                <div 
                  className={`absolute left-4 top-12 w-0.5 h-8 ${
                    isReached ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isReached 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isReached ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold ${
                        isReached ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        {milestone.description}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ETB {milestone.amount.toLocaleString()}
                      </p>
                    </div>
                    {isReached && milestone.reachedDate && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Reached {new Date(milestone.reachedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {!isReached && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {progress.toFixed(0)}% reached
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
