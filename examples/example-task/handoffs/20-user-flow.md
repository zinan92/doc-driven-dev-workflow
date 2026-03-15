---
task_id: "TASK-2026-03-15-example-greeter"
author: codex
role: planner
stage: user_flow
status: draft
next_actor: human
---

# User Flow: Example Greeter CLI

## User

A terminal user validating the workflow with a minimal feature.

## Entry Point

The user runs the greeter command from the shell.

## Flow Summary

The user executes the command, optionally provides a name, and receives a greeting immediately.

## Steps

1. User runs the greeter command
2. User optionally provides a name argument
3. System prints the greeting

## System Responses

- If a name is provided, return a personalized greeting
- If no name is provided, return a default greeting

## Completion Condition

The user sees a correct greeting and the command exits successfully.

## Open Questions

- None
