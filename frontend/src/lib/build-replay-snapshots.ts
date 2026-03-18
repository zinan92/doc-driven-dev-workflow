import type { ReplaySnapshot } from "../types/workflow";
import type { TimelineEvent } from "./map-run-log-to-events";

const STAGE_ORDER = [
  "clarify_objective",
  "classify_task",
  "draft_prd",
  "prd_reality_review",
  "draft_user_flow",
  "human_approval_gate",
  "draft_implementation_plan",
  "review_implementation_plan",
  "write_execution_prompt",
  "claude_code_batch_execution",
  "codex_reviews_batch",
  "gate_major_phase",
  "final_revision",
  "integrate_merge_cleanup",
  "next_cycle",
];

/**
 * Build replayable snapshots from timeline events.
 * Each snapshot represents the workflow state at the moment that stage completed.
 */
export function buildReplaySnapshots(events: readonly TimelineEvent[]): readonly ReplaySnapshot[] {
  return events.map((ev, i) => {
    const activeStageId = ev.stageId;
    const activeIndex = STAGE_ORDER.indexOf(activeStageId);
    const completedStageIds = activeIndex >= 0 ? STAGE_ORDER.slice(0, activeIndex) : [];

    return {
      eventIndex: i,
      timestamp: ev.timestamp,
      event: ev.label,
      actor: ev.actor,
      activeStageId,
      completedStageIds,
    };
  });
}
