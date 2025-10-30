'use client';

import { useBlueprintStore } from '@/lib/store/blueprintStore';
import { CheckCircle2, Circle, Target } from 'lucide-react';

export default function RoadmapPanel() {
  const blueprintDefinition = useBlueprintStore((state) => state.blueprintDefinition);
  const currentPosition = useBlueprintStore((state) => state.currentPosition);
  
  if (!blueprintDefinition) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-foreground/50 italic text-apple-caption">
          Waiting for blueprint initialization...
        </p>
      </div>
    );
  }
  
  const milestones = blueprintDefinition.milestone_nodes || [];
  
  // Calculate which milestone is current based on position
  const getMilestoneStatus = (index: number) => {
    const milestonePosition = index / Math.max(milestones.length - 1, 1);
    if (currentPosition >= milestonePosition) {
      return 'completed';
    } else if (Math.abs(currentPosition - milestonePosition) < 0.15) {
      return 'current';
    }
    return 'upcoming';
  };
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-primary" />
        <h2 className="text-apple-h2 font-semibold text-primary">
          Strategic Roadmap
        </h2>
      </div>
      
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(index);
          
          return (
            <div
              key={index}
              className={`
                relative pl-8 pb-8 border-l-2 transition-all duration-300
                ${status === 'completed' ? 'border-success/50' : ''}
                ${status === 'current' ? 'border-primary' : ''}
                ${status === 'upcoming' ? 'border-border/30' : ''}
                ${index === milestones.length - 1 ? 'border-l-0 pb-0' : ''}
              `}
            >
              {/* Milestone Icon */}
              <div
                className={`
                  absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${status === 'completed' ? 'bg-success/20 text-success' : ''}
                  ${status === 'current' ? 'bg-primary/20 text-primary ring-4 ring-primary/20' : ''}
                  ${status === 'upcoming' ? 'bg-border/20 text-foreground/40' : ''}
                `}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              {/* Milestone Content */}
              <div
                className={`
                  glass-strong rounded-lg p-4 transition-all duration-300
                  ${status === 'current' ? 'border border-primary/30 shadow-lg' : 'border border-white/10'}
                `}
              >
                <h3
                  className={`
                    font-semibold text-base mb-2
                    ${status === 'completed' ? 'text-success' : ''}
                    ${status === 'current' ? 'text-primary' : ''}
                    ${status === 'upcoming' ? 'text-foreground/70' : ''}
                  `}
                >
                  {milestone.label}
                </h3>
                
                <p
                  className={`
                    text-sm leading-relaxed
                    ${status === 'completed' ? 'text-foreground/70 line-through' : ''}
                    ${status === 'current' ? 'text-foreground/90' : ''}
                    ${status === 'upcoming' ? 'text-foreground/60' : ''}
                  `}
                >
                  {milestone.content.core_objective}
                </p>
                
                {milestone.content.key_signals && milestone.content.key_signals.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-foreground/60">
                    {milestone.content.key_signals.map((signal, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="mt-1">•</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Position indicator for current milestone */}
                {status === 'current' && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-medium">Current Focus</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Summary */}
      <div className="mt-8 p-4 glass rounded-lg border border-white/10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-foreground/70">Overall Progress</span>
          <span className="font-semibold text-primary">
            {Math.round(currentPosition * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-border/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 rounded-full"
            style={{ width: `${currentPosition * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

