---
task_id: "TASK-2026-03-15-medium-feed-workbench"
author: codex
role: planner
stage: next_cycle
status: draft
next_actor: human
---

# Next Cycle

## Architectural Debt

- The example still treats the phase gate as a lightweight document rather than a richer contract artifact
- Cross-phase schema evolution is only lightly represented

## Deferred Work

- Add a dedicated phase-gate handoff template
- Add a validator check for phase-gate evidence in medium tasks

## Product Polish Opportunities

- Add diagrams for backend-to-UI dependency flow
- Add one example with a stop-and-rethink gate decision

## Next Spec Candidate

Create a medium-to-large example that shows a failed phase gate, a rethink decision, and a resumed implementation cycle.
