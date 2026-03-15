---
task_id: "TASK-2026-03-15-example-greeter"
author: codex
role: planner
stage: prd
status: draft
next_actor: codex
---

# PRD: Example Greeter CLI

## Purpose

Provide a minimal example feature that demonstrates the workflow from PRD through final revision.

## Problem

The repo needs a simple, low-risk example task that shows what a finished document-driven task looks like.

## Goals

- Implement a command that prints a greeting for a user-supplied name.
- Keep the feature small enough to demonstrate the workflow clearly.

## Non-Goals

- Full CLI framework integration
- Persistent configuration

## User Value

A user can verify the workflow with a trivial but complete feature.

## Scope

One command, one helper function, and unit tests.

## Expected Behavior

- Running the command with a name prints `Hello, <name>!`
- Running without a name prints a default greeting

## Contracts

- Greeting output is deterministic
- Tests cover both named and default usage

## Acceptance Criteria

- Greeting function exists
- CLI path exists
- Unit tests pass

## Constraints

- Python only
- Keep the file footprint small

## Terminology

- greeting command: the user-facing CLI entry point
- greeter function: the underlying formatter
