#!/usr/bin/env python3
"""Show the next recommended action for a document-driven task."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


STAGE_ACTIONS = {
    "intake": ("Codex should classify the task and estimate scope.", "Write handoffs/05-task-classification.yaml and handoffs/08-scope-estimate.md"),
    "classification": ("Codex should draft the PRD.", "Write handoffs/10-prd.md"),
    "scope_estimation": ("Codex should draft the PRD.", "Write handoffs/10-prd.md"),
    "prd": ("Codex should review the PRD against reality.", "Write handoffs/15-prd-reality-review.md"),
    "prd_reality_review": ("Codex should draft the user flow.", "Write handoffs/20-user-flow.md and handoffs/21-user-flow.yaml"),
    "user_flow": ("Human approval is required before planning.", "Write handoffs/25-human-approval.md"),
    "approval": ("Codex should draft the implementation plan.", "Write handoffs/30-implementation-plan.md"),
    "implementation_plan": ("Codex should review the implementation plan.", "Write handoffs/35-plan-review.md"),
    "plan_review": ("Codex should write the execution prompt.", "Write handoffs/40-execution-prompt.md"),
    "execution_prompt": ("Claude Code should start implementation.", "Write handoffs/50-claude-batch-r1.md"),
    "implementation_batch": ("Codex should review the latest Claude batch.", "Write the next Codex review handoff"),
    "review": ("Claude Code should apply the required changes.", "Write the next Claude revision handoff"),
    "final_revision": ("Human should run integration checks.", "Update handoffs/95-integration-checklist.md"),
    "integration": ("Codex and human should capture the next cycle.", "Write handoffs/99-next-cycle.md"),
    "next_cycle": ("Task is complete.", "No further action required"),
}


def get_next_step(task_dir: Path) -> dict[str, str]:
    state_path = task_dir / "system" / "state.json"
    if not state_path.exists():
        raise FileNotFoundError(f"Missing state file: {state_path}")

    state = json.loads(state_path.read_text())
    status = state.get("status", "unknown")
    stage = state.get("stage", "unknown")

    if status == "done":
        return {"stage": stage, "message": "Task is complete.", "action": "No further action required"}

    message, action = STAGE_ACTIONS.get(
        stage,
        ("State is unknown. Inspect the latest handoff and status.md.", "Check status.md and system/state.json"),
    )
    return {"stage": stage, "message": message, "action": action}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_dir", help="Path to the task directory")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = get_next_step(Path(args.task_dir))
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
