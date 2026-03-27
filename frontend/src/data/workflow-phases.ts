import type { WorkflowPhase } from "../types/workflow";

export interface WorkflowPhaseDefinition {
  readonly id: WorkflowPhase;
  readonly title: string;
  readonly subtitle: string;
  readonly stageIds: readonly string[];
}

export const WORKFLOW_PHASES: readonly WorkflowPhaseDefinition[] = [
  {
    id: "research",
    title: "Research",
    subtitle: "Find anchors, evidence, and approval before PRD work starts.",
    stageIds: [
      "clarify_objective",
      "classify_task",
      "product_research",
      "collect_reference_evidence",
      "research_approval_gate",
    ],
  },
  {
    id: "design",
    title: "Design",
    subtitle: "Turn the anchored idea into PRD, flow, prototype brief, and execution contract.",
    stageIds: [
      "draft_prd",
      "prd_reality_review",
      "draft_user_flow",
      "draft_prototype_brief",
      "design_approval_gate",
      "draft_implementation_plan",
      "review_implementation_plan",
      "write_execution_prompt",
    ],
  },
  {
    id: "development",
    title: "Development",
    subtitle: "Implement, review, gate, and finalize in bounded batches.",
    stageIds: [
      "claude_code_batch_execution",
      "codex_reviews_batch",
      "gate_major_phase",
      "final_revision",
    ],
  },
  {
    id: "packaging",
    title: "Packaging",
    subtitle: "Integrate, package, and approve the release surface.",
    stageIds: [
      "integrate_and_verify",
      "prepare_release_package",
      "delivery_approval_gate",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    subtitle: "Capture next-cycle work and update the debt ledger.",
    stageIds: [
      "capture_next_cycle",
      "update_backlog_and_debt",
    ],
  },
] as const;
