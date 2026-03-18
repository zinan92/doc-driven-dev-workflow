# Doc-Driven Development Workflow — Agent Instructions

## BEFORE ANYTHING ELSE

1. Read `docs/workflow-driven-developer/agent-runner-prompt.md` — this is your operating manual.
2. Read `docs/development-workflow.md` — this defines the 15-stage canonical workflow.
3. Start the Workflow Observer Dashboard so the human can watch your progress:
   ```bash
   cd frontend && npm install && npm run build:data && npm run dev &
   ```
4. Confirm the dashboard is running at http://localhost:5173 before proceeding.

## FINDING THE ACTIVE TASK

```bash
# List all tasks and their status
ls tasks/
# Find the active task (status != "done")
python3 -c "import json, pathlib; [print(p.name, json.loads((p/'system/state.json').read_text())['status']) for p in pathlib.Path('tasks').iterdir() if p.is_dir() and (p/'system/state.json').exists()]"
```

If no active task exists, scaffold one:
```bash
python3 scripts/scaffold_dev_workflow_task.py --name "Feature Name" --repo-path /path/to/repo
```

## ENFORCEMENT RULES

All state transitions go through `scripts/update_task_state.py`, which enforces:

- **Stage ordering**: You cannot skip stages. Each stage defines allowed `next` stages in `docs/canonical-workflow.json`.
- **Actor ownership**: Each stage has a designated `actor`. You cannot execute a stage owned by a different actor.
- **Prerequisites**: Required input files must exist and not be unfilled templates.
- **Human gates**: `handoffs/25-human-approval.md` must have `author: human` and `status: approved` before implementation planning.
- **Round limits**: Small tasks allow 2 review rounds max. Do not create unbounded loops.
- **Event consistency**: `scripts/append_task_event.py` validates events match current state.

If a script rejects your action, do NOT use `--no-enforce`. Stop and report the error.

## ONE STAGE PER CYCLE

Execute at most one canonical stage per conversation turn. After completing a stage:
1. Update state via `scripts/update_task_state.py`
2. Append event via `scripts/append_task_event.py`
3. Report what you did
4. STOP and wait for the next instruction

## ROLE MAPPING

- `codex`: planning, PRD writing, reviewing, process control
- `claude_code`: implementation and revision execution
- `human`: goals, approvals, final decisions

If the next stage belongs to a different actor, STOP and say who needs to act next.

## SCRIPTS

```bash
# Scaffold a new task
python3 scripts/scaffold_dev_workflow_task.py --name "Feature Name" --repo-path /path/to/repo

# Check next step
python3 scripts/dev_workflow_next_step.py tasks/<TASK_ID>

# Validate task structure
python3 scripts/validate_dev_workflow_task.py tasks/<TASK_ID>

# Update state (enforced)
python3 scripts/update_task_state.py tasks/<TASK_ID> --stage <STAGE> --actor <ACTOR> --artifact <PATH>

# Append event (enforced)
python3 scripts/append_task_event.py tasks/<TASK_ID> --event <EVENT> --artifact <PATH>
```
