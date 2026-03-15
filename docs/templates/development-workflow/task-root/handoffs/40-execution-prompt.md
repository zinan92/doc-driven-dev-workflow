---
task_id: "{{TASK_ID}}"
author: codex
role: planner
stage: execution_prompt
status: completed
next_actor: claude_code
---

# Execution Prompt for Claude Code

## Repository

- Repo path: `{{REPO_PATH}}`
- Working branch or worktree: `{{WORK_BRANCH}}`

## Source of Truth

- PRD: `handoffs/10-prd.md`
- User flow: `handoffs/20-user-flow.md`
- User flow YAML: `handoffs/21-user-flow.yaml`
- Approved plan: `handoffs/30-implementation-plan.md`
- Reviewed plan: `handoffs/35-plan-review.md`

## Execution Rules

- Follow the implementation plan in order.
- Do not expand scope without explicit approval.
- Stop if required inputs are missing.
- Report each batch in a new handoff document.
- Prefer scripts for verification and reporting where possible.

## Stop Conditions

- Missing source-of-truth document
- Validation failure that cannot be resolved
- Secret, private key, or destructive operation required
- Human approval gate triggered

## Required Report Format

Each batch report must include:

- Tasks Completed
- Files Changed
- Tests Run
- Result
- Next Proposed Batch

## Forbidden Behavior

- Do not rewrite the PRD.
- Do not rewrite the approved user flow.
- Do not skip required verification.
- Do not silently change architecture.
