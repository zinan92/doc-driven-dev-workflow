---
task_id: "WDD-V1-EXAMPLE-REPLAY"
author: codex
role: planner
stage: user_flow
status: draft
next_actor: human
---

# User Flow: Workflow Replay Cockpit

## User

A workflow operator who wants to understand a doc-driven task without manually reading multiple files across the task directory.

## Entry Point

The operator opens the Workflow Driven Developer front-end with the example task preloaded.

## Flow Summary

The operator first sees the full workflow graph, identifies the current stage, then clicks either a workflow node or a timeline event to inspect what happened at that moment, including actor, inputs, outputs, and artifact content.

## Steps

1. The operator lands on the cockpit and immediately sees the full canonical workflow.
2. The interface highlights the task's current or selected stage.
3. The operator reads the summary bar to understand the current stage, actor, and task status.
4. The operator clicks a workflow node to inspect that step in detail.
5. The detail panel updates to show purpose, actor, inputs, outputs, validation, and next step.
6. The artifact panel shows the relevant markdown, YAML, or state snapshot for the selected step.
7. The operator clicks an event in the replay timeline to move to a historical point in the workflow.
8. The graph, summary bar, detail panel, and artifact preview all update to match that point in time.

## System Responses

- On load, the system renders the full 15-stage workflow and the current task summary.
- On node selection, the system updates the detail panel and artifact preview.
- On timeline selection, the system reconstructs the workflow state for the selected event.
- If a stage has no direct artifact, the system still shows its canonical meaning and nearest available linked evidence.

## Completion Condition

The operator can understand where the example task is or was, who acted there, and what artifacts define that step, without opening the filesystem manually.

## Open Questions

- Should the first version show exact file paths on every detail view, or keep paths partially abbreviated for readability?
- Should the graph use a strict left-to-right pipeline layout or a wrapped multi-row layout for better screen fit?
