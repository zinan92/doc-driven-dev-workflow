import { mapRunLogToEvents } from "./map-run-log-to-events";
import type { HandoffArtifact, RunLogEvent } from "../types/workflow";

const makeHandoff = (filename: string, author = "codex"): HandoffArtifact => ({
  filename,
  content: "",
  frontmatter: { author },
});

const RUN_LOG: RunLogEvent[] = [
  { timestamp: "2026-03-15T10:00:00Z", event: "task_created", actor: "human" },
  { timestamp: "2026-03-15T10:10:00Z", event: "prd_completed", actor: "codex" },
  { timestamp: "2026-03-15T10:45:00Z", event: "implementation_completed", actor: "claude_code" },
  { timestamp: "2026-03-15T11:20:00Z", event: "task_completed", actor: "human" },
];

test("derives timeline events from handoff artifacts with interpolated timestamps", () => {
  const handoffs: HandoffArtifact[] = [
    makeHandoff("00-intake.md", "human"),
    makeHandoff("05-task-classification.yaml"),
    makeHandoff("10-prd.md"),
    makeHandoff("15-prd-reality-review.md"),
    makeHandoff("20-user-flow.md"),
    makeHandoff("21-user-flow.yaml"),
    makeHandoff("25-human-approval.md", "human"),
    makeHandoff("30-implementation-plan.md"),
    makeHandoff("35-plan-review.md"),
    makeHandoff("40-execution-prompt.md"),
    makeHandoff("50-claude-batch-r1.md", "claude_code"),
    makeHandoff("60-codex-review-r1.md"),
    makeHandoff("70-claude-batch-r2.md", "claude_code"),
    makeHandoff("80-codex-review-r2.md"),
    makeHandoff("90-claude-final.md", "claude_code"),
    makeHandoff("95-integration-checklist.md", "human"),
    makeHandoff("99-next-cycle.md"),
  ];

  const events = mapRunLogToEvents(handoffs, RUN_LOG);

  // Should cover all canonical stages (deduped + gate_major_phase injected)
  expect(events.length).toBeGreaterThanOrEqual(14);

  // Check key stages are present
  const stageIds = events.map((e) => e.stageId);
  expect(stageIds).toContain("clarify_objective");
  expect(stageIds).toContain("draft_prd");
  expect(stageIds).toContain("human_approval_gate");
  expect(stageIds).toContain("claude_code_batch_execution");
  expect(stageIds).toContain("codex_reviews_batch");
  expect(stageIds).toContain("gate_major_phase");
  expect(stageIds).toContain("final_revision");
  expect(stageIds).toContain("next_cycle");
});

test("anchored stages have run-log timestamps", () => {
  const handoffs: HandoffArtifact[] = [
    makeHandoff("00-intake.md", "human"),
    makeHandoff("10-prd.md"),
    makeHandoff("99-next-cycle.md"),
  ];

  const events = mapRunLogToEvents(handoffs, RUN_LOG);

  const clarify = events.find((e) => e.stageId === "clarify_objective")!;
  expect(clarify.timestamp).toBe("2026-03-15T10:00:00Z");

  const prd = events.find((e) => e.stageId === "draft_prd")!;
  expect(prd.timestamp).toBe("2026-03-15T10:10:00Z");

  const next = events.find((e) => e.stageId === "next_cycle")!;
  expect(next.timestamp).toBe("2026-03-15T11:20:00Z");
});

test("intermediate stages get interpolated timestamps", () => {
  const handoffs: HandoffArtifact[] = [
    makeHandoff("00-intake.md", "human"),
    makeHandoff("05-task-classification.yaml"),
    makeHandoff("10-prd.md"),
  ];

  const events = mapRunLogToEvents(handoffs, RUN_LOG);

  // classify_task is between clarify_objective (10:00) and draft_prd (10:10)
  const classify = events.find((e) => e.stageId === "classify_task")!;
  expect(classify.timestamp).toBeTruthy();
  const classifyTime = new Date(classify.timestamp).getTime();
  const clarifyTime = new Date("2026-03-15T10:00:00Z").getTime();
  const prdTime = new Date("2026-03-15T10:10:00Z").getTime();
  expect(classifyTime).toBeGreaterThan(clarifyTime);
  expect(classifyTime).toBeLessThan(prdTime);
});

test("deduplicates stages with multiple artifacts", () => {
  const handoffs: HandoffArtifact[] = [
    makeHandoff("20-user-flow.md"),
    makeHandoff("21-user-flow.yaml"),
  ];

  const events = mapRunLogToEvents(handoffs);
  const flowEvents = events.filter((e) => e.stageId === "draft_user_flow");
  expect(flowEvents).toHaveLength(1);
});
