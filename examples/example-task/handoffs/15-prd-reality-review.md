---
task_id: "TASK-2026-03-15-example-greeter"
author: codex
role: reviewer
stage: prd_reality_review
inputs:
  - handoffs/10-prd.md
status: completed
next_actor: codex
---

# PRD Reality Review

## Baseline Checked

- Repo path: `/path/to/example-repo`
- Environment or service checked: `local python project layout`

## Findings

- The repo already uses Python entry scripts
- Unit tests are the right verification layer for this example

## Resolved Contradictions

- No conflict between the PRD and the baseline
- No missing dependency assumptions remain

## Required PRD Corrections

- Clarify that default greeting behavior is required
- Clarify that tests should cover CLI and helper behavior

## Approved Baseline Assumptions

- Python is available
- Unit tests can be run locally
