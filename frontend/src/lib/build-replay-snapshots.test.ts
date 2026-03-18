import { buildReplaySnapshots } from "./build-replay-snapshots";
import type { TimelineEvent } from "./map-run-log-to-events";

test("creates replayable snapshots from timeline events", () => {
  const events: TimelineEvent[] = [
    { id: "0", timestamp: "", label: "Clarify Objective", actor: "codex", stageId: "clarify_objective" },
    { id: "1", timestamp: "", label: "Draft PRD", actor: "codex", stageId: "draft_prd" },
  ];
  const snapshots = buildReplaySnapshots(events);

  expect(snapshots.length).toBe(2);
  expect(snapshots[0].activeStageId).toBe("clarify_objective");
  expect(snapshots[1].activeStageId).toBe("draft_prd");
});

test("snapshot at draft_prd has clarify_objective and classify_task as completed", () => {
  const events: TimelineEvent[] = [
    { id: "0", timestamp: "", label: "Draft PRD", actor: "codex", stageId: "draft_prd" },
  ];
  const snapshots = buildReplaySnapshots(events);

  expect(snapshots[0].activeStageId).toBe("draft_prd");
  expect(snapshots[0].completedStageIds).toContain("clarify_objective");
  expect(snapshots[0].completedStageIds).toContain("classify_task");
});
