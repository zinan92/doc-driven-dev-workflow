---
task_id: "TASK-2026-03-15-medium-feed-workbench"
author: codex
role: planner
stage: execution_prompt
status: completed
next_actor: claude_code
---

# Execution Prompt for Claude Code

## Repository

- Repo path: `/path/to/feed-workbench-repo`
- Working branch or worktree: `task/medium-feed-workbench`

## Source of Truth

- PRD: `handoffs/10-prd.md`
- User flow: `handoffs/20-user-flow.md`
- User flow YAML: `handoffs/21-user-flow.yaml`
- Approved plan: `handoffs/30-implementation-plan.md`
- Reviewed plan: `handoffs/35-plan-review.md`

## Execution Rules

- Complete backend work first
- Do not begin UI work before the backend phase gate is approved
- Write a new handoff after each batch
- Stop if required inputs are missing

## Stop Conditions

- Missing source-of-truth document
- Backend gate not approved
- Risky action requiring human approval
- Validation failure that cannot be resolved

## Required Report Format

- Tasks Completed
- Files Changed
- Tests Run
- Result
- Next Proposed Batch

## Forbidden Behavior

- Do not skip phase gates
- Do not rewrite the approved user flow
- Do not invent UI fields not present in the verified backend contract
