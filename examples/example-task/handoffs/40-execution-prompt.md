---
task_id: "TASK-2026-03-15-example-greeter"
author: codex
role: planner
stage: execution_prompt
status: completed
next_actor: claude_code
---

# Execution Prompt for Claude Code

## Repository

- Repo path: `/path/to/example-repo`
- Working branch or worktree: `task/example-greeter`

## Source of Truth

- PRD: `handoffs/10-prd.md`
- User flow: `handoffs/20-user-flow.md`
- User flow YAML: `handoffs/21-user-flow.yaml`
- Approved plan: `handoffs/30-implementation-plan.md`
- Reviewed plan: `handoffs/35-plan-review.md`

## Execution Rules

- Follow the implementation plan in order
- Do not expand scope
- Stop if required inputs are missing
- Write a batch report after each meaningful step

## Stop Conditions

- Missing source-of-truth document
- Destructive or risky action required
- Validation failure that cannot be resolved

## Required Report Format

- Tasks Completed
- Files Changed
- Tests Run
- Result
- Next Proposed Batch

## Forbidden Behavior

- Do not rewrite the PRD
- Do not rewrite the approved user flow
- Do not silently change architecture
