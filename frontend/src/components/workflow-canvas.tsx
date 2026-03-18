import type { WorkflowStep } from "../types/workflow";
import { WORKFLOW_PHASES } from "../data/workflow-phases";
import { WorkflowNode } from "./workflow-node";

interface WorkflowCanvasProps {
  readonly steps: readonly WorkflowStep[];
  readonly selectedStepId: string;
  readonly onSelect: (stepId: string) => void;
  readonly stageTimestamps: Record<string, string>;
}

export function WorkflowCanvas({ steps, selectedStepId, onSelect, stageTimestamps }: WorkflowCanvasProps) {
  const stepsById = new Map(steps.map((s) => [s.id, s]));

  return (
    <section className="rounded-2xl border border-gray-800 bg-[#121212] p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">Workflow Canvas</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            Workflow-first view. Select a step to inspect its purpose, artifacts, and context in the right panel.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {WORKFLOW_PHASES.map((phase) => (
          <div key={phase.id} className="relative rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{phase.id.replace(/_/g, " ")}</div>
              <h3 className="mt-1 text-base font-semibold text-gray-100">{phase.title}</h3>
              <p className="mt-1 text-xs leading-5 text-gray-500">{phase.subtitle}</p>
            </div>

            <div className="space-y-3">
              {phase.stageIds.map((stageId, idx) => {
                const step = stepsById.get(stageId);
                return (
                  <div key={stageId} className="flex flex-col">
                    <WorkflowNode
                      id={stageId}
                      index={step?.index ?? idx}
                      title={step?.title ?? stageId}
                      actor={step?.actor ?? "codex"}
                      stepType={step?.stepType ?? "llm"}
                      status={step?.status ?? "not_reached"}
                      isSelected={stageId === selectedStepId}
                      timestamp={stageTimestamps[stageId] ?? ""}
                      onClick={() => onSelect(stageId)}
                    />
                    {idx < phase.stageIds.length - 1 && (
                      <div className="ml-5 mt-1 h-4 border-l border-dashed border-gray-800" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
