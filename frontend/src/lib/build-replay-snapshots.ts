import type { ReplaySnapshot } from "../types/workflow";
import type { TimelineEvent } from "./map-run-log-to-events";
import { CANONICAL_STAGES } from "../data/canonical-stages";

const STAGE_ORDER = CANONICAL_STAGES.map((stage) => stage.id);

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
