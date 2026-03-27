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
  readonly timestamp?: string;
  readonly onClick: () => void;
}

const ACTOR_LABEL: Record<Actor, string> = {
  human: "Human",
  codex: "Codex",
  claude_code: "Claude",
};

const TYPE_ICON: Record<StepType, string> = {
  ai_routing: "AI",
  script: "SCR",
  human_approval_gate: "GATE",
};

function formatTimestamp(ts?: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function WorkflowNode({ index, title, actor, stepType, status, isSelected, timestamp, onClick }: WorkflowNodeProps) {
  const visual = getNodeVisualState(status, isSelected);
  const formattedTime = formatTimestamp(timestamp);

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-colors hover:brightness-110 ${visual.borderColor} ${visual.bgColor}`}
    >
      <div className="flex w-full items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${visual.dotColor}`} />
        <span className={`text-xs font-mono ${visual.textColor}`}>
          {index + 1}. {title}
        </span>
      </div>
      <div className="ml-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-gray-500 font-mono">{ACTOR_LABEL[actor]}</span>
        <span className="text-[10px] text-gray-600 font-mono">{TYPE_ICON[stepType]}</span>
        {formattedTime && <span className="text-[10px] text-cyan-300 font-mono">{formattedTime}</span>}
      </div>
    </button>
  );
}
