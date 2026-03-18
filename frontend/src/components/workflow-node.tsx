import type { NodeStatus, Actor, StepType } from "../types/workflow";
import { getNodeVisualState } from "../lib/get-node-visual-state";

interface WorkflowNodeProps {
  readonly id: string;
  readonly index: number;
  readonly title: string;
  readonly actor: Actor;
  readonly stepType: StepType;
  readonly status: NodeStatus;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

const ACTOR_LABEL: Record<Actor, string> = {
  human: "Human",
  codex: "Codex",
  claude_code: "Claude",
};

const TYPE_ICON: Record<StepType, string> = {
  llm: "LLM",
  script: "SCR",
  human_gate: "GATE",
};

export function WorkflowNode({ index, title, actor, stepType, status, isSelected, onClick }: WorkflowNodeProps) {
  const visual = getNodeVisualState(status, isSelected);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-start gap-1 border rounded-lg px-3 py-2 w-full text-left transition-colors hover:brightness-110 ${visual.borderColor} ${visual.bgColor}`}
    >
      <div className="flex items-center gap-2 w-full">
        <span className={`w-2 h-2 rounded-full shrink-0 ${visual.dotColor}`} />
        <span className={`text-xs font-mono ${visual.textColor}`}>
          {index + 1}. {title}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <span className="text-[10px] text-gray-500 font-mono">{ACTOR_LABEL[actor]}</span>
        <span className="text-[10px] text-gray-600 font-mono">{TYPE_ICON[stepType]}</span>
      </div>
    </button>
  );
}
