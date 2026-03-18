import type { WorkflowStep, HandoffArtifact, TaskState, RunLogEvent, NodeStatus } from "../types/workflow";
import { CANONICAL_STAGES } from "../data/canonical-stages";

interface MapInput {
  readonly state: TaskState;
  readonly handoffs: readonly HandoffArtifact[];
  readonly runLog: readonly RunLogEvent[];
}

const STAGE_ARTIFACT_MAP: Record<string, readonly string[]> = {
  clarify_objective: ["00-intake.md"],
  classify_task: ["05-task-classification.yaml", "08-scope-estimate.md"],
  draft_prd: ["10-prd.md"],
  prd_reality_review: ["15-prd-reality-review.md"],
  draft_user_flow: ["20-user-flow.md", "21-user-flow.yaml"],
  human_approval_gate: ["25-human-approval.md"],
  draft_implementation_plan: ["30-implementation-plan.md"],
  review_implementation_plan: ["35-plan-review.md"],
  write_execution_prompt: ["40-execution-prompt.md", "32-execution-workflow.yaml"],
  claude_code_batch_execution: ["50-claude-batch-r1.md", "70-claude-batch-r2.md"],
  codex_reviews_batch: ["60-codex-review-r1.md", "80-codex-review-r2.md"],
  gate_major_phase: [],
  final_revision: ["90-claude-final.md"],
  integrate_merge_cleanup: ["95-integration-checklist.md"],
  next_cycle: ["99-next-cycle.md"],
};

function findHandoff(handoffs: readonly HandoffArtifact[], filename: string): HandoffArtifact | undefined {
  return handoffs.find((h) => h.filename === filename || h.filename.endsWith(`/${filename}`));
}

function resolveStatus(stageId: string, currentStageId: string, stageIndex: number, currentIndex: number): NodeStatus {
  if (stageId === currentStageId) return "completed";
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "completed";
  return "not_reached";
}

export function mapArtifactsToStages(input: MapInput): readonly WorkflowStep[] {
  const currentStageId = input.state.stage;
  const currentStageIndex = CANONICAL_STAGES.findIndex((s) => s.id === currentStageId);
  const effectiveIndex = currentStageIndex >= 0 ? currentStageIndex : CANONICAL_STAGES.length - 1;

  return CANONICAL_STAGES.map((stage) => {
    const artifactFiles = STAGE_ARTIFACT_MAP[stage.id] ?? [];
    const matchedHandoffs = artifactFiles
      .map((f) => findHandoff(input.handoffs, f))
      .filter((h): h is HandoffArtifact => h !== undefined);

    const hasDirectArtifact = matchedHandoffs.length > 0;
    const artifactContent = hasDirectArtifact ? matchedHandoffs.map((h) => h.content).join("\n\n---\n\n") : null;

    const status = resolveStatus(stage.id, currentStageId, stage.index, effectiveIndex);

    const evidence =
      !hasDirectArtifact && status === "completed"
        ? `No direct artifact. ${stage.purpose}`
        : null;

    return {
      id: stage.id,
      index: stage.index,
      title: stage.title,
      actor: stage.actor,
      stepType: stage.stepType,
      purpose: stage.purpose,
      status,
      inputs: stage.canonicalInputs,
      outputs: stage.canonicalOutputs,
      validation: [],
      failure: [],
      next: stage.index < CANONICAL_STAGES.length - 1 ? [CANONICAL_STAGES[stage.index + 1].id] : [],
      artifactContent,
      evidence,
    };
  });
}
