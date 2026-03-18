import type { WorkflowStep } from "../types/workflow";
import { CANONICAL_STAGES } from "../data/canonical-stages";
import { WorkflowNode } from "./workflow-node";

interface WorkflowGraphProps {
  readonly steps: readonly WorkflowStep[];
  readonly selectedStepId: string;
  readonly onSelect: (stepId: string) => void;
}

export function WorkflowGraph({ steps, selectedStepId, onSelect }: WorkflowGraphProps) {
  const stepsById = new Map(steps.map((s) => [s.id, s]));

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Workflow Graph</h2>
      <div className="grid grid-cols-5 gap-2">
        {CANONICAL_STAGES.map((stage) => {
          const step = stepsById.get(stage.id);
          return (
            <div key={stage.id} className="flex flex-col">
              <WorkflowNode
                id={stage.id}
                index={stage.index}
                title={stage.title}
                actor={step?.actor ?? stage.actor}
                stepType={step?.stepType ?? stage.stepType}
                status={step?.status ?? "not_reached"}
                isSelected={stage.id === selectedStepId}
                onClick={() => onSelect(stage.id)}
              />
              {stage.index < CANONICAL_STAGES.length - 1 && stage.index % 5 !== 4 && (
                <div className="flex justify-center my-0.5">
                  <span className="text-gray-700 text-xs">→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
