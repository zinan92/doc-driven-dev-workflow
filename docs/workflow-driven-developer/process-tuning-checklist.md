# Process Tuning Checklist

Use this checklist when tightening the Doc-Driven Development Workflow after a real task run.

## Highest Priority

- [x] Stage 0 clarification must be a distinct interaction and cannot be silently skipped
- [x] Runner must advance only one canonical stage per cycle
- [x] Human approval gate must move machine state to `waiting` and stop execution
- [x] `next-step` helper must respect `waiting` and `blocked` task states

## Medium Priority

- [x] Approval artifact semantics must be explicit: request first, human decision later
- [x] Structured `user-flow.yaml` must require `failure` on every step
- [x] Recommended stage skills must be used or explicitly skipped with justification

## Logging Discipline

- [x] Use canonical workflow event names only
- [x] Emit `stage_entered` when a stage begins
- [x] Emit `stage_waiting` instead of ad hoc gate event names
- [x] Keep `artifact_written` and `stage_completed` append-only

## Goal

After these checks are in place, a fresh run should be:

- easier to observe
- easier to stop at the right gate
- less likely to self-infer missing human intent
