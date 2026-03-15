# Doc-Driven Development Workflow

Terminal-first workflow for individual developers who use `Codex` as planner/reviewer and `Claude Code` as coder.

This repo is designed for both:

- humans who want a disciplined way to manage coding agents
- agents that need a stable, document-based execution protocol

## For Humans

Use this repo if you want to:

- turn vague intent into a PRD before coding
- require implementation plans before execution
- keep review as a control loop, not an end-of-project ritual
- preserve all handoffs as durable documents instead of chat history
- run the workflow from raw terminal sessions without a heavy orchestrator

This repo is not for:

- teams that need a web dashboard first
- users who want one-shot prompting with no planning or review gates
- users who need built-in CI or PR automation on day one

## For Agents

If you are an agent, start here:

1. Read [docs/development-workflow.md](docs/development-workflow.md) before taking action.
2. Treat that file as the canonical workflow instruction.
3. Treat generated task directories as live execution state.
4. Treat `handoffs/` as append-only.
5. Prefer scripts for deterministic steps.
6. Do not cross approval gates without explicit approval artifacts.

## Why This Exists

Direct prompting collapses planning, implementation, and review into one loop. That usually creates drift.

This repo separates:

- what must be true: PRD and user flow
- how work should proceed: implementation plan
- how execution is controlled: reviews, phase gates, and final integration

The result is a workflow that is slower than impulsive prompting but much more reliable.

## Quickstart

### 1. Read the canonical workflow

Start with [docs/development-workflow.md](docs/development-workflow.md).

### 2. Scaffold a task

```bash
python3 scripts/scaffold_dev_workflow_task.py \
  --name "My First Task" \
  --repo-path /path/to/my/repo
```

This creates a new task directory under `tasks/`.

### 3. Fill the intake

Edit:

- `tasks/<task-id>/handoffs/00-intake.md`

### 4. Validate the task structure

```bash
python3 scripts/validate_dev_workflow_task.py tasks/<task-id>
python3 scripts/dev_workflow_next_step.py tasks/<task-id>
```

### 5. Give the workflow and task to Codex

Give your agent:

- [docs/development-workflow.md](docs/development-workflow.md)
- [examples/example-task/README.md](examples/example-task/README.md)
- [examples/medium-example-task/README.md](examples/medium-example-task/README.md)
- your new task directory

Codex should then:

- classify the task
- estimate scope
- write the PRD
- review the PRD against reality
- draft the user flow
- wait for human approval
- write the implementation plan
- write the execution prompt

### 6. Give the execution prompt to Claude Code

After approval and planning, Claude Code implements according to the execution prompt and writes batch reports back into the task directory.

### 7. Run the review loop

Codex reviews each batch or review round and decides:

- `proceed`
- `fix_before_proceeding`
- `stop_and_rethink`

## How The Workflow Works

High-level lifecycle:

1. clarify objective
2. classify task and estimate size
3. draft PRD
4. review PRD against reality
5. draft user flow
6. human approval gate
7. draft implementation plan
8. review implementation plan
9. write execution prompt
10. execute in batches
11. review each batch
12. gate each major phase
13. final revision
14. integrate and clean up
15. define the next cycle

Default role mapping:

- `human`: owns goals, tradeoffs, and approvals
- `Codex`: planner, spec writer, reviewer, process controller
- `Claude Code`: implementation executor

## Repository Structure

```text
README.md
docs/
  development-workflow.md
  plans/
  templates/development-workflow/
examples/
  example-task/
scripts/
  scaffold_dev_workflow_task.py
  validate_dev_workflow_task.py
  dev_workflow_next_step.py
tests/
```

Key files:

- [docs/development-workflow.md](docs/development-workflow.md): canonical workflow instruction
- [docs/templates/development-workflow/README.md](docs/templates/development-workflow/README.md): task template entry
- [scripts/scaffold_dev_workflow_task.py](scripts/scaffold_dev_workflow_task.py): create a new task directory
- [scripts/validate_dev_workflow_task.py](scripts/validate_dev_workflow_task.py): validate a task directory
- [scripts/dev_workflow_next_step.py](scripts/dev_workflow_next_step.py): suggest the next action for a task
- [examples/example-task/README.md](examples/example-task/README.md): small-task reference
- [examples/medium-example-task/README.md](examples/medium-example-task/README.md): medium-task reference with phased work

## Core Concepts

### Doc-Driven

Documents are the collaboration surface. Chat is not the source of truth.

### Terminal-First

The workflow assumes raw terminal sessions, not a visual control plane.

### Script First

Use scripts whenever a step can be deterministic and cheap.

### Bounded Review

Review is part of execution control, not just final inspection.

### Append-Only Handoffs

Every transition should create a new artifact instead of rewriting history.

## Current Scope

Current v1 assumptions:

- primary audience is individual developers
- default role mapping is `Codex + Claude Code`
- workflow is terminal-first and repo-local
- templates and scaffolder are included

Not included yet:

- package installation flow
- CI integration
- automatic PR creation
- multi-agent parallel orchestration
- web UI

## Status

This repo is currently being productized into a public workflow repo.

The current stable entry points are:

- [README.md](README.md)
- [docs/development-workflow.md](docs/development-workflow.md)
- [scripts/scaffold_dev_workflow_task.py](scripts/scaffold_dev_workflow_task.py)
