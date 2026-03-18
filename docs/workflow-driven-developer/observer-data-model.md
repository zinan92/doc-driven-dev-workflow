# Workflow Observer Data Model

**Version:** 0.1  
**Date:** 2026-03-18  
**Status:** Draft

---

## 1. Principle

Keep the observer local-first and simple.

- `state.json` = current truth
- `run-log.jsonl` = history
- `handoffs/*.md` = evidence
- `status.md` = human-readable summary

Do not put full observer summary into `state.json` in V1.

---

## 2. `state.json` v1 Minimal Schema

```json
{
  "task_id": "TASK-2026-03-18-example",
  "status": "active",
  "current_phase": "document_authoring",
  "current_stage": "draft_user_flow",
  "current_actor": "codex",
  "round": 1,
  "updated_at": "2026-03-18T11:20:00Z",
  "last_artifact": "handoffs/20-user-flow.md",
  "stop_reason": null
}
```

### Field Definitions

- `task_id`: unique task identifier
- `status`: current task status
- `current_phase`: current phase bucket for the dashboard
- `current_stage`: current canonical workflow stage id
- `current_actor`: who is currently responsible
- `round`: current batch / review round
- `updated_at`: latest state update timestamp in ISO8601
- `last_artifact`: most recent important artifact path
- `stop_reason`: nullable reason for waiting or blocked state

### Allowed Enums

```ts
type TaskStatus = "active" | "waiting" | "blocked" | "done";

type WorkflowPhase =
  | "intention_framing"
  | "document_authoring"
  | "code_execution"
  | "integration_cleanup";

type WorkflowActor =
  | "human"
  | "codex"
  | "claude_code"
  | "openclaw";
```

---

## 3. Canonical Stage to Phase Mapping

```yaml
intention_framing:
  - clarify_objective
  - classify_task

document_authoring:
  - draft_prd
  - prd_reality_review
  - draft_user_flow
  - human_approval_gate
  - draft_implementation_plan
  - review_implementation_plan
  - write_execution_prompt

code_execution:
  - claude_code_batch_execution
  - codex_reviews_batch
  - gate_major_phase
  - final_revision

integration_cleanup:
  - integrate_merge_cleanup
  - next_cycle
```

### Canonical Stage Order

```yaml
1: clarify_objective
2: classify_task
3: draft_prd
4: prd_reality_review
5: draft_user_flow
6: human_approval_gate
7: draft_implementation_plan
8: review_implementation_plan
9: write_execution_prompt
10: claude_code_batch_execution
11: codex_reviews_batch
12: gate_major_phase
13: final_revision
14: integrate_merge_cleanup
15: next_cycle
```

---

## 4. `run-log.jsonl` v1 Minimal Event Schema

Each line is a single JSON object.

```json
{"timestamp":"2026-03-18T11:00:00Z","event":"stage_entered","task_id":"TASK-2026-03-18-example","phase":"document_authoring","stage":"draft_prd","actor":"codex","artifact":null,"status":"active","round":1}
{"timestamp":"2026-03-18T11:05:00Z","event":"artifact_written","task_id":"TASK-2026-03-18-example","phase":"document_authoring","stage":"draft_prd","actor":"codex","artifact":"handoffs/10-prd.md","status":"active","round":1}
{"timestamp":"2026-03-18T11:15:00Z","event":"stage_completed","task_id":"TASK-2026-03-18-example","phase":"document_authoring","stage":"draft_prd","actor":"codex","artifact":"handoffs/10-prd.md","status":"active","round":1}
```

### Event Fields

- `timestamp`: ISO8601 event time
- `event`: event type
- `task_id`: task id
- `phase`: current phase at event time
- `stage`: current stage at event time
- `actor`: actor responsible for the event
- `artifact`: nullable related artifact path
- `status`: task status at event time
- `round`: current round / batch

### Allowed Event Types

```ts
type WorkflowEvent =
  | "task_created"
  | "stage_entered"
  | "artifact_written"
  | "stage_completed"
  | "stage_blocked"
  | "stage_waiting"
  | "review_decision"
  | "task_completed";
```

---

## 5. Recommended Logging Rules

- Write `task_created` once at task initialization
- Write `stage_entered` every time `current_stage` changes
- Write `artifact_written` when a key handoff becomes available
- Write `stage_completed` when a stage is done
- Write `stage_waiting` when paused for approval or external dependency
- Write `stage_blocked` when progress cannot continue
- Write `review_decision` when a review gate returns `proceed`, `fix_before_proceeding`, or `stop_and_rethink`
- Write `task_completed` once when the task is done

---

## 6. Dashboard Read Model

For V1 observer:

- Read `state.json` for current state
- Read `run-log.jsonl` for replay and timeline
- Read `handoffs/*.md` for step-level inputs, outputs, and evidence

Do not require the dashboard to infer the whole world from markdown alone.

---

## 7. What Stays Out of `state.json`

Do not store these in V1:

- `completed_stages`
- `pending_stages`
- `next_expected_stage`
- `current_goal`
- `active_artifacts`
- UI layout state
- selected tabs
- colors
- panel state

These can be derived by the observer for now.
