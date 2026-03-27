import type { HandoffArtifact, RunLogEvent } from "../types/workflow";
import { CANONICAL_STAGES } from "../data/canonical-stages";

export interface TimelineEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly label: string;
  readonly actor: string;
  readonly stageId: string;
}

/** Map handoff filename prefixes to canonical stage ids */
const HANDOFF_TO_STAGE: readonly [string, string][] = [
  ["00-intake", "clarify_objective"],
  ["05-task-classification", "classify_task"],
  ["08-scope-estimate", "classify_task"],
  ["09-product-research", "product_research"],
  ["09-reference-evidence", "collect_reference_evidence"],
  ["09-research-approval", "research_approval_gate"],
  ["10-prd", "draft_prd"],
  ["15-prd-reality-review", "prd_reality_review"],
  ["20-user-flow", "draft_user_flow"],
  ["21-user-flow", "draft_user_flow"],
  ["22-prototype-brief", "draft_prototype_brief"],
  ["25-human-approval", "design_approval_gate"],
  ["30-implementation-plan", "draft_implementation_plan"],
  ["32-execution-workflow", "write_execution_prompt"],
  ["35-plan-review", "review_implementation_plan"],
  ["40-execution-prompt", "write_execution_prompt"],
  ["50-claude-batch-r1", "claude_code_batch_execution"],
  ["60-codex-review-r1", "codex_reviews_batch"],
  ["70-claude-batch-r2", "claude_code_batch_execution"],
  ["80-codex-review-r2", "codex_reviews_batch"],
  ["85-phase-gate", "gate_major_phase"],
  ["90-claude-final", "final_revision"],
  ["95-integration-checklist", "integrate_and_verify"],
  ["96-release-package", "prepare_release_package"],
  ["97-delivery-approval", "delivery_approval_gate"],
  ["99-next-cycle", "capture_next_cycle"],
  ["100-backlog-and-debt", "update_backlog_and_debt"],
];

/** Map run-log event names to canonical stage ids */
const RUN_LOG_EVENT_TO_STAGE: Record<string, string> = {
  task_created: "clarify_objective",
  prd_completed: "draft_prd",
  implementation_completed: "claude_code_batch_execution",
  task_completed: "update_backlog_and_debt",
};

function resolveStageId(filename: string): string {
  for (const [prefix, stageId] of HANDOFF_TO_STAGE) {
    if (filename.startsWith(prefix)) return stageId;
  }
  return "clarify_objective";
}

function resolveActor(stageId: string, frontmatter: Record<string, unknown>): string {
  if (typeof frontmatter.author === "string") return frontmatter.author;
  const stage = CANONICAL_STAGES.find((s) => s.id === stageId);
  return stage?.actor ?? "unknown";
}

/**
 * Interpolate timestamps between known anchor points.
 * For N events between two anchors, space them evenly.
 */
function interpolateTimestamps(events: TimelineEvent[], anchors: Map<string, string>): TimelineEvent[] {
  // Build index of anchor positions
  const anchorPositions: { index: number; time: number }[] = [];
  for (let i = 0; i < events.length; i++) {
    const ts = anchors.get(events[i].stageId);
    if (ts) {
      const time = new Date(ts).getTime();
      if (!isNaN(time)) {
        anchorPositions.push({ index: i, time });
      }
    }
  }

  if (anchorPositions.length === 0) return events;

  // Fill timestamps by interpolating between anchors
  return events.map((ev, i) => {
    const anchor = anchors.get(ev.stageId);
    if (anchor) return { ...ev, timestamp: anchor };

    // Find surrounding anchors
    let before: { index: number; time: number } | undefined;
    let after: { index: number; time: number } | undefined;
    for (const ap of anchorPositions) {
      if (ap.index <= i) before = ap;
      if (ap.index > i && !after) after = ap;
    }

    if (before && after) {
      const span = after.time - before.time;
      const steps = after.index - before.index;
      const offset = i - before.index;
      const interpolated = before.time + (span * offset) / steps;
      return { ...ev, timestamp: new Date(interpolated).toISOString() };
    }
    if (before) {
      // After last anchor: add 5 min per step
      const offset = i - before.index;
      return { ...ev, timestamp: new Date(before.time + offset * 5 * 60_000).toISOString() };
    }
    if (after) {
      // Before first anchor: subtract 5 min per step
      const offset = after.index - i;
      return { ...ev, timestamp: new Date(after.time - offset * 5 * 60_000).toISOString() };
    }
    return ev;
  });
}

/**
 * Build a fine-grained timeline from handoff artifacts + run-log timestamps.
 * Handoffs determine which stages exist; run-log provides timestamp anchors.
 * Intermediate stages get interpolated timestamps.
 */
export function mapRunLogToEvents(
  handoffs: readonly HandoffArtifact[],
  runLog: readonly RunLogEvent[] = [],
): readonly TimelineEvent[] {
  const seen = new Set<string>();
  const events: TimelineEvent[] = [];

  // Build timestamp anchors from run-log
  const anchors = new Map<string, string>();
  for (const entry of runLog) {
    const stageId = RUN_LOG_EVENT_TO_STAGE[entry.event];
    if (stageId && entry.timestamp) {
      anchors.set(stageId, entry.timestamp);
    }
  }

  // Sort handoffs by filename prefix (numeric order)
  const sorted = [...handoffs].sort((a, b) => a.filename.localeCompare(b.filename));

  for (const h of sorted) {
    const stageId = resolveStageId(h.filename);
    if (seen.has(stageId)) continue;
    seen.add(stageId);

    const stage = CANONICAL_STAGES.find((s) => s.id === stageId);
    const actor = resolveActor(stageId, h.frontmatter);

    events.push({
      id: String(events.length),
      timestamp: "",
      label: stage?.title ?? stageId,
      actor,
      stageId,
    });
  }

  // Add gate_major_phase if we have codex reviews (older tasks may not have a direct artifact)
  if (seen.has("codex_reviews_batch") && !seen.has("gate_major_phase")) {
    const gateStage = CANONICAL_STAGES.find((s) => s.id === "gate_major_phase")!;
    const finalIdx = events.findIndex((e) => e.stageId === "final_revision");
    const gateEvent: TimelineEvent = {
      id: String(events.length),
      timestamp: "",
      label: gateStage.title,
      actor: gateStage.actor,
      stageId: "gate_major_phase",
    };
    if (finalIdx >= 0) {
      events.splice(finalIdx, 0, gateEvent);
    } else {
      events.push(gateEvent);
    }
  }

  // Interpolate timestamps from run-log anchors
  const withTimestamps = interpolateTimestamps(events, anchors);

  // Re-assign sequential ids
  return withTimestamps.map((e, i) => ({ ...e, id: String(i) }));
}
