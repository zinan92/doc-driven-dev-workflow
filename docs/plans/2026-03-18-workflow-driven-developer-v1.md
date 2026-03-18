# Workflow Driven Developer V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a read-only front-end prototype inside this repo that visualizes the example task as a replayable 15-stage workflow cockpit for the operator.

**Architecture:** Add a small React + TypeScript + Vite front-end under `frontend/` and keep V1 static-first. Use a build-time normalization script to convert the example task's markdown, YAML, and JSON artifacts into a single typed snapshot consumed by the UI. Preserve the canonical 15-stage workflow in the UI even when the example task has fewer direct artifacts, and map missing stages to the closest supporting evidence.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, Vitest, Testing Library, Node file parsing script, local example-task artifacts

---

## Assumptions

- Repo root: `/Users/wendy/work/dev-co/doc-driven-dev-workflow`
- New front-end lives in: `/Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend`
- V1 visualizes only: `/Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task`
- The app is read-only and does not need filesystem live watching in V1
- The front-end can consume a normalized JSON snapshot generated locally during development/build

### Task 1: Bootstrap the front-end app

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/app.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test/setup.ts`

**Step 1: Write the failing app smoke test**

Create:
- `frontend/src/app.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders workflow cockpit shell", () => {
  render(<App />);
  expect(screen.getByText(/workflow driven developer/i)).toBeInTheDocument();
  expect(screen.getByText(/workflow graph/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand`
Expected: FAIL because app and test setup are not ready yet.

**Step 3: Create the minimal Vite + React + Tailwind scaffold**

Implement the shell so the smoke test can pass.

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand`
Expected: PASS for the smoke test.

**Step 5: Commit**

```bash
git add frontend
git commit -m "feat: bootstrap workflow driven developer frontend"
```

### Task 2: Normalize the example task into a typed snapshot

**Files:**
- Create: `frontend/scripts/build-example-task.ts`
- Create: `frontend/src/types/workflow.ts`
- Create: `frontend/src/data/example-task.json`
- Create: `frontend/src/data/canonical-stages.ts`
- Create: `frontend/src/lib/load-example-task.ts`
- Create: `frontend/src/lib/map-artifacts-to-stages.ts`
- Test: `frontend/src/lib/map-artifacts-to-stages.test.ts`

**Step 1: Write the failing normalization test**

Create:
- `frontend/src/lib/map-artifacts-to-stages.test.ts`

```ts
import { mapArtifactsToStages } from "./map-artifacts-to-stages";

test("maps example task to all 15 canonical stages", () => {
  const result = mapArtifactsToStages({
    state: { stage: "next_cycle", current_actor: "human", round: 2 },
    handoffs: [],
    runLog: [],
  });

  expect(result).toHaveLength(15);
  expect(result.some((step) => step.id === "draft_prd")).toBe(true);
  expect(result.some((step) => step.id === "next_cycle")).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/lib/map-artifacts-to-stages.test.ts`
Expected: FAIL because the mapper does not exist yet.

**Step 3: Implement the normalization pipeline**

The build script should:

- read `examples/example-task/status.md`
- read `examples/example-task/system/state.json`
- read `examples/example-task/system/run-log.jsonl`
- read `examples/example-task/handoffs/*.md`
- read `examples/example-task/handoffs/21-user-flow.yaml`
- read `examples/example-task/handoffs/32-execution-workflow.yaml`
- emit a typed JSON snapshot at `frontend/src/data/example-task.json`

The mapper should:

- preserve 15 canonical stages
- attach actor, status, artifact refs, and evidence
- label missing direct artifacts with canonical meaning plus nearest evidence

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/lib/map-artifacts-to-stages.test.ts`
Expected: PASS.

**Step 5: Run the build-data script**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm run build:data`
Expected: `src/data/example-task.json` is generated or refreshed successfully.

**Step 6: Commit**

```bash
git add frontend/scripts frontend/src/types frontend/src/data frontend/src/lib
git commit -m "feat: add normalized example task dataset"
```

### Task 3: Build the top summary bar and app state container

**Files:**
- Modify: `frontend/src/app.tsx`
- Create: `frontend/src/components/summary-bar.tsx`
- Create: `frontend/src/state/use-replay-state.ts`
- Test: `frontend/src/components/summary-bar.test.tsx`

**Step 1: Write the failing summary bar test**

Create:
- `frontend/src/components/summary-bar.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { SummaryBar } from "./summary-bar";

test("renders current stage, actor, and status", () => {
  render(
    <SummaryBar
      taskId="TASK-1"
      workflowName="Example"
      status="done"
      currentStage="next_cycle"
      currentActor="human"
      round={2}
    />
  );

  expect(screen.getByText(/task-1/i)).toBeInTheDocument();
  expect(screen.getByText(/human/i)).toBeInTheDocument();
  expect(screen.getByText(/next_cycle/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/summary-bar.test.tsx`
Expected: FAIL because the component does not exist yet.

**Step 3: Implement replay selection state and summary bar**

State should track:

- selected workflow node
- selected timeline event
- selected artifact tab
- current replay snapshot

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/summary-bar.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/app.tsx frontend/src/components/summary-bar.tsx frontend/src/state/use-replay-state.ts frontend/src/components/summary-bar.test.tsx
git commit -m "feat: add workflow summary bar and replay state"
```

### Task 4: Build the 15-stage workflow graph

**Files:**
- Create: `frontend/src/components/workflow-graph.tsx`
- Create: `frontend/src/components/workflow-node.tsx`
- Create: `frontend/src/lib/get-node-visual-state.ts`
- Test: `frontend/src/components/workflow-graph.test.tsx`

**Step 1: Write the failing graph test**

Create:
- `frontend/src/components/workflow-graph.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { WorkflowGraph } from "./workflow-graph";

test("renders all canonical workflow stages", () => {
  render(<WorkflowGraph steps={[]} selectedStepId="clarify_objective" onSelect={() => {}} />);
  expect(screen.getByText(/clarify objective/i)).toBeInTheDocument();
  expect(screen.getByText(/draft prd/i)).toBeInTheDocument();
  expect(screen.getByText(/reflect and define the next cycle/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/workflow-graph.test.tsx`
Expected: FAIL because graph components do not exist yet.

**Step 3: Implement the graph**

Requirements:

- render all 15 stages
- show actor on each node
- show visual status
- highlight selected node
- prefer readability over fancy edges

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/workflow-graph.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/workflow-graph.tsx frontend/src/components/workflow-node.tsx frontend/src/lib/get-node-visual-state.ts frontend/src/components/workflow-graph.test.tsx
git commit -m "feat: add canonical workflow graph"
```

### Task 5: Build the step detail panel

**Files:**
- Create: `frontend/src/components/step-detail-panel.tsx`
- Create: `frontend/src/components/metadata-list.tsx`
- Test: `frontend/src/components/step-detail-panel.test.tsx`

**Step 1: Write the failing detail panel test**

Create:
- `frontend/src/components/step-detail-panel.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { StepDetailPanel } from "./step-detail-panel";

test("shows actor, step type, inputs, outputs, and next step", () => {
  render(
    <StepDetailPanel
      step={{
        id: "draft_prd",
        title: "Draft PRD",
        actor: "codex",
        stepType: "llm",
        purpose: "Draft the PRD",
        inputs: ["handoffs/00-intake.md"],
        outputs: ["handoffs/10-prd.md"],
        validation: ["required sections"],
        failure: ["retry_once"],
        next: ["prd_reality_review"],
      }}
    />
  );

  expect(screen.getByText(/codex/i)).toBeInTheDocument();
  expect(screen.getByText(/handoffs\\/10-prd.md/i)).toBeInTheDocument();
  expect(screen.getByText(/prd_reality_review/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/step-detail-panel.test.tsx`
Expected: FAIL because the component does not exist yet.

**Step 3: Implement the detail panel**

It should explain the selected step clearly enough that the operator does not need to inspect raw files first.

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/step-detail-panel.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/step-detail-panel.tsx frontend/src/components/metadata-list.tsx frontend/src/components/step-detail-panel.test.tsx
git commit -m "feat: add step detail panel"
```

### Task 6: Build the artifact preview panel

**Files:**
- Create: `frontend/src/components/artifact-preview-panel.tsx`
- Create: `frontend/src/components/artifact-tabs.tsx`
- Create: `frontend/src/lib/render-artifact-content.ts`
- Test: `frontend/src/components/artifact-preview-panel.test.tsx`

**Step 1: Write the failing artifact preview test**

Create:
- `frontend/src/components/artifact-preview-panel.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { ArtifactPreviewPanel } from "./artifact-preview-panel";

test("switches between artifact and state views", () => {
  render(
    <ArtifactPreviewPanel
      tabs={["Artifact", "State"]}
      activeTab="Artifact"
      onChangeTab={() => {}}
      artifactTitle="handoffs/20-user-flow.md"
      content="# User Flow"
    />
  );

  expect(screen.getByText(/handoffs\\/20-user-flow.md/i)).toBeInTheDocument();
  expect(screen.getByText(/# User Flow/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/artifact-preview-panel.test.tsx`
Expected: FAIL because the component does not exist yet.

**Step 3: Implement artifact preview tabs**

Required tabs:

- `Artifact`
- `Schema`
- `State`
- `Event`

**Step 4: Run test to verify it passes**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/artifact-preview-panel.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/artifact-preview-panel.tsx frontend/src/components/artifact-tabs.tsx frontend/src/lib/render-artifact-content.ts frontend/src/components/artifact-preview-panel.test.tsx
git commit -m "feat: add artifact preview panel"
```

### Task 7: Build the manual replay timeline

**Files:**
- Create: `frontend/src/components/replay-timeline.tsx`
- Create: `frontend/src/lib/map-run-log-to-events.ts`
- Create: `frontend/src/lib/build-replay-snapshots.ts`
- Test: `frontend/src/components/replay-timeline.test.tsx`
- Test: `frontend/src/lib/build-replay-snapshots.test.ts`

**Step 1: Write the failing replay snapshot test**

Create:
- `frontend/src/lib/build-replay-snapshots.test.ts`

```ts
import { buildReplaySnapshots } from "./build-replay-snapshots";

test("creates replayable snapshots from run log events", () => {
  const snapshots = buildReplaySnapshots([
    { event: "task_created", timestamp: "2026-03-15T10:00:00Z" },
    { event: "prd_completed", timestamp: "2026-03-15T10:10:00Z" },
  ]);

  expect(snapshots.length).toBe(2);
  expect(snapshots[1].timestamp).toBe("2026-03-15T10:10:00Z");
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/lib/build-replay-snapshots.test.ts`
Expected: FAIL because replay helpers do not exist yet.

**Step 3: Implement the replay model**

Requirements:

- clicking a timeline event updates selected state
- summary bar, graph, detail panel, and artifact panel all update together
- event order is chronological and stable

**Step 4: Add the timeline UI**

Create:
- `frontend/src/components/replay-timeline.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { ReplayTimeline } from "./replay-timeline";

test("renders replay events", () => {
  render(
    <ReplayTimeline
      events={[{ id: "1", timestamp: "10:00", label: "task_created", actor: "human" }]}
      selectedEventId="1"
      onSelect={() => {}}
    />
  );

  expect(screen.getByText(/task_created/i)).toBeInTheDocument();
});
```

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand src/components/replay-timeline.test.tsx`
Expected: FAIL first, then PASS after implementation.

**Step 5: Commit**

```bash
git add frontend/src/components/replay-timeline.tsx frontend/src/lib/map-run-log-to-events.ts frontend/src/lib/build-replay-snapshots.ts frontend/src/components/replay-timeline.test.tsx frontend/src/lib/build-replay-snapshots.test.ts
git commit -m "feat: add manual replay timeline"
```

### Task 8: Compose the cockpit screen and polish layout

**Files:**
- Modify: `frontend/src/app.tsx`
- Create: `frontend/src/components/panel-shell.tsx`
- Create: `frontend/src/components/status-badge.tsx`
- Create: `frontend/src/components/empty-evidence-state.tsx`

**Step 1: Integrate all major panels into the main app**

The first viewport should show:

- summary bar
- workflow graph
- step detail
- artifact preview
- timeline

**Step 2: Handle missing direct artifacts gracefully**

When a canonical stage lacks an exact artifact:

- show canonical description
- show nearest supporting evidence
- do not leave blank UI

**Step 3: Run the app locally**

Run: `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm run dev`
Expected: the cockpit loads without runtime errors.

**Step 4: Commit**

```bash
git add frontend/src/app.tsx frontend/src/components/panel-shell.tsx frontend/src/components/status-badge.tsx frontend/src/components/empty-evidence-state.tsx
git commit -m "feat: compose workflow replay cockpit"
```

### Task 9: Final verification and docs

**Files:**
- Create: `frontend/README.md`
- Modify: `README.md`

**Step 1: Document how to run the prototype**

Include:

- install command
- build data command
- test command
- dev server command

**Step 2: Run full verification**

Run:

- `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm test -- --runInBand`
- `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm run build:data`
- `cd /Users/wendy/work/dev-co/doc-driven-dev-workflow/frontend && npm run build`

Expected:

- tests pass
- normalized dataset builds successfully
- production build completes successfully

**Step 3: Commit**

```bash
git add frontend/README.md README.md
git commit -m "docs: add workflow driven developer frontend usage"
```

## Manual QA Checklist

- On page load, the full 15-stage workflow is visible
- Current stage and actor are understandable without opening files
- Clicking a node updates the detail panel
- Clicking a timeline event updates the whole page state
- Artifact tabs switch correctly
- Missing direct artifacts still show useful evidence
- The interface feels like an operator cockpit, not a generic admin dashboard

## Deferred for V2

- live file watching
- real task directories instead of example task only
- multi-task switching
- gate status computation from live state transitions
- UI-triggered approvals or next-step actions
- artifact diffs between replay points
