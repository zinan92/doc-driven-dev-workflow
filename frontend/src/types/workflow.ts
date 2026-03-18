export type Actor = "human" | "codex" | "claude_code";
export type NodeStatus = "not_reached" | "selected" | "completed" | "waiting" | "blocked";
export type TaskStatus = "active" | "waiting" | "done" | "blocked";
export type StepType = "llm" | "script" | "human_gate";
export type WorkflowPhase =
  | "intention_framing"
  | "document_authoring"
  | "code_execution"
  | "integration_cleanup";

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
  readonly current_phase?: WorkflowPhase;
  readonly stage: string;
  readonly round: number;
  readonly current_actor: Actor;
  readonly last_artifact: string;
  readonly updated_at?: string;
  readonly stop_reason: string | null;
}

export interface HandoffArtifact {
  readonly filename: string;
  readonly content: string;
  readonly frontmatter: Record<string, unknown>;
}

export interface WorkflowSnapshot {
  readonly id: string;
  readonly label: string;
  readonly sourceDir: string;
  readonly state: TaskState;
  readonly statusMd: string;
  readonly handoffs: readonly HandoffArtifact[];
  readonly runLog: readonly RunLogEvent[];
}

export interface WorkflowSnapshotCollection {
  readonly generatedAt: string;
  readonly snapshots: readonly WorkflowSnapshot[];
}

export interface ReplaySnapshot {
  readonly eventIndex: number;
  readonly timestamp: string;
  readonly event: string;
  readonly actor: string;
  readonly activeStageId: string;
  readonly completedStageIds: readonly string[];
}
