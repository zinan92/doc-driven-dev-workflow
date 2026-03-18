export type Actor = "human" | "codex" | "claude_code";
export type NodeStatus = "not_reached" | "selected" | "completed" | "waiting" | "blocked";
export type TaskStatus = "active" | "done" | "blocked";
export type StepType = "llm" | "script" | "human_gate";

export interface CanonicalStage {
  readonly id: string;
  readonly index: number;
  readonly title: string;
  readonly actor: Actor;
  readonly stepType: StepType;
  readonly purpose: string;
  readonly canonicalInputs: readonly string[];
  readonly canonicalOutputs: readonly string[];
}

export interface WorkflowStep {
  readonly id: string;
  readonly index: number;
  readonly title: string;
  readonly actor: Actor;
  readonly stepType: StepType;
  readonly purpose: string;
  readonly status: NodeStatus;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly validation: readonly string[];
  readonly failure: readonly string[];
  readonly next: readonly string[];
  readonly artifactContent: string | null;
  readonly evidence: string | null;
}

export interface RunLogEvent {
  readonly timestamp: string;
  readonly event: string;
  readonly actor: string;
}

export interface TaskState {
  readonly task_id: string;
  readonly status: TaskStatus;
  readonly stage: string;
  readonly round: number;
  readonly current_actor: Actor;
  readonly last_artifact: string;
  readonly stop_reason: string;
}

export interface HandoffArtifact {
  readonly filename: string;
  readonly content: string;
  readonly frontmatter: Record<string, unknown>;
}

export interface ExampleTaskSnapshot {
  readonly state: TaskState;
  readonly statusMd: string;
  readonly handoffs: readonly HandoffArtifact[];
  readonly runLog: readonly RunLogEvent[];
}

export interface ReplaySnapshot {
  readonly eventIndex: number;
  readonly timestamp: string;
  readonly event: string;
  readonly actor: string;
  readonly activeStageId: string;
  readonly completedStageIds: readonly string[];
}
