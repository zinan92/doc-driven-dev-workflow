# Workflow Driven Developer Front-End PRD

**Version:** 0.1  
**Date:** 2026-03-18  
**Status:** Draft

---

## 1. Purpose

`Workflow Driven Developer` is a visual operator cockpit for `Doc-Driven Development Workflow`.

Its first goal is not execution control. Its first goal is visibility.

For V1, the product should let a workflow operator open a single example task and understand within 10 seconds:

- where the workflow currently is
- who is acting at that stage
- what this stage is doing
- what artifacts this stage consumes and produces
- what happened before and what comes next

---

## 2. Product Thesis

`Doc-Driven Development Workflow` is currently legible only if the operator reads files across `handoffs/`, `status.md`, `state.json`, and `run-log.jsonl`.

This creates a black-box feeling even though the workflow is actually structured.

`Workflow Driven Developer` turns that hidden structure into a visible, replayable, stage-by-stage interface.

---

## 3. V1 Scope

V1 is a:

- single-task viewer
- read-only observer
- manual timeline replay tool
- visualization layer over the existing example task artifacts

V1 is not:

- a multi-task dashboard
- an approval interface
- a workflow editor
- a workflow executor
- a live terminal replacement

---

## 4. Primary User

### Workflow Operator

The first user is the workflow operator who owns the process and needs immediate situational awareness without opening the filesystem manually.

---

## 5. Success Criteria

The product is successful if the operator can:

1. identify the current stage in under 10 seconds
2. identify the current actor in under 10 seconds
3. identify the selected step's inputs and outputs in under 15 seconds
4. understand whether the workflow is running, waiting, blocked, or done in under 10 seconds
5. click a past event and see the interface update to the corresponding historical state

---

## 6. Source of Truth

V1 should render only from the existing example task artifacts.

Primary files:

- `examples/example-task/status.md`
- `examples/example-task/system/state.json`
- `examples/example-task/system/run-log.jsonl`
- `examples/example-task/handoffs/*.md`
- `examples/example-task/handoffs/21-user-flow.yaml`
- `examples/example-task/handoffs/32-execution-workflow.yaml`

Reference files:

- `docs/development-workflow.md`
- `docs/templates/development-workflow/task-root/...`

---

## 7. Core UX Model

The UI should feel like a `workflow mission control`, not a document site.

The user journey is:

1. open the page
2. immediately see the full canonical workflow
3. identify the highlighted stage and current actor
4. click a node or timeline event
5. inspect the selected step's inputs, outputs, validation, and artifact preview

---

## 8. Information Architecture

### Screen 1: Workflow Replay Cockpit

This is the main and only required V1 screen.

It contains five regions:

1. `Top Summary Bar`
2. `Workflow Graph`
3. `Step Detail Panel`
4. `Artifact Preview Panel`
5. `Replay Timeline`

---

## 9. Layout Specification

### 9.1 Top Summary Bar

Must show:

- task id
- workflow name
- overall status
- current stage
- current actor
- current round / batch

Optional:

- last artifact
- stop reason

### 9.2 Workflow Graph

This is the first visual priority on page load.

Requirements:

- show all 22 canonical stages across the 5 canonical phases
- show stage status
- show actor on each node
- show phase grouping or labeling
- highlight selected node
- visually distinguish:
  - completed
  - current
  - pending
  - blocked
  - waiting on human gate

The graph should prioritize readability over diagrammatic complexity.

### 9.3 Step Detail Panel

When a node is selected, show:

- step name
- stage id / canonical stage
- actor
- phase
- step type: `ai_routing`, `script`, or `human_approval_gate`
- purpose
- output summary
- recommended skills
- input artifacts
- output artifacts
- validation contract
- failure contract
- next step

### 9.4 Artifact Preview Panel

Should support tabs:

- `Artifact`
- `Schema`
- `State`
- `Event`

Examples:

- markdown handoff preview
- YAML workflow step schema
- `state.json` snapshot
- event details from `run-log.jsonl`

### 9.5 Replay Timeline

This is manual replay, not autoplay.

Requirements:

- render a chronological event list
- clicking an event updates the selected workflow state
- timeline selection updates:
  - workflow highlight
  - summary bar
  - detail panel
  - artifact preview

---

## 10. Canonical Stages to Render

The graph should render the full canonical lifecycle as explicit nodes:

1. Clarify Objective
2. Classify Task and Estimate Size
3. Run Product Research
4. Collect Reference Evidence
5. Research Approval Gate
6. Draft PRD
7. Review PRD Against Reality
8. Draft User Flow
9. Draft Prototype Brief
10. Design Approval Gate
11. Draft Implementation Plan
12. Review Implementation Plan
13. Write Execution Prompt
14. Claude Code Executes in Batches
15. Codex Reviews Each Batch
16. Gate Each Major Phase
17. Final Revision
18. Integrate and Verify
19. Prepare Release Package
20. Delivery Approval Gate
21. Capture Next Cycle
22. Update Backlog and Debt

For the example task, some nodes may map to simplified or collapsed real artifacts. The UI should still preserve the full canonical shape.

---

## 11. State Model

### Node Status

Each workflow node should be one of:

- `not_reached`
- `selected`
- `completed`
- `waiting`
- `blocked`

### Task Status

Task-level states should map from `system/state.json`:

- `active`
- `done`
- `blocked`

### Actor Types

- `human`
- `codex`
- `claude_code`

---

## 12. Visual Direction

### Tone

- operator-focused
- technical
- calm
- credible
- high signal

### Style

- dark interface
- dense but not cluttered
- clear system colors
- code/document preview in monospace
- graph and timeline feel closer to CI pipelines or mission control than SaaS CRUD

### Color Semantics

- gray: not reached
- cyan: selected / active focus
- green: completed
- amber: waiting on gate
- red: blocked / error

---

## 13. Functional Requirements

### FR1

The page must load the example task from local structured artifacts.

### FR2

The page must render the complete canonical workflow as a graph.

### FR3

The page must highlight the current or selected step.

### FR4

The page must show actor and status for every step.

### FR5

The page must let the user click a workflow node to inspect details.

### FR6

The page must let the user click a timeline event to replay a historical state.

### FR7

The page must preview the selected artifact content.

### FR8

The page must display structured input/output references for the selected step.

---

## 14. Non-Functional Requirements

- first screen should be understandable without scrolling
- visual hierarchy must favor workflow visibility over raw documents
- desktop is the primary target for V1
- mobile responsiveness is desirable but secondary
- data loading can be static or mock-parsed for V1 as long as the structure is faithful

---

## 15. Non-Goals for V1

- live file watching
- concurrent tasks
- mutation from UI
- approvals from UI
- triggering Codex or Claude Code from UI
- editing artifacts in place
- multi-user collaboration

---

## 16. Future Direction

### V2

- live file watching over a real task directory
- gate state badges
- richer event schema
- diff previews between artifacts

### V3

- visual-first workflow control
- gate actions from UI
- task switching
- workflow analytics

---

## 17. Final Product Statement

V1 should feel like:

**“An interactive replay cockpit that makes Doc-Driven Development Workflow visible at a glance.”**
