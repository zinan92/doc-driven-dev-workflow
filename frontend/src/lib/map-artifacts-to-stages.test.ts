import { mapArtifactsToStages } from "./map-artifacts-to-stages";
import type { TaskState } from "../types/workflow";

const state: TaskState = {
  task_id: "TASK-2026-03-15-example-greeter",
  status: "done",
  stage: "next_cycle",
  round: 2,
  current_actor: "human",
  last_artifact: "handoffs/99-next-cycle.md",
  stop_reason: "final_revision_completed",
};

test("maps example task to all 15 canonical stages", () => {
  const result = mapArtifactsToStages({
    state,
    handoffs: [],
    runLog: [],
  });

  expect(result).toHaveLength(15);
  expect(result.some((step) => step.id === "draft_prd")).toBe(true);
  expect(result.some((step) => step.id === "next_cycle")).toBe(true);
});

test("all stages are completed for a done task at next_cycle", () => {
  const result = mapArtifactsToStages({
    state,
    handoffs: [],
    runLog: [],
  });

  expect(result.every((s) => s.status === "completed")).toBe(true);
});

test("attaches artifact content when handoff matches", () => {
  const result = mapArtifactsToStages({
    state,
    handoffs: [
      { filename: "00-intake.md", content: "# Intake content", frontmatter: {} },
    ],
    runLog: [],
  });

  const clarify = result.find((s) => s.id === "clarify_objective")!;
  expect(clarify.artifactContent).toContain("Intake content");
});

test("provides evidence for stages without direct artifacts", () => {
  const result = mapArtifactsToStages({
    state,
    handoffs: [],
    runLog: [],
  });

  const gatePhase = result.find((s) => s.id === "gate_major_phase")!;
  expect(gatePhase.evidence).toBeTruthy();
  expect(gatePhase.artifactContent).toBeNull();
});
