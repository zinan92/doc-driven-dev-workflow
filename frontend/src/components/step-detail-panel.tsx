import type { WorkflowStep } from "../types/workflow";
import { MetadataList } from "./metadata-list";

interface StepDetailPanelProps {
  readonly step: Pick<
    WorkflowStep,
    | "id"
    | "title"
    | "actor"
    | "stepType"
    | "purpose"
    | "outputSummary"
    | "recommendedSkills"
    | "inputs"
    | "outputs"
    | "validation"
    | "failure"
    | "next"
  >;
}

const ACTOR_LABEL: Record<string, string> = {
  human: "Human",
  codex: "Codex",
  claude_code: "Claude Code",
};

export function StepDetailPanel({ step }: StepDetailPanelProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{step.title}</h3>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-gray-500">{step.id}</span>
        <span className="text-xs font-mono text-amber-300">{ACTOR_LABEL[step.actor] ?? step.actor}</span>
        <span className="text-xs font-mono text-gray-500">{step.stepType}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{step.purpose}</p>
      <dl>
        <MetadataList label="Output Summary" items={step.outputSummary} />
        <MetadataList label="Recommended Skills" items={step.recommendedSkills} />
        <MetadataList label="Inputs" items={step.inputs} />
        <MetadataList label="Outputs" items={step.outputs} />
        <MetadataList label="Validation" items={step.validation} />
        <MetadataList label="Failure" items={step.failure} />
        <MetadataList label="Next" items={step.next} />
      </dl>
    </div>
  );
}
