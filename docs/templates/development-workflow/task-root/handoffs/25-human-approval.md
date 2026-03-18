---
task_id: "{{TASK_ID}}"
author: codex
role: planner
gate: prd_user_flow
status: pending
next_actor: human
---

# Human Approval Request

## Decision

`pending`

## Notes

Review the PRD and user flow artifacts, then replace this pending request with the human decision.

## Constraints

- Do not proceed past this gate without explicit human approval.
- Update frontmatter and decision content when the human responds.
