import type { WorkflowPhase } from "../types/workflow";

export interface WorkflowPhaseDefinition {
  readonly id: WorkflowPhase;
  readonly title: string;
  readonly subtitle: string;
  readonly stageIds: readonly string[];
}

export const WORKFLOW_PHASES: readonly WorkflowPhaseDefinition[] = [
  {
    id: "intention_framing",
    title: "Intent Framing",
    subtitle: "Clarify the goal and classify the unit of work.",
    stageIds: ["clarify_objective", "classify_task"],
  },
  {
    id: "document_authoring",
    title: "Spec Authoring",
    subtitle: "Turn the task into PRD, flow, plan, and execution contract.",
    stageIds: [
      "draft_prd",
      "prd_reality_review",
      "draft_user_flow",
      "human_approval_gate",
      "draft_implementation_plan",
      "review_implementation_plan",
      "write_execution_prompt",
    ],
  },
  {
    id: "code_execution",
    title: "Execution",
    subtitle: "Implement, review, gate, and finalize the coding work.",
    stageIds: [
      "claude_code_batch_execution",
      "codex_reviews_batch",
      "gate_major_phase",
      "final_revision",
    ],
  },
  {
    id: "integration_cleanup",
    title: "Integration",
    subtitle: "Integrate, clean up, and define the next cycle.",
    stageIds: ["integrate_merge_cleanup", "next_cycle"],
  },
] as const;
